# 블로그 SEO 개선 계획 — 2026-05-27

> **북극성 지표:** 블로그 오가닉 유입 → 마음토스 서비스 가입 전환
> 트래픽 자체가 목표가 아니라, **타겟 페르소나(상담사·임상가·기관 담당자)가 검색을 통해 사이트로 들어와 가입까지 완주하는 비율**이 목표.

GSC 베이스라인(2026-04-29 ~ 05-24, 28d): clicks 763 / imp 17,482 / CTR 4.36% / 평균 pos 6.5.

---

## 0. 현황 — 무엇이 있고 무엇이 빠졌나

### ✅ 이미 갖춰진 자산

| 자산 | 위치 | 역할 |
|---|---|---|
| 발행 파이프라인 | `scripts/publish-blog/src/publish.ts` | SEO 분석 → 교차검증 → 인링크 → 이미지 → Supabase |
| 일일 자동 발행 | `daily-auto-publish.sh` (pm2) | 매일 신규 글 |
| 주간 키워드 보강 | `weekly-keyword-refresh.sh` (월 05:00) | target-keywords.md에 신규 키워드 20-30개 추가 |
| 토픽 선정 | `select-daily-topics.ts` | target-keywords.md + opportunity_scorer + Supabase 중복 회피 |
| 인링크 자동 삽입 | `insert-inlinks.ts` | 기존 발행 글 보강 |
| 팩트체크 프로토콜 | `web/context/fact-check-protocol.md` | 자격/제도/법률/정책 글의 1차 방어선 |
| 카테고리→CTA 매핑 | `web/context/internal-links-map.md` | 8개 카테고리별 CTA intent 명시 |
| CTA UTM 추적 | `web/components/blog/_cta.ts` | `utm_source=blog&utm_medium=channel-post` |
| GA4 funnel 이벤트 | S0/S0.1/S0.2 (commit 8908f89) | 가입 funnel 일부 |
| GSC OAuth 셋업 | `~/.config/claude-seo/` + `gsc_query.py` | 실제 검색 데이터 조회 가능 |

### ❌ 빠진 연결고리 (핵심 갭)

1. **GSC 실데이터 → 토픽 선정 피드백 없음**
   - `opportunity_scorer.py`는 DataForSEO **추정치**만 사용
   - `post_publish_analyzer.py`는 코드에 "GSC/GA4 연동 대기 중"이라 명시 — 스텁 상태
   - `weekly-keyword-refresh.sh`는 Claude가 컨텍스트 파일 보고 **상상으로 키워드 생성** — 실제로 우리 사이트에서 무엇이 검색되고 있는지 모름
   - 결과: 어떤 글이 striking distance에 있는지, 어떤 쿼리에 의외로 노출되는지, 어떤 글이 클릭으로 안 이어지는지 — 전부 발행 결정에 반영 안 됨

2. **기존 800+ 글의 retrofit 미실시**
   - 팩트체크 프로토콜이 정착되기 전 작성된 글들의 사실 검증 갭
   - 인링크 자동 삽입은 신규 글 대상 — 오래된 글은 누락
   - 외부(아웃)링크 정책 부재 — 공식 출처 인용은 있으나 SEO authority 차원의 일관성 없음

3. **블로그 → 가입 전환 측정 갭**
   - `signup` CTA에 UTM은 있지만 **글별 conversion rate**를 사이트 내에서 보기 어려움
   - 어떤 토픽 클러스터가 가입까지 이어지는지, 어떤 글은 트래픽만 받고 끝나는지 분리 안 됨
   - "유입은 많은데 페르소나 매칭이 약한 글"을 식별할 수 없음

---

## 1. 전략 프레임 — 3개 기둥

```
                    [북극성] 오가닉 → 가입 전환
                              ▲
            ┌─────────────────┼─────────────────┐
            │                 │                 │
        Pillar 1          Pillar 2          Pillar 3
        품질 보강       GSC 기반 발행      전환 측정·최적화
       (기존 글)         (신규/리프트)      (CTA + funnel)
```

세 기둥이 **상호 강화**합니다:
- Pillar 2가 어떤 글을 보강할지(P1) 우선순위를 알려줌
- Pillar 1이 보강한 글의 효과를 Pillar 3가 측정
- Pillar 3의 전환 데이터가 Pillar 2의 토픽 가중치에 다시 들어감

