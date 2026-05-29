#!/usr/bin/env bash
# =============================================================================
# daily-auto-publish.sh — 마음토스 일일 블로그 자동 발행 오케스트레이터
#
# 사용법:
#   bash scripts/publish-blog/daily-auto-publish.sh
#   bash scripts/publish-blog/daily-auto-publish.sh --dry-run
#   bash scripts/publish-blog/daily-auto-publish.sh --count 5
#   bash scripts/publish-blog/daily-auto-publish.sh --skip-select   (기존 daily-topics.json 재사용)
#
# 흐름:
#   Phase 0: 환경/claude/디스크/락 검증
#   Phase 1: 주제 선정 (select-daily-topics.ts)
#   Phase 2: 주제별로 → claude -p 콘텐츠 생성 → 인링크 → SEO 게이트 → publish.ts
#   Phase 3: 결과 요약 + Slack 알림
#
# 필요 환경변수 (web/.env.local):
#   - NEXT_PUBLIC_SUPABASE_URL
#   - SUPABASE_SERVICE_ROLE_KEY
#   - NANOBANANA_API_KEY      (선택; Gemini 검증 + 이미지)
#   - REVALIDATION_SECRET     (선택; ISR 즉시 재검증)
#   - INDEXNOW_KEY            (선택; Bing/Yandex/Naver 즉시 색인)
#   - SLACK_WEBHOOK_URL_2     (선택; 자동발행 전용 채널 — 폴백 SLACK_WEBHOOK_URL)
# =============================================================================

set -euo pipefail

# ------------------------------------------------------------------
# 경로/상수
# ------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"          # scripts/publish-blog
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"                     # repo root
LOGS_DIR="$PROJECT_ROOT/logs"
LOG_DATE="$(date +%Y-%m-%d)"
LOG_FILE="$LOGS_DIR/daily-publish-$LOG_DATE.log"
LOCK_FILE="/tmp/mindthos-daily-blog-publish.lock"
TOPICS_FILE="$SCRIPT_DIR/daily-topics.json"
CONTENT_FILE="$SCRIPT_DIR/content.json"
SEO_REPORT_FILE="$SCRIPT_DIR/seo-report.json"

SELECT_TOPICS_TS="$SCRIPT_DIR/src/select-daily-topics.ts"
INSERT_INLINKS_TS="$SCRIPT_DIR/src/insert-inlinks.ts"
PUBLISH_TS="$SCRIPT_DIR/src/publish.ts"
ANALYZE_PY="$PROJECT_ROOT/scripts/seo-analysis/analyze.py"

# 각 포스트당 최대 실행 시간 (초)
POST_TIMEOUT=600
# 실패 시 재시도 횟수
MAX_RETRIES=2
# 포스트 간 대기 시간 (초)
SLEEP_BETWEEN=15
# 재시도 대기 시간 (초)
RETRY_DELAY=30
# 최소 필요 디스크 공간 (MB)
MIN_DISK_MB=500
# claude 세션당 최대 턴 수
# v2: 가이드 파일을 prompt 에 인라인 주입하므로 Read 호출이 사라짐 → 8~10턴이면 충분.
# (이전 25턴도 초과하던 원인이 가이드 Read+검증 반복이었음)
CLAUDE_MAX_TURNS=10
# Verifier mustFix 발견 시 Claude 재호출하여 본문 수정하는 최대 횟수.
# 1로 제한 — 운영 1회차(2026-05-29) 에서 2회 반복도 무한 루프였음. 한 번 수정 후
# 그래도 mustFix 남으면 그대로 발행 (ai_review.revisionGuide 의 "후속 개선" 항목으로
# 누적되어 운영자가 사후 처리). aggregate.ts 의 임계 완화와 짝.
MAX_FACT_FIX=1
# Slack 채널 override — 마음토스 자동 발행은 #blog 채널(C0ARUQ8F18U)로 전송
# (env MINDTHOS_SLACK_CHANNEL 로 변경 가능)
SLACK_CHANNEL_OVERRIDE="${MINDTHOS_SLACK_CHANNEL:-C0ARUQ8F18U}"

# ------------------------------------------------------------------
# 로그
# ------------------------------------------------------------------
log() {
  local level="$1"; shift
  local msg="$*"
  local ts; ts="$(date '+%Y-%m-%d %H:%M:%S')"
  local line="[$ts] [$level] $msg"
  echo "$line"
  echo "$line" >> "$LOG_FILE"
}
log_info()  { log "INFO " "$@"; }
log_warn()  { log "WARN " "$@"; }
log_error() { log "ERROR" "$@"; }
log_ok()    { log "OK   " "$@"; }

# ------------------------------------------------------------------
# timeout 폴백 (macOS 기본 미설치)
# ------------------------------------------------------------------
if command -v timeout &>/dev/null; then
  TIMEOUT_BIN="timeout"
elif command -v gtimeout &>/dev/null; then
  TIMEOUT_BIN="gtimeout"
else
  TIMEOUT_BIN=""
fi
run_with_timeout() {
  local secs="$1"; shift
  if [[ -n "$TIMEOUT_BIN" ]]; then
    "$TIMEOUT_BIN" "$secs" "$@"
  else
    "$@"
  fi
}

# ------------------------------------------------------------------
# 인수 파싱
# ------------------------------------------------------------------
DRY_RUN=false
TOPIC_COUNT=5
SKIP_SELECT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)     DRY_RUN=true; shift ;;
    --count)       TOPIC_COUNT="$2"; shift 2 ;;
    --skip-select) SKIP_SELECT=true; shift ;;
    *) echo "알 수 없는 인수: $1"; shift ;;
  esac
done

# ------------------------------------------------------------------
# 정리 핸들러
# ------------------------------------------------------------------
cleanup() {
  log_warn "종료 신호 수신 — 정리 중..."
  rm -f "$LOCK_FILE"
  log_warn "정리 완료. 종료합니다."
  exit 130
}
trap cleanup SIGTERM SIGINT

# ------------------------------------------------------------------
# 초기화
# ------------------------------------------------------------------
mkdir -p "$LOGS_DIR"

log_info "========================================================"
log_info "마음토스 일일 블로그 자동 발행 시작"
log_info "  프로젝트 루트: $PROJECT_ROOT"
log_info "  로그 파일:     $LOG_FILE"
log_info "  Dry-run:       $DRY_RUN"
log_info "  목표 주제 수:  $TOPIC_COUNT"
log_info "========================================================"

