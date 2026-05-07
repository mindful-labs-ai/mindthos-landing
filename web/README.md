# mindthos-web

마음토스(Mindthos) 공식 웹사이트 — Next.js 16 / Tailwind CSS v4 / Supabase 기반.

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 세팅
cp .env.example .env.local
# .env.local 의 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / REVALIDATION_SECRET / INDEXNOW_KEY 등을 채웁니다.

# 3. 개발 서버
npm run dev          # http://localhost:3000

# 4. 빌드
npm run build
npm run start
```

## 디렉토리

```
app/                  Next.js App Router
  layout.tsx          전역 레이아웃 (Pretendard local font + JSON-LD + GA/Pixel)
  globals.css         디자인 토큰 + .prose + shadcn 변수
  hifi.css            home 전용 hifi 스타일 aggregator (13 모듈 import)
  hifi/               .gnb / .promo-top / 섹션별 모듈 13개
    ├─ tokens.css     :root 디자인 토큰 (브랜드/컬러/스페이싱/모션)
    ├─ base.css       reset · 프리미티브 · .container
    ├─ chrome.css     GNB · promo · hero overlay · kicker
    ├─ pain.css       §03 Pain
    ├─ features.css   §04 Features (5 product mocks)
    ├─ sample.css     §05 Sample experience
    ├─ personas.css   §06 Persona timeline
    ├─ vs.css         §07 vs Compare
    ├─ evidence.css   §08 Evidence + Testimonials
    ├─ pricing.css    §09 Pricing
    ├─ faq.css        §10 FAQ
    ├─ final.css      §11 Final CTA
    └─ footer.css     Footer + IA + typography overrides
  (site)/             Header + Footer 가 적용되는 라우트 그룹
    ├─ page.tsx       홈 (HifiLanding monolith)
    ├─ layout.tsx     <PromoBanner /> + <Header /> + <Footer />
    ├─ blog/          블로그 시스템 (목록 / 상세 / OG 이미지)
    ├─ education/     교육 프로그램
    └─ security/      보안 / 데이터 처리 안내
  api/
    ├─ revalidate/    POST: REVALIDATION_SECRET 검증 후 ISR 갱신
    └─ indexnow/      Bing/Yandex 즉시 인덱싱
  sitemap.ts          / · /blog · /education · /security + 발행된 블로그 글
  robots.ts           User-agent + Disallow + Sitemap

components/
  layout/             Header, PromoBanner, Footer (모든 (site) 페이지 공통)
  home/HifiLanding    홈 monolith (다음 라운드에 sections 분할 예정)
  blog/               PostCard, PostContent, SummaryBox, TableOfContents,
                      FAQSection, ReferencesList, RelatedPosts, Pagination,
                      CategoryFilter, BlogSearch, BlogSidebar, InlineCTA,
                      BottomCTA + _cta(공유 resolver)
  seo/SchemaMarkup    <script type="application/ld+json">

lib/
  markdown/           remark-rehype 파이프라인 + rehype-sanitize + TOC 추출
  seo/                generatePostMetadata, JSON-LD 빌더 (Article/FAQ/Breadcrumb 등)
  supabase/{client,server,static,queries,types}
  utils.ts            cn(), formatDateKo()

constants/            site, nav, seo, categories
types/                blog (Database 기반 derive), form, seo
public/               fonts (Pretendard 5 weight) · 이미지 · IndexNow 키 파일
supabase/migrations/  001_initial · 002_counseling_programs
docs/                 운영 가이드 + Phase 2 백로그 + 차후 리팩토링 spec
```

## 디자인 토큰

`globals.css :root` 가 마음토스 canonical 토큰의 단일 진실 원본:

- **메인 그린**: `--brand-primary: #44ce4b` (운영 색, CLAUDE.md mandate)
- **hover**: `--brand-primary-dark: #40a755`
- **다크 위 fill**: `--brand-primary-soft: #65c377`
- **본문 텍스트**: `--text-primary: #1f1f1f`
- **본문 배경**: `--bg-base: #ffffff`
- **다크 영역**: `--bg-deep: #181819`
- **컨테이너**: `--container-wide: 1280px` / `--gutter-wide: 40px` (홈/블로그) ·
  `--container-max: 1120px` (security/education) · `--container-prose: 640px`
- **폰트**: Pretendard local (5 weight: 400/500/600/700/800) + IBM Plex Mono (caption)

`hifi/tokens.css` 의 짧은 alias(`--brand`/`--ink-*`/`--line-*`)는 globals canonical 토큰의
alias로 처리되어 시각 회귀 위험 없이 hifi 스타일과 일반 페이지가 같은 색·간격을 공유합니다.

## SEO / 보안

- 모든 페이지: `generateMetadata()` + canonical + og:* 메타
- JSON-LD: Organization + WebSite + (블로그) BlogPosting + BreadcrumbList + FAQPage
- 헤더: HSTS preload, X-Frame-Options DENY, Permissions-Policy, **CSP report-only**
  (Google Fonts/GA4/Meta Pixel/Supabase/Vercel insights whitelist)
- 마크다운: rehype-sanitize 적용 (h1-h6 id 보존, table-responsive 래퍼 허용,
  외부 링크 target=\_blank rel=noopener noreferrer 자동 부여)
- IndexNow: `GET /api/indexnow` 가 키 평문 응답 (Bing 검증) · `POST /api/indexnow` 가
  indexnow.org 포워딩

## DB 마이그레이션

```bash
# Supabase CLI 사용 (권장)
supabase link --project-ref <PROJECT_REF>
supabase db push

# 또는 Management API (PAT 필요)
bash scripts/apply-supabase-migrations.sh
```

마이그레이션:
- `001_initial_schema.sql` — 9 테이블 + RLS + 인덱스 + 트리거 + 카테고리 4종 시드
- `002_counseling_programs.sql` — 마음토스 제품 4종(transcribe/progress-note/conceptualization/genogram) 시드 + categories.default_program_id 매핑

## 블로그 발행 가이드

콘텐츠 발행은 어드민 페이지가 아닌 **Supabase Studio 에서 직접** 수행합니다 — 자세한 가이드: `docs/blog-publishing.md`.

## 주요 문서

| 문서 | 내용 |
|---|---|
| `CLAUDE.md` | Claude/AI assistant 작업 규칙 (코딩 컨벤션, 디자인 토큰, 절대 금지 등) |
| `docs/blog-publishing.md` | 글 INSERT SQL 템플릿, ISR 갱신, IndexNow ping, SEO 점검 |
| `docs/PHASE2_BACKLOG.md` | Phase 2 작업 진행 추적 (완료/진행/대기) |
| `docs/refactor-deferred.md` | 차후 PR 권장 큰 리팩토링 spec |
| `.qa/qa-checklist.md` | QA 체크리스트 (자동 + 수동) |
| `.qa/qa-report.md` | 최근 검증 리포트 + 스크린샷 |

## 디자인 / 콘텐츠 참고 자료 (외부 폴더)

| 폴더 | 역할 |
|---|---|
| `../mindthos-landing-design/` | 디자인 토큰 / 와이어 / 하이파이 (단일 진실 원본) |
| `../blog-seo-template/` | 재사용 가능한 SEO 블로그 시스템 패키지 |
| `../andotherlife-web/` | 동일 템플릿 best practice 레퍼런스 |

## 라이선스

내부용. 외부 배포 전 별도 결정 필요.
