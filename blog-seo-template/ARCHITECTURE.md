# 시스템 아키텍처

## 전체 그림

```
                     ┌──────────────┐
                     │  사용자 (검색)  │
                     └──────┬───────┘
                            │
                ┌───────────▼────────────┐
                │  Google / Naver / Bing │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │  Next.js (Vercel) ISR  │
                │   - sitemap.ts         │
                │   - robots.ts          │
                │   - /blog/[..]         │
                │   - JSON-LD Schema     │
                │   - OG Image (next/og) │
                └───────────┬────────────┘
                            │ Server Components
                ┌───────────▼────────────┐
                │  Supabase (PostgreSQL) │
                │   - posts              │
                │   - categories         │
                │   - tags / authors     │
                │   - counseling_programs│
                │   - contact_inquiries  │
                │   - newsletter_subs    │
                └───────────▲────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐ ┌────────▼────────┐ ┌────────▼─────────┐
│ 콘텐츠 작성     │ │ 폼 제출 (사용자)  │ │ ISR 수동 재생성   │
│ (관리자 도구)   │ │ /contact         │ │ /api/revalidate  │
│ Studio / SQL   │ │ /subscribe       │ │ /api/indexnow    │
└────────────────┘ └─────────────────┘ └──────────────────┘
```

> **이 패키지의 범위** — 검색 → 블로그 → 전환에 이르는 **사용자 경로(파란 박스)**와 **DB 스키마**까지. 콘텐츠 작성/발행 도구는 별도 운영 도구로 분리 (이 폴더에 포함되지 않음).

## 데이터 흐름

```
┌─ 콘텐츠 작성 (외부) ──────────────────────────────────────────┐
│  Markdown 본문 + 메타 + FAQ + references → posts 테이블 INSERT │
│  (Supabase Studio, 자체 어드민, 또는 외부 CMS 연동)            │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─ 사용자 요청 ──────────────────────────────────────────────────┐
│  /blog/[category]/[slug] 진입                                  │
│   ↓                                                           │
│  Next.js Server Component                                     │
│   ├─ getPostBySlug() — Supabase 조회                          │
│   ├─ generateMetadata() — meta/og/twitter/canonical           │
│   ├─ generateArticleSchema() — JSON-LD                        │
│   ├─ generateBreadcrumbSchema()                               │
│   ├─ counseling_program_id → 프로그램 조회 (CTA 매칭)           │
│   │     없으면 categories.default_program_id 폴백               │
│   ├─ processMarkdown() — Markdown → HTML                      │
│   ├─ extractToc() — 목차 추출                                  │
│   └─ FAQSection — schema_markup의 FAQPage 자동 노출 + Schema  │
│   ↓                                                           │
│  HTML 응답 (ISR 1시간)                                          │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─ ISR 갱신 ────────────────────────────────────────────────────┐
│ revalidate: 3600 (블로그), 86400 (정적)                        │
│ + POST /api/revalidate?path=/blog/[cat]/[slug] (수동)         │
│ + POST /api/indexnow {urls:[...]} (Bing/Yandex 즉시 인덱싱)   │
└────────────────────────────────────────────────────────────┘
```

## 각 레이어의 역할

### Next.js App Router

| 라우트 | 렌더링 | 핵심 기능 |
|-------|------|---------|
| `/sitemap.xml` | runtime | Supabase 쿼리로 모든 발행 글 + 카테고리 + 태그 (>=3개) + 작성자 페이지 자동 포함 |
| `/robots.txt` | runtime | `/api/`, `/actions/` 차단, CCBot/Bytespider 차단 |
| `/blog` | ISR 1시간 | 페이지네이션 + 검색 (search 시 noindex) + 카테고리 필터 + 사이드바 |
| `/blog/[category]` | ISR 1시간 (정적 prerender) | 카테고리별 그리드 + 페이지네이션 + CollectionPage Schema |
| `/blog/[category]/[slug]` | ISR 1시간 | 본문 (Markdown→HTML) + TOC + FAQ Schema + Article Schema + Breadcrumb Schema + InlineCTA + BottomCTA + RelatedPosts |
| `/blog/[category]/[slug]/opengraph-image` | runtime | 한국어 폰트 임베드, 그라데이션 배경, 제목 자동 렌더링 |
| `/blog/tag/[tag]` | ISR 1시간 | 태그 페이지. `posts < 3`이면 robots: index=false |
| `/api/revalidate` | runtime | secret 검증 후 `revalidatePath()` |
| `/api/indexnow` | runtime | GET = 키 평문 응답 (Bing 검증), POST = indexnow.org 포워딩 |

### Supabase