---

## 2. Pillar 1 — 품질 보강 (기존 글 retrofit)

### 2.1 사실관계 (Fact-check) 소급 적용

**문제:** 팩트체크 프로토콜은 정립되어 있으나 그 이전에 작성된 글들의 검증 갭. 자격/제도/연봉/바우처 등 YMYL 영역에서 잘못된 사실은 가입 전환·신뢰도에 치명적.

**액션:**
1. **트리거 카테고리 식별** — `web/context/fact-check-protocol.md` §1 기준에 해당하는 글 자동 추출
   - 카테고리: `training`, `career`, `operations`, 일부 `trends`
   - 키워드 트리거: "자격", "수련", "연봉", "바우처", "민간자격", "국가자격", "면허", "병영생활전문상담관" 등
2. **GSC 트래픽 가중 우선순위** — 위 트리거에 해당하면서 28d 노출 ≥ 100인 글부터
3. **재검증 스크립트** — `scripts/publish-blog/src/refine-existing.ts` 확장 또는 신규 `factcheck-existing.ts`:
   - 글의 핵심 수치·요건 추출
   - 정부/공식 출처 재확인 (web fetch)
   - 변경 사항 PR로 출력
4. **빈도** — 첫 한 달은 GSC 상위 50개 글 일괄 검토, 이후 분기 1회 회전 점검

**완료 조건:** 28d 노출 상위 50개 글의 사실관계 갱신 PR 머지

### 2.2 인링크 (내부 링크) 포화도 보강

**문제:** `insert-inlinks.ts`가 발행 시점에 인링크를 넣지만, 새 글이 발행될 때 **이전 글들에 이번 글로의 인링크는 추가되지 않음**. 시간이 갈수록 신규 글은 고립되고 구글의 토픽 권위 평가에 불리.

**액션:**
1. **양방향 인링크 백필 잡** — 신규 글 발행 시 트리거되는 후속 잡:
   - 신규 글의 키워드/카테고리/관련 글 후보 추출
   - 가장 관련성 높은 기존 글 3~5개에 신규 글로의 인링크 자동 삽입 PR 생성
2. **인링크 밀도 KPI** — 글당 평균 outbound internal link 수 (현재 측정 → 목표 5+)
3. **클러스터 허브 구조** — Pillar 2의 분석에서 동일 클러스터로 분류된 글들 사이 허브-스포크 링크 강화

### 2.3 아웃링크 (외부 링크) 정책 명문화

**문제:** 공식 출처는 본문에 인용되지만, SEO authority 신호로서의 외부 링크 정책이 없음. 권위 사이트로의 아웃링크는 구글이 콘텐츠의 신뢰성을 평가하는 신호 중 하나.

**액션:**
1. `web/context/seo-guidelines.md` 또는 신규 `outbound-link-policy.md`에 정책 추가:
   - YMYL 글(자격/제도/법률/연봉): **정부·공식기관 최소 2개** 인용 + 외부 링크 필수
   - 임상이론 글: **학술/공식 학회** 최소 1개 인용
   - 임의/품질 낮은 사이트 링크 금지
   - `rel="nofollow"` vs 일반 링크 기준
2. `publish.ts`에 검증 단계 추가 — 트리거 카테고리 글이 외부 링크 0개면 발행 차단/경고
3. 기존 글 retrofit과 함께 진행

### 2.4 CTA 정합성 점검

**문제:** internal-links-map.md에 카테고리→CTA 매핑이 있으나 모든 기존 글이 매핑대로 표시 중인지 미검증. 가입 전환의 직접 입구.

**액션:**
1. Supabase의 글별 `cta_type` 컬럼 vs internal-links-map.md 매핑 비교 스크립트
2. 미스매치 글 일괄 갱신
3. **A/B 후보 식별** — 동일 카테고리에서 가입 전환이 높은 글의 CTA 카피를 다른 글에 복제

---

## 3. Pillar 2 — GSC 기반 발행 루프 (가장 큰 갭)

목표: **DataForSEO 추정치 발행에서 실데이터 발행으로 전환**

### 3.1 GSC 통합 모듈 신설

**`scripts/seo-analysis/gsc_insights.py`** (신규):

매주/매일 호출 가능한 통합 분석기. 4가지 인사이트 클래스 분류:

