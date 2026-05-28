# Master Document Fact-Check 시스템 — 아키텍처

- **작성일**: 2026-05-27
- **목적**: AI 다중 검수 워크플로우(Stage 3)의 정답지 시스템
- **참조**: [ai-review-workflow.md](./ai-review-workflow.md)

---

## 1. 컨셉

"YMYL(정신건강) 주제는 AI 가 자기 일반 지식으로 fact-check 하면 안 된다 — 권위 있는 문서를 정답지(master)로 두고 그 문서와 비교한다."

목적:
- LLM 환각(hallucination) 으로부터 마음토스 콘텐츠 격리
- 마음토스가 인용하는 사실의 일관성·갱신성 보장
- master doc 자체가 마음토스의 **clinical knowledge backbone** 이 되어 신뢰 자산화

---

## 2. 폴더 구조

마음토스 블로그 = 상담사 대상 B2B SaaS 콘텐츠. master doc 구성도 **상담사 실무 정보가 1순위**, 조건/장애 master 는 그 다음.

```
docs/fact-master/
├── README.md                          # 인덱스 + 작성·갱신 규칙
├── _schema.md                         # master doc 표준 schema
├── _sources.md                        # 신뢰 source whitelist
│
├── # ── 상담사 실무 영역 (Phase 1 — 가장 자주 인용) ──
├── counseling-licenses-kr.md          # 한국 상담 관련 자격증 (임상심리·상담심리·정신건강임상심리·사회복지)
├── counseling-ethics-kr.md            # 학회 윤리강령 (이중관계·비밀보장·다중역할 등)
├── counseling-regulations-kr.md       # 정신건강복지법·청소년상담복지법·EAP 가이드라인
├── crisis-response.md                 # 위기 상담 표준 절차 (자살·자해·학대·가정폭력)
├── supervision-standards.md           # 슈퍼비전 시간 요건·인정 기준
├── counseling-techniques.md           # CBT/DBT/ACT 등 기법 일반
├── assessment-tools.md                # K-WAIS/MMPI-2/BDI/PHQ-9 등 평가도구
├── counseling-records.md              # 상담 기록·축어록·진행노트 표준
│
├── # ── 조건/장애 영역 (Phase 2 — 상담 콘텐츠에서 다룰 때 정확성용) ──
├── adhd.md
├── major-depressive-disorder.md
├── panic-disorder.md
├── generalized-anxiety-disorder.md
├── ptsd.md
├── trauma.md
├── grief.md
├── child-adolescent.md
├── couples-family.md
└── ...
```

조건/장애 master 는 상담사 콘텐츠에서 "ADHD 내담자 상담 시 고려사항" 같이 다뤄질 때 사실 정확성 보장용. Phase 2 우선순위.

운영 위치:
- 권장: `mindthos-landing` repo 의 `web/fact-master/` 또는 별도 repo `mindthos-fact-master`
- AI 가 fetch 하기 쉽도록 GitHub raw URL 노출 가능한 경로

---

## 3. Master Doc 표준 구조

각 master doc 은 다음 frontmatter + 섹션 구조:

```markdown
---
slug: adhd
title: 주의력결핍 과잉행동장애 (ADHD)
aliases: [adhd, 성인 adhd, attention deficit, 주의력결핍]
last_reviewed: 2026-05-27
last_refreshed: 2026-05-27
ai_only: true  # AI 가 자동 생성·갱신
sources_consulted:
  - https://www.kcp.or.kr/    # 한국임상심리학회
  - https://www.kosadd.org/   # 대한소아청소년정신의학회
  - DSM-5-TR (한국어판, APA 2023)
  - https://www.cdc.gov/adhd/
  - https://www.kdca.go.kr/
confidence_overall: 0.9
---

# ADHD — Fact-Check Master

## 진단 기준 (DSM-5-TR)

### Claim
ADHD 진단은 12세 이전에 증상이 시작되었어야 한다.

- **Source**: DSM-5-TR Criterion B
- **Confidence**: 1.0
- **Last verified**: 2026-05-27

### Claim
성인 ADHD 는 부주의 또는 과잉행동·충동성 증상 중 5개 이상이 6개월 이상 지속되어야 한다.
(아동은 6개 이상)

- **Source**: DSM-5-TR Criterion A
- **Confidence**: 1.0

## 유병률

### Claim
성인 ADHD 유병률은 약 2.5% (전 세계 메타분석).

- **Source**: Simon et al. (2009). 메타분석 Br J Psychiatry.
- **Confidence**: 0.85
- **Notes**: 한국 성인 유병률은 1.1-2.0% 범위로 보고됨 (KEpiSurv 2022).

### Claim
아동 ADHD 유병률은 약 5-7%.

- **Source**: Polanczyk et al. (2007). 메타분석.
- **Confidence**: 0.9

## 치료

### Claim — 1차 치료
성인 ADHD 1차 약물치료는 메틸페니데이트 또는 암페타민 계열 자극제.

- **Source**: NICE NG87 (2018, 2024 update); 대한소아청소년정신의학회 ADHD 임상지침
- **Confidence**: 0.95

### Claim — 비약물치료
CBT 와 메타인지 훈련은 성인 ADHD 에 보조적 효과가 있음.

- **Source**: Knouse et al. (2017) JCCP 메타분석.
- **Confidence**: 0.8

## 한국 특수 컨텍스트

### Claim
한국은 ADHD 진단·약물치료 접근성에서 OECD 평균보다 낮음.

- **Source**: 보건복지부 정신건강실태조사 2021
- **Confidence**: 0.8

## 잘못 알려진 정보 (Anti-Claims — fact-check 시 글이 이렇게 주장하면 차단)

### Anti-Claim
"ADHD 는 게으름의 결과다" — 거짓.
"ADHD 약물은 중독성이 강해 절대 복용하면 안 된다" — 과장. 의학적 사용은 의존 위험 낮음.
"성인 ADHD 는 존재하지 않는다" — 거짓.

---

## 갱신 이력

- 2026-05-27: 최초 작성 (AI 합성 + cross-LLM 검증)
- (예정) 2026-08-27: 분기 refresh
```

