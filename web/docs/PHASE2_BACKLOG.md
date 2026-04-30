# Phase 2 Backlog — mindthos-web

> Phase 1 (프로젝트 부트스트랩) 완료 시점의 남은 작업 단일 진실 원본.
> Phase 1 결과 요약은 `/Users/jeonghyowon/mindthos-landing/.omc/progress.txt` 참조.
>
> 이 문서는 **각 항목을 독립적으로 픽업 가능**하도록 작성됐습니다.
> 작업 종료 시 항목 옆에 ✅ 와 PR/커밋 링크를 추가하세요.

---

## 0. 백엔드 인프라 (Supabase) 적용

> **현 상태**: 마이그레이션 SQL 2개는 작성 완료 (`web/supabase/migrations/`).
> 실제 Supabase 프로젝트에는 아직 적용 안 됨.
> 이 세션에는 Supabase MCP 서버가 등록돼 있지 않아 Claude 가 직접 적용 불가 → 사용자가 수동 또는 supabase CLI 로 적용해야 함.

### 0-1. 새 dev/staging Supabase 프로젝트 생성

운영 사이트(`mindthos.com`) 의 기존 Supabase 프로젝트는 production 데이터가
들어 있을 가능성이 높으므로, **마케팅 사이트용 별도 프로젝트** 를 새로 만드는 것을 강력히 권장합니다.

```
프로젝트명: mindthos-marketing-staging (또는 mindthos-www)
리전: AWS Northeast Asia (Seoul) ap-northeast-2
DB 비밀번호: 1Password / Bitwarden 등 안전한 저장소
```

### 0-2. 마이그레이션 적용

옵션 A — Supabase CLI (권장):

```bash
cd /Users/jeonghyowon/mindthos-landing/web
npm install -g supabase                 # 처음 1회
supabase login
supabase link --project-ref <NEW_PROJECT_REF>
supabase db push                         # web/supabase/migrations/ 의 001, 002 모두 적용
```

옵션 B — Supabase Dashboard (수동):

1. Dashboard → SQL Editor → `web/supabase/migrations/001_initial_schema.sql` 전체 붙여넣고 실행
2. 같은 Editor 에서 `web/supabase/migrations/002_counseling_programs.sql` 실행
3. Table Editor 에서 9 테이블 생성 확인 + categories 4 행 / counseling_programs 4 행 시드 확인

### 0-3. 환경 변수 세팅

Dashboard → Project Settings → API 에서 키 복사 후:

```bash
cd /Users/jeonghyowon/mindthos-landing/web
cp .env.example .env.local
# .env.local 편집:
#   NEXT_PUBLIC_SUPABASE_URL=https://<NEW_PROJECT_REF>.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
#   SUPABASE_SERVICE_ROLE_KEY=<service role key — 절대 공개 ❌>
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000   (로컬용)
```

### 0-4. Storage 버킷 생성 (블로그 이미지용)

Dashboard → Storage:
- 버킷명: `blog-images` · Public ✅
- (선택) `og-images` · Public ✅ — 동적 OG 이미지 캐시용

### 0-5. (선택) Supabase MCP 서버 등록

Claude 가 직접 SQL 실행 / 행 조회를 하려면 Supabase MCP 서버를 추가:

```bash
claude mcp add supabase \
  -- npx -y @supabase/mcp-server-supabase \
  --access-token <PERSONAL_ACCESS_TOKEN>
```

(`Project Settings → Access Tokens` 에서 발급)

---

## 1. 정적 자산 (High priority)

`app/layout.tsx` 가 이미 다음 경로를 참조 중이므로 부재 시 SEO/공유 UX 가 무력화됩니다.

| 자산 | 경로 | 사양 |
|---|---|---|
| 기본 OG 이미지 | `web/public/og-default.png` | 1200×630 PNG, 마음토스 그린 그라디언트 + 로고 + tagline |
| Apple touch icon | `web/public/apple-touch-icon.png` | 180×180 PNG |
| Web app icon | `web/public/icon.png` | 192×192 PNG |
| Favicon | `web/public/favicon.ico` | 32×32 (multi-resolution ico) |
| (선택) 네이버 검증 | `web/public/naver*.html` | 발급 후 추가, layout.tsx `metadata.verification.other['naver-site-verification']` 에 코드 추가 |

> 디자인 자산은 `mindthos-landing-design/05-design/hifi/landing-v1-hifi.html` 의 헤더 로고와 컬러 토큰을 따라 디자이너에게 발주.

---

## 2. Pretendard 로컬화 (High priority)

현재 `web/app/globals.css` 1행이 jsDelivr CDN @import 를 씀 → render-blocking, offline 빌드 깨짐.