| 클래스 | 정의 | 액션 |
|---|---|---|
| **A. Quick win — 타이틀 리라이트** | imp ≥ 50, pos 5-15, CTR ≤ 평균의 50% | 글은 그대로, 타이틀/메타만 갱신 → PR |
| **B. Striking distance — 콘텐츠 보강** | imp ≥ 30, pos 2-5, CTR ≤ 평균 | 기존 글에 해당 서브토픽 섹션 추가 |
| **C. New gap — 신규 발행** | imp ≥ 50, pos > 15 또는 미커버, 사이트에 해당 글 없음 | target-keywords.md에 추가 → daily 발행 큐 |
| **D. Cannibalization — 통합/canonical** | 동일 키워드가 2개+ 페이지로 분산 노출 | 통합 또는 canonical 정리 |

스크립트 출력: `scripts/publish-blog/gsc-opportunities.json` (클래스별 분류된 액션 큐)

### 3.2 발행 루프 재배선

```
[현재]                              [개선 후]
weekly-keyword-refresh.sh           weekly-keyword-refresh.sh
   ↓ (Claude가 상상으로 키워드)        ↓ (Claude + GSC 실데이터)
target-keywords.md                  target-keywords.md (GSC C-클래스 자동 머지)
   ↓                                   ↓
opportunity_scorer.py               opportunity_scorer.py
   (DataForSEO 추정치만)               + gsc_insights.py (실측 보정)
   ↓                                   ↓
select-daily-topics.ts              select-daily-topics.ts
                                       (실측 imp 가중치 추가)
   ↓                                   ↓
publish.ts → 글 발행                publish.ts → 글 발행
                                       ↓
                                    [신규] post-publish 후 30일 시점
                                       gsc_insights.py 재실행
                                       → A/B 클래스 자동 인큐
```

**구체 구현:**
1. `gsc_insights.py` 작성 — GSC API 호출, 4-클래스 분류, JSON 출력
2. `weekly-keyword-refresh.sh` 수정 — Claude 호출 전에 `gsc_insights.py --new-gaps` 결과를 컨텍스트로 전달
3. `select-daily-topics.ts` 수정 — 실측 imp/clicks를 기회 점수에 가중치 추가 (기존 DataForSEO 점수와 합산)
4. `post_publish_analyzer.py` 활성화 — 스텁 제거하고 발행 30일 후 자동 분석 → A/B 액션 인큐
5. pm2 새 잡: `weekly-gsc-insights` (월요일 새벽, weekly-keyword-refresh 전에)

### 3.3 첫 분석 결과의 즉시 액션 (이미 보유 중)

이미 수행한 28일 분석에서 도출된 액션을 위 자동화 구축 전에 수동 처리:

**A. 타이틀 리라이트 (8개 페이지)**

| 쿼리 | imp | pos | 현재 CTR | 페이지 식별 필요 |
|---|---|---|---|---|
| 안정형 | 540 | 8.7 | 0.56% | adult-attachment-theory 관련 |
| 한상심 | 406 | 6.0 | 0% | 한국상담심리학회 관련 글 |
| 에릭슨 심리사회적 발달단계 | 299 | 8.7 | 1.67% | eriksons-psychosocial-development |
| soap | 148 | **1.5** | 2.03% | 1위인데 CTR 2% — 메타 명백한 결함 |
| 도식 | 180 | 9.8 | 0.56% | (의도 모호 — 페이지 확인 필요) |
| 반동형성 | 146 | 10.2 | 0.68% | 방어기제 관련 |
| 직면 | 86 | 5.0 | 0% | 상담기법 단일 키워드 |
| 주호소 | 82 | 4.2 | 0% | 임상 용어 |

→ 첫 PR: 8개 글의 metadata API `title`/`description` 갱신 + 14일 후 CTR 재측정

**C. 신규 발행 큐 (검증된 갭)**

- 병영생활전문상담관 공식 가이드 (총 imp 250+, 페이지 부재 또는 매칭 약함)
- 양적연구 vs 질적연구 비교 (대학원생 검색, pos 11.5)
- 심리상담 민간자격 vs 국가자격 가이드 (토큰 합산 imp 275, 0클릭)
- WAIS-IV 종합 해석 허브 (현재 소검사 페이지만 산재, 허브 부재)

