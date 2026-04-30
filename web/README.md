# mindthos-web

마음토스(Mindthos) 공식 웹사이트 — Next.js 16 / Tailwind CSS v4 / Supabase 기반.

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 세팅
cp .env.example .env.local
# .env.local 의 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 등을 채워주세요.

# 3. 개발 서버
npm run dev          # http://localhost:3000

# 4. 빌드
npm run build
npm run start
```

## 디렉토리

```
app/           Next.js App Router (홈 + IA 11 섹션 + 서브 페이지)
components/    재사용 컴포넌트 (layout, ui, seo, blog, cta, home)
lib/           유틸리티 (supabase, seo, markdown, analytics, validations)
constants/     사이트 상수, 카테고리, SEO 기본값
types/         TypeScript 타입
hooks/         커스텀 React 훅
public/        정적 자산 (fonts, images, og-default.png 등)
supabase/      DB 마이그레이션 + Edge Functions
styles/        전역 CSS (필요 시)
```

## 디자인 / 콘텐츠 참고 자료 (별도 폴더)

| 폴더 | 역할 |
|---|---|
| `../mindthos-landing-design/` | 랜딩 디자인 · 와이어 · 디자인 토큰 (단일 진실 원본) |
| `../blog-seo-template/` | 재사용 가능한 SEO 블로그 시스템 패키지 |
| `../andotherlife-web/` | 동일 템플릿으로 만든 best practice 레퍼런스 |

> **컬러·타이포 변경**은 항상 `../mindthos-landing-design/05-design/design-tokens.md` (v1.2 이상)
> 를 단일 진실 원본으로 참조한 뒤 `app/globals.css` 에 반영합니다.

## 브랜드 토큰 (요약)

- **메인 그린**: `#44ce4b` — CTA fill / active tab / 강조
- **다크 그린(hover)**: `#40a755` — primary hover · outline border
- **소프트 그린(다크 bg 위)**: `#65c377`
- **본문 텍스트**: `#1f1f1f` (warmth 유지)
- **본문 배경**: `#ffffff` / 섹션 alt `#f7f5f1`
- **다크 영역**: `#181819` (Hero · Footer · 종착점)
- **폰트**: Pretendard Variable (본문) + IBM Plex Mono (caption / data)

## 사이트 IA (11 섹션 + 서브페이지)

홈 11 섹션: Hero · Trust · 문제 공감 · 핵심 기능 5축 · 샘플 체험 · 페르소나 ·
범용 AI vs 마음토스 · 후기+정량 · 가격 · FAQ · 최종 CTA.

서브 페이지:
- `/product/{transcribe,progress-note,conceptualization,genogram}`
- `/for-institutions`
- `/security/{how-we-protect,privacy-policy,terms}`
- `/pricing` · `/about` · `/contact`
- `/resources/{blog,tech-blog,guides,case-studies}`

자세한 내용은 `../mindthos-landing-design/02-plan/current/ia-structure.md` 참조.

## SEO 기본 동작

- 모든 페이지는 `generateMetadata()` 또는 `metadata` 객체 필수.
- `app/sitemap.ts` 가 정적 라우트 + Supabase posts 데이터로 sitemap.xml 자동 생성.
- `app/robots.ts` 가 robots.txt 응답.
- `lib/seo/schema.ts` 가 Organization / WebSite / Article / FAQPage / BreadcrumbList JSON-LD 생성.

## DB 마이그레이션

```bash
# Supabase CLI 사용 (권장)
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push

# 또는 Supabase Dashboard → SQL Editor 에 supabase/migrations/*.sql 순서대로 실행
```

## 후속 작업 (Phase 2 — 본 세팅에서 의도적으로 deferred)

| 항목 | 위치 / 행동 |
|---|---|
| **og 이미지 + 파비콘 자산** | `public/og-default.png` (1200×630) · `public/icon.png` (192×192) · `public/apple-touch-icon.png` · `public/favicon.ico` 생성 후 추가. layout.tsx 가 이미 참조 중. |
| **Pretendard 로컬화** | 현재는 jsDelivr CDN @import (globals.css 1행). `public/fonts/Pretendard-Variable.woff2` 다운로드 후 `next/font/local` 로 전환하면 LCP / offline 빌드 안정성 개선. |
| **블로그 컴포넌트 본 구현** | PostCard, PostContent, TableOfContents, FAQSection, RelatedPosts, BlogSearch, BlogSidebar, Pagination — `../blog-seo-template/src/components/blog/` 참고하여 마음토스 디자인 토큰으로 포팅. |
| **문의 / 뉴스레터 폼 본 구현** | `/contact` 페이지에 React Hook Form + zod (lib/validations/) + Supabase insert 연동. |
| **법무 본문** | `/security/privacy-policy`, `/security/terms` placeholder 를 법무 검토본으로 교체. |
| **마음토스 4 제품 상세 페이지 본 구현** | `/product/{transcribe,progress-note,conceptualization,genogram}` 카피·시각·CTA 보강. |
| **가격 4단 + 크레딧 계산기** | `/pricing` 본 구현. |
| **콘텐츠 카테고리 확정** | 현재는 4 placeholder (general-blog, tech-blog, guides, case-studies). 콘텐츠 전략 확정 시 SQL 시드 보강 + `constants/categories.ts` 갱신. |

## 라이선스

내부용. 외부 배포 전 별도 결정 필요.