### 단계
1. `cp ../andotherlife-web/public/fonts/Pretendard-{Light,Regular,Medium,SemiBold,Bold,ExtraBold}.woff2 public/fonts/` (이미 라이선스 OK 인 동일 파일)
2. `app/layout.tsx` 에 `next/font/local` 로딩 추가:
   ```ts
   import localFont from 'next/font/local';
   const pretendard = localFont({
     src: [
       { path: '../public/fonts/Pretendard-Light.woff2', weight: '300' },
       { path: '../public/fonts/Pretendard-Regular.woff2', weight: '400' },
       { path: '../public/fonts/Pretendard-Medium.woff2', weight: '500' },
       { path: '../public/fonts/Pretendard-SemiBold.woff2', weight: '600' },
       { path: '../public/fonts/Pretendard-Bold.woff2', weight: '700' },
       { path: '../public/fonts/Pretendard-ExtraBold.woff2', weight: '800' },
     ],
     variable: '--font-pretendard',
     display: 'swap',
   });
   ```
3. `<html className={`${pretendard.variable} ${plexMono.variable}`}>` 로 `--font-pretendard` 노출
4. `app/globals.css` 1행의 `@import url('https://cdn.jsdelivr.net/...pretendardvariable.css');` 삭제
5. `globals.css` 의 `--font-sans` 선언을 `var(--font-pretendard)` 로 변경
6. `npm run build` + Lighthouse 로 LCP 개선 확인

> Variable woff2 (`Pretendard-Variable.woff2`) 사용도 가능 (단일 파일). https://github.com/orioncactus/pretendard/releases 의 `pretendard-1.3.x.zip` 의 `web/variable/woff2/` 참조.

---

## 3. 랜딩 11 섹션 본 구현 (High priority — 핵심)

| # | 섹션 | 와이어 / 디자인 참고 | 핵심 컴포넌트 |
|:---:|---|---|---|
| 01 | Hero | `mindthos-landing-design/04-wireframes/final/wireframe-v2-final.html` §01 + `05-design/hifi/landing-v1-hifi.html` Hero 부분 | `components/home/Hero.tsx`, `cta/PrimaryCTA.tsx` (이미 있음) |
| 02 | Trust & 보안 | 와이어 §02 (사수 피드백으로 상단 배치 확정) | `components/home/TrustStrip.tsx` (chip 3-4 개 + 보안 아이콘) |
| 03 | 문제 공감 (5 Pain) | 와이어 §03 — `06-content/sections/problems-v2-draft.md` | `components/home/PainPoints.tsx` (스토리텔링 카드) |
| 04 | 핵심 기능 5축 (탭 전환형) | 와이어 §04 — `06-content/sections/features-v2-draft.md` | `components/home/FeatureTabs.tsx` (탭 + 스크린샷 placeholder) |
| 05 | 샘플 상담노트 체험 | 와이어 §05 — `06-content/sections/sample-experience-v2-draft.md` (Collapsed/Expanded · CASE 01-03) | `components/home/SampleExperience.tsx` (3 카드 + Step 1-3) |
| 06 | 페르소나 timeline | 와이어 §06 — timeline scene sequence (구 grid 폐기) | `components/home/PersonasTimeline.tsx` (5 scene + IntersectionObserver) |
| 07 | 범용 AI vs 마음토스 | 와이어 §07 — 좌우 비교 + workflow panel | `components/home/VsAI.tsx` |
| 08 | 후기 + 정량 | 와이어 §08 — Metrics First + Testimonials Below 통합 | `components/home/SocialProof.tsx` (4 metric 카드 + 3 후기 + 6 기관 로고) |
| 09 | 가격 + 크레딧 환산 | `07-features/pricing-plan/plans-v2.md` (TBD — 현재 placeholder) | `components/home/Pricing.tsx` (4 플랜 카드, 1.5px brand-primary border = 추천) |
| 10 | FAQ | `06-content/faqs.md` | `components/home/FAQ.tsx` (Accordion · 열림 상태 brand-primary-pale bg) |
| 11 | 최종 CTA | 와이어 §11 — `bg-deep` 다크 영역 | `components/home/FinalCTA.tsx` |

### 작업 원칙 (CLAUDE.md 동일)
- 한 번에 한 섹션씩 PR
- 디자인 토큰 변수 (`var(--brand-primary)` 등) 만 사용 — hex 직접 ❌
- 인라인 style 대신 Tailwind arbitrary value (`bg-[var(--brand-primary)]`) 사용
- 이모지 ❌, lucide-react SVG 아이콘만
- `prefers-reduced-motion` 가드 필수

---

## 4. 마음토스 제품 4종 상세 페이지 본 구현 (Mid)

`/product/{transcribe, progress-note, conceptualization, genogram}` 의 placeholder 를 본 구현으로 교체.