---

## 4. Claim Triple 형식

각 Claim 은 다음 메타 구조:

```yaml
claim: "사실 주장 본문"
source: "신뢰 출처 (저자, 연도, 가이드라인 등)"
confidence: 0.0-1.0   # 출처 강도·합의도
last_verified: ISO date
notes: "(선택) 한국 컨텍스트, 예외, 추가 단서"
```

Confidence 가이드:
- 1.0 — DSM-5-TR / 보건복지부 공식 / Cochrane 메타분석
- 0.8-0.9 — 학회 가이드라인 / 메이저 메타분석
- 0.6-0.7 — 단일 RCT / 한국 단일 연구
- < 0.6 — 의견·통념. **fact-check 에서 인용 차단** 또는 ambiguous 처리

---

## 5. 신뢰 Source Whitelist (`_sources.md`)

master doc 작성·갱신 시 AI 가 fetch 가능한 권위 출처:

### 한국 (1차) — 상담사 실무 영역
- **한국임상심리학회** (`https://www.kcp.or.kr/`) — 임상심리전문가·자격
- **한국상담심리학회** (`https://krcpa.or.kr/`) — 상담심리사 1·2급·윤리강령
- **한국상담학회** (`https://counselors.or.kr/`) — 전문상담사 자격
- 한국정신건강사회복지학회 — 정신건강사회복지사 자격
- **법제처 국가법령정보센터** (`https://www.law.go.kr/`) — 정신건강복지법·청소년상담복지법 최신 조문
- **보건복지부 정신건강정책과** — EAP 가이드라인·정신건강증진사업 안내
- 국립정신건강센터 (`https://www.ncmh.go.kr/`) — 위기상담 표준 절차·자살예방 가이드라인
- 여성가족부 — 청소년상담복지센터 1388 운영 표준

### 한국 (조건/장애 영역)
- 대한신경정신의학회 (`https://www.knpa.or.kr/`)
- 대한소아청소년정신의학회 (`https://www.kacap.or.kr/`)
- KDCA (질병관리청, 정신건강 통계)

### 국제 (1차)
- DSM-5-TR (APA 2023)
- ICD-11 (WHO)
- NICE Guidelines (영국)
- NIMH (`https://www.nimh.nih.gov/`)
- CDC Mental Health (`https://www.cdc.gov/mentalhealth/`)
- Cochrane Reviews

### 학술 DB
- PubMed (`https://pubmed.ncbi.nlm.nih.gov/`)
- KISS, RISS (한국)

### 차단 출처
- 위키피디아 (직접 인용 ❌, 단 출처 추적용으로는 OK)
- 일반 health 블로그·매체
- 광고성 의료기관 사이트
- Reddit, 카페, 익명 커뮤니티

---

## 6. Master Doc 라이프사이클

### 6-1. 최초 생성 (사람 일회 작성 또는 AI 합성)

운영 방식: **AI 자동 생성 + cross-LLM 검증**.

스크립트: `scripts/master-docs/create.ts` (신규 작성 예정)

```
[입력] topic slug, aliases, source URL 목록
   ↓
[Step A] 각 source URL fetch + 본문 추출
   ↓
[Step B] LLM #1 (Claude Opus) 가 source 들에서 claim 추출 → draft master
   ↓
[Step C] LLM #2 (Gemini Pro) 가 LLM #1 draft 를 검증 → 모순 / 누락 / confidence 재평가
   ↓
[Step D] LLM #1 이 LLM #2 critique 반영 → 최종 master
   ↓
[Step E] 결과 저장 + commit (Git history 가 갱신 이력 보존)
```

비용: 글 1개 master 당 약 $2-5 (큰 비용 — 평생 자산이라 허용)

### 6-2. 정기 Refresh (분기 1회)

