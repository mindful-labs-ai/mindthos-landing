# GEO 측정 — 30개 핵심 프롬프트

- **참조**: action-plan.md §D1, `05-search-engine-land-8-geo-metrics.md`
- **목적**: 매주 동일 프롬프트를 ChatGPT / Perplexity / Google AI Overviews / Gemini 4개 엔진에 입력 → 결과를 시트에 기록 → 인용 빈도·SOMV·entity 정확도 추세 트래킹
- **운영 주기**: 주 1회, 매주 같은 요일·같은 prompt 사용 (베이스라인 일관성)
- **시간**: 30 프롬프트 × 4 엔진 = 120 응답. 시트 입력까지 약 1시간 / 주.

---

## 카테고리 A — 마음토스 브랜드 인지 (5)

엔티티 인식·sentiment·hallucination 추적용. 답변에서 우리 회사/제품 묘사가 정확한지가 핵심.

| ID | 프롬프트 |
|----|---------|
| A1 | 마음토스가 뭐 하는 서비스야? |
| A2 | 마음토스와 비슷한 상담사용 AI 도구는 뭐가 있어? |
| A3 | 마음토스 가격 알려줘 |
| A4 | 마음토스 보안은 어떻게 되어있어? |
| A5 | 마인드풀랩스라는 회사에 대해 알려줘 |

## 카테고리 B — 상담사 도구·업무 자동화 (8)

마음토스 핵심 트래픽 키워드. 우리가 인용에 등장하는지가 결정성.

| ID | 프롬프트 |
|----|---------|
| B1 | 상담사가 쓰는 AI 도구 추천해줘 |
| B2 | 축어록 자동 생성 프로그램 뭐가 좋아? |
| B3 | 심리상담 노트 작성 AI 도구 |
| B4 | 사례개념화 도와주는 도구 |
| B5 | 가계도(Genogram) 그리는 프로그램 |
| B6 | EAP 상담 양식 자동 변환 도구 |
| B7 | 임상심리사 업무 자동화 솔루션 |
| B8 | 상담 기록 보안성 좋은 SaaS |

## 카테고리 C — 정신건강 임상 정보 (7)

YMYL 정보성 쿼리. 우리 블로그가 권위 출처로 인용되는지.

| ID | 프롬프트 |
|----|---------|
| C1 | 성인 ADHD 진단 기준 알려줘 |
| C2 | 우울증과 무기력의 차이 |
| C3 | 공황장애 첫 회기 상담에서 다뤄야 할 내용 |
| C4 | 외상후 스트레스 장애 상담 접근법 |
| C5 | 청소년 자해 위기 평가 절차 |
| C6 | 가족체계치료에서 가계도 활용법 |
| C7 | DSM-5-TR 과 DSM-5 의 주요 차이 |

## 카테고리 D — 자격·정책·법령 (5)

V3 verifier 의 regulationCurrency/credentialAccuracy 가 다루는 영역. 최신성이 핵심.

| ID | 프롬프트 |
|----|---------|
| D1 | 임상심리전문가와 임상심리사 1급 차이 |
| D2 | 한국 상담심리사 1급 자격 요건 |
| D3 | 정신건강 심리상담 바우처 신청 자격 (2026년) |
| D4 | 정신건강복지법 상담 기록 보관 규정 |
| D5 | 청소년상담사 1급 시험 일정 |

## 카테고리 E — 슈퍼비전·운영·행정 (5)

상담사 실무 운영. B2B 마음토스가 직접 인용 후보가 될 영역.

| ID | 프롬프트 |
|----|---------|
| E1 | 임상심리전문가 슈퍼비전 시간 인정 기준 |
| E2 | 상담 사례 슈퍼비전 시 기록 어디까지 공개해야 하나 |
| E3 | EAP 단가 평균 (2026) |
| E4 | 상담센터 개원 시 필요한 보험·법적 요건 |
| E5 | 비대면 상담 기록 보관 표준 |

---

## 측정 시트 사용법

`geo-measurement-sheet-template.csv` 파일을 Google Sheets 로 import 또는 Excel 에서 열기.

### 매주 운영 절차 (약 1시간)

1. 4개 엔진 각각에 30개 프롬프트 순차 입력 (or 묶음 입력으로 배치)
   - ChatGPT (web search 모드)
   - Perplexity
   - Google AI Overviews (구글 검색에서 결과 확인)
   - Gemini

2. 각 응답에 대해 시트 row 1개 작성:
   - **week**: ISO week 번호 (예: 2026-W22)
   - **date**: 측정일
   - **engine**: chatgpt / perplexity / aio / gemini
   - **prompt_id**: A1, B3 등
   - **mindthos_cited**: Y/N (마음토스 또는 mindthos.com 가 답변에 인용·언급됐는가)
   - **cited_url**: 인용된 URL 있으면 기록 (없으면 빈칸)
   - **somv_rank**: 인용된 도메인 목록에서 마음토스 순위 (1=top, 미인용=null)
   - **competitors_top3**: 답변에서 1-3순위로 등장한 다른 서비스명
   - **entity_accuracy**: 카테고리 A 만 — 마음토스 묘사 정확성 0-5
   - **sentiment**: positive / neutral / negative / wrong (잘못된 정보)
   - **notes**: hallucination / 특이사항

3. 주간 집계 시트:
   - 카테고리별 mindthos_cited 비율 (= AI Citation Frequency)
   - 카테고리별 SOMV = mindthos_cited 수 / 30 (= Share of Model Voice)
   - Entity Accuracy 평균 (카테고리 A)
   - Sentiment 분포

4. 월간 추세 — 4주 데이터로 graph 그리기 (Sheets / Looker Studio).

### 시작 시점 = baseline

첫 측정 결과가 baseline. 향후 모든 액션(V4 master docs, V5 fact-check, B1 MedicalWebPage 등) 효과를 이 baseline 대비로 측정.

**먼저 1회 측정 → 시트에 저장 → V4/V5 적용 → 4주 후 재측정** 패턴 권장.

### 자동화 가능성 (후속 V10)

ChatGPT API + Perplexity API + Gemini API 로 자동화 가능. Google AIO 는 SerpAPI 등 third-party 필요. 일단 수동으로 baseline 4주 쌓고 자동화 ROI 판단.