### 페이지 공통 구조
1. Hero (제품 라벨 + 기능 한 줄 요약 + 데모 placeholder)
2. 핵심 가치 3-4 카드
3. 사용 흐름 step-by-step
4. 보안/정확도 트러스트 셀
5. 관련 블로그/가이드 (Supabase posts 의 카테고리 매칭)
6. CTA — `<PrimaryCTA href="/contact?type=free-trial">무료로 시작하기</PrimaryCTA>`

### 데이터 연결
`lib/supabase/queries.ts` 의 `getCounselingPrograms()` 추가 (현재는 없음 — `blog-seo-template/src/lib/supabase/queries.ts` 156행 참고) 후 product 페이지에서 호출.

---

## 5. 폼 본 구현 (Mid)

### 5-1. `/contact` (`app/contact/page.tsx`)
- React Hook Form + zod (스키마는 `lib/validations/contact.ts` 에 이미 있음)
- 분기 query: `?type=free-trial` 와 `?type=institution-inquiry` 시 inquiry_type 자동 채움
- Server Action 또는 `app/api/contact/route.ts` POST → `contact_inquiries` 테이블 INSERT
- 제출 후 thank-you 영역 + GA4 `generate_lead` 이벤트
- UTM 파라미터 자동 캡처

### 5-2. 뉴스레터 폼 (`components/forms/NewsletterForm.tsx`)
- 단일 email + name(선택) + sourceUrl(자동)
- Server Action → `newsletter_subscribers` INSERT (RLS 가 익명 INSERT 허용)
- 푸터 / 블로그 사이드바에 임베드

---

## 6. 블로그 시스템 본 구현 (Mid)

`blog-seo-template/src/components/blog/` 에 있는 컴포넌트 8종을 마음토스 디자인 토큰으로 포팅.

| 컴포넌트 | 위치 |
|---|---|
| PostCard | `components/blog/PostCard.tsx` |
| PostContent | `components/blog/PostContent.tsx` (본문 HTML 렌더 + prose) |
| TableOfContents | `components/blog/TableOfContents.tsx` (sticky · `lib/markdown/toc.ts` 사용) |
| FAQSection | `components/blog/FAQSection.tsx` (Accordion 의존 — shadcn) |
| ReferencesList | `components/blog/ReferencesList.tsx` |
| RelatedPosts | `components/blog/RelatedPosts.tsx` |
| BlogSidebar | `components/blog/BlogSidebar.tsx` (인기글 + 뉴스레터 + 카테고리) |
| Pagination | `components/blog/Pagination.tsx` |
| BlogSearch | `components/blog/BlogSearch.tsx` |

### 라우트 본 구현
- `/resources/blog/page.tsx` → 페이지네이션 + 카테고리 필터 + 사이드바
- `/resources/[category]/page.tsx` → 카테고리 페이지 (현재는 `/resources/blog`, `/tech-blog`, `/guides`, `/case-studies` 가 별도 경로 — 동적 [category] 로 통일 검토)
- `/resources/[category]/[slug]/page.tsx` → 개별 포스트 (Article + FAQ + Breadcrumb Schema)
- `/resources/[category]/[slug]/opengraph-image.tsx` → 동적 OG (next/og)
- `/resources/tag/[tag]/page.tsx` → 태그 페이지 (글 < 3 이면 noindex)

---

## 7. 가격 4단 + 크레딧 계산기 (Mid)

`/pricing` 본 구현. 디자인 토큰: 추천 카드만 `1.5px var(--brand-primary)` 테두리.

### 추가 자료 필요
- `mindthos-landing-design/07-features/pricing-plan/plans-v2.md` — 현재 미작성. 비즈니스 결정 후 작성 필요
- 크레딧 계산기는 클라이언트 컴포넌트 (`'use client'` + zustand 또는 useState)

---

## 8. 법무 본문 교체 (Low)

| 페이지 | 현재 | 필요 |
|---|---|---|
| `/security/privacy-policy` | placeholder | 법무 검토 본문 + 마음토스 데이터 처리 실태 반영 |
| `/security/terms` | placeholder | 법무 검토 본문 |
| `/security/how-we-protect` | placeholder | 보안 설계 (암호화·접근 통제·학습 미사용·감사 로그) 본문 + 다이어그램 |

---

## 9. 콘텐츠 카테고리 확정 + 시드 보강 (Low)

현 시드 (`web/supabase/migrations/001_initial_schema.sql` 마지막 INSERT) 는 4 placeholder.
콘텐츠 전략 확정 후:
1. 신규 마이그레이션 `003_categories_v2.sql` 작성 (UPDATE / INSERT)
2. `web/constants/categories.ts` 갱신
3. `web/constants/nav.ts` 의 `리소스 ▾` 하위 메뉴 갱신

---

## 10. 인라인 style → Tailwind arbitrary value 통일 (Low)

