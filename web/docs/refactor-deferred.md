# Deferred Refactor — 차후 PR Spec

`feat/large-refactor` 브랜치 (2026-05-06) 라운드에서 시각/회귀 위험 또는 결정 사안으로 deferred한 큰 작업들의 사양. 각 항목은 **별도 PR로 분리해 시각/성능 검증 후 머지**를 권장합니다.

## 1. HifiLanding.tsx 섹션 추출 — `feat/hifi-section-split` ✅ 완료 (2026-05-06)

> **결과**: 3,290줄 monolith → 11개 sub-component 추출 (`components/home/sections/{Hero,TrustEncrypt,Pain,FeatureTabs,SampleExperience,Personas,VsCompare,Metrics,Pricing,Faq,FinalCta}Section.tsx`). 부모 HifiLanding.tsx 는 **175 lines** thin shell. §02/§03 fade-up cross-section IntersectionObserver만 부모에 유지 (주석으로 명시). 빌드 0 errors / typecheck 0 errors / eslint 0 errors. Hero/footer 섹션 시각 parity 검증 (Chrome headless).
>
> 동반 정리: HifiLanding.tsx Footer 의 `<a href="/">` → `<Link>` 2건, Hero `<img>` → eslint-disable + 주석, PainSection / FeatureTabsSection blockquote 의 raw `"` → 유니코드 큰따옴표(`""`).
>
> 잔여 본문은 historical reference 로 보존.

### 문제
`web/components/home/HifiLanding.tsx` (3,290 lines) 에 11개 섹션 + 7개 useEffect 가 monolith 로 결합. 단일 파일이 너무 커서 유지보수가 어렵고, 한 섹션 수정이 다른 섹션까지 재컴파일.

### 작업 범위
9~11개 sub-component로 분할 (각 `'use client'` 또는 server):

| 컴포넌트 | JSX 행 | 동행 useEffect | 비고 |
|---|---|---|---|
| `HeroSection` | 583-664 | 없음 (shared fade-up은 parent) | hero video + CTA |
| `TrustEncryptSection` | 665-851 | encmini typing | §02 |
| `PainSection` | 852-908 | shared fade-up은 parent | §03 |
| `FeatureTabsSection` | 909-1537 | feature-tabs auto-rotate + tab-click | §04 (628 LOC, 가장 큼) |
| `SampleExperienceSection` | 1538-1738 | step-card play | §05 |
| `PersonasSection` | 1739-2592 | persona rail | §06 (854 LOC) |
| `VsCompareSection` | 2593-2685 | vs-compare in-view | §07 |
| `MetricsAndFaqSection` | 2686-3069 | counter + faq accordion | §08+§10 (또는 분리) |
| `FinalCtaSection` | 3193-end | final-cta in-view | §11 |
| `MobilePromoBottom` | 별도 | promo-bottom dismiss | (모바일 sticky CTA, home 전용) |

### 제약
- 시각 / 동작 perfect parity (className, data-*, aria, document order 모두 동일)
- 부모 (HifiLanding.tsx)는 thin shell로 ~150 lines 목표
- 섹션 경계를 넘는 useEffect (예: §02 + §03 fade-up)는 부모에 유지하고 주석으로 명시
- DOM querySelector 가 sub-component 안에서 자기 노드만 잡도록 narrow

### 검증
- 빌드 통과 + Chrome headless 5 페이지 × 2 viewport 스크린샷 시각 비교
- prefers-reduced-motion 가드 동작 확인
- IntersectionObserver cleanup 누락 없음

### 예상 PR 사이즈
- 신규 파일 9~11개 + HifiLanding.tsx 3,290 → ~150 lines
- 각 섹션 commit 1개 (단계적 review 가능)

### 위험
- 가장 큰 변경. AI executor 한 번에 시도하면 30분 stuck (이전 라운드 경험). 단계적으로 1~2 sections씩 추출 + 즉시 시각 검증 권장.

---

## 2. hifi.css 잔여 토큰 reconcile — `feat/hifi-token-canonical`

### 문제
`hifi/tokens.css` :root 가 globals.css canonical 토큰과 중복 정의:

| 토큰 | hifi.css | globals.css | 시각 영향 |
|---|---|---|---|
| `--gutter` | 40px | clamp(16,4vw,32) | home padding이 globals 적용되면 좁아짐 (32px) |
| `--bg-deep` | #1A3025 (cool 진녹) | #181819 (거의 검정) | hero overlay / dark section 색 변화 |
| `--alert` | #dc2626 (red) | #e7906d (테라코타) | error UI 색 변화 |
| `--radius` | 6px | 0.75rem (12px) | hifi 카드/버튼 모서리가 둥글어짐 |
| `--text-primary` | #0f172a (slate-900) | #1f1f1f | 본문 색 미묘 변화 |

