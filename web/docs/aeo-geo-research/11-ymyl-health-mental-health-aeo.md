# YMYL / 정신건강 콘텐츠 AI 검색 인용 가이드

- **출처**:
  - upGrowth YMYL Healthcare Playbook: <https://upgrowth.in/ymyl-playbook-healthcare-brands-win-ai-search-trust/> (2026-02-18)
  - ALM Corp Health AI Investigation: <https://almcorp.com/blog/google-ai-overviews-health-misinformation-investigation-2026/>
  - SEM Nexus AEO for Healthcare: <https://semnexus.com/aeo-for-healthcare/>
  - VarnHealth: <https://varnhealth.com/industry-insights/creating-ymyl-and-eeat-content-for-pharma-and-healthcare-brands/>
- **수집일**: 2026-05-27
- **한 줄 요약**: **마음토스에 가장 중요한 노트**. 정신건강 = 강한 YMYL → AI 인용 진입장벽이 다른 분야보다 훨씬 높다. E-E-A-T 입증과 의료 스키마, 인용 link 부착이 인용/미인용을 가른다.

---

## YMYL 헬스 콘텐츠 AI 검색 핵심 데이터

| 지표 | 값 | 출처 |
|------|----|------|
| **AI Overviews 노출률 — 의료 YMYL 쿼리** | **44.1%** (전체 쿼리 평균 20.5%의 **2배+**) | ALM Corp |
| AI Overviews 노출률 — 헬스 검색 전반 | 63% | upGrowth 인용 |
| Perplexity 의료 답변 평균 인용 소스 수 | **21+** | upGrowth |
| 헬스 AI Overviews 인용 중 academic/government 비중 | **< 1%** | SE Ranking 분석 |
| 인용된 헬스 페이지의 Article+Organization 스키마 보유 | 65-71% | Evertune |

핵심: 정신건강·의료 쿼리는 AI Overviews 노출 빈도가 일반 쿼리의 2배 이상. **AI 인용을 안 잡으면 트래픽 손실이 더 크다**.

## E-E-A-T → AI 인용 신호 변환표

upGrowth + SEM Nexus 종합:

| E-E-A-T 축 | AI 엔진이 보는 시그널 | 마음토스 구현 |
|------------|----------------------|---------------|
| **Experience** | 면허 의료진 저자 + 가시적 자격증 | 검수의/임상심리사 byline + 자격 표기 |
| **Expertise** | 병원·클리닉·학술기관 소속 | 검수 기관 (대학병원, 학회 등) 명시 |
| **Authoritativeness** | 전문 학회 등록, 학술 출판물 | 출처에 정신의학회·심리학회 자료 인용 |
| **Trustworthiness** | 규제 준수 마커 (의료기기 인증, 의료광고 심의 등) | "의료광고 사전심의 필" 같은 표기 |

## 플랫폼별 인용 패턴 (헬스 분야)

| 플랫폼 | 패턴 | 마음토스 영향 |
|--------|------|--------------|
| **ChatGPT** | "Constitutional AI" 필터로 unverified claim 차단. 1차 출처(primary source) 우선. 헬스 쿼리 **100%가 이 필터 통과 요구** | 모든 의학 주장에 **inline citation 필수** |
| **Perplexity** | 평균 21+ 소스 인용. **PubMed, 임상시험 DB** 1차 사용. peer-reviewed 우선 | PubMed/학술자료 인용 강화 |
| **Google AI Overviews** | 63% 헬스 검색에 노출. 높은 E-E-A-T 임계값 | 저자/검수 정보, 마지막 업데이트 일자 |

핵심 인용:
- > "**Unlinked claims don't count**" — 링크 없는 의학 주장은 인용 후보에서 자동 탈락.
- > "Every health claim must withstand Constitutional AI scrutiny **before earning a citation**" — 그렇지 않으면 ChatGPT는 retrieve 했어도 cite 안 함.

## 스키마 우선순위 (헬스 콘텐츠)

upGrowth + 종합:

1. **MedicalWebPage** — 페이지 레벨, 헬스 콘텐츠 식별자
2. **MedicalEntity / MedicalCondition** — 다루는 질환·증상에 부착
3. **Person (medicalSpecialty)** — 저자/검수의 자격
4. **Organization (medicalOrganization)** — 운영 주체
5. **datePublished / dateModified** — freshness 시그널 (강함)
6. ~~FAQPage~~ — 08번 노트 참조, **신규 추가 안함** (rich result 폐지)
7. ~~HowTo~~ — 2023년 이미 폐지

## ALM Corp의 경고 — Health AI Misinformation 문제

- AI Overviews가 의료 정보에서 **citation-support gap** 발생: 그럴듯한 답변에 부적합한 출처 부착.
- Academic/government 소스가 헬스 AI 인용의 **< 1%** — 거의 일반 사이트가 의학 응답을 만든다.
- 시사점: **마음토스가 학술·임상 인용을 강화한 콘텐츠를 내면 인용 풀에서 상위 차별화 가능**. 큰 갭이 비어있다.

---

## 마음토스 액션 (높은 우선순위)

### 콘텐츠
- [ ] 모든 의학·정신건강 주장에 **inline citation (논문/학회/공식 가이드)** 부착 규칙화
- [ ] 글 상단·하단에 **검수의 byline + 자격 + 검수일자** 표시 — 자동화 검토
- [ ] 글 끝에 **References / 출처** 섹션 의무화 (PubMed/학회 자료 우선)
- [ ] 마지막 업데이트 일자 명시 (freshness 시그널 강함)

### 스키마
- [ ] MedicalWebPage 스키마 점진 적용 (기존 Article 스키마 위에 확장)
- [ ] Person 스키마 — 검수의·임상심리사 정보 구조화
- [ ] Organization 스키마에 medicalSpecialty 필드 추가
- [ ] FAQPage 스키마 신규 적용 중단 (08번 노트)

### 신뢰 시그널
- [ ] 의료광고 사전심의 받은 콘텐츠 표시
- [ ] 운영 주체(병원/클리닉/위원회) 정보 hub 페이지
- [ ] 검수 기관 / 자문 위원회 명시 페이지

### 측정
- [ ] 정신건강 핵심 쿼리 30개를 4개 엔진(ChatGPT, Perplexity, AIO, Gemini)에서 매주 시뮬레이션 → 인용 소스 분포 트래킹
- [ ] 우리 인용 소스 vs 경쟁(학회·대학병원·기존 헬스 미디어) 비교