`web/CLAUDE.md` 6.스타일 의 "인라인 스타일 ❌" 규칙 정합. 현재 page.tsx, Header, Footer, PrimaryCTA 등에 `style={{ background: 'var(--brand-primary)' }}` 패턴이 남아 있음.

전환 예시:
```tsx
// before
<div style={{ background: 'var(--brand-primary)', color: 'var(--text-primary)' }}>

// after
<div className="bg-[var(--brand-primary)] text-[var(--text-primary)]">
```

또는 `globals.css` 의 `@theme inline` 에 brand 토큰을 매핑했으므로 더 간결하게:
```tsx
<div className="bg-brand-primary text-text-primary">
```

---

## 11. Vercel 배포 + 검색엔진 등록 (Low — 모든 phase 끝나고)

```bash
cd /Users/jeonghyowon/mindthos-landing/web
vercel link
# .env.example 의 모든 키를 production 으로 push:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production           # https://mindthos.com
vercel env add NEXT_PUBLIC_SITE_NAME production          # 마음토스
vercel env add REVALIDATION_SECRET production            # openssl rand -hex 32
vercel env add INDEXNOW_KEY production                   # openssl rand -hex 16
vercel env add NEXT_PUBLIC_GA_ID production              # G-XXXXXXX
vercel deploy --prod
```

배포 후:
- Google Search Console 등록 + sitemap.xml 제출
- Naver Search Advisor 등록 + sitemap.xml 제출
- Bing Webmaster Tools 등록 + IndexNow 키 등록
- `public/${INDEXNOW_KEY}.txt` 파일 생성 (단순 텍스트, 키 본인)
- Lighthouse 검증 (LCP < 2.5s · INP < 200ms · CLS < 0.1)

---

## 12. (선택) `app/api/revalidate/route.ts` & `app/api/indexnow/route.ts`

`blog-seo-template/src/app/api/` 참고. 콘텐츠 발행 자동화 도구를 도입할 때 함께 추가.

---

## 진행 추적

| 항목 | 우선순위 | 상태 | 담당 | 비고 |
|---|:---:|:---:|---|---|
| 0. Supabase 적용 | 🔴 | ☐ | | dev/staging 프로젝트 신규 권장 — MCP 도구가 본 세션에 노출 안 됨 |
| 1. og/favicon 자산 | 🔴 | ☐ | | 디자이너 발주 |
| 2. Pretendard 로컬화 | 🔴 | ✅ | claude (2026-04-30) | next/font/local 6 weight, jsDelivr 제거 |
| 3. 랜딩 11 섹션 | 🔴 | ✅ | claude (2026-04-30) | components/home/* 11 컴포넌트 |
| 4. 제품 4종 상세 | 🟡 | ☐ | | 카피 → `06-content/` 가져오기 |
| 5. 폼 본 구현 | 🟡 | ☐ | | contact + newsletter (Supabase 적용 후) |
| 6. 블로그 시스템 | 🟡 | ☐ | | 9 컴포넌트 + 라우트 본 구현 |
| 7. 가격 4단 + 계산기 | 🟡 | △ | | 4 플랜 카드 §3 안에서 완료 / 크레딧 계산기 미구현 |
| 8. 법무 본문 | 🟢 | ☐ | | 외부 법무 검토 의존 |
| 9. 카테고리 v2 | 🟢 | ☐ | | 콘텐츠 전략 확정 후 |
| 10. inline → tailwind | 🟢 | △ | | 새 home 섹션은 모두 arbitrary value / 기존 Hero·Header·Footer 잔존 |
| 11. Vercel 배포 | 🟢 | ☐ | | 모든 high/mid 완료 후 |
| 12. revalidate/indexnow API | ⚪ | ☐ | | 콘텐츠 자동화 도입 시 |

> 우선순위: 🔴 High · 🟡 Mid · 🟢 Low · ⚪ Optional

---

## 참고 자료 (절대 변경 ❌ — 단일 진실 원본)

- `mindthos-landing-design/CLAUDE.md` — 마음토스 랜딩 작업 규칙
- `mindthos-landing-design/INDEX.md` — 디자인 폴더 맵
- `mindthos-landing-design/02-plan/current/ia-structure.md` — IA v3
- `mindthos-landing-design/02-plan/current/direction.md` — 개편 방향
- `mindthos-landing-design/05-design/design-tokens.md` v1.2 — **디자인 토큰 단일 진실 원본**
- `mindthos-landing-design/04-wireframes/final/wireframe-v2-final.html` — 와이어 lock-in
- `mindthos-landing-design/05-design/hifi/landing-v1-hifi.html` — 하이파이 작업본
- `mindthos-landing-design/06-content/` — 섹션별 카피 초안
- `blog-seo-template/` — 블로그 시스템 패키지 원본
- `andotherlife-web/` — 동일 패턴의 best practice 레퍼런스