**D. Canonicalization 모니터링 (자동 정리 예정)**

- `psychological-counselor-income-strategies`: non-www(6,831 imp) + www(2,263 imp) 분리. 308 리다이렉트 정상 작동 확인 — 2026-06-10에 합산 확인
- `adult-attachment-theory-deep-guide-for-counselors`: 동일 패턴 — 함께 모니터링

---

## 4. Pillar 3 — 전환 측정·최적화

### 4.1 글별 가입 전환율 측정

**현재 상태:** CTA에 UTM은 있지만 GA4에서 글별 funnel 보기 어려움.

**액션:**
1. CTA 클릭 시 GA4 event에 `blog_slug` 파라미터 추가:
   ```ts
   gtag('event', 'cta_click', { slug, intent: 'signup', ... });
   ```
2. GA4 explorations에 "블로그 글별 가입 funnel" 저장된 보고서 1개:
   - `page_view (/blog/[slug])` → `cta_click` → `app.mindthos.com signup` (S0.2)
3. 주간 dump 스크립트 — 글별 conversion rate 표로 저장 (`logs/conversion-by-post-YYYY-WW.csv`)
4. **재배치 임계값**:
   - 트래픽 상위 20개 글 중 CTR_to_signup이 평균 미만이면 → CTA 재실험 큐
   - CTR_to_signup 평균 이상이면 → 같은 클러스터 글에 CTA 카피 복제

### 4.2 CTA 카피·배치 실험

GSC가 알려준 **트래픽 큰 페이지 = "X 현실/연봉" 시리즈**가 가장 페르소나에 가까움(상담사 진로 탐색 중). 이 클러스터에 가입 동기 명시:
- "축어록 / 사례개념화로 시간 절약 → 임상 실무에 집중" 등
- 클러스터별 specific CTA 카피 A/B

### 4.3 블로그→홈→블로그 동선 vs 직접 가입

- 브랜드 검색("마음토스") 272 clicks → 홈 도착 → 어디로 가는가? 현재 불명
- GA4로 측정 → 홈 페이지에서 "인기 가이드" 위젯 신설 시 가설: 브랜드 도달자의 블로그 → 가입 비율 상승
- 측정 후 결정

---

## 5. 실행 로드맵

### Sprint 1 (Week 1: 5/28 ~ 6/3) — 측정 가능 상태 만들기

| 항목 | 결과물 | 의존성 |
|---|---|---|
| 1.1 GA4 cta_click 이벤트에 `blog_slug` 추가 | PR 1개 | — |
| 1.2 GA4 funnel report 저장 (글별 가입 전환) | GA4 console | 1.1 |
| 1.3 Pillar 1.4 CTA 정합성 점검 스크립트 | `scripts/seo-analysis/cta_audit.py` | — |
| 1.4 GSC 베이스라인 분석 영구화 | `scripts/seo-analysis/gsc_insights.py` v1 (분석만, 자동 액션 없음) | — |

### Sprint 2 (Week 2: 6/4 ~ 6/10) — Quick win 일괄 적용

| 항목 | 결과물 |
|---|---|
| 2.1 타이틀 리라이트 8개 페이지 PR | metadata 갱신 머지 |
| 2.2 외부 링크 정책 문서화 | `web/context/outbound-link-policy.md` |
| 2.3 사실관계 retrofit Top 20 글 PR | 머지 + 재인덱싱 |
| 2.4 www 콘솔리데이션 재측정 | gsc_insights 자동 확인 |

### Sprint 3 (Week 3-4: 6/11 ~ 6/24) — 자동화 1차

| 항목 | 결과물 |
|---|---|
| 3.1 `gsc_insights.py` 4-클래스 분류 완성 | JSON 출력 |
| 3.2 `weekly-keyword-refresh.sh`에 GSC C-클래스 통합 | Claude 컨텍스트에 실데이터 주입 |
| 3.3 `select-daily-topics.ts`에 실측 가중치 | 발행 우선순위 개선 |
| 3.4 양방향 인링크 백필 잡 | 신규 발행 시 기존 글에 역링크 자동 |
| 3.5 사실관계 retrofit Top 21-50 글 | PR 머지 |

### Sprint 4 (Week 5-6: 6/25 ~ 7/8) — 자동화 완성 + 전환 최적화

