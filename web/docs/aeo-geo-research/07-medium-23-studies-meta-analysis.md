# I Analyzed 23 Studies on AI Citations — Meta-Analysis (Medium / Max Vincet)

- **출처**: <https://medium.com/@maxvincet391/i-analyzed-23-studies-on-ai-citations-780c0717cac0>
- **발행일**: 2026-05-11
- **저자**: Max Vincet
- **수집일**: 2026-05-27
- **한 줄 요약**: 2025-2026 출판된 23개 AI 인용 연구의 메타 분석. ChatGPT/Perplexity/Google AI 인용을 결정하는 23개 팩터 순위.

---

## 23개 팩터 (저자의 영향력 순)

1. URL Accessibility
2. Search Rank
3. Fan-out Rank
4. Preview Control
5. Query-Answer Match
6. Intent-Format Match
7. Topic Cluster Ranking
8. Answer Near the Top
9. AI-Ready Structure
10. Factually Specific
11. Explicit Phrasing
12. Cites Sources
13. Self-Contained Passages
14. Content Visibility
15. Freshness
16. Brand and Entity Trust
17. Length
18. Language
19. Entity Consistency
20. Structured Data
21. Known Source
22. Domain Authority
23. llms.txt

---

## Top-tier 팩터 해설 (1-9)

- **URL Accessibility (#1)**: 크롤러 차단되면 게임 끝. robots.txt, JS-only 렌더, paywall은 직접 영향. GPTBot/ClaudeBot/PerplexityBot 명시 허용.
- **Search Rank (#2)**: Google top-10 ≒ AI 인용 후보 풀. 위치 1 ≈ **53% citation probability**.
- **Fan-out Rank (#3)**: 모델이 만든 sub-query에서 ranking. fan-out 인용 = 메인 키워드 트래킹 사각지대 (ALM Corp 데이터: 인용 중 1/3 가량이 fan-out에서만).
- **Preview Control (#4)**: 모델이 미리보기 하는 영역 (보통 본문 첫 절). 따라서 title, meta description, 첫 문단 control 중요.
- **Query-Answer Match (#5)**: 페이지가 **그 쿼리 답을 명시적으로 제공**하는가.
- **Intent-Format Match (#6)**: 정보성 → article / 상업성 → ranked listicle / 도구성 → table·calculator (Evertune 데이터 일치).
- **Topic Cluster Ranking (#7)**: 동일 토픽으로 묶인 페이지 군이 함께 ranking. Hub-and-spoke 구조 권장.
- **Answer Near the Top (#8)**: 첫 30%에 답을 배치 (Digital Applied 44.2% 발췌 데이터).
- **AI-Ready Structure (#9)**: H1-H2-H3 명확, scannable, semantic HTML.

## 하위 팩터 메모

- **#23 llms.txt**: 거의 영향 없음. Google 공식 메세지와 일치.
- **#17 Length, #18 Language, #20 Structured Data**: 모두 직접 영향 약함. 단, 영어 외 언어는 entity consistency 부족하면 인용률 떨어짐.

---

## 메타 결론 (인용 가능 문장)

- > "Most of what works for AI citations is stuff you should already be doing for regular SEO."
- > AI 인용은 **passage-level retrievability** 의 함수다 — page-level이 아니다.
- 인용된 페이지는 평균적으로 **impression 당 organic click +120%** (Seer 2026).

---

## 마음토스 적용 메모 (체크리스트화)

- [ ] GPTBot, ClaudeBot, PerplexityBot robots.txt 허용 확인
- [ ] 발행 글 GSC top-10 위치 점검 (Search Rank가 결국 #2 팩터)
- [ ] 각 글 첫 H2 위에 "직접 답" 단락 존재 여부 점검 (Preview Control + Answer Near the Top)
- [ ] 토픽 클러스터: 마음/우울/불안 등 카테고리별 hub 페이지 + spoke 글 정합성 점검
- [ ] Entity Consistency: "마음토스" 표기 / 도메인 / Organization 스키마 일치 (외부에서도 동일하게 표기되는가)
- [ ] Self-contained passages: 한 글 안에 단독으로 발췌 가능한 단락이 3개 이상인가
