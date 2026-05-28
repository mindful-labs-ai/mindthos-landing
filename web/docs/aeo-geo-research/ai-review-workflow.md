# AI 다중 검수 워크플로우 — 사람 검수 없는 자동화 파이프라인

- **작성일**: 2026-05-27
- **목표**: 사람 검수 없이 AI 만으로 글 품질·정확성 보증
- **핵심 컨셉**:
  - **Cross-LLM** — Claude 가 쓰고 Gemini 가 본다 (편향 다양화)
  - **Specialized verifiers** — 한 mega-prompt 가 아니라 역할별로 분리
  - **Master Document fact-check** — YMYL 주제는 토픽별 정답지(master doc)와 대조
  - **Iteration loop** — Critique → Revise → Re-verify (최대 2-3회)
  - **Token 비용 ↑ 허용** — 글 한 편 당 token 4-8배 써도 품질이 더 중요

---

## 1. 파이프라인 전체 구조

```
[Stage 0] Claude → 초안 작성 (skill/script 이미 운영 중)
                    ↓ content.json
[Stage 1] Self-Reflection — Claude 가 자기 글을 AEO 체크리스트로 자기 검토 → 1차 수정
                    ↓
[Stage 2] AEO/구조 검증 (Gemini) — passage 단독성, summary 직접답변, citations, listicle 적합
                    ↓
[Stage 3] Fact 검증 (Gemini + Master Docs) — 토픽 추론 → master doc 로드 → 모순 검출
                    ↓
[Stage 4] 임상·윤리 검증 (Gemini) — 자격 범위, 광고 표현, 스티그마, 유해 권고
                    ↓
[Stage 5] Critique 통합 → Claude 가 모든 issue 보고 본문 수정
                    ↓
[Stage 6] Re-verify (Stage 2-4 다시) — 1회 한정
                    ↓
        ┌────────── 통과? ─────────┐
        Yes                       No
         ↓                         ↓
[Stage 7 발행]            [auto_review_queue=true]
  - 모든 검증 결과를 DB     - status='draft' 유지
    columns 에 기록         - Telegram/Discord 알림 (옵션)
  - revalidate + IndexNow   - 운영자가 prompt/master doc 보완 후 재실행
```

---

## 2. 각 Stage 상세 스펙

### Stage 1 — Claude Self-Reflection

목적: Claude 가 자기가 쓴 초안을 AEO 체크리스트로 점검 후 1차 self-edit.

입력: `content.json` 의 `content`
프롬프트(요지):
```
당신은 마음토스 블로그 편집자입니다. 아래 본문을 다음 체크리스트로 자기 검토하고,
빠진 부분이 있다면 본문만 수정해서 다시 출력하세요. 사실 변경 ❌.

체크리스트:
1. summary 박스 텍스트가 글 제목 질문의 단독 답변인가? (도입부 hook 금지)
2. 각 H2 직후 첫 문장이 그 섹션의 self-contained 답변인가?
3. 의학·통계·연구 주장 모두 본문 안 inline 링크가 있는가?
4. 본문 첫 30% (첫 H2 위까지)에 핵심 답·요점이 들어있는가?
5. references 배열에 academic/government 출처가 최소 1개 있는가?
6. 광고형 표현, 자격 범위 초과 권고가 없는가?
```

출력: `content.json` 갱신 (`content`, `summary`, `references` 등)
실패 시: pass (Stage 0 결과 그대로 진행)
비용: 1회 Claude 호출 (sonnet 권장)

### Stage 2 — AEO/구조 검증 (Gemini)

목적: 인용 가능성 구조 점검. **사실 검증 ❌** (Stage 3 분리).

