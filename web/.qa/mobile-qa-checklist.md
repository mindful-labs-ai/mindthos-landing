# 모바일 반응형 QA 체크리스트 — feat/large-refactor (2026-05-07)

## 검증 범위

| 라우트 | 경로 |
|---|---|
| 홈 | `/` |
| 블로그 목록 | `/blog` |
| 블로그 상세 | `/blog/ai-transcription-counseling-security` |
| 보안 | `/security` |
| 교육 | `/education` |

## 뷰포트

| 라벨 | width × height |
|---|---|
| Galaxy | 360 × 800 |
| iPhone SE | 375 × 667 |
| iPhone 14 | 390 × 844 |
| iPhone Plus | 414 × 896 |

---

## 카테고리 1 — Horizontal Overflow (자동)
검사: `document.documentElement.scrollWidth > clientWidth`

| 라우트 | 360 | 375 | 390 | 414 |
|---|---|---|---|---|
| / | ☐ | ☐ | ☐ | ☐ |
| /blog | ☐ | ☐ | ☐ | ☐ |
| /blog/[slug] | ☐ | ☐ | ☐ | ☐ |
| /security | ☐ | ☐ | ☐ | ☐ |
| /education | ☐ | ☐ | ☐ | ☐ |

## 카테고리 2 — Touch Target ≥ 44 × 44 px (자동, WCAG 2.5.5)
검사: 모든 `a[href]`, `button`, `[role="button"]`, `input`, `select`, `summary` 의 visible bounding rect

| 라우트 | < 44px 카운트 (목표 0, 인라인 텍스트 링크 제외) |
|---|---|
| / | ☐ |
| /blog | ☐ |
| /blog/[slug] | ☐ |
| /security | ☐ |
| /education | ☐ |

## 카테고리 3 — 가독성 (자동 + 수동)
- ☐ 본문 폰트 크기 ≥ 14px (Apple HIG / Material 가이드)
- ☐ line-height ≥ 1.4
- ☐ 컬러 대비 WCAG AA (4.5:1 본문, 3:1 large text)
- ☐ 한 줄 길이 ≤ 60–80자 (모바일에서 너무 좁지 않은지)

## 카테고리 4 — 인터랙션 (수동)
- ☐ Header 햄버거 메뉴 → drawer 열림 / Esc 닫힘 / 첫 링크 focus
- ☐ Personas 캐러셀 → ◀ ▶ 버튼 클릭 + 스와이프
- ☐ PromoBanner ✕ → dismiss 후 sessionStorage 유지
- ☐ promo-bottom (홈) ✕ → dismiss
- ☐ FAQ `<details>` 펼침/접힘
- ☐ 블로그 TOC `<details>` (모바일) 펼침 + 항목 클릭 → smooth scroll
- ☐ Hero `<video>` autoPlay (preload="metadata")
- ☐ 페이지네이션 (블로그) prev/next 클릭

## 카테고리 5 — 이미지 / 비디오 (자동 + 수동)
- ☐ 모든 `<img>` 가 `max-width: 100%`
- ☐ 모든 이미지 `alt` 존재 (장식은 `alt=""`)
- ☐ Hero `<video>` 가 360px 에서 잘리지 않음
- ☐ Persona 5장 이미지 모두 로드 + 종횡비 유지
- ☐ Blog 썸네일 종횡비 유지

## 카테고리 6 — Sticky / Fixed 요소 겹침 (수동)
- ☐ 상단 promo-top + Header 가 본문과 겹치지 않음 (`html.has-promo-top` 패딩)
- ☐ `.promo-bottom` (홈) 이 FAQ/FinalCTA 의 마지막 콘텐츠를 가리지 않음 (충분한 padding-bottom)
- ☐ 블로그 TOC (sticky) 가 데스크톱에서만 sticky, 모바일에서는 inline `<details>`

## 카테고리 7 — 폼 / CTA 정렬 (수동)
- ☐ 모든 CTA 버튼이 컨테이너 안에 들어가고 잘림 없음
- ☐ 버튼 텍스트 한 줄 (강제 줄바꿈 없음, 또는 의도된 줄바꿈만)
- ☐ Hero CTA 두 버튼이 360px 에서 stack 또는 wrap

---

## 자동화 — `scripts/mobile-qa/capture.mjs`

```bash
cd scripts/mobile-qa && QA_VARIANT=before node capture.mjs
# → web/.qa/screenshots/mobile-qa/before/{home,blog,blog-detail,security,education}-{galaxy,iphone-se,iphone-14,iphone-plus}.png
# → web/.qa/mobile-qa-audit.json (overflow + touch target + small text 진단)
```

수정 후:
```bash
QA_VARIANT=after node capture.mjs
# → web/.qa/screenshots/mobile-qa/after/...
```

## 수동 검증 — Chrome DevTools

1. F12 → 디바이스 툴바 → Custom 360×800
2. 각 라우트 5개 방문
3. 카테고리 4 (인터랙션) 7개 항목 직접 동작 확인

## 결과 보고 — `web/.qa/mobile-qa-report.md`

검증 후 매트릭스 + 발견 이슈 + 수정 PR 라인을 mobile-qa-report.md 에 기록.
