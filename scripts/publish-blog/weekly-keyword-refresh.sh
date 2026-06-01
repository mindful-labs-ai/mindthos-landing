#!/usr/bin/env bash
# =============================================================================
# weekly-keyword-refresh.sh — 마음토스 주간 SEO 키워드 풀 보강
#
# 매주 1회 자동 실행되어 web/context/target-keywords.md 에 신규 키워드를
# 카테고리별로 분산 추가합니다 (claude -p 가 작업).
#
# 사용법:
#   bash scripts/publish-blog/weekly-keyword-refresh.sh
#   bash scripts/publish-blog/weekly-keyword-refresh.sh --dry-run
#
# pm2 자동 실행 (매주 월 05:00 KST):
#   ecosystem.config.js 의 weekly-keyword-refresh 항목 참조
# =============================================================================

set -euo pipefail

# ------------------------------------------------------------------
# 경로/상수
# ------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/logs"
LOG_DATE="$(date +%Y-%m-%d)"
LOG_FILE="$LOGS_DIR/weekly-keyword-refresh-$LOG_DATE.log"
LOCK_FILE="/tmp/mindthos-weekly-keyword-refresh.lock"
KEYWORDS_FILE="$PROJECT_ROOT/web/context/target-keywords.md"
SUMMARY_FILE="$LOGS_DIR/keyword-refresh-$LOG_DATE.json"
SELECT_TOPICS_TS="$SCRIPT_DIR/src/select-daily-topics.ts"

CLAUDE_TIMEOUT=900
CLAUDE_MAX_TURNS=20
# Slack 채널 override — 마음토스 자동 발행 채널(C0ARUQ8F18U) 로 전송
SLACK_CHANNEL_OVERRIDE="${MINDTHOS_SLACK_CHANNEL:-C0ARUQ8F18U}"

# ------------------------------------------------------------------
# 로그
# ------------------------------------------------------------------
mkdir -p "$LOGS_DIR"
log() {
  local level="$1"; shift
  local ts; ts="$(date '+%Y-%m-%d %H:%M:%S')"
  local line="[$ts] [$level] $*"
  echo "$line"
  echo "$line" >> "$LOG_FILE"
}
log_info()  { log "INFO " "$@"; }
log_warn()  { log "WARN " "$@"; }
log_error() { log "ERROR" "$@"; }
log_ok()    { log "OK   " "$@"; }

# ------------------------------------------------------------------
# 인수
# ------------------------------------------------------------------
DRY_RUN=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    *) log_warn "알 수 없는 인수: $1"; shift ;;
  esac
done

# ------------------------------------------------------------------
# 정리 핸들러
# ------------------------------------------------------------------
cleanup() {
  log_warn "종료 신호 수신 — 정리 중..."
  rm -f "$LOCK_FILE"
  exit 130
}
trap cleanup SIGTERM SIGINT

# ------------------------------------------------------------------
# .env.local 로드 (Supabase 자격 필요 — select-daily-topics 풀 확인용)
# ------------------------------------------------------------------
ENV_FILE="$PROJECT_ROOT/web/.env.local"
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value || [[ -n "$key" ]]; do
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    export "$key=$value"
  done < "$ENV_FILE"
fi

# ------------------------------------------------------------------
# 락
# ------------------------------------------------------------------
if [[ -f "$LOCK_FILE" ]]; then
  existing_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    log_error "이미 실행 중 (PID: $existing_pid)"
    exit 1
  else
    log_warn "오래된 락 파일 제거 (PID: ${existing_pid:-unknown})"
    rm -f "$LOCK_FILE"
  fi
fi
echo $$ > "$LOCK_FILE"

# ------------------------------------------------------------------
# PATH 보강 + claude 검증
# ------------------------------------------------------------------
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/Applications/cmux.app/Contents/Resources/bin:$PATH"
if ! command -v claude &>/dev/null; then
  log_error "claude CLI 를 PATH 에서 찾을 수 없습니다"
  rm -f "$LOCK_FILE"; exit 1