프롬프트(요지):
```
당신은 SEO/AEO 구조 검증자입니다. 본문을 평가해서 JSON 으로 출력하세요.

평가 항목:
1. summaryDirectAnswer: summary 첫 1-2 문장이 글 제목 질문의 단독 답변인가? (0-10)
2. passageSelfContainment: 각 H2 직후가 self-contained 인가? (0-10, 평균)
3. inlineCitations: 의학·통계·연구 주장 중 inline 링크가 없는 것은? (배열로 발췌 인용)
4. firstThirdDensity: 본문 첫 30% 답·요점 밀도 (0-10)
5. intentFormatMatch: 글 인텐트(정보성/결정성/비교성)에 포맷이 적합한가? (article/listicle/guide 중 권장)
6. overallScore: 1-10
7. mustFix: 발행 차단 사유 (배열) — 인용 불가능 수준이면 여기 채움

JSON 만 출력.
```

threshold:
- overallScore < 7 → revise (Stage 5 진입)
- mustFix 비어있지 않음 → revise

비용: 1회 Gemini 호출

### Stage 3 — Fact 검증 (Gemini + Master Docs)

가장 중요. 토픽별 master doc 와 대조.

**Sub-step 3a — 토픽 추론**
- 입력: title + keywords + 본문 첫 800자
- 프롬프트: "이 글이 다루는 임상 토픽들을 master doc slug 기준으로 추론해라.
  허용 slug: [목록 자동 주입]. 관련도 0.5+ 만 반환."
- 출력: `{ topics: [{ slug: "adhd", relevance: 0.9 }, ...] }`
- 비용: 1회 Gemini Flash (저렴)

**Sub-step 3b — Claim 추출**
- 입력: 본문 전체
- 프롬프트: "본문에서 사실 주장(통계·진단 기준·치료법·유병률 등)만 추출. 의견·해석은 제외.
  각 claim 에 본문 발췌 + 위치 메타."
- 출력: `{ claims: [{ text: "성인 ADHD 유병률은 약 2.5%", excerpt: "...", section: "유병률" }] }`
- 비용: 1회 Gemini

**Sub-step 3c — Master 와 대조**
- 입력: claims + 관련 master doc(s) 본문
- 프롬프트:
  ```
  당신은 fact-checker 입니다. 아래 claim 들이 master 문서와 일치하는지 평가하세요.

  각 claim 에 대해:
  - status: "consistent" | "contradicts" | "missing_in_master" | "ambiguous"
  - evidence: master 의 관련 발췌 (있으면)
  - suggestedFix: 모순일 경우 어떻게 고쳐야 하는가
  - confidence: 0-1
  ```
- 출력: 검증 보고서
- 비용: 1회 Gemini (master doc 포함 → 토큰 무거움. 그래서 토픽 선별이 중요)

threshold:
- `contradicts` 1개 이상 → revise + 본문에서 그 claim 제거 또는 수정 요구
- `missing_in_master` 다수 → master doc 갱신 trigger (별도 큐)
- `ambiguous` 는 정보로만 전달

비용 절약 전략:
- 토픽 관련도 < 0.5 → fact-check 건너뜀
- master doc 없는 토픽 → fact-check skip + master_docs_consulted=[] 기록 + 큐에 master 작성 요청

### Stage 4 — 상담 전문성·정합성 검증 (Gemini)

**스코프 명확화**: 마음토스 블로그 = 상담사 대상 B2B SaaS 콘텐츠. **환자/내담자 대상 의료 정보 사이트 아님**.
→ 의료광고법 같은 환자-side 규제는 검증 우선순위 ❌.
→ **상담 전문성·정책·자격·윤리 정합성**이 진짜 검증해야 할 영역.