| 항목 | 결과물 |
|---|---|
| 4.1 `post_publish_analyzer.py` 활성화 | 발행 30일 후 자동 A/B 분류 |
| 4.2 발행 30일 후 액션 인큐 자동화 | A-클래스(리라이트), B-클래스(섹션 추가) PR 봇 |
| 4.3 클러스터별 CTA 카피 A/B | "X 현실" 시리즈부터 |
| 4.4 신규 발행 큐 (P2 §3.3 C-클래스) | 4편 신규 글 |

### Sprint 5+ — 정상 운영

- 매주 월 04:30: `gsc_insights.py` 실행 → JSON 갱신
- 매주 월 05:00: `weekly-keyword-refresh.sh` (GSC 컨텍스트 포함)
- 매일 06:00: `daily-auto-publish.sh` (실측 가중치 발행)
- 매월 1일: 클러스터별 conversion rate 리포트 → 다음 달 발행 우선순위 조정

---

## 6. 측정 (북극성 + 보조 지표)

### 6.1 북극성

| 지표 | 베이스라인 (2026-05) | 목표 (2026-08) |
|---|---|---|
| **블로그→signup 전환수 (월)** | (Sprint 1에서 측정) | 베이스라인 × 2.0 |
| **블로그→signup 전환율 (글별 평균)** | 미측정 | 측정 가능 + 추적 |

### 6.2 보조 지표 (GSC 기반)

| 지표 | 베이스라인 28d | 4주 후 목표 | 8주 후 목표 |
|---|---|---|---|
| Clicks | 763 | 1,000+ | 1,500+ |
| Impressions | 17,482 | 22,000+ | 30,000+ |
| CTR | 4.36% | 4.8%+ | 5.2%+ |
| 평균 Position | 6.5 | 6.0 | 5.5 |
| Head 쿼리 비중 (클릭) | 46% (22 쿼리) | 40% | 35% (롱테일 활성화 효과) |
| non-www 잔존 imp | 측정 중 | 0 | 0 |

### 6.3 품질 지표 (Pillar 1)

| 지표 | 베이스라인 | 4주 후 |
|---|---|---|
| YMYL 글 retrofit 완료 비율 | 0% | 100% (상위 50개) |
| 글당 평균 outbound internal link | 측정 필요 | 5+ |
| 글당 평균 outbound external link (YMYL) | 측정 필요 | 2+ |
| CTA 매핑 일치율 | 측정 필요 | 100% |

### 6.4 시스템 지표 (Pillar 2)

- 발행된 신규 글 중 GSC C-클래스(실데이터 기반)에서 유래한 비율 → 목표 50%+
- 발행 30일 후 자동 인사이트 검출 비율 (A+B 클래스) → 목표 매월 10건+

---

## 7. 리스크와 가드레일

| 리스크 | 가드레일 |
|---|---|
| 자동 타이틀 리라이트가 의도와 어긋남 | A-클래스는 PR로 출력, 사람 리뷰 후 머지 |
| 신규 발행 글이 페르소나 빗나가 트래픽만 늘고 전환 0 | Pillar 3 전환율 추적 → 4주 후 페르소나-매칭이 낮은 클러스터는 가중치 하향 |
| 사실관계 retrofit이 본문 의도를 훼손 | publish-blog 워크플로 v2.4의 사후 검증 단계 그대로 활용 |
| GSC API rate limit | 주 1회 풀 추출 + 캐시 (`scripts/seo-analysis/cache/`) |
| Google이 www 콘솔리데이션 안 함 (6/10 시점) | 영향 큰 페이지부터 URL Inspection API로 강제 재크롤링 요청 |

---

## 8. 참고

- 인덱싱 복구 배경: `web/docs/seo-indexing-recovery-2026-05-19.md`
- 팩트체크 규정: `web/context/fact-check-protocol.md`
- 인링크/CTA 매핑: `web/context/internal-links-map.md`
- 타겟 키워드 풀: `web/context/target-keywords.md`
- GSC 조회 방법: `~/.claude/projects/.../memory/gsc-seo-google-access.md`
- 기존 발행 파이프라인: `scripts/publish-blog/`
- 기존 SEO 분석 스텁: `scripts/seo-analysis/`

이 문서는 살아있는 문서. Sprint 1 끝에 베이스라인 수치 채워넣고, 매 Sprint 종료 시 §6 표 갱신.