fi

# ------------------------------------------------------------------
# timeout 폴백
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
# 시작
# ------------------------------------------------------------------
log_info "========================================================"
log_info "마음토스 주간 SEO 키워드 풀 보강 시작"
log_info "  프로젝트:    $PROJECT_ROOT"
log_info "  대상 파일:   $KEYWORDS_FILE"
log_info "  요약 파일:   $SUMMARY_FILE"
log_info "  Dry-run:    $DRY_RUN"
log_info "========================================================"

cd "$PROJECT_ROOT"

# ------------------------------------------------------------------
# 기존 풀 크기 확인 (select-daily-topics dry-run 로 측정)
# ------------------------------------------------------------------
existing_count=0
if [[ -f "$KEYWORDS_FILE" ]]; then
  existing_count=$(npx tsx "$SELECT_TOPICS_TS" --count 1 --dry-run 2>&1 \
    | grep -E "최종 풀:" | head -1 | grep -oE "[0-9]+개" | head -1 | tr -d '개' || echo 0)
fi
log_info "현재 키워드 풀: ${existing_count:-0}개"

if [[ "$DRY_RUN" == "true" ]]; then
  log_info "[dry-run] claude 호출 스킵 — 종료"
  rm -f "$LOCK_FILE"; exit 0
fi

# ------------------------------------------------------------------
# Claude 프롬프트
# ------------------------------------------------------------------
CURRENT_MONTH=$(date +%-m)
TODAY=$(date +%Y-%m-%d)

REFRESH_PROMPT="당신은 마음토스 블로그의 SEO 키워드 큐레이터입니다. 주 독자는 상담사·임상가·수련생 등 전문가입니다.

## 목적
web/context/target-keywords.md 에 신규 SEO 키워드 **20~30개** 를 보강합니다.
일일 자동 발행으로 풀이 빠르게 소진되므로 카테고리·검색 의도·타겟 독자를 다양하게 채워주세요.

## 작업 절차
1. 다음 파일들을 모두 읽으세요:
   - web/context/target-keywords.md   (현재 8개 카테고리 키워드 풀)
   - web/context/brand-voice.md       (톤·금지 표현)
   - web/context/seo-guidelines.md    (카테고리별 기준)
   - web/context/internal-links-map.md (CTA 매핑)

2. 다음 조건을 모두 만족하는 신규 키워드를 선정하세요:
   - 기존 키워드와 의미 중복되지 않을 것 (단어 단위 Jaccard ≥ 0.7 회피)
   - 8개 카테고리(case-conceptualization, counseling-skills, training, career, operations, self-care, trends, tech-blog) 에 분산
   - **각 카테고리당 최소 2개**
   - **최소 5개는 상업형/거래형 의도** (도구·교육·자격 비교 — 예: '축어록 비교', '슈퍼비전 비용')
   - **최소 5개는 기관 도입 담당자 시점** (tech-blog/operations — 보안·계약·운영)
   - **최소 8개는 롱테일** (3단어 이상, 자연어 질문 형태 환영)
   - 시즌(현재 ${CURRENT_MONTH}월) 과 2026년 임상 현장 트렌드 반영
   - YMYL 안전 — 비전문가에게 의료 진단/처방을 권유하는 키워드 ❌

3. 선정한 키워드를 web/context/target-keywords.md 의 **'## 시즌별 키워드 캘린더' 섹션 바로 위** 에 다음 형식으로 삽입하세요. 'Edit' 도구를 사용하세요. 정확한 삽입 지점을 찾기 위해 Read 로 파일을 확인 후 작업하세요.

