# Google FAQ Rich Results Deprecation (2026-05-07)

- **출처**:
  - Search Engine Journal: <https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/> (2026-05-10)
  - ALM Corp 분석: <https://almcorp.com/blog/google-faq-rich-results-no-longer-supported/>
  - Google 공식 문서: <https://developers.google.com/search/docs/appearance/structured-data/faqpage>
- **수집일**: 2026-05-27
- **한 줄 요약**: 2026-05-07부로 FAQ rich result UI가 검색결과에서 사라졌다. 스키마 자체는 valid하나 SERP 시각 효과는 없다. 아카이브 03번(Digital Applied) vs 01번(Google 공식)의 충돌이 이 사건으로 정리된다.

---

## 타임라인 (Google 공식 발표)

| 일자 | 이벤트 |
|------|--------|
| 2023-09-13 | HowTo rich result 폐지 (선행 사건) |
| **2026-05-07** | **FAQ rich result UI 노출 중단** |
| 2026-06 (예정) | Rich Result Test에서 FAQ 지원 제거, Search Console rich result 리포트에서 제거 |
| 2026-08 (예정) | Search Console API에서 FAQ 지원 제거 |

## 스키마 상태

- **FAQPage 스키마 자체는 schema.org에서 valid 유지**.
- Google 공식: "unused structured data doesn't cause problems for Search".
- 즉, 기존에 박혀있는 FAQPage 마크업을 **굳이 제거할 필요 없다**.
- 단, rich result UI는 사라졌으므로 **새 페이지에 추가하는 비용 vs 효익**은 명백히 낮아짐.

## AI 검색 인용과의 관계

- Google 공식 발표는 **AI 검색과의 연관성을 명시하지 않음**.
- ALM Corp 추정: "FAQ 스키마는 AI parsing에 도움된다는 주장이 있었지만, Google은 이 deprecation을 AI 트렌드와 연결시키지 않았다."
- Perplexity·ChatGPT가 FAQ 스키마를 직접 신호로 쓰는지에 대한 **확정 데이터는 없음**.
- 안전한 해석: **FAQ 스키마는 더 이상 추가 우선순위가 아니다**. Article / Organization / MedicalWebPage 스키마가 우선.

## 아카이브 충돌 해소

- 03번 (Digital Applied, 05-23): "**FAQPage/HowTo는 피하라 — eligibility 제한**" → 정확함. 이 deprecation을 반영한 권고였다.
- 01번 (Google 공식, 05 중순): "Structured data는 rich result 자격에 도움" → 일반 원칙으로는 여전히 맞지만 FAQ/HowTo는 예외.
- **결론**: 마음토스에서 FAQ 스키마 신규 추가 작업은 멈춘다. 기존 마크업은 유지 OK.

---

## 마음토스 액션

- [ ] 현재 블로그 발행 글 중 FAQPage 스키마 적용 현황 파악
- [ ] 신규 글 템플릿에서 FAQ 스키마 자동 생성 로직 비활성화 / 우선순위 하향
- [ ] **MedicalWebPage / Article + Organization** 스키마로 우선순위 이동 (11번 노트 참조)
- [ ] FAQ 콘텐츠 자체는 유지 — 본문 내 Q&A 섹션은 여전히 사용자/AI 모두에 가치 있음
