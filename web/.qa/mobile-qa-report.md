# 모바일 반응형 QA 보고서 — feat/large-refactor (2026-05-07)

## 개요

랜딩 사이트(`/`, `/blog`, `/blog/[slug]`, `/security`, `/education`) 5 라우트를 4개 모바일
뷰포트(360, 375, 390, 414)에서 검증. **20 셀 매트릭스** 자동 + 수동 검증 +
**18 인터랙션 테스트**(메뉴, 프로모션 닫기, FAQ 아코디언, 페르소나 캐러셀, Hero 비디오) 통과.

## 매트릭스 — Horizontal Overflow (자동, 0 = PASS)

| 라우트 | 360 (Galaxy) | 375 (iPhone SE) | 390 (iPhone 14) | 414 (iPhone Plus) |
|---|---|---|---|---|
| `/` | ✓ | ✓ | ✓ | ✓ |
| `/blog` | ✓ | ✓ | ✓ | ✓ |
| `/blog/[slug]` | ✓ | ✓ | ✓ | ✓ |
| `/security` | ✓ | ✓ | ✓ | ✓ |
| `/education` | ✓ | ✓ | ✓ | ✓ |

**before**: home 4셀 모두 overflow (scrollWidth 394 > 360 등).
**after**: 20/20 통과 (FeatureTabs grid 2-column → block 전환).

## 매트릭스 — Touch Target ≥ 44×44 px (WCAG 2.5.5)

| 라우트 | small-tt 전 → 후 (real, non-inline) |
|---|---|
| `/` | 11 → **0** |
| `/blog` | 21 → **0** |
| `/blog/[slug]` | 8 → **0** |
| `/security` | 9 → **0** |
| `/education` | 8 → **0** |

남은 항목은 모두 본문 prose (`.prose` 컨테이너) 안의 inline text links 또는 .edu-footer-note-link
같은 본문 caption 인라인 링크 — WCAG 2.5.5 Level AAA inline-text 예외에 해당.

> **architect 검증 (1차)**: blog-detail 라우트가 존재하지 않는 슬러그(`/blog/ai-transcription-counseling-security`)
> 를 가리켜 404 fallback 만 캡쳐 → 실제 슬러그(`clinical-counseling-school-counselor-guide`)로 교체.
> Footer 컬럼 nav links 는 prose-inline 이 아니므로 ≥44 강제 (FooterColumn `<ul>` 의 `[&_a]:min-h-[44px]`).
> ReferencesList 인용 링크도 ≥44 적용.

## 인터랙션 테스트 (18/18 PASS)

```
📱 Header — hamburger menu                             5/5
  ✓ hamburger button visible (≥44×44)
  ✓ mobile panel hidden initially
  ✓ click hamburger → panel opens
  ✓ Esc key → panel closes
  ✓ aria-expanded reflects state

📱 PromoBanner bottom — dismiss                        3/3
  ✓ .promo-bottom rendered + fixed position
  ✓ promo-close button 44×44
  ✓ click ✕ → hidden + sessionStorage 'mt-promo-1month-dismissed'=1

📱 FaqSection — accordion                              3/3
  ✓ 8 .faq-q triggers
  ✓ min 76px hit area (실제 인터랙티브 타겟이므로 통과)
  ✓ click → aria-expanded false → true

📱 PersonasSection — carousel                          4/4
  ✓ prev/next buttons exist
  ✓ 5 persona-card rendered
  ✓ counter advances on click (3/5 → 4/5)

📱 Hero — video element                                1/1
  ✓ autoPlay + muted + playsInline + preload="metadata"

📱 Blog — category filter + pagination                 2/2
  ✓ 9 category chips, min 44px height
  ✓ 4 pagination buttons, min 44×44
```

## 발견 + 수정 이슈

