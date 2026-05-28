# AI search loves listicles — Evertune 25,000 URL Citation Study

- **출처 (SE Land 커버)**: <https://searchengineland.com/ai-search-loves-listicles-what-25000-urls-reveal-about-citations-477682>
- **원 데이터셋**: Evertune (2026-05-19 발행)
- **수집일**: 2026-05-27
- **한 줄 요약**: 6개 LLM × 25,000 URL × ~4억 인용. 현존 최대 인용 포맷 데이터셋. 리스티클 — 특히 번호 매긴 Top-N — 이 압도적이다.

---

## 메서드

- **분석 대상 엔진 (6개)**: ChatGPT, Microsoft Copilot, Gemini, Google AI Mode, Google AI Overview, Perplexity
- **데이터**: 25,000 URLs, **약 4억 (400M) LLM 인용**
- **분류**: 포맷(listicle/article/etc.), 쿼리 인텐트(정보성/상업성), 추출 위치, 길이

## 핵심 발견 (그대로 인용)

| 지표 | 값 |
|------|----|
| 전체 인용 중 리스티클 비중 | **63%** |
| 리스티클 중 ranked(Top-N) 비중 | **71-86%** |
| 정보성 쿼리에서 article 인용 비중 | 45.48% |
| 상업성 쿼리에서 listicle 인용 비중 | **40.86%** |
| 첫 30% 본문에서 인용 추출 비중 | 44.2% |
| 본문 중간(30-70%) | 31.1% |
| 본문 마지막(70-100%) | 24.7% |
| 길이 vs 인용 Spearman 상관 | **0.04** (사실상 무관) |

## 함의

1. **번호 매긴 Top-N 리스트가 LLM이 가장 쉽게 파싱·발췌하는 단위.**
2. 상업적 결정 단계 쿼리("best X", "top Y") → 리스티클 콘텐츠로만 게임 가능.
3. 정보성 쿼리에서도 article이 우위지만, 그 안에 list 섹션을 넣는 하이브리드가 합리적.
4. 페이지 길이 늘리기는 인용 측면에서 헛수고. **본문 첫 부분의 답변 밀도**가 진짜 변수.
5. 인용은 페이지가 아니라 **passage** 단위 — 따라서 문서 안에 "독립적으로 인용될 수 있는 self-contained passage"를 여러 개 심어두는 게 옳다.

---

## 마음토스 적용 메모

- 발행 중인 마음 콘텐츠 중 **상업/결정성 쿼리** (예: "ADHD 검사 어디서", "마음 검진 추천", "심리 상담 비교") 를 타깃하는 글은 ranked listicle 포맷으로 변형 또는 신규 작성.
- 정보성 글에는 본문 중간에 ranked list 섹션 1-2개 임베드 권장.
- 본문 첫 30% (사실상 첫 H2 위까지)에 핵심 답·요점 리스트를 위치시키는 템플릿 정리 필요.

---

## 인접 데이터 (다른 연구들이 보강)

- Seer 2026 분석: AIO 인용된 브랜드는 동일 쿼리에서 노출 당 organic click **+120%**.
- Evertune 데이터에서 인용 페이지의 65-71%가 Article/Organization 스키마 보유.
