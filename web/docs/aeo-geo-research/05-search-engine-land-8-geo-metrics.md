# 8 GEO Metrics to Track in 2026 — Search Engine Land

- **출처**: <https://searchengineland.com/geo-metrics-to-track-476642>
- **발행일**: 2026-05-07
- **저자**: Casey Nifong (Edited: Angel Niñofranco / Reviewed: Danny Goodwin)
- **수집일**: 2026-05-27
- **한 줄 요약**: GEO 성과를 어떻게 잴 것인가에 대한 첫 표준화 시도. 마음토스 월간 SEO 리포트 설계 베이스로 적합.

---

## 8개 측정 지표 (정의 + 공식 + 측정 방법)

### 1. AI Citation Frequency
브랜드/도메인이 AI 생성 답변에 등장한 횟수.
- **플랫폼**: Google AI Overviews, ChatGPT, Perplexity, Gemini
- **측정**: 트래킹 툴 (Profound, Otterly, Goodie 등) 또는 수동 프롬프트 시뮬레이션

### 2. Share of Model Voice (SOMV)
경쟁사 대비 AI 답변 점유율.
- **공식**: `Brand appearances ÷ Total answers generated for the query set`
- **활용**: 동일 쿼리셋에서 우리 vs 경쟁사 비율 트래킹

### 3. Answer Inclusion Rate
직접 인용은 아니지만 답변 생성 근거로 사용된 비율.
- 인용 클릭은 없어도 grounding에 기여한 케이스 포함

### 4. Entity Recognition & Authority
AI가 브랜드/제품/전문 영역을 얼마나 정확히 이해하는가.
- **측정**: 다양한 프롬프트("[브랜드]는 뭐 하는 회사야?", "[브랜드]의 주요 서비스는?")로 답변 정확도/일관성 채점

### 5. Sentiment in AI Responses
AI가 우리를 신뢰성/혁신성/구식 등 어떤 톤으로 묘사하는가, hallucination·misinformation 식별.

### 6. Prompt Coverage
정보성/비교성/결정성 단계 전반에서 노출 폭.

### 7. Content Retrieval Success Rate
크롤링 가능성, 인덱싱 상태, 스키마, 기술적 접근성.

### 8. Conversion Influence After AI Interaction
AI 노출 → 비즈니스 결과 연결.
- 추적 신호: referral traffic, assisted conversion, branded search lift

---

## 핵심 인용

- > "AI search visitors convert at a **23x higher rate** than traditional organic search visitors." — Ahrefs (기사에서 인용)
- GEO의 핵심은 **"ranking 어디에 있느냐"** 가 아니라 **"AI가 우리를 얼마나 명확히 해석·신뢰하느냐"**.

---

## 마음토스 월간 리포트 설계안

기존 GSC 기반 리포트에 **GEO 섹션** 추가:

| 섹션 | 출처 | 카드 |
|------|------|------|
| 전통 SEO | GSC | clicks/impr/CTR/position 변화 + Page-2 키워드 |
| **GEO — Citation** | 수동 + 트래킹 툴 | AI Citation Frequency, SOMV (vs 3 경쟁) |
| **GEO — Entity** | 수동 프롬프트 | "마음토스는?" 답변 정확도 스코어 |
| **GEO — Sentiment** | 수동 프롬프트 | 톤 / 잘못된 정보 발견 |
| **GEO — Retrieval** | 크롤러 로그 | GPTBot, PerplexityBot, ClaudeBot hit율 |
| **Conversion** | GA4 | AI referral traffic + assisted conversion |

→ 우선 무료로 시작: 매주 동일 프롬프트 30개를 4개 엔진에 돌려 스프레드시트에 저장. 트래킹 SaaS는 데이터 쌓인 뒤 검토.