```
[Step A] 각 master 의 last_refreshed 확인 → 90일 초과 대상 선별
   ↓
[Step B] 동일 source URL 재 fetch
   ↓
[Step C] 새 source 본문 vs 기존 master claim 대조 → diff 생성
   ↓
[Step D] LLM 이 diff 평가 → master update 제안 + 변경 사유
   ↓
[Step E] 변경 큰 master 는 자동 적용 X — review queue 에 올림 (운영자 1회 확인)
```

비용: 분기 당 ~$30-50 (모든 master).

### 6-3. Trigger-Based Update

- 글 발행 중 Stage 3 가 `missing_in_master` 다수 발견 → master refresh trigger
- 운영자가 새 가이드라인 발견 → 수동 master 추가/갱신

---

## 7. Stage 3 Fact-Check 와의 인터페이스

**검수 시 AI 가 master 를 사용하는 방식**:

1. 글의 토픽 추론 → master slug 매칭 (예: `["adhd", "counseling-techniques"]`)
2. 매칭된 master doc(s) 의 본문을 prompt 에 포함
3. 글의 사실 claim 들을 master 의 claim 과 대조
4. 결과:
   - **consistent**: master 와 정확히 일치
   - **contradicts**: master 와 모순 → 차단·수정
   - **ambiguous**: master 에 명시되지 않은 디테일
   - **missing_in_master**: 글의 claim 이 master 에 없음 → master 갱신 또는 source 보강 필요
   - **violates_anti_claim**: master 의 anti-claim 에 해당 → 즉시 차단

---

## 8. 운영 / 모니터링

### 운영 책임
- master doc 추가 / 갱신 결정 — 운영자
- master 작성·갱신 실행 — AI 스크립트
- 검증된 master 의 Git commit 시 운영자 1회 spot check (≥ 변경 비율)

### 모니터링 지표
- master 갯수 / 마지막 refresh 일자
- `missing_in_master` 누적 빈도 (어느 토픽이 부족한지)
- `contradicts` 발견 빈도 (어느 master 가 자주 충돌하는지 — 갱신 필요)
- master 평균 confidence_overall

---

## 9. 최초 5개 우선 master (Phase 1) — **상담사 실무 영역 우선**

마음토스 블로그 발행 콘텐츠 = 상담사 실무 도구·정책·자격·기법 중심.
→ Phase 1 master 는 **상담사가 일상적으로 인용·확인하는 정보** 우선.
→ 조건/장애명 master 는 Phase 2.

| # | Master Doc | 이유 |
|---|-----------|------|
| 1 | `counseling-licenses-kr.md` | 한국 상담 자격증 (임상심리사·상담심리사·정신건강임상심리사·사회복지사) — 가장 자주 인용·가장 자주 변경됨 (시험 일정·자격 갱신 주기 등) |
| 2 | `counseling-ethics-kr.md` | 학회 윤리강령 — 이중관계·비밀보장·다중역할 — 상담사 콘텐츠 안전 가드 |
| 3 | `counseling-regulations-kr.md` | 정신건강복지법·청소년상담복지법·EAP 가이드라인 — 정책 변경 잦음 |
| 4 | `crisis-response.md` | 위기 상담 표준 절차 — 자살·자해·학대 대응. Stage 4 의 `crisisResponseGap` 검수 기준 |
| 5 | `counseling-techniques.md` | CBT/DBT/ACT/IFS 등 기법 일반 — 임상 기법 정확성 |

Phase 2 (조건/장애 — 상담 콘텐츠에서 이런 케이스 다룰 때):
6. `supervision-standards.md`
7. `assessment-tools.md` (K-WAIS·MMPI-2 등)
8. `adhd.md`
9. `major-depressive-disorder.md`
10. `counseling-records.md` (상담 기록·축어록 표준)

Phase 3:
11. `panic-disorder.md` / `generalized-anxiety-disorder.md` / `ptsd.md` / `trauma.md` / `child-adolescent.md` / `couples-family.md` / `grief.md`

---

## 10. 한계·위험

- **Master 자체의 정확성**: AI 합성으로 만들면 환각 가능. → cross-LLM (Claude·Gemini) 합의 + source URL 명시로 reduce.
- **소스 url 사라짐 / 변경**: 분기 refresh 가 dead link 감지 + 대체 source 탐색. 그래도 1-2년 단위 dead 가능.
- **언어 격차**: DSM-5-TR 등 영문 가이드라인 → 한국어 master 변환 시 뉘앙스 누락. 한국학회 가이드라인 우선 채택.
- **새로운 진단 카테고리**: ICD-11, DSM 개정 시 master 전체 재검토 필요. 알림 trigger 필요.

---

## 11. 다음 액션

1. `docs/fact-master/` 폴더 생성 + `_schema.md`, `_sources.md`, `README.md` 작성
2. `scripts/master-docs/create.ts` 작성
3. Phase 1 master 5개 작성 (Claude + Gemini cross-verified)
4. Stage 3 fact-check 가 `docs/fact-master/` 에서 master 로드하도록 publish.ts 통합
5. 분기 refresh 스크립트 (V9, 후순위)