| 테이블 | 핵심 컬럼 | 인덱스 |
|--------|----------|------|
| `posts` | slug(unique), status, category_id, counseling_program_id, schema_markup(JSONB), references(JSONB), keywords(TEXT[]) | slug, (status, published_at), (category_id, published_at), is_featured, updated_at, GIN(keywords), GIN(fulltext) |
| `categories` | slug(unique), target_audience, default_cta_type, default_program_id | slug |
| `tags` | slug(unique) | slug |
| `authors` | slug(unique), credentials(TEXT[]), specialties(TEXT[]), is_active, sort_order | slug, (is_active, sort_order) |
| `counseling_programs` | slug(unique), match_keywords(TEXT[]), is_active, sort_order | slug, (is_active, sort_order) |
| `contact_inquiries` | utm_source/medium/campaign, status | (status, created_at) |
| `newsletter_subscribers` | email(unique), is_active | email WHERE is_active |

**RLS 정책 패턴:**
- 익명: 발행된 글만 SELECT, 카테고리/태그/작성자/활성 프로그램 SELECT, 폼 INSERT 가능
- 인증: 모든 테이블 ALL

### Markdown 처리

```
원본 Markdown
  └─ remarkParse           Markdown AST
  └─ remarkGfm             GFM (테이블, 체크박스, 취소선 등) — singleTilde:false (~취소선 오작동 방지)
  └─ remarkRehype          HTML AST 변환
  └─ rehypeSlug            H2/H3에 자동 ID 부여 (TOC 앵커)
  └─ rehypeResponsiveTable 모든 <table>을 <div class="table-responsive">로 감쌈
  └─ rehypeExternalLinks   http(s)://* 외부 링크에 target=_blank rel=noopener noreferrer 자동 추가
  └─ rehypeStringify       HTML 문자열
```

### SEO Schema 8종

`lib/seo/schema.ts` 가 다음 JSON-LD 스키마를 생성:

1. **BlogPosting** — 개별 포스트 (headline, datePublished, dateModified, author, publisher, image)
2. **FAQPage** — 본문 schema_markup 필드에서 자동 추출 → 페이지에 임베드 + 본문에 시각적 노출
3. **BreadcrumbList** — 홈 > 블로그 > 카테고리 > 글 제목
4. **Organization** — `@id` URL fragment 포함, layout.tsx에서 1회 임베드
5. **LocalBusiness** + **MedicalBusiness** — 지역 사업자 (영업시간, 좌표, 주소)
6. **Person** — 작성자 페이지
7. **WebSite** — SearchAction (검색 박스 SiteLinks)
8. **Course** / **Service** — 교육/서비스 페이지

**비개별 페이지 스키마:**
- 블로그 목록: `Blog` 스키마
- 카테고리/태그 페이지: `CollectionPage` 스키마

### CTA 자동 매칭 (런타임)

```
posts.cta_type ─ 'consultation' | 'education' | 'newsletter'
posts.counseling_program_id ─ FK to counseling_programs (작성 시 또는 어드민에서 채움)

런타임 매칭 (app/blog/[category]/[slug]/page.tsx):
1. posts.counseling_program_id 가 있으면 → 해당 프로그램 조회 (is_cta_enabled)
2. 없으면 categories.default_program_id 폴백
3. 그래도 없으면 cta_type에 따라 일반 CTA 표시
   - 'consultation' → /counseling 목록
   - 'education'    → /programs 목록
   - 'newsletter'   → 사이드바 NewsletterForm
4. InlineCTA / BottomCTA 가 program.cta_heading + cta_button_text 로 렌더
```

## 외부 의존성 매트릭스

| 도구 | 용도 | 필수/선택 | 대체 |
|------|-----|---------|------|
| Supabase | DB / Storage / Auth | 필수 | Postgres + S3 직접 (이식 부담 큼) |
| Vercel | 호스팅 / ISR / OG | 필수 (또는 Next.js 호환 호스팅) | self-hosted Node, Cloudflare Pages |
| GA4 / Meta Pixel | 분석 / 광고 전환 | 선택 | 다른 분석 도구 (lib/analytics/gtag.ts 교체) |

이 패키지는 외부 의존성이 매우 가볍습니다 — Supabase + Vercel만 있으면 동작.

## 배포 후 SEO 체크리스트

- [ ] Google Search Console 등록 + sitemap.xml 제출
- [ ] Naver Search Advisor 등록 + sitemap.xml 제출
- [ ] Bing Webmaster Tools 등록 + IndexNow 키 등록
- [ ] `metadata.verification.other['naver-site-verification']` 값 채우기
- [ ] GA4 Measurement ID, Meta Pixel ID 채우기 (또는 제거)
- [ ] `og-default.png` (1200x630), `apple-touch-icon.png`, `icon.png`, `favicon.ico` 배치
- [ ] `public/[indexnow-key].txt` 파일 생성 (api/indexnow GET 응답과 동일 키)
- [ ] Supabase Storage 버킷 `blog-images` 생성 + public 정책 (썸네일 호스팅용)
- [ ] `.env.local` 환경 변수 채우기 (`docs/ENV_VARIABLES.md` 참조)

전체 검증 항목은 `docs/VERIFICATION_CHECKLIST.md` 참조.
