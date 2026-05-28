# AEO / GEO 리서치 아카이브

AI 검색(AI Overviews, AI Mode, ChatGPT Search, Perplexity 등) 가시성 향상을 위한 외부 자료 모음.
원문은 1, 2번에 직접 저장. 3번 이후는 구조화 노트 + 원문 링크 + 마음토스 적용 메모 형식.

## 수집된 글

| # | 제목 | 출처 | 발행 | 형식 | 파일 |
|---|------|------|------|------|------|
| 01 | Optimizing your website for generative AI features on Google Search | Google Search Central | 2026-05 중순 | 원문 보존 | [01](./01-google-generative-ai-optimization.md) |
| 02 | Top 20 Claude Prompts For SEO | Alventra Marketing | 2026 | 원문 보존 | [02](./02-claude-prompts-seo-stack.md) |
| 03 | Content Strategy for AI Overviews: Post-I/O 2026 Guide | Digital Applied | 2026-05-23 | 구조화 노트 | [03](./03-digital-applied-post-io-ai-overviews.md) |
| 04 | AI search loves listicles — Evertune 25,000 URL Citation Study | Search Engine Land / Evertune | 2026-05-19 | 구조화 노트 | [04](./04-evertune-listicle-citation-study.md) |
| 05 | 8 GEO Metrics to Track in 2026 | Search Engine Land | 2026-05-07 | 구조화 노트 | [05](./05-search-engine-land-8-geo-metrics.md) |
| 06 | SEO Pulse: Google Core Update + I/O AI Search Overhaul | Search Engine Journal | 2026-05-22 | 구조화 노트 | [06](./06-search-engine-journal-may-2026-core-update.md) |
| 07 | I Analyzed 23 Studies on AI Citations (메타 분석) | Medium / Max Vincet | 2026-05-11 | 구조화 노트 | [07](./07-medium-23-studies-meta-analysis.md) |
| 08 | Google FAQ Rich Results Deprecation | Search Engine Journal / Google | 2026-05-07 | 구조화 노트 | [08](./08-google-faq-rich-results-deprecation.md) |
| 09 | 한국 AEO/GEO 시장 — Naver Cue: 종료 | SearchPolaris 외 | 2026-04-10 | 구조화 노트 | [09](./09-korean-aeo-geo-market.md) |
| 10 | AI 봇 robots.txt 설정 — 2026 최신 | ALM Corp / Mersel 외 | 2026-02-26 발 | 구조화 노트 | [10](./10-ai-bot-robots-txt-configuration.md) |
| 11 | **YMYL / 정신건강 콘텐츠 AI 검색 인용** | upGrowth / ALM Corp 외 | 2026-02-18 | 구조화 노트 | [11](./11-ymyl-health-mental-health-aeo.md) |

## 정리 메모

- 자료 11건 수집 완료.
- 산출물:
  - ✅ **[action-plan.md](./action-plan.md)** — AEO/GEO/SEO 액션 플랜 (Phase 1-4, A1~D3). 11개 리서치 + 코드 점검 종합. **가장 먼저 읽을 문서**.
  - ✅ **[ai-review-workflow.md](./ai-review-workflow.md)** — AI 다중 검수 6-stage 파이프라인 (사람 검수 ❌). A5 의 상세 설계.
  - ✅ **[master-docs-architecture.md](./master-docs-architecture.md)** — YMYL 토픽별 master document 시스템. AI fact-check 의 정답지.
  - ☐ `summary-themes.md` — 공통 원칙 / 자료별 충돌 (action-plan 부록에 일부 포함)
  - ☐ `myths.md` — 하지 않아도 되는 것 (action-plan "의도적으로 하지 않을 것" 섹션에 포함)

## 현재까지 드러난 공통 원칙

1. **AEO/GEO = SEO** — Google 공식 + 메타 분석 일치 (#1, #7)
2. **본문 첫 30%에 직접 답** — 인용 발췌 위치 44.2% (#3, #4)
3. **Ranked Top-N listicle 인용 우위** — 전체 63%, 상업 쿼리 40.86% (#4)
4. **페이지 길이는 무상관** (Spearman 0.04)
5. **Top-10 organic은 여전히 가장 큰 단일 시그널**, 단 점유율 76%→38% 하락 (#3, #6)
6. **Passage-level retrievability** — page-level 사고 종료 (#3, #7)
7. **FAQ/HowTo 스키마 신규 추가 중단** — 2026-05-07부 rich result 폐지 (#8)
8. **헬스 YMYL은 AI Overviews 노출률 2배+, 진입장벽 최고** — inline citation·검수의 byline·MedicalWebPage 스키마 필수 (#11)

## 충돌 / 미해결 이슈

- ~~FAQPage 스키마 권고~~ → **#8로 해소** (deprecation 확인)
- **llms.txt**: Google "불필요" / Lighthouse "경고" / 한국 GEO 일부 추천 → **현재 마음토스 미적용 유지가 합리적**
- **AI 인용 측정 SaaS** (Profound, Otterly, Goodie 등) 실효성 미검증 → 수동 프롬프트 30개 트래킹부터 시작 권장
- **2026-05-21 코어 업데이트 영향** → GSC 모니터링 진행 중

## 마음토스 도메인 specific 인사이트

- **정신건강 = 강한 YMYL**: AIO 노출 44.1% (전체 평균 20.5%의 2배+)
- **academic/government 출처가 헬스 AI 인용의 <1%** → 학술 인용 강화하면 빠르게 차별화 가능
- **Perplexity 의료 답변 평균 21+ 소스** → PubMed/학회 인용이 차별 변수
- **한국 시장**: Naver Cue: 종료(2026-04-09)로 글로벌 엔진 한국어 응답이 사실상 전체 게임

## 추가 수집 후보

- Profound / Otterly / Goodie 등 GEO 트래킹 SaaS 실제 사용기·검증
- ALM Corp Health AI Misinformation Investigation 풀버전
- 한국 정신건강 학회·복지부 사이트의 AI 인용 점유율 조사 (직접 시뮬레이션)
- Bing Webmaster Tools 등록 + ChatGPT Search 인용 상관 사례
- 2026-05-21 코어 업데이트 영향 사후 분석 (6월 중)