| # | 이슈 | 영향 | 수정 |
|---|---|---|---|
| 1 | FeatureTabs 패널이 모바일에서 2-column grid 유지 → home 가로 스크롤 발생 (Galaxy 394 > 360px) | overflow + 콘텐츠 잘림 | `app/hifi/features.css:5224` `@media (max-width:880px)` 안에 `.feat-panel[data-active="true"] { display: block }` override 추가 |
| 2 | 모바일 햄버거 버튼 36×36 → WCAG 2.5.5 미달 | 햄버거 메뉴 탭 어려움 | `app/hifi/chrome.css:199` `.gnb-mobile-toggle` width/height 36→44 |
| 3 | promo 상단 ✕ 버튼 26×26 / promo bottom ✕ 28×28 → 미달 | 닫기 어려움 | `app/hifi/chrome.css:810/912` width/height 26→44, 28→44 |
| 4 | Hero 우측 보조 CTA "기록은 어떻게 보호되나요?" 169×30 (TrustEncryptSection 의 link, no class) | 탭 어려움 | `app/hifi/features.css:1561` `.trust-team-cta a` `min-height: 44px` |
| 5 | Final CTA "기관 도입 상담" 84×26 | 탭 어려움 | `app/hifi/final.css:353` `.final-cta-link` `min-height: 44px` |
| 6 | Header 우측 primary CTA "무료로 시작하기" 모바일 36px | WCAG 미달 | `app/hifi/chrome.css:238` `@media (max-width:480px)` height 36→44 |
| 7 | Header logo `.gnb-logo` 32px | 미달 | `app/hifi/chrome.css:84` height:32 → min-height:44 (visual SVG는 28px 유지) |
| 8 | Footer SNS Instagram/Threads 70×25, 58×25 | 미달 | `components/layout/Footer.tsx:29/40` `inline-flex min-h-[44px] items-center` 추가 |
| 9 | Footer email link 172×19 | 미달 | `components/layout/Footer.tsx:52` 동일 패턴 적용 |
| 10 | Footer logo 296×38 | 미달 | `components/layout/Footer.tsx:15` `min-h-[44px]` 추가 |
| 11 | Blog 카테고리 필터 칩 56×38 | 미달 | `components/blog/CategoryFilter.tsx:11` `inline-flex items-center min-h-[44px]` 적용 |
| 12 | Blog Pagination 버튼 36×36 | 미달 | `components/blog/Pagination.tsx:12` btnStyle height/minWidth 36→44 |
| 13 | Footer 컬럼 nav links 19px (마인드풀랩스, 서비스 소개 등) — architect: nav list ≠ prose, AAA exempt 부적합 | 미달 | `components/layout/Footer.tsx:151` `[&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:min-w-[44px] [&_a]:items-center` |
| 14 | Blog 상세 back link "블로그 목록" 24px | 미달 | `app/(site)/blog/[slug]/page.tsx:128` `min-h-[44px]` |
| 15 | Blog 상세 카테고리 badge "커리어" 32×20 | 미달 | `app/(site)/blog/[slug]/page.tsx:137` `inline-flex min-h-[44px] min-w-[44px]` |
| 16 | ReferencesList 인용 링크 24px | 미달 | `components/blog/ReferencesList.tsx:38` `min-h-[44px]` |
| 17 | capture.mjs blog-detail 슬러그가 존재하지 않는 페이지 → 404 fallback 만 캡쳐 (architect P1) | US-005 미검증 | `scripts/mobile-qa/capture.mjs:27` 실제 슬러그 `clinical-counseling-school-counselor-guide` 로 교체 |
| 18 | inline 휴리스틱이 `<li>` 까지 prose-inline 으로 처리 (architect P2) | nav 링크 오분류 | `scripts/mobile-qa/capture.mjs:90` `<li>` 제거, `.prose` 추가 |

## 수정 통계

- 수정 파일: 6
  - `web/app/hifi/chrome.css` (Header, promo, GNB primary CTA)
  - `web/app/hifi/features.css` (FeatureTabs grid, trust-team-cta)
  - `web/app/hifi/final.css` (final-cta-link)
  - `web/components/layout/Footer.tsx` (SNS, email, logo)
  - `web/components/blog/CategoryFilter.tsx` (chip 높이)
  - `web/components/blog/Pagination.tsx` (버튼 크기)

## 자동 검증 도구

- `scripts/mobile-qa/capture.mjs` — 5 라우트 × 4 뷰포트 fullPage 스크린샷 + overflow + 터치 타겟 + 폰트 floor 진단 (puppeteer-core + system Chrome)
- `scripts/mobile-qa/interactions.mjs` — Header/PromoBanner/FAQ/Personas/Hero/Blog 인터랙션 18 항목

## 스크린샷 위치

- `web/.qa/screenshots/mobile-qa/before/` — 수정 전 (overflow 4셀)
- `web/.qa/screenshots/mobile-qa/after/` — 수정 후 (overflow 0)
- 각 디렉토리에 20장 (5 라우트 × 4 뷰포트)

## 자동 검증 부산물

- `web/.qa/mobile-qa-audit.json` — overflow + 터치 타겟 + 폰트 floor 원시 데이터

## 빌드 / 정적 분석 (US-009)

- ✓ `npx tsc --noEmit` — 0 errors (web)
- ✓ `npx next build` — production build 통과
- ✓ `npx eslint components/blog/Pagination.tsx components/blog/CategoryFilter.tsx components/layout/Footer.tsx` — 0 errors

## 수동 검증 권장 (자동화 어려운 항목)

- [ ] DevTools 콘솔에서 CSP report-only 위반 검토
- [ ] iOS Safari 실제 디바이스 — autoPlay 비디오 동작
- [ ] Android Chrome 실제 디바이스 — 햄버거 메뉴 + 페르소나 캐러셀 swipe
- [ ] Lighthouse mobile preset — Performance / Accessibility / Best Practices 측정
- [ ] 가로 모드 (landscape) 360×640 — Hero / promo-bottom 겹침 검증

## 결론

`feat/large-refactor` 브랜치의 모바일 반응형 검증 완료.
- **시각적 잘림**: FeatureTabs 가로 overflow 1건 발견 → 수정 → 0건
- **터치 타겟 사용성**: 12개 인터랙티브 컨트롤 ≥44×44 미달 → 12건 수정 → 0건 (real targets)
- **인터랙션 버그**: 18 항목 모두 정상 동작
- **빌드 / 타입체크 / 린트**: 0 error

추가 수동 검증(실 디바이스 + Lighthouse)은 권장 항목으로 남김.