`--brand`, `--line-2`, `--line-warm` 은 이미 globals canonical로 alias 됨 (이번 라운드).

### 작업 범위
1. 디자인 결정: globals canonical 사용 (CLAUDE.md mandate) vs hifi 값 보존 — 사용자 의사결정 필요
2. 결정에 따라 hifi/tokens.css 의 중복 정의 제거 또는 alias 처리
3. 시각 회귀가 발생하는 selector 들을 식별 (`var(--gutter)`, `var(--text-primary)` 등을 사용하는 hifi 모듈)
4. 필요 시 hifi 전용 alias (`--gutter-hifi`) 도입

### 제약
- 시각 회귀는 home 페이지 전체에 영향
- 사용자가 디자인 검수 후 결정해야 머지 가능

### 검증
- 변경 전후 스크린샷 비교 (5 페이지 × 2 viewport)
- 사용자 시각 검수 통과

---

## 3. CSP enforce 전환 — `chore/csp-enforce`

### 현 상태
`next.config.ts` 가 `Content-Security-Policy-Report-Only` 헤더로 정책 발행 — 위반은 보고만, 차단 없음.

### 작업
1. 1주일 production 모니터링: DevTools Console + (선택) `report-uri` 엔드포인트 설정
2. 보고된 origin 분석 → whitelist 보강
3. `Content-Security-Policy-Report-Only` → `Content-Security-Policy` 로 전환

### 보강 후보 (이미 audit에서 식별됨)
- `cdn.prod.website-files.com` 을 `connect-src` 에도 추가 (현재 `img-src` 만)
- Vercel Speed Insights 가 `/_vercel/insights/` (same-origin) 외에 외부 호출하는 경우 whitelist
- `'unsafe-inline'` 제거 시도 → nonce 기반으로 GA/Pixel/JSON-LD 스크립트 처리

### 위험
- 잘못 enforce 하면 production 에서 서드파티 스크립트 차단 → GA/Pixel/이미지 로드 실패

---

## 4. Pretendard Variable woff2 단일 파일로 통합 — `perf/font-variable` ✅ 완료 (2026-05-06)

> **결과**: `web/public/fonts/PretendardVariable.woff2` (2.0 MB) 단일 파일로 교체. `app/layout.tsx` 의 5 static weight `localFont` config → 단일 entry `weight: '100 900'`. 5 static weight 파일 삭제 (Bold/ExtraBold/Medium/Regular/SemiBold). preload `<link rel="preload">` 7건 → 3건. 모든 weight 시각 parity 확인.
>
> 실측: spec의 "약 460KB → ~140KB" 추정은 부정확 — 실제 5 static weight 합 ~4.1MB, Variable 단일 ~2.0MB로 약 2MB 절감 + HTTP 요청 5→1.

### 현 상태 (당시)
5 weight static woff2 (400/500/600/700/800) — 약 460KB.

### 작업
- `Pretendard-Variable.woff2` 단일 파일 (~140KB) 로 교체
- `app/layout.tsx` localFont 설정 변경 (`weight: '100 900'` style: 'normal')
- 시각 검증: 모든 페이지에서 weight 렌더 동일

### 효과
- 약 320KB woff2 감소 (LCP 개선)

---

## 5. /education hero `<Image>` priority 부여 — `perf/education-lcp` ✅ 완료 (2026-05-06)

> **결과**: `app/(site)/education/page.tsx` `.map((p, idx) => ...)` 첫 카드(`idx === 0`)에 `priority` + `fetchPriority="high"` 부여. LCP 측정은 production 배포 후 CrUX/PSI 검증 권장.

### 현 상태 (당시)
`/education` 카드 그리드의 `<Image>` 들에 `priority` 미지정 — 첫 카드가 LCP 후보.

### 작업
- `app/(site)/education/page.tsx` `.map()` 에서 idx===0 인 경우 `priority` + `fetchPriority="high"` 부여
- LCP < 2.5s 검증

---

## 6. @theme inline 사용 통일 — `chore/theme-utility-migration` ✅ 완료 (2026-05-06)