평가 항목:
| ID | 항목 | 정의 | 차단 기준 |
|----|------|------|----------|
| 1 | `scopeOfPractice` | 상담사 자격 범위 초과 권고 (예: 약물 권고, 진단 단정, 약 용량 조절 안내) | 1건 이상 → revise |
| 2 | `counselingEthics` | 윤리강령 위반 가능 표현 (이중관계, 비밀보장 위반, 다중 역할, 부적절한 자기개방) | 1건 이상 → revise |
| 3 | `crisisResponseGap` | 위기 상황(자살·자해·아동학대·가정폭력) 대응 표준 절차가 빠진 권고 | 1건 이상 → revise |
| 4 | `regulationCurrency` | 인용된 법령·정책·자격 제도 최신 여부 (정신건강복지법, 청소년상담복지법, 자격 갱신 주기 등) | outdated 1건 이상 → revise + master doc 확인 |
| 5 | `credentialAccuracy` | 자격증 명칭·발급 기관·시험 일정·역량 범위 정확성 | 오류 1건 이상 → revise |
| 6 | `professionalLanguage` | 비전문 / 광고형 표현 ("최고의", "유일한", "상담사 인증") | 발견 → revise |
| 7 | `outdatedStatistics` | 통계·연구 인용 출처 연도 5년 초과 또는 출처 불명 | 5년 초과 → ambiguous, 출처 불명 → revise |
| 8 | `unsafeAdvice` | 상담사에게 권고하면 안 되는 위해 가능 행동 (예: 슈퍼비전 없이 단독 위기 개입) | 1건 이상 → **즉시 큐 (revise 금지)** |

프롬프트(요지):
```
당신은 마음토스 콘텐츠 검증자입니다. 본문은 한국 상담사·임상가 대상 B2B SaaS 블로그입니다.
환자 대상 의료 정보가 아닙니다 — 의료광고법 평가 ❌.

다음 8개 항목으로 본문을 평가하고 JSON 으로 출력:
1. scopeOfPractice: 상담사 자격 범위 초과 권고
2. counselingEthics: 윤리강령 위반 가능 표현 (이중관계, 비밀보장, 자기개방 등)
3. crisisResponseGap: 위기 상황 대응 표준 절차 누락
4. regulationCurrency: 인용된 한국 상담·정신건강 관련 법령·정책의 최신성
5. credentialAccuracy: 자격증 정보 정확성 (임상심리사·상담심리사·정신건강임상심리사·사회복지사 등)
6. professionalLanguage: 비전문/광고형 표현
7. outdatedStatistics: 5년 초과 통계 또는 출처 불명
8. unsafeAdvice: 상담사에게 위해 가능한 권고 (단독 위기 개입 등)

각 항목에 발견된 issue 발췌 + 권장 수정안 포함.
mustBlock: 발행 차단 항목 (unsafeAdvice 가 1건 이상이면 자동 포함)

JSON 만 출력.
```

threshold:
- `unsafeAdvice` 1건 이상 → **즉시 큐**, revise 금지
- `mustBlock` 비어있지 않음 → revise 또는 큐
- 기타 항목 1건 이상 → revise

**의료광고법 평가가 제거된 이유**: 마음토스 블로그는 의료기관 광고 또는 환자 대상 의료 정보 사이트가 아닌, 상담사 대상 도구·정책·실무 콘텐츠 사이트. 의료광고법 위반 케이스가 사실상 발생 불가. 검수 노이즈만 늘림.

비용: 1회 Gemini Flash

### Stage 5 — Claude 수정 패스

입력: Stage 2-4 의 모든 critique 보고서 통합
프롬프트:
```
당신은 마음토스 블로그 편집자입니다. 아래 critique 를 모두 반영해서 본문을 수정하세요.

가드레일:
- 사실·통계·인용은 master doc 가 제시한 정답으로 교체 (없으면 제거)
- AEO 구조 critique 는 형식 변경으로 반영
- 임상·윤리 issue 는 표현 수정 또는 해당 권고 삭제
- 새로운 사실·주장 추가 금지 — 본문에 없던 정보를 만들지 마세요

전체 본문 + 갱신된 summary, references 를 출력.
```

비용: 1회 Claude (opus 권장 — 다중 critique 반영은 추론 부담)

### Stage 6 — Re-verify

Stage 2, 3, 4 를 다시 1회 실행. 모두 통과하면 발행.
**2회 이상 iteration 금지** — 비용 폭발 + 무한 루프 회피.

여전히 실패하면:
- `status='draft'` 유지
- `auto_review_queue = true`
- 알림 발송 (운영자가 master doc 갱신 또는 prompt 조정)

