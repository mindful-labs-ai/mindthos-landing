# QA 검증 리포트 — feat/large-refactor (2026-05-06)

자동 검증 도구: Chrome 142 headless + curl + tsc + next build + eslint.

## 결과 요약 — ✅ 전체 통과

### A. 빌드/타입/린트
| 항목 | 결과 |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx next build` | ✅ 0 errors, 11 routes |
| `npx eslint` 신규 파일 | ✅ 0 errors |
| node_modules | 632 MB → 601 MB (~31 MB 감소) |

### B. HTTP 응답 (200)
- `/` `/blog` `/blog/ai-transcription-counseling-security` `/security` `/education` `/sitemap.xml` `/robots.txt` `/api/indexnow` 모두 200 ✅

### C. Redirect (307)
| URL | Location |
|---|---|
| `/contact` | https://open.kakao.com/me/Mindthos ✅ |
| `/about` | / ✅ |
| `/product` | / ✅ |
| `/security/privacy-policy` | https://app.mindthos.com/terms?type=privacy ✅ |
| `/security/terms` | https://app.mindthos.com/terms?type=service ✅ |
| `/resources` | /blog ✅ |
| `/pricing` | /#pricing ✅ |

### D. 보안 헤더
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- ✅ **Content-Security-Policy-Report-Only** (Google Fonts/GA/Pixel/Supabase whitelist)

### E. SEO / sitemap.xml
- ✅ 5개 URL: `/`, `/blog`, `/education`, `/security`, `/blog/ai-transcription-counseling-security`
- ✅ `/contact` 미포함 (외부 redirect로 의도적 제외)
- ✅ `<html lang="ko">`

### F. JSON-LD 스키마 (블로그 상세)
- ✅ `BlogPosting`
- ✅ `BreadcrumbList`
- ✅ `FAQPage`

### G. Markdown sanitize 동작
- ✅ H2 `id` 속성 보존 (TOC anchor 정상): `<h2 id="user-content-1-상담사가-축어록을-쓰는-네-가지-이유"` 등
- ✅ 외부 링크 `target=_blank` 보존

### H. 시각 — 데스크톱 (1280px) 스크린샷 검증
| 페이지 | 결과 |
|---|---|
| `/` 홈 | ✅ promo + gnb 헤더 통일, hero 비디오, "상담사를 위한 안전한 AI 에이전트" |
| `/blog` 목록 | ✅ 카테고리 필터 + 검색 + 사이드바 + PostCard 그리드 + Footer |
| `/blog/[slug]` 상세 | ✅ TOC sticky + SummaryBox + 본문 + FAQ + 표 정상 |
| `/security` | ✅ 헤더 통일, 보안 카드 그리드 |
| `/education` | ✅ 헤더 통일, 2개 프로그램 카드 |

### I. 시각 — 모바일 (390px) 스크린샷 검증
| 페이지 | 결과 |
|---|---|
| `/` 홈 | ✅ 헤더 햄버거 + 무료로 시작 버튼 |
| `/blog` 목록 | ✅ 카드 1열 |
| `/blog/[slug]` 상세 | ✅ TOC details collapsible, summary box, 본문 정상 |
| `/security` | ✅ 정상 |
| `/education` | ✅ 정상 |

### J. Console 에러
- ✅ 0 errors (dev.log 검사)
- 컴파일 후 모든 페이지 ready 상태 정상

### K. CSS 토큰
- ✅ `var(--brand-primary)` 적용 (#44ce4b 마음토스 mandate)
- ✅ hifi.css 13 모듈 모두 로드 (`tokens.css` 포함)
- ✅ Footer hex → CSS 토큰 마이그레이션 후 시각 동일

## 발견된 이슈 (수정됨)

| 이슈 | 영향 | 수정 |
|---|---|---|
| `app/hifi/features.css:1` 깨진 multi-line 주석 — turbopack dev에서 PostCSS parse 실패로 500 에러 | dev 모드 차단 | line 1을 `/* 공통 카드 ... */` 단일 라인 주석으로 수정. `tokens.css`/`base.css` 등 다른 모듈은 영향 없음. 이전 build는 lightningcss를 사용해 warning만 발생하고 통과했으나, dev turbopack은 stricter parsing |

## 스크린샷 위치
`/Users/sicei/Documents/GitHub/mindthos-landing/web/.qa/screenshots/`
- `home-{desktop,mobile}.png`
- `blog-{desktop,mobile}.png`
- `blog-detail-{desktop,mobile}.png`
- `security-{desktop,mobile}.png`
- `education-{desktop,mobile}.png`

## 결론

**현 브랜치 `feat/large-refactor`는 main 머지 가능 상태.** 시각 회귀 없음, 보안 헤더 정상, 모든 라우트 200/307 응답. CSP는 report-only 모드로 1주 모니터 후 enforce 전환 권장.