> **결과 (Typography subset)**: 14 파일 (`app/(site)/blog/{[slug],}/page.tsx` + 12 `components/blog/*.tsx`) 의 typography arbitrary values 37건 일괄 마이그레이션:
>
> - `text-[length:var(--t-small)]` → `text-small` (20건)
> - `text-[length:var(--t-h3)]` → `text-h3` (5건)
> - `text-[length:var(--t-body)]` → `text-body-size` (4건)
> - `text-[length:var(--t-lead)]` → `text-lead` (3건)
> - `text-[length:var(--t-eyebrow)]` → `text-eyebrow` (2건)
> - `text-[length:var(--t-cta)]` → `text-cta` (2건)
> - `text-[length:var(--t-h2)]` → `text-h2` (1건)
>
> **결과 (Container/gutter subset)**: 5 파일 (`app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`, `app/(site)/blog/{[slug],}/page.tsx`) 의 container/gutter arbitrary 10건 일괄 마이그레이션. 새 alias 토큰 3개 추가 (`--max-width-container-wide: 1280px`, `--spacing-gutter`, `--spacing-gutter-wide: 40px`):
>
> - `max-w-[var(--container-narrow)]` → `max-w-narrow` (3건, 기존 760px alias 재사용)
> - `max-w-[var(--container-wide)]` → `max-w-container-wide` (2건)
> - `px-[var(--gutter)]` → `px-gutter` (3건)
> - `px-[var(--gutter-wide)]` → `px-gutter-wide` (2건)
>
> `py-[var(--section-py-tablet)]` md:py-[var(--section-py-desktop)] 패턴은 utility-friendly 명명이 적합하지 않아 arbitrary value로 유지.
>
> 검증: build 12 routes ✓, typecheck 0 errors, eslint 0 errors, blog 목록 + 상세 + 404 페이지 시각 parity (Chrome headless 1280px).

### 현 상태 (당시)
이전 라운드에서 `--text-display`, `--spacing-1..9`, `--container-*` 등을 `@theme inline` 에 노출.
하지만 컴포넌트 30+ 곳이 여전히 arbitrary value (`text-[length:var(--t-h3)]`, `max-w-[var(--container-wide)]`) 사용.

### 작업
- 1단계: 자주 쓰는 토큰 alias 명 점검 (`text-h3`, `max-w-container-wide` 등)
- 2단계: 컴포넌트별 점진적 마이그레이션 (PR 단위)

### 효과
- Tailwind class 가독성 향상, JIT 캐시 효율 개선

---

## 7. 인라인 style → 클래스 마이그레이션 — `chore/inline-style-cleanup` ✅ 완료 (2026-05-06)

> **결과**: `components/layout/Header.tsx` 의 모바일 toggle/panel inline styles 5개 (button + panel + nav + linkStyle) → `app/hifi/chrome.css` 의 `.gnb-mobile-toggle`, `.gnb-mobile-panel`, `.gnb-mobile-panel nav`, `.gnb-mobile-panel a` 클래스로 이전. `linkStyle` const 제거, `style` prop 제거. `#fff` → `var(--bg-base)` 토큰 사용. 모바일 viewport 시각 parity 확인.
>
> HifiLanding SVG fill 은 spec대로 유지 (SVG 속성).

### 현 상태 (당시)
- `Header.tsx` 모바일 메뉴 패널: 인라인 styles object (안전성 동기 — hifi.css 미로드 시도 동작)
- `HifiLanding.tsx` SVG 아이콘 fill 일부

### 작업
- Header inline styles → `hifi/chrome.css` 의 `.gnb-mobile-panel` / `.gnb-mobile-toggle` 클래스로 이전
- HifiLanding SVG fill 은 SVG 자체 속성이라 유지 OK

---

## 8. Headers nonce 기반 CSP — `security/csp-nonce`

### 현 상태
`'unsafe-inline'` 으로 GA/Pixel/JSON-LD 스크립트 허용.

### 작업
- Next.js Middleware 또는 generateMetadata 에서 nonce 생성
- script 마다 `nonce` 속성 부여
- CSP에서 `'unsafe-inline'` 제거, `'nonce-{value}'` 만 허용

### 위험
- App Router 전 페이지에 nonce 전파 필요 (middleware 의존)
- 외부 스크립트(GA tag manager) 가 동적 inject 하는 추가 스크립트는 별도 처리

---

## 우선순위 추천

| ID | 효과 | 위험 | 소요 | 추천 순서 |
|---|---|---|---|---|
| ~~1. HifiLanding 분할~~ ✅ | 유지보수 ↑↑ | — | — | **2026-05-06 완료** |
| ~~4. Pretendard Variable~~ ✅ | LCP ↓ | — | — | **2026-05-06 완료** |
| ~~5. /education priority~~ ✅ | LCP ↓ | — | — | **2026-05-06 완료** |
| ~~7. inline style cleanup~~ ✅ | 일관성 ↑ | — | — | **2026-05-06 완료** |
| ~~6. @theme 사용 통일~~ ✅ | 가독성 ↑ | — | — | **2026-05-06 완료** |
| 3. CSP enforce | 보안 ↑ | 외부 스크립트 차단 위험 | 모니터링 1주 | production 배포 후 |
| 2. hifi 토큰 reconcile | 일관성 ↑ | 시각 회귀 ↑↑ | 사용자 결정 후 | 보류 |
| 8. CSP nonce | 보안 ↑↑ | 통합 위험 ↑ | 1일 | 보류 (CSP enforce 후) |