---

## 3. 비용·시간 추정

| Stage | LLM | 호출 | 입력 토큰 (예) | 글당 비용 (USD, sonnet/flash 기준) |
|-------|-----|------|---------------|-------------------------------------|
| 0 | Claude Sonnet | 1 | 3K (skill) | $0.04 |
| 1 | Claude Sonnet | 1 | 5K | $0.05 |
| 2 | Gemini Flash | 1 | 5K | $0.01 |
| 3a | Gemini Flash | 1 | 2K | $0.005 |
| 3b | Gemini Flash | 1 | 5K | $0.01 |
| 3c | Gemini Pro | 1 | 15K (master doc 포함) | $0.05 |
| 4 | Gemini Flash | 1 | 5K | $0.01 |
| 5 | Claude Opus | 1 (if needed) | 8K | $0.30 |
| 6 | Stage 2-4 재실행 | 3 | 위와 동일 | $0.025 |

**1글당 최악 비용**: 약 **$0.5** (revise 1회 발생 시) — 무한 루프 아닌 cap 있음.
**평균 비용**: 약 **$0.15-0.25** (대부분 Stage 5-6 skip).

→ 일 5편 발행 시 월 ~$25-75. 한국어 정신건강 콘텐츠 1편이 적정 의료광고 검수 대행 비용보다 압도적으로 저렴.

---

## 4. Master Document 시스템

**별도 문서**: `web/docs/aeo-geo-research/master-docs-architecture.md` 참조.

요약:
- `docs/fact-master/{topic-slug}.md` 구조 (예: `adhd.md`, `mdd.md`)
- 각 master 는 [Claim · Source · Confidence] 트리플 형태
- 최초 생성: AI 가 외부 가이드라인 (KSAD/KSDP/DSM-5-TR/KDCA) 합성 → cross-LLM 합의 검증
- 갱신: 분기 1회 자동 refresh + master_docs_consulted 가 누적된 글 빈도 보고

---

## 5. DB 컬럼 (마이그레이션 008 재설계)

기존 사람 검수 컬럼 제거. AI-only 검수 흔적으로 전체 교체:

```sql
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS ai_review jsonb,
  -- 구조:
  -- {
  --   "stages": {
  --     "self_reflection": { "ran": true, "model": "claude-sonnet-4-6", "at": "..." },
  --     "aeo_structure":   { "score": 8.5, "must_fix": [], "model": "...", "at": "..." },
  --     "fact_check":      { "topics": ["adhd"], "master_docs": ["adhd.md"], "contradicts": 0, "ambiguous": 1, "at": "..." },
  --     "clinical_ethics": { "score": 9.0, "must_block": [], "at": "..." }
  --   },
  --   "iterations": 1,
  --   "final_pass_at": "2026-05-27T10:00:00+09:00",
  --   "queued_for_review": false
  -- }
  ADD COLUMN IF NOT EXISTS auto_review_queue boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fact_check_topics text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS review_iterations int DEFAULT 0;
```

이전 마이그레이션 008 (`reviewed_by`, `reviewed_at` 등 사람 검수 칼럼)은 폐기.

---

## 6. 구현 우선순위

| ID | 작업 | Impact | Effort | 의존성 |
|----|------|--------|--------|--------|
| V1 | 마이그레이션 008 재설계 (AI-only 컬럼) | High | XS | — |
| V2 | Stage 2 (AEO 검증) Gemini 프롬프트 분리 + publish.ts 통합 | High | M | V1 |
| V3 | Stage 4 (임상·윤리) Gemini 프롬프트 분리 + Stage 2 와 병렬 호출 | High | S | V2 |
| V4 | Master doc 시스템 — `docs/fact-master/` 폴더 + 최초 5개 토픽 master 작성 | High | L | — |
| V5 | Stage 3 (fact-check) 구현 — 토픽 추론 + master 로드 + 대조 | Critical | L | V4 |
| V6 | Stage 5 (Claude 수정 패스) — daily-auto-publish.sh exit code 라우팅 확장 | High | M | V2-V5 |
| V7 | Stage 6 (re-verify) — iteration cap 로직 + auto_review_queue 기록 | High | S | V6 |
| V8 | Stage 1 (self-reflection) Claude 추가 패스 — 토큰 비용 vs 효과 검증 | Med | S | V2-V4 |
| V9 | Master doc 분기 자동 refresh — 외부 가이드라인 fetch + diff | Med | XL | V4 |
| V10 | auto_review_queue 알림 (Telegram/Discord webhook) | Low | XS | V7 |