# ------------------------------------------------------------------
# Phase 0a: web/.env.local 로드
# ------------------------------------------------------------------
ENV_FILE="$PROJECT_ROOT/web/.env.local"
if [[ -f "$ENV_FILE" ]]; then
  # KEY=VALUE 형식만 안전하게 로드 (한글 주석/빈 줄 무시 + trailing newline 없는 마지막 줄 처리)
  while IFS='=' read -r key value || [[ -n "$key" ]]; do
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    export "$key=$value"
  done < "$ENV_FILE"
  log_info "web/.env.local 로드 완료"
else
  log_warn ".env.local 파일을 찾을 수 없습니다: $ENV_FILE"
fi

# ------------------------------------------------------------------
# Phase 0b: 환경 변수 검증
# ------------------------------------------------------------------
log_info "[Phase 0] 환경 변수 검증..."

missing_vars=()
[[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]   && missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
[[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]  && missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
# 자동 발행은 모든 글에 썸네일을 강제하므로 NANOBANANA_API_KEY 도 필수
[[ -z "${NANOBANANA_API_KEY:-}" ]]         && missing_vars+=("NANOBANANA_API_KEY")

if [[ ${#missing_vars[@]} -gt 0 ]]; then
  log_error "필수 환경변수 누락: ${missing_vars[*]}"
  log_error "확인: $ENV_FILE"
  slack_url="${SLACK_WEBHOOK_URL_2:-${SLACK_WEBHOOK_URL:-}}"
  if [[ -n "$slack_url" ]]; then
    curl -s -X POST -H 'Content-Type: application/json' \
      -d "{\"channel\":\"${SLACK_CHANNEL_OVERRIDE}\",\"text\":\":rotating_light: 마음토스 일일 발행 abort — 필수 환경변수 누락: ${missing_vars[*]}\"}" \
      "$slack_url" >/dev/null 2>&1 || true
  fi
  rm -f "$LOCK_FILE"
  exit 1
fi
[[ -z "${REVALIDATION_SECRET:-}" ]] && log_warn "REVALIDATION_SECRET 없음 — ISR 즉시 재검증 스킵됨."
[[ -z "${INDEXNOW_KEY:-}" ]] && log_warn "INDEXNOW_KEY 없음 — IndexNow 즉시 색인 스킵됨."
[[ -z "${SLACK_WEBHOOK_URL_2:-${SLACK_WEBHOOK_URL:-}}" ]] && log_warn "SLACK_WEBHOOK_URL(2) 없음 — 슬랙 알림 비활성화."
log_ok "환경 변수 검증 완료"

# publish.ts 에 STRICT 모드 신호 — 썸네일 실패 시 exit 2 로 abort
export AUTO_PUBLISH_STRICT=1

# ------------------------------------------------------------------
# Phase 0c: claude CLI 검증
# ------------------------------------------------------------------
log_info "[Phase 0] claude CLI 검증..."

# PM2/cron 등이 GUI 셸의 stale PATH 를 상속받아 못 찾는 경우 대비
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/Applications/cmux.app/Contents/Resources/bin:$PATH"

if ! command -v claude &>/dev/null; then
  log_error "claude CLI를 PATH에서 찾을 수 없습니다."
  log_error "  현재 PATH: $PATH"
  log_error "  설치: npm i -g @anthropic-ai/claude-code"
  slack_url="${SLACK_WEBHOOK_URL_2:-${SLACK_WEBHOOK_URL:-}}"
  if [[ -n "$slack_url" ]]; then
    curl -s -X POST -H 'Content-Type: application/json' \
      -d "{\"channel\":\"${SLACK_CHANNEL_OVERRIDE}\",\"text\":\":rotating_light: 마음토스 일일 발행 abort — claude CLI not found in PATH\"}" \
      "$slack_url" >/dev/null 2>&1 || true
  fi
  rm -f "$LOCK_FILE"
  exit 1
fi
CLAUDE_BIN="$(command -v claude)"
log_ok "claude CLI 발견: $CLAUDE_BIN"

# ------------------------------------------------------------------
# Phase 0d: 디스크 공간
# ------------------------------------------------------------------
log_info "[Phase 0] 디스크 공간 확인..."
available_mb=$(df -m "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
if [[ -n "$available_mb" && "$available_mb" -lt "$MIN_DISK_MB" ]]; then
  log_error "디스크 공간 부족: ${available_mb}MB (최소 ${MIN_DISK_MB}MB 필요)"
  exit 1
fi
log_info "  사용 가능: ${available_mb:-?}MB"

# ------------------------------------------------------------------
# Phase 0e: 락 파일 (동시 실행 방지)
# ------------------------------------------------------------------
if [[ -f "$LOCK_FILE" ]]; then
  existing_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    log_error "이미 실행 중 (PID: $existing_pid). 종료합니다."
    exit 1
  else
    log_warn "오래된 락 파일 제거 (PID: ${existing_pid:-unknown})"
    rm -f "$LOCK_FILE"
  fi
fi
echo $$ > "$LOCK_FILE"
log_info "락 파일 생성: $LOCK_FILE (PID: $$)"

# ------------------------------------------------------------------
# Phase 0f: 어제 실행 누락 감지 (catch-up 안내)
# ------------------------------------------------------------------
YESTERDAY="$(date -v-1d '+%Y-%m-%d' 2>/dev/null || date -d 'yesterday' '+%Y-%m-%d' 2>/dev/null || echo "")"
if [[ -n "$YESTERDAY" && ! -f "$LOGS_DIR/daily-publish-$YESTERDAY.log" ]]; then
  log_warn "어제($YESTERDAY) 실행 로그가 없습니다 — 실행 누락 가능"
  log_warn "  catch-up: bash scripts/publish-blog/daily-auto-publish.sh --count 3"
fi

# ------------------------------------------------------------------
# Phase 0g: 로그 로테이션 (30일 초과 삭제)
# ------------------------------------------------------------------
log_info "[Phase 0] 로그 로테이션..."
find "$LOGS_DIR" -name "daily-publish-*.log" -mtime +30 -delete 2>/dev/null || true

# ------------------------------------------------------------------
# Phase 1: 주제 선정
# ------------------------------------------------------------------
log_info ""
if [[ "$SKIP_SELECT" == "true" ]]; then
  log_info "[Phase 1] 주제 선정 스킵 — 기존 $TOPICS_FILE 재사용"
  if [[ ! -f "$TOPICS_FILE" ]]; then
    log_error "기존 daily-topics.json 없음: $TOPICS_FILE"
    rm -f "$LOCK_FILE"; exit 1
  fi
else
  log_info "[Phase 1] 주제 선정..."

  if ! command -v npx &>/dev/null; then
    log_error "npx 없음 — Node.js 설치 필요"
    rm -f "$LOCK_FILE"; exit 1
  fi

  cd "$PROJECT_ROOT"

  select_exit=0
  npx tsx "$SELECT_TOPICS_TS" --count "$TOPIC_COUNT" 2>&1 | tee -a "$LOG_FILE" || select_exit=$?
  if [[ $select_exit -ne 0 ]]; then
    log_error "주제 선정 실패 (코드: $select_exit)"
    rm -f "$LOCK_FILE"; exit 1
  fi
  if [[ ! -f "$TOPICS_FILE" ]]; then
    log_error "daily-topics.json 생성되지 않음"
    rm -f "$LOCK_FILE"; exit 1
  fi
fi

# 주제 수 확인
topic_count_actual=$(python3 -c "
import json
try:
    d = json.load(open('$TOPICS_FILE'))
    print(len(d.get('topics', [])))
except Exception:
    print(0)
" 2>/dev/null || echo "0")

if [[ "$topic_count_actual" -eq 0 ]]; then
  log_error "선정된 주제가 없습니다. 종료."
  rm -f "$LOCK_FILE"; exit 1
fi
log_ok "주제 선정 완료: ${topic_count_actual}개"

# ------------------------------------------------------------------
# Phase 2: 발행 루프
# ------------------------------------------------------------------
log_info ""
log_info "[Phase 2] 발행 루프 시작 (총 ${topic_count_actual}개)"

succeeded=0
failed=0
failed_keywords=()
published_slugs=()
fatal_abort=false
fatal_reason=""

topics_json=$(cat "$TOPICS_FILE")

for i in $(seq 0 $((topic_count_actual - 1))); do
  keyword=$(echo "$topics_json" | python3 -c "
import json, sys
d = json.load(sys.stdin); t = d.get('topics', [])
print(t[$i]['keyword'] if $i < len(t) else '')
" 2>/dev/null || echo "")

  category=$(echo "$topics_json" | python3 -c "
import json, sys
d = json.load(sys.stdin); t = d.get('topics', [])
print(t[$i].get('category', 'counseling-skills') if $i < len(t) else 'counseling-skills')
" 2>/dev/null || echo "counseling-skills")

  audience=$(echo "$topics_json" | python3 -c "
import json, sys
d = json.load(sys.stdin); t = d.get('topics', [])
print(t[$i].get('audience', '') if $i < len(t) else '')
" 2>/dev/null || echo "")

  kw_type=$(echo "$topics_json" | python3 -c "
import json, sys
d = json.load(sys.stdin); t = d.get('topics', [])
print(t[$i].get('type', 'core') if $i < len(t) else 'core')
" 2>/dev/null || echo "core")

  format=$(echo "$topics_json" | python3 -c "
import json, sys
d = json.load(sys.stdin); t = d.get('topics', [])
v = t[$i].get('format', 'article') if $i < len(t) else 'article'
print(v if v in ('article', 'listicle', 'guide') else 'article')
" 2>/dev/null || echo "article")

  if [[ -z "$keyword" ]]; then
    log_warn "주제 $((i+1)): 키워드 추출 실패, 스킵"
    continue
  fi

  # audience 가 비어 있으면 카테고리로 폴백 매핑
  if [[ -z "$audience" ]]; then
    case "$category" in
      tech-blog)       audience="institution" ;;
      self-care|trends) audience="general" ;;
      *)               audience="counselor" ;;
    esac
  fi

  # ----------------------------------------------------------------
  # 사실 검증(팩트체크) 필요 주제 판정
  # 자격 취득 / 교육과정·수련 / 학회 규정 / 상담 관련 법률·제도 /
  # 정부 정책·지원사업 / 시점에 따라 변하는 수치·일정 → 발행 전 웹 교차검증
  # (web/context/fact-check-protocol.md 트리거와 동일 기준)
  # ----------------------------------------------------------------
  fact_sensitive=false
  case "$category" in
    training|career) fact_sensitive=true ;;
  esac
  if echo "$keyword" | grep -qiE '자격|자격증|면허|바우처|지원사업|지원금|보조금|단가|수가|급여|법률|법령|시행규칙|규정|윤리강령|학회|수련|이수|시험|응시|요건|등록기준|개정|제도|정책'; then
    fact_sensitive=true
  fi

  # ----------------------------------------------------------------
  # 마음토스 자체 기능·보안·가격 주제 판정 (product-self)
  # tech-blog 카테고리 또는 '마음토스/mindthos' + 기능/보안/가격 키워드 →
  # mindthos-web 소스·/security·가격 섹션을 1차 출처로 교차검증.
  # (web/context/mindthos-product-facts.md 의 deny-list 로 가공 기능 차단)
  # ----------------------------------------------------------------
  product_self=false
  if [[ "$category" == "tech-blog" ]]; then
    product_self=true
  fi
  if echo "$keyword" | grep -qiE '마음토스|mindthos'; then
    if echo "$keyword" | grep -qiE '기능|연동|통합|인증|sso|saml|sla|emr|보안|암호화|권한|접근|감사|로그|가격|요금|플랜|크레딧|구독|시트|seat|도입|기관|온보딩|축어록|진행기록|사례개념화|제노그램|슈퍼비전|템플릿|api'; then
      product_self=true
    fi
  fi

  if [[ "$fact_sensitive" == "true" ]]; then
    GEN_TOOLS="Write,WebSearch,WebFetch"
    GEN_MAX_TURNS=20
    FACT_CHECK_BLOCK="## ⚠️ 사실 검증 필수 (이 주제는 자격/교육/학회규정/법률/정부정책 등 사실민감 주제로 분류됨)
본문 작성 전에 WebSearch/WebFetch 로 반드시 사실을 교차검증하세요. 잘못된 제도·자격·법률 정보는 독자에게 직접적 피해를 줍니다.
- 정부·법령(law.go.kr)·복지로·학회·자격관리기관 등 1차 공식 출처를 우선 확인
- 핵심 수치·요건(금액·비율·시간·일정·자격·명칭)은 독립된 2개 이상 출처로 교차검증
- 현재 연도 기준 최신 지침·개정·명칭 변경 여부 확인 (예: '전국민 마음투자 지원사업' → 2026 '정신건강 심리상담 바우처')
- 출처 간 값이 다르면 공식 출처 우선, 확정 못 하면 단정하지 말고 '공식 공고·관할 기관 확인' 안내 문구 사용
- 검증에 사용한 1차 출처는 references 에 포함, 확인 못 한 내용은 본문에 단정형으로 쓰지 말 것
- 상세 규칙은 아래 인라인된 'web/context/fact-check-protocol.md' 를 따르세요"
    log_info "  사실 검증 주제로 판정 — 웹 리서치 활성화 (tools: $GEN_TOOLS, turns: $GEN_MAX_TURNS)"
  else
    GEN_TOOLS="Write"
    GEN_MAX_TURNS=$CLAUDE_MAX_TURNS
    FACT_CHECK_BLOCK=""
  fi

  # 마음토스 자체 기능 주제 — 사실 자료(아래 인라인) 기준으로만 자사 기능 단정.
  # deny-list 기능(SSO/SLA/EMR/RBAC/시트과금 등)은 자사 기능으로 절대 쓰지 않음.
  if [[ "$product_self" == "true" ]]; then
    PRODUCT_SELF_BLOCK="## ⚠️ 마음토스 자체 기능·보안·가격 검증 필수 (product-self 주제)
이 글은 마음토스 자신의 기능/보안/가격을 다룹니다. 아래 인라인된 'web/context/mindthos-product-facts.md' 에 **명시된 사실만** 마음토스의 기능·정책으로 단정하세요.
- 사실 자료에 없는 기능을 '마음토스가 제공/지원/구성한다'고 쓰면 자사 서비스를 잘못 소개하는 치명적 오류입니다.
- deny-list 기능(SSO/SAML/OIDC·SLA 보장·EMR 연동·RBAC/역할기반 접근·감사 로그·시트 단위 과금·무료 체험·자동 파기 옵션·표준 DPA/SLA 문서 등)은 마음토스 기능으로 절대 단정하지 마세요.
- 만약 키워드 자체가 deny-list 기능(예: '마음토스 SSO 연동')이면, 그 기능이 마음토스에 있다고 전제하지 말고 검증된 인접 기능(기관 플랜 계정·권한 관리 등)으로 안전하게 전환하거나 '기관 검토 항목' 관점으로만 다루세요.
- 가격은 사실 자료의 표를 따르되 '변동 가능, 공식 안내 확인' 문구를 넣고, 보안은 '도입 시 별도 안내' 프레이밍을 유지하세요."
    log_info "  마음토스 자체 기능 주제로 판정 — 제품 사실 자료 게이트 활성화"
  else
    PRODUCT_SELF_BLOCK=""
  fi

  log_info ""
  log_info "------------------------------------------------------------"
  log_info "주제 $((i+1))/$topic_count_actual: $keyword ($category / $audience, $kw_type, format=$format)"
  log_info "------------------------------------------------------------"

  # --------------------------------------------------------------
  # Format-specific 콘텐츠 규칙 블록 — daily-topics.json 의 format 필드 기반
  # 액션 플랜 §B4 (web/docs/aeo-geo-research/action-plan.md)
  # AEO 인용 데이터(Evertune 25K URL): 전체 인용 63% / 상업 쿼리 40.86% 가 listicle
  # 모든 다른 규칙(분량·인링크·FAQ·references·메타·임상 윤리)은 article 과 동일하게 적용됨
  # --------------------------------------------------------------
  case "$format" in
    listicle)
      FORMAT_BLOCK="## 포맷: LISTICLE (필수 준수)
이 글은 **ranked Top-N listicle** 포맷으로 작성합니다. AEO 인용 풀(특히 추천·비교·상업 쿼리) 진입의 핵심.

규칙:
- H2 가 \"1. \", \"2. \", \"3. \" … 등 **번호로 시작** — 총 5-10개 항목.
- 각 H2 항목은 **단독 인용 가능 self-contained passage** — 이전 항목 참조 표현(\"위에서 본 것처럼…\") 금지.
- 각 H2 직후 첫 문장 = 그 항목의 핵심 요점·결론을 **단독으로** 제시.
- summary 박스: 1-3위 미리보기 한 줄씩 + 선정 기준 1줄 (총 200-400자, 도입부 hook 금지).
- 본문 마지막에 간단한 비교표 또는 결론 단락 (선택).
- 본문 첫 30% 영역(첫 H2 위 도입 + 1번 항목)에 핵심 답이 들어가도록.
- content.json 의 content.format = \"listicle\" 필수.

다른 모든 규칙(분량·인링크·FAQ·references·메타·임상 윤리)은 article 과 동일."
      log_info "  ▶ LISTICLE 포맷으로 생성 — 1. 2. 3. 번호 H2"
      ;;
    guide)
      FORMAT_BLOCK="## 포맷: GUIDE (필수 준수)
이 글은 **종합 정리 / 완벽 가이드** 포맷으로 작성합니다.

규칙:
- H2 5-8개 + 각 H2 아래 H3 다수 사용 (목차 깊이 있음).
- 본문 **3,000자 이상** (article 표준보다 길게).
- 단계·체크리스트·표 적극 활용 (실무 적용 가능한 절차·양식·기준).
- 끝에 \"정리\" 또는 \"체크리스트\" 또는 \"다음 단계\" 섹션 권장.
- summary 박스: 가이드 범위·대상 독자·다루는 핵심 항목 200-400자 (도입부 hook 금지, 단독 답변).
- content.json 의 content.format = \"guide\" 필수.

다른 모든 규칙(인링크·FAQ·references·메타·임상 윤리)은 article 과 동일."
      log_info "  ▶ GUIDE 포맷으로 생성 — 종합 정리 + H3 다수 + 3000자+"
      ;;
    *)
      FORMAT_BLOCK="## 포맷: ARTICLE (기본 정보성)
이 글은 표준 article 포맷입니다. H2 5-8개 자연어 제목, summary 박스가 글 제목 질문의 단독 답변. content.json 의 content.format = \"article\" 명시."
      log_info "  ▶ ARTICLE 포맷으로 생성 (기본)"
      ;;
  esac

  rm -f "$CONTENT_FILE"

  attempt=0
  post_success=false
  seo_c_retried=0

  while [[ $attempt -le $MAX_RETRIES ]]; do
    if [[ $attempt -gt 0 ]]; then
      log_warn "  재시도 $attempt/$MAX_RETRIES — ${RETRY_DELAY}초 대기..."
      sleep "$RETRY_DELAY"
    fi
    attempt=$((attempt + 1))

    rm -f "$CONTENT_FILE"
    log_info "  [시도 $attempt] 콘텐츠 생성 중..."

    # ------------- Dry-run: 더미 콘텐츠 -------------
    if [[ "$DRY_RUN" == "true" ]]; then
      log_info "  [dry-run] claude -p 스킵 — 더미 content.json 생성"
      python3 -c "
import json, re
kw = '''$keyword'''
slug = re.sub(r'[^a-z0-9]+', '-', kw.lower()).strip('-')[:60]
dummy = {
    'categorySlug': '$category',
    'targetAudience': '$audience',
    'authorSlug': 'mindthos',
    'status': 'draft',
    'skipImage': True,
    'content': {
        'title': f'[dry-run] {kw}',
        'slug': f'dry-run-{slug}',
        'content': '## 테스트\n\n테스트 콘텐츠입니다.',
        'excerpt': '테스트 발췌문',
        'summary': '테스트 요약',
        'keywords': [kw],
        'meta_title': f'[dry-run] {kw}',
        'meta_description': '테스트 메타 디스크립션',
        'faq': [],
        'references': [],
        'visual_keywords': ['calm', 'nature']
    }
}
json.dump(dummy, open('$CONTENT_FILE', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('[dry-run] content.json 생성 완료')
" 2>&1 | tee -a "$LOG_FILE"
      post_success=true
      published_slugs+=("dry-run-${keyword}")
      succeeded=$((succeeded + 1))
      break
    fi

    # ------------- 콘텐츠 생성: claude -p (가이드 인라인) -------------
    # v2: 가이드 5종을 사전에 prompt 본문에 인라인 주입.
    # → Claude 가 Read 호출을 안 해도 되므로 turn 수 대폭 감소 (이전 25턴 초과 → 5~8턴 완료 예상)
    # → allowedTools 도 Write 만 허용해 다른 행동 차단
    PROMPT_FILE="$(mktemp -t mindthos-prompt.XXXXXX)"
    {
      cat <<PROMPT_HEADER
당신은 마음토스 블로그 전문 편집자입니다. 주 독자는 상담사·임상가·수련생 등 전문가입니다.

## 본 블로그의 메인 컨셉 (반드시 준수)
마음토스는 상담사를 위한 AI 파트너 SaaS 입니다. 그러나 본 블로그의 **1차 목적은 상담사에게 임상 실무·운영·자기돌봄·커리어에 실질적으로 도움되는 정보를 제공**하는 것입니다. 마음토스 제품 홍보 블로그가 아닙니다. 정보가 먼저이고, 제품은 보조입니다.

## 자매 사이트 톤 침투 금지
앤아더라이프(상담센터, andotherlife.com)와 같은 임상 도메인을 다루지만 독자와 목적이 다릅니다. 마음토스 블로그는 **동료 상담사 시점** 으로 작성하며, 내담자에게 상담 신청을 권유하는 흐름(예: '지금 상담 신청해 보세요', '전문가의 도움을 받아보세요')은 **금지** 합니다. 본 글의 마무리는 상담사 본인의 실무·도구 활용 관점이어야 합니다.

## 작성 주제
키워드: ${keyword}
카테고리: ${category}
유형: ${kw_type}
타겟 독자: ${audience}   (counselor / institution / general)

## 작업 절차 (가이드는 아래 인라인되어 있음 — 별도 Read 호출 금지)
1. 아래 '## 인라인 가이드 5종' 섹션을 검토하여 카테고리 '${category}' 의 권장값(글자 수, 키워드 밀도, CTA, 톤)을 파악하세요.
2. 키워드 '${keyword}' 에 대한 블로그 글을 가이드에 맞춰 작성하세요.
3. **Write 도구로** scripts/publish-blog/content.json 에 결과를 저장하세요. (다른 파일 Read/탐색 금지 — 모든 컨텍스트는 이미 아래에 있음)
4. content.json 저장 직후 즉시 종료하세요.

## 출력 형식 — content.json (반드시 이 JSON 구조 그대로)
바깥 레벨(categorySlug, targetAudience, authorSlug, status, skipImage)은 메타이고, 실제 글 본문/메타데이터는 모두 \`content\` 객체 안에 중첩됩니다. 절대 평탄화하지 마세요.

\`\`\`json
{
  "categorySlug": "${category}",
  "targetAudience": "${audience}",
  "authorSlug": "mindthos",
  "status": "published",
  "skipImage": false,
  "content": {
    "format": "${format}",
    "title": "(30~60자 제목, 핵심 키워드 앞쪽 30자 안에)",
    "slug": "(영문 소문자 + 하이픈, 3~5단어)",
    "content": "## H2 섹션 1\\n\\n본문 마크다운...\\n\\n## H2 섹션 2\\n\\n...",
    "excerpt": "(155자 이내 발췌)",
    "summary": "(200~400자, '이 글의 핵심' 박스용 — 단독 답변, 도입부 hook 금지)",
    "keywords": ["핵심키워드", "보조키워드1", "보조키워드2"],
    "meta_title": "(30~60자)",
    "meta_description": "(120~155자)",
    "faq": [
      { "question": "...?", "answer": "..." }
    ],
    "references": [
      { "name": "기관/저자(연도)", "url": "https://...", "type": "academic|government|industry", "description": "(선택)" }
    ],
    "visual_keywords": ["english keyword 1", "english keyword 2", "english keyword 3"]
  }
}
\`\`\`

체크리스트(저장 전 확인):
- 최상위 키: categorySlug / targetAudience / authorSlug / status / skipImage / content (정확히 6개)
- content.format 은 "${format}" 으로 고정 (변경 금지)
- content.title / content.slug / content.content 는 모두 필수, 비워두지 마세요
- content.content 는 **마크다운 본문** (H1 없이 H2 부터 시작)
- LISTICLE 인 경우 H2 가 "1. ", "2. " ... 번호로 시작 / GUIDE 인 경우 H3 다수 활용 / ARTICLE 은 자연어 H2

## 콘텐츠 규칙
- 분량/키워드 밀도/헤딩: 인라인 ### web/context/seo-guidelines.md 의 '${category}' 권장값을 따르세요. 수치를 임의로 덮어쓰지 마세요.
- 첫 100자 안에 핵심 키워드 배치.
- H2 5~8개, 최소 2개 H2 에 핵심/보조 키워드 포함.
- 본문 톤: ~습니다체 / 동료 상담사 어조 / 이모지 없음.
- FAQ 3~5개 (실제 검색 쿼리 반영, 답변 40~300자).
- references 1~5개: 학술/정부/전문기관 출처만, type: academic|government|industry.
- visual_keywords: 이미지 생성용 영문 키워드 3~5개.
- 사례는 익명화 + 변형 + 동의 가정 명시.

## 마음토스 제품 언급 빈도 가이드 (절제)
정보 전달이 우선이며 마음토스 제품 언급은 주제와 자연스럽게 맞닿을 때만 짧게 포함합니다.
- case-conceptualization / counseling-skills / training / career / operations: 본문 전체에서 0~1회 자연 언급
- self-care / trends: 원칙적으로 언급하지 않음
- tech-blog: 1~2회 (이 카테고리는 마음토스 제품·보안 자체가 주제)
- 언급할 때는 '도구 → 효과' 흐름. 광고 카피·과장 표현 금지.
- 강한 행동 유도 CTA 는 본문에 쓰지 마세요 (InlineCTA / BottomCTA 컴포넌트가 담당).

## 메타 데이터 규격
- meta_title: 30~60자, 핵심 키워드를 앞쪽 30자 안에.
- meta_description: 120~155자, 부드러운 행동 유도 1줄 포함.
- slug: 영문 소문자 + 하이픈, 3~5단어.
- excerpt: 155자 이내, summary: 200~400자.

## 내부 링크
- 본문에 자연스러운 위치만 표시. 블로그 → 블로그 인링크는 작성하지 마세요 (별도 스크립트가 발행 직전 자동 삽입).

## 임상 윤리·안전 (필수)
- DSM·진단 기준 인용 시 버전 표기 (DSM-5-TR 등).
- 의료 진단/처방 표현 금지 ('진단됩니다', '처방하세요', '치료할 수 있습니다' 등).
- 비전문가에게 임상 행위를 권유하는 표현 금지.
- 자살/자해 주제 시 본문에 위기상담 안내 필수 (정신건강 위기상담 1393, 자살예방 109) + 슈퍼바이저/전문가 슈퍼비전 권장.
- 마음토스 제품 언급은 광고형 금지 — 도구 → 효과 흐름.
- 통계/연구 인용은 출처(저자+연도 또는 기관+발행연도)를 references 에 명시.

${FORMAT_BLOCK}

${FACT_CHECK_BLOCK}

${PRODUCT_SELF_BLOCK}

---

## 인라인 가이드 (이미 읽혀 있음 — Read 호출 금지)

### web/context/brand-voice.md
PROMPT_HEADER
      cat "$PROJECT_ROOT/web/context/brand-voice.md"
      echo ""
      echo "### web/context/style-guide.md"
      cat "$PROJECT_ROOT/web/context/style-guide.md"
      echo ""
      echo "### web/context/seo-guidelines.md"
      cat "$PROJECT_ROOT/web/context/seo-guidelines.md"
      echo ""
      echo "### web/context/target-keywords.md"
      cat "$PROJECT_ROOT/web/context/target-keywords.md"
      echo ""
      echo "### web/context/internal-links-map.md"
      cat "$PROJECT_ROOT/web/context/internal-links-map.md"
      if [[ "$fact_sensitive" == "true" ]]; then
        echo ""
        echo "### web/context/fact-check-protocol.md"
        cat "$PROJECT_ROOT/web/context/fact-check-protocol.md"
      fi
      if [[ "$product_self" == "true" ]]; then
        echo ""
        echo "### web/context/mindthos-product-facts.md"
        cat "$PROJECT_ROOT/web/context/mindthos-product-facts.md"
      fi
      echo ""
      echo "---"
      echo ""
      if [[ "$fact_sensitive" == "true" && "$product_self" == "true" ]]; then
        echo "먼저 WebSearch/WebFetch 로 외부 사실(제도·법령 등)을 1차 공식 출처로 교차검증하고, 마음토스 자체 기능·보안·가격은 위 'mindthos-product-facts.md' 에 명시된 사실만 단정한 뒤, 위 가이드에 맞춰 키워드 '${keyword}' 글을 작성하고 scripts/publish-blog/content.json 에 Write 후 즉시 종료하세요. 로컬 파일 Read/Glob/Grep 호출은 금지하되 WebSearch/WebFetch 는 허용·필수입니다."
      elif [[ "$fact_sensitive" == "true" ]]; then
        echo "먼저 WebSearch/WebFetch 로 핵심 사실을 1차 공식 출처 기준 교차검증한 뒤, 위 가이드에 맞춰 키워드 '${keyword}' 글을 작성하고 scripts/publish-blog/content.json 에 Write 후 즉시 종료하세요. 로컬 파일 Read/Glob/Grep 호출은 금지하되, 웹 검색·페치(WebSearch/WebFetch)는 허용·필수입니다."
      elif [[ "$product_self" == "true" ]]; then
        echo "마음토스 자체 기능·보안·가격은 위 'mindthos-product-facts.md' 에 명시된 사실만 단정하세요(없는 기능은 자사 기능으로 쓰지 말 것). 위 가이드에 맞춰 키워드 '${keyword}' 글을 작성하고 scripts/publish-blog/content.json 에 Write 후 즉시 종료하세요. 다른 파일 Read/Glob/Grep 호출 금지."
      else
        echo "위 가이드를 참고하여 키워드 '${keyword}' 글을 작성하고 scripts/publish-blog/content.json 에 Write 후 즉시 종료하세요. 다른 파일 Read/Glob/Grep 호출 금지."
      fi
    } > "$PROMPT_FILE"

    generate_exit=0
    run_with_timeout "$POST_TIMEOUT" claude \
      -p "$(cat "$PROMPT_FILE")" \
      --allowedTools "$GEN_TOOLS" \
      --max-turns "$GEN_MAX_TURNS" \
      2>&1 | tee -a "$LOG_FILE" || generate_exit=$?
    rm -f "$PROMPT_FILE"

    if [[ $generate_exit -ne 0 ]]; then
      log_warn "  콘텐츠 생성 실패 (코드: $generate_exit)"
      continue
    fi
    if [[ ! -f "$CONTENT_FILE" ]]; then
      log_warn "  content.json 미생성"
      continue
    fi

    # 유효성 검사
    valid=$(python3 -c "
import json
try:
    d = json.load(open('$CONTENT_FILE')); c = d.get('content', {})
    missing = [f for f in ('title','slug','content') if not c.get(f)]
    print('missing:' + ','.join(missing) if missing else 'ok')
except Exception as e:
    print('error:' + str(e))
" 2>/dev/null || echo "error:parse_failed")

    if [[ "$valid" != "ok" ]]; then
      log_warn "  content.json 유효성 실패: $valid"
      continue
    fi
    log_info "  content.json 생성 확인 완료"

    # ------------- 인링크 자동 삽입 -------------
    log_info "  [시도 $attempt] 인링크 삽입 중..."
    inlink_exit=0
    run_with_timeout 120 npx tsx "$INSERT_INLINKS_TS" 2>&1 | tee -a "$LOG_FILE" || inlink_exit=$?
    if [[ $inlink_exit -ne 0 ]]; then
      log_warn "  인링크 삽입 비정상 종료 (코드: $inlink_exit) — 본문 변경 없이 계속"
    fi

    # ------------- SEO 게이트 -------------
    # A/B (>=70): 발행
    # C  (50-69): 1회만 재생성, 그 다음은 그대로 발행
    # D/F (<50): 주제 포기 → 다음 주제로
    log_info "  [시도 $attempt] SEO 분석 중..."
    seo_exit=0
    run_with_timeout 120 python3 "$ANALYZE_PY" "$CONTENT_FILE" \
      --output "$SEO_REPORT_FILE" 2>&1 | tee -a "$LOG_FILE" || seo_exit=$?

    if [[ $seo_exit -ne 0 ]]; then
      log_warn "  SEO 분석 실패 (코드: $seo_exit) — 게이트 스킵하고 발행 진행"
    elif [[ -f "$SEO_REPORT_FILE" ]]; then
      seo_score=$(python3 -c "
import json
try:
    print(json.load(open('$SEO_REPORT_FILE')).get('overall_score', 0))
except Exception:
    print(0)
" 2>/dev/null || echo 0)
      seo_score=${seo_score%%.*}
      log_info "  SEO 점수: ${seo_score}점"

      if [[ $seo_score -lt 50 ]]; then
        log_error "  SEO 점수 ${seo_score} (D/F) — 주제 '${keyword}' 포기"
        break
      elif [[ $seo_score -lt 70 ]]; then
        if [[ $seo_c_retried -eq 0 && $attempt -le $MAX_RETRIES ]]; then
          seo_c_retried=1
          log_warn "  SEO 점수 ${seo_score} (C) — content.json 재생성 (1회만)"
          continue
        else
          log_warn "  SEO 점수 ${seo_score} (C) — 재시도 한도 도달, 그대로 발행"
        fi
      else
        log_ok "  SEO 점수 ${seo_score} (A/B) — 발행 진행"
      fi
    fi

    # ------------- 발행 (publish.ts) -------------
    # 결과 분기:
    #   exit 0 → 발행 성공
    #   exit 2 → 썸네일/NANOBANANA 문제 (STRICT) → 전체 배치 중단
    #   exit 3 → Gemini 사실 오류 검출 → Claude 재호출하여 본문 수정 후 재발행 (점수 무관 강제 반영)
    #   기타  → 일반 발행 실패 (재시도 루프로 회귀)
    log_info "  [시도 $attempt] 발행 중..."
    publish_exit=0
    fact_fix_count=0

    while true; do
      publish_exit=0
      run_with_timeout "$POST_TIMEOUT" npx tsx "$PUBLISH_TS" 2>&1 | tee -a "$LOG_FILE" || publish_exit=$?

      if [[ $publish_exit -ne 3 ]]; then
        break  # exit 3 외에는 fact-fix 루프 종료
      fi

      if [[ $fact_fix_count -ge $MAX_FACT_FIX ]]; then
        log_error "  사실 오류 ${MAX_FACT_FIX}회 수정 후에도 미해결 — 이 글 포기"
        break
      fi

      fact_fix_count=$((fact_fix_count + 1))
      log_warn "  AI 다중 검수 mustFix 발견 — Claude 본문 수정 호출 (${fact_fix_count}/${MAX_FACT_FIX})"

      fix_prompt="당신은 마음토스 블로그 편집자입니다. AI 다중 검수(Stage 2 AEO + Stage 4 상담사 콘텐츠)에서 수정 필요 항목(mustFix)이 발견되었습니다.

## 작업 절차
1. Read 로 scripts/publish-blog/review-feedback.json 을 읽으세요.
   - version=2 구조: 'overallDecision', 'revisionGuide', 'stages.aeo_structure', 'stages.counselor_content' 필드 포함.
   - **'revisionGuide' 필드에 모든 수정 항목이 카테고리별 번호로 정리되어 있습니다 — 이것을 1차 작업 목록으로 사용하세요.**
   - 추가로 stages.*.details 의 각 항목(excerpt/issue/fix)도 확인해서 맥락을 파악하세요.
2. Read 로 scripts/publish-blog/content.json 을 읽으세요.
3. revisionGuide 의 각 항목이 본문에서 어디에 해당하는지 찾고, 'fix' 가이드에 따라 수정하세요.
   - **AEO 항목** ([aeo_structure] 태그): summary 단독 답변·passage self-containment·inline citation·첫 30% 답변 밀도 같은 구조 issue. 본문 텍스트와 summary 를 수정.
   - **상담사 콘텐츠 항목** ([counselor_content] 태그): 자격·정책 최신성·윤리·위기 대응·전문 표현. 본문 문구를 정확한 사실로 교체.
   - **출처 인용 항목** ([citation_check] 태그): 통계·수치 주장에 inline 출처 링크 누락. 신뢰할 공식 출처(정부·학회·논문)가 있으면 해당 주장 옆에 [출처명](URL) 형태로 inline 링크를 부착하고 references 에도 추가하세요. 출처를 확신할 수 없으면 구체 수치 단정을 완화하세요 (예: '유병률 5.7%' → '국내 조사에 따라 차이가 있으나 대체로 높게 보고됨').
   - 추측 금지. 정확한 정보를 모르면 안전한 일반 표현으로 대체하세요 (예: 구체 수치 → '관련 시행규칙 참고', 명확하지 않은 자격명 → '관련 자격 확인 필요').
   - 인용 가능한 공식 출처가 있으면 references 에도 추가하고 본문에 inline 링크 부착.
4. Write 로 수정된 content.json 을 같은 형식·구조로 다시 저장하세요.

## 가드레일
- content.content (본문) / content.summary / content.references 만 수정하세요.
  다른 필드(title, slug, keywords, meta_*, excerpt, faq, visual_keywords, categorySlug, targetAudience, status 등)는 절대 변경 금지.
- 본문 길이는 가능한 유지하세요 (수정 부분만 정확하게 고침).
- JSON 구조를 깨뜨리지 마세요.
- 마음토스 톤(~습니다체, 동료 상담사 어조, 이모지 없음) 유지.
- summary 박스 텍스트는 글 제목 질문에 대한 단독 답변으로 작성 (도입부 hook 으로 시작 금지).

수정 완료 후 종료하세요."

      fix_exit=0
      run_with_timeout "$POST_TIMEOUT" claude \
        -p "$fix_prompt" \
        --allowedTools "Read,Write,Edit" \
        --max-turns 12 \
        2>&1 | tee -a "$LOG_FILE" || fix_exit=$?

      if [[ $fix_exit -ne 0 ]]; then
        log_warn "  Claude 본문 수정 호출 실패 (코드: $fix_exit) — fact-fix 루프 종료"
        break
      fi

      log_info "  본문 수정 완료 — 재발행 시도..."
    done

    if [[ $publish_exit -eq 0 ]]; then
      slug=$(python3 -c "
import json
try:
    print(json.load(open('$CONTENT_FILE')).get('content', {}).get('slug', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")
      log_ok "  발행 성공! 슬러그: ${slug:-unknown}"
      [[ $fact_fix_count -gt 0 ]] && log_ok "    (Gemini 사실 오류 ${fact_fix_count}회 수정 후 발행)"
      published_slugs+=("${slug:-$keyword}")
      post_success=true
      succeeded=$((succeeded + 1))
      break
    elif [[ $publish_exit -eq 2 ]]; then
      # STRICT — 썸네일/NANOBANANA 문제 → 전체 배치 중단
      log_error "  [STRICT] publish.ts 가 코드 2 로 abort — 썸네일 생성 실패"
      log_error "  이 글은 DB INSERT 되지 않았으며, 일일 배치 전체를 중단합니다."
      fatal_abort=true
      fatal_reason="썸네일 생성 실패 (publish.ts exit 2) — 주제: ${keyword}"
      failed=$((failed + 1))
      failed_keywords+=("$keyword")
      break
    elif [[ $publish_exit -eq 3 ]]; then
      log_warn "  사실 오류 미해결 (코드: 3) — 이 글 포기, 다음 시도"
    else
      log_warn "  발행 실패 (코드: $publish_exit)"
    fi
  done

  # 치명적 중단 신호 — 외부 for 루프도 탈출
  if [[ "$fatal_abort" == "true" ]]; then
    remaining=$((topic_count_actual - i - 1))
    log_error "  치명적 오류로 일일 배치 중단 — 남은 주제 ${remaining}개 스킵"
    break
  fi

  if [[ "$post_success" == "false" ]]; then
    log_error "  '$keyword' 발행 실패 (최대 재시도 초과)"
    failed=$((failed + 1))
    failed_keywords+=("$keyword")
  fi

  if [[ $i -lt $((topic_count_actual - 1)) ]]; then
    log_info "  다음 포스트까지 ${SLEEP_BETWEEN}초 대기..."
    sleep "$SLEEP_BETWEEN"
  fi
done

# ------------------------------------------------------------------
# Phase 3: 결과 요약
# ------------------------------------------------------------------
log_info ""
log_info "========================================================"
log_info "[Phase 3] 발행 결과 요약"
log_info "========================================================"
if [[ "$fatal_abort" == "true" ]]; then
  log_error "  ⛔ 치명적 중단: $fatal_reason"
fi
log_info "  시도: ${topic_count_actual}개"
log_ok   "  성공: ${succeeded}개"
if [[ $failed -gt 0 ]]; then
  log_error "  실패: ${failed}개"
  for kw in "${failed_keywords[@]}"; do
    log_error "    - $kw"
  done
fi
if [[ ${#published_slugs[@]} -gt 0 ]]; then
  log_info "  발행된 슬러그:"
  for s in "${published_slugs[@]}"; do
    log_info "    - $s"
  done
fi
log_info "  로그: $LOG_FILE"
log_info "========================================================"

# ------------------------------------------------------------------
# Slack 알림 (자동발행 전용 채널 우선)
# ------------------------------------------------------------------
slack_webhook="${SLACK_WEBHOOK_URL_2:-${SLACK_WEBHOOK_URL:-}}"
if [[ -n "$slack_webhook" ]]; then
  if [[ "$fatal_abort" == "true" ]]; then
    slack_color="danger"
    slack_emoji=":rotating_light:"
    slack_text="치명적 중단 — $fatal_reason"
  elif [[ $failed -eq 0 ]]; then
    slack_color="good"
    slack_emoji=":white_check_mark:"
    slack_text="모든 포스트 발행 성공"
  else
    slack_color="warning"
    slack_emoji=":warning:"
    slack_text="${failed}개 실패"
  fi

  payload=$(python3 -c "
import json
payload = {
    'channel': '$SLACK_CHANNEL_OVERRIDE',
    'username': '마음토스 자동발행봇',
    'icon_emoji': ':memo:',
    'attachments': [{
        'color': '$slack_color',
        'title': '$slack_emoji 마음토스 일일 블로그 자동 발행 결과 ($LOG_DATE)',
        'fields': [
            {'title': '성공', 'value': '${succeeded}개', 'short': True},
            {'title': '실패', 'value': '${failed}개', 'short': True},
            {'title': '요약', 'value': '$slack_text', 'short': False},
        ],
        'footer': '마음토스 자동발행 시스템',
        'ts': __import__('time').time()
    }]
}
print(json.dumps(payload))
" 2>/dev/null || echo '{"text":"일일 발행 완료"}')

  curl -s -X POST -H "Content-Type: application/json" \
    --data "$payload" "$slack_webhook" >> "$LOG_FILE" 2>&1 || true
  log_info "슬랙 알림 전송 완료"
fi

# ------------------------------------------------------------------
# 락 해제
# ------------------------------------------------------------------
rm -f "$LOCK_FILE"
log_info "락 파일 제거 완료"

# 실패가 있으면 비정상 종료
[[ $failed -gt 0 ]] && exit 1
exit 0