\`\`\`markdown
---

## 자동 추가 키워드 (${TODAY})

> 주간 자동 보강 — 카테고리별 정렬

### 1. case-conceptualization (자동 추가 ${TODAY})

| 키워드 | 의도 | 비고 |
|-------|-----|-----|
| 키워드1 | 정보형 | 보강 사유 |

#### 롱테일 (자동 추가)
- \"롱테일 키워드 1\"

### 2. counseling-skills (자동 추가 ${TODAY})

(같은 형식)

(... 8개 카테고리 모두)
\`\`\`

표 헤더는 정확히 \`| 키워드 | 의도 | 비고 |\` 로 유지하세요. 의도는 \`정보형\`, \`정보형/상업형\`, \`상업형\`, \`거래형\`, \`탐색\` 중 선택하세요. 마음토스 기존 표 구조와 동일합니다.

4. 작업 후 logs/keyword-refresh-${TODAY}.json 파일에 다음 형식으로 요약을 저장하세요:

\`\`\`json
{
  \"added_at\": \"${TODAY}\",
  \"total_added\": 25,
  \"by_category\": {
    \"case-conceptualization\": [\"키워드1\", \"키워드2\"],
    \"counseling-skills\": [...],
    \"training\": [...],
    \"career\": [...],
    \"operations\": [...],
    \"self-care\": [...],
    \"trends\": [...],
    \"tech-blog\": [...]
  },
  \"reasoning\": \"왜 이 키워드들을 골랐는지 2~3문장 (트렌드/계절/기관 도입 등)\"
}
\`\`\`

5. 모든 작업이 끝나면 종료하세요."

# ------------------------------------------------------------------
# Claude 실행
# ------------------------------------------------------------------
log_info "Claude 로 키워드 보강 요청 중..."

claude_exit=0
run_with_timeout "$CLAUDE_TIMEOUT" claude \
  -p "$REFRESH_PROMPT" \
  --allowedTools "Read,Write,Edit,Glob,Grep" \
  --max-turns "$CLAUDE_MAX_TURNS" \
  2>&1 | tee -a "$LOG_FILE" || claude_exit=$?

if [[ $claude_exit -ne 0 ]]; then
  log_error "claude 실행 실패 (코드: $claude_exit)"
  rm -f "$LOCK_FILE"; exit 1
fi

# ------------------------------------------------------------------
# 검증: 풀이 늘었는지
# ------------------------------------------------------------------
new_count=$(npx tsx "$SELECT_TOPICS_TS" --count 1 --dry-run 2>&1 \
  | grep -E "최종 풀:" | head -1 | grep -oE "[0-9]+개" | head -1 | tr -d '개' || echo 0)

log_info "갱신 후 키워드 풀: ${new_count:-?}개 (이전: ${existing_count:-?}개)"

if [[ -n "${new_count:-}" && -n "${existing_count:-}" && "$new_count" -le "$existing_count" ]]; then
  log_warn "키워드 수가 늘지 않았습니다 — Claude 작업을 확인하세요"
fi

# ------------------------------------------------------------------
# Slack 알림
# ------------------------------------------------------------------
slack_webhook="${SLACK_WEBHOOK_URL_2:-${SLACK_WEBHOOK_URL:-}}"
if [[ -n "$slack_webhook" ]]; then
  added_count=$((${new_count:-0} - ${existing_count:-0}))
  payload=$(python3 -c "
import json
print(json.dumps({
  'channel': '$SLACK_CHANNEL_OVERRIDE',
  'username': '마음토스 자동발행봇',
  'icon_emoji': ':memo:',
  'attachments': [{
    'color': 'good',
    'title': ':sparkles: 마음토스 주간 SEO 키워드 보강 결과 ($LOG_DATE)',
    'fields': [
      {'title': '추가', 'value': '${added_count}개', 'short': True},
      {'title': '풀 크기', 'value': '${new_count:-?}개', 'short': True},
    ],
    'footer': '마음토스 자동 키워드 갱신',
    'ts': __import__('time').time()
  }]
}))
" 2>/dev/null || echo '{"text":"키워드 보강 완료"}')
  curl -s -X POST -H "Content-Type: application/json" --data "$payload" \
    "$slack_webhook" >> "$LOG_FILE" 2>&1 || true
fi

rm -f "$LOCK_FILE"
log_ok "주간 키워드 보강 완료"
exit 0