---

## 7. 운영 모드 (운영자 입장)

평상시:
- Claude skill 로 글 작성 → content.json 저장
- `npx tsx scripts/publish-blog/src/publish.ts` 실행 → 자동 검수 → 통과 시 발행, 실패 시 draft + queue
- 운영자는 `auto_review_queue=true` 글만 주기 확인 (예: 주 1회)

큐 처리:
- Queue 글의 `ai_review` JSON 확인 → 어느 stage 에서 막혔는지 보기
- 막힌 원인이 master doc 부재 → master doc 작성 의뢰 (또는 자동 master 작성 trigger)
- 막힌 원인이 프롬프트 한계 → prompt 보강
- 재실행: `npx tsx publish.ts --post-id <id> --force-reverify`

Master doc 갱신:
- `docs/fact-master/{slug}.md` 수동 또는 V9 자동 갱신
- 갱신 후 그 토픽 다루는 모든 published 글 일괄 re-verify 옵션 (선택)

---

## 8. 한계·위험

- **LLM 환각**: master doc 자체가 잘못되면 모든 fact-check 가 잘못된 정답으로 작동. → master 의 초기 생성 시 multi-source consensus + 명시적 source URL 유지가 핵심.
- **새로운 사실 누락**: master doc 갱신 안 되면 최신 연구·통계 반영 못함. V9 (분기 refresh) 필요.
- **token cost**: 매 발행마다 $0.15-0.5. 일 100편 발행이면 월 $450-1500. 현재 일 1-5편 수준이라 부담 적음. 발행 빈도 증가 시 재평가.
- **반복 critique cycle**: Stage 6 후에도 안 풀리는 글이 누적되면 큐 운영 부담. 큐 길이 모니터링.
- **AI 합의의 함정**: Claude·Gemini 모두 같은 학습 데이터 편향 가질 수 있음 → master doc 의 인간 가이드라인 의존이 안전판.

---

## 9. 기존 시스템 대비 차이

| 항목 | 현재 publish.ts | 신 워크플로우 |
|------|----------------|---------------|
| 검수자 | Gemini 1회 (mega-prompt) | Gemini 다회 (역할별 분리) + Claude self-reflection + revise |
| Fact-check | 모델 일반 지식 | Master doc 대조 |
| 통과 기준 | overallScore ≥ 6 | 4개 stage 각각 임계 |
| 실패 시 | exit code → daily-auto-publish.sh 가 처리 | 동일 + auto_review_queue 큐로 격리 |
| 발행 차단 | factErrors 있을 때 | unsafeAdvice / mustBlock / mustFix 셋 중 하나 |
| 흔적 보존 | review-feedback.json | DB `ai_review` JSONB + master_docs_consulted |
| 사람 개입 | 직접 검수 (action plan 원안) | **운영자는 prompt·master doc 갱신만 함. 글마다 검수 ❌** |

---

## 10. 다음 액션

1. 이 문서 합의 → 마이그레이션 008 재작성 (V1)
2. Stage 2 + Stage 4 분리 (V2, V3) — publish.ts 점진 갱신
3. 첫 master doc 5개 작성 (V4) — ADHD / MDD / 공황 / GAD / PTSD
4. Stage 3 fact-check 통합 (V5)
5. daily-auto-publish.sh 확장 (V6) — revise 패스 라우팅
6. Stage 6 cap + queue (V7)
7. 운영 모니터링 1개월 후 V8/V9/V10 결정
