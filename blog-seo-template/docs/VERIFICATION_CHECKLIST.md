# 이식 검증 체크리스트

새 프로젝트에 `blog-seo-template/`를 적용한 뒤 **이 체크리스트를 위에서 아래로** 검증하세요. 각 항목은 명확한 통과 조건을 가집니다 (눈으로 확인 / 명령 실행 / 자동 검증).

총 7개 섹션 · 약 120개 항목.

---

## A. 디렉토리 구조 (코드 배치)

### A-1. 핵심 디렉토리 존재
- [ ] `app/blog/page.tsx` 존재
- [ ] `app/blog/[category]/page.tsx` 존재
- [ ] `app/blog/[category]/[slug]/page.tsx` 존재
- [ ] `app/blog/[category]/[slug]/opengraph-image.tsx` 존재
- [ ] `app/blog/tag/[tag]/page.tsx` 존재
- [ ] `app/sitemap.ts` 존재
- [ ] `app/robots.ts` 존재
- [ ] `app/api/revalidate/route.ts` 존재
- [ ] `app/api/indexnow/route.ts` 존재

### A-2. lib 모듈
- [ ] `lib/supabase/{client,server,static,queries,types}.ts` 5개 모두 존재
- [ ] `lib/seo/{metadata,schema}.ts` 2개 존재
- [ ] `lib/markdown/{processor,toc}.ts` 2개 존재
- [ ] `lib/utils.ts` 존재 (cn 함수)
- [ ] `lib/analytics/gtag.ts` 존재 (또는 자체 분석으로 대체)

### A-3. 컴포넌트
- [ ] `components/seo/SchemaMarkup.tsx` 존재
- [ ] `components/blog/` 11개 파일 모두 존재 — PostCard, PostContent, SummaryBox, TableOfContents, FAQSection, ReferencesList, RelatedPosts, CategoryFilter, BlogSearch, BlogSidebar, Pagination

### A-4. 타입 / 상수
- [ ] `types/blog.ts` (Post, Category, Tag, Author, Reference)
- [ ] `constants/site.ts` (SITE_CONFIG, REVALIDATION, PAGINATION)
- [ ] `constants/categories.ts` (CATEGORIES 배열)

### A-5. import alias
- [ ] `tsconfig.json` 의 `paths`에 `"@/*": ["./*"]` 또는 `"./src/*"` 정의
- [ ] 컴포넌트의 `@/...` import가 모두 해석됨 (`npx tsc --noEmit` 통과)

### A-6. 빌드 통과
```bash
npm run build
```
- [ ] 0 errors, 0 warnings (next 빌드)
- [ ] `app/blog/[category]` 가 정적 prerender 됨 (`generateStaticParams` 동작)
- [ ] `app/sitemap.ts` 빌드 시 Supabase에 접근 (네트워크 권한 필요)

---

## B. DB 스키마 (Supabase)

### B-1. 테이블 존재
Supabase Dashboard → Table Editor 에서:
- [ ] `categories` 존재 (10개 컬럼 — id, name, slug, description, target_audience, default_cta_type, seo_title, seo_description, sort_order, default_program_id, created_at)
- [ ] `tags` 존재
- [ ] `authors` 존재 (확장 필드 포함 — role, education, career, publications, is_active, sort_order)
- [ ] `posts` 존재 (counseling_program_id FK 포함 — 22개 컬럼)
- [ ] `post_tags` 존재 (PK: post_id + tag_id)
- [ ] `contact_inquiries` 존재
- [ ] `program_registrations` 존재
- [ ] `newsletter_subscribers` 존재 (email UNIQUE)
- [ ] `counseling_programs` 존재 (또는 도메인에 맞는 이름으로 변경됨)

### B-2. 인덱스 존재
SQL Editor에서:
```sql
SELECT indexname FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname;
```
- [ ] `idx_posts_slug`
- [ ] `idx_posts_status_published` (Partial: WHERE status='published')
- [ ] `idx_posts_category`
- [ ] `idx_posts_featured` (Partial: WHERE is_featured=TRUE)
- [ ] `idx_posts_updated`
- [ ] `idx_posts_keywords` (GIN — 키워드 배열 검색용)
- [ ] `idx_posts_fulltext` (GIN — 풀텍스트 검색)
- [ ] `idx_categories_slug`
- [ ] `idx_tags_slug`
- [ ] `idx_authors_slug`
- [ ] `idx_authors_active_sort` (Partial)
- [ ] `idx_counseling_programs_slug`
- [ ] `idx_counseling_programs_active` (Partial)
- [ ] `idx_posts_counseling_program` (Partial: WHERE counseling_program_id IS NOT NULL)
- [ ] `idx_contact_inquiries_status`
- [ ] `idx_newsletter_subscribers_email` (Partial)

### B-3. RLS 정책
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;
```
- [ ] `posts`: "Public can read published posts" (USING `status='published'`)
- [ ] `posts`: "Authenticated can manage posts"
- [ ] `categories` / `tags` / `authors` / `post_tags` / `counseling_programs` 각각 Public read + Authenticated manage
- [ ] `contact_inquiries` / `program_registrations` / `newsletter_subscribers` 각각 Public INSERT + Authenticated SELECT
- [ ] **모든 테이블에 ALTER ... ENABLE ROW LEVEL SECURITY 적용됨** — `pg_class.relrowsecurity = true`

### B-4. 트리거
- [ ] `update_updated_at_column()` 함수 존재
- [ ] `trigger_posts_updated_at` BEFORE UPDATE on posts 존재 — UPDATE 시 `updated_at`가 자동 갱신되는지 직접 INSERT/UPDATE로 확인

### B-5. 카테고리 시드
```sql
SELECT slug, name, target_audience, default_cta_type, sort_order FROM categories ORDER BY sort_order;
```
- [ ] 도메인에 맞는 카테고리 7-10개 시드됨
- [ ] 각 카테고리의 `target_audience` 값이 정의된 set에 들어감 (예: client/professional)
- [ ] `default_cta_type` 값이 정의된 set에 들어감 (예: consultation/education/newsletter)
- [ ] `sort_order` 가 중복 없이 1부터 순차적

### B-6. 카테고리 ↔ 프로그램 폴백 매핑 (002 마이그레이션 사용 시)
```sql
SELECT c.slug AS category, cp.slug AS default_program
FROM categories c LEFT JOIN counseling_programs cp ON c.default_program_id = cp.id;
```
- [ ] 모든 카테고리에 `default_program_id` 가 채워짐 (또는 의도적으로 NULL)

### B-7. 직접 INSERT 테스트
```sql
INSERT INTO posts (title, slug, content, category_id, status)
VALUES ('테스트', 'test-post', '## 테스트\n\n본문', (SELECT id FROM categories LIMIT 1), 'published')
RETURNING id, slug, status, published_at, updated_at;
```
- [ ] INSERT 성공
- [ ] `updated_at` 가 NOW() 와 동일
- [ ] (테스트 후) `DELETE FROM posts WHERE slug='test-post'` 정리

---

## C. SEO 메타 / 메타데이터

### C-1. layout.tsx 메타
브라우저 `view-source:`로 홈 페이지 HTML 확인:
- [ ] `<title>` 가 `${SITE_CONFIG.name}` 형태로 출력됨
- [ ] `<meta name="description" content="...">` 존재
- [ ] `<link rel="canonical" href="...">` 존재 (또는 메타로)
- [ ] `<meta property="og:type" content="website">`
- [ ] `<meta property="og:locale" content="ko_KR">` (또는 도메인 locale)
- [ ] `<meta property="og:image" content="/og-default.png">`
- [ ] `<meta name="twitter:card" content="summary_large_image">`
- [ ] (선택) `<meta name="naver-site-verification" content="...">`

### C-2. 블로그 글 페이지 메타
임의 블로그 글 페이지의 HTML 확인:
- [ ] `<title>` 가 `${글 제목} | ${사이트명}` 형태
- [ ] `<meta property="og:type" content="article">`
- [ ] `<meta property="article:published_time">` 존재 (ISO-8601)
- [ ] `<meta property="article:modified_time">` 존재
- [ ] `<meta property="og:image">` 가 thumbnail_url 또는 /opengraph-image
- [ ] `<link rel="canonical" href="https://.../blog/{cat}/{slug}">` (절대 URL)
- [ ] `<meta name="keywords">` 가 post.keywords 배열로 채워짐

### C-3. 검색 페이지 noindex
- [ ] `/blog?search=test` HTML 의 `<meta name="robots" content="noindex,follow">`

### C-4. Thin tag 페이지 noindex
- [ ] 글이 3개 미만인 태그 페이지(`/blog/tag/<태그>`) HTML 의 `<meta name="robots" content="noindex,follow">`

### C-5. metadataBase
- [ ] `layout.tsx` 의 `metadata.metadataBase` 가 `process.env.NEXT_PUBLIC_SITE_URL` 사용
- [ ] og:image 가 절대 URL로 출력됨 (개발 환경에서도 확인)

---

## D. 구조화 데이터 (JSON-LD)

### D-1. 전역 스키마 (layout.tsx)
모든 페이지의 HTML에서:
- [ ] `<script type="application/ld+json">` 가 최소 2개 — Organization + WebSite
- [ ] Organization 의 `@id` 가 `${SITE_URL}/#organization`
- [ ] WebSite 의 `potentialAction.target.urlTemplate` 가 검색 박스 URL 패턴

### D-2. 블로그 글 페이지 스키마
- [ ] BlogPosting Schema 존재 — headline, datePublished, dateModified, author, publisher, image, mainEntityOfPage
- [ ] BreadcrumbList Schema 존재 — 홈 → 블로그 → 카테고리 → 글 제목 4단계
- [ ] FAQ가 있는 글에서 FAQPage Schema 자동 생성 (mainEntity 배열에 Question/Answer)

### D-3. Google Rich Results Test
https://search.google.com/test/rich-results
- [ ] 임의 블로그 글 URL 입력 시 "Article" + "FAQPage" + "Breadcrumb" 인식
- [ ] 0 errors, 0 warnings

### D-4. Schema.org Validator
https://validator.schema.org/
- [ ] BlogPosting / Organization / WebSite 모두 valid

### D-5. 사용자/팀 페이지 (해당 시)
- [ ] `/team/[slug]` 페이지에 Person Schema (jobTitle, knowsAbout, affiliation)
- [ ] LocalBusiness 페이지(`/about` 또는 홈)에 영업시간 + 좌표 + 주소

---

## E. 사이트맵 / robots.txt / IndexNow

### E-1. sitemap.xml
```bash
curl https://your-domain.com/sitemap.xml
```
- [ ] HTTP 200, `Content-Type: application/xml`
- [ ] `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` 루트
- [ ] 정적 페이지 포함 (홈, /blog, /about, /contact 등)
- [ ] 발행된 모든 `posts.slug` 가 `/blog/[category]/[slug]` 형태로 포함
- [ ] 카테고리 목록 페이지(`/blog/[category]`) 포함
- [ ] 글 ≥3개 태그만 포함 (thin content 회피)
- [ ] 작성자 페이지(`/team/[slug]`) 포함 (해당 시)
- [ ] 모든 `<lastmod>` 가 ISO-8601 형식
- [ ] noindex 페이지(`/programs/[slug]` 등) 미포함 (의도된 경우)

### E-2. robots.txt
```bash
curl https://your-domain.com/robots.txt
```
- [ ] `User-agent: *` + `Allow: /` + `Disallow: /api/` + `Disallow: /actions/`
- [ ] AI 크롤러 차단 (정책에 맞는 경우): `User-agent: CCBot`, `User-agent: Bytespider` Disallow
- [ ] `Sitemap: https://your-domain.com/sitemap.xml` 명시

### E-3. IndexNow
```bash
curl https://your-domain.com/api/indexnow
# → 평문 키 응답
```
- [ ] GET 응답이 `INDEXNOW_KEY` 환경변수와 동일
- [ ] `public/${INDEXNOW_KEY}.txt` 정적 파일도 동일 키 응답 (Bing 검증용 필수)

```bash
curl -X POST https://your-domain.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://your-domain.com/blog/test/test"]}'
```
- [ ] HTTP 200, `{success: true, status: 200}` 응답
- [ ] (Bing Webmaster Tools에서 IndexNow 제출 이력 확인 가능)

### E-4. ISR 수동 갱신
```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"<REVALIDATION_SECRET>","path":"/blog/<cat>/<slug>"}'
```
- [ ] HTTP 200, `{revalidated: true, path: ...}` 응답
- [ ] secret 미일치 시 401 반환

### E-5. Search Console / Naver Search Advisor 등록
- [ ] Google Search Console — 사이트 등록 + sitemap 제출
- [ ] Naver Search Advisor — 사이트 등록 + sitemap 제출
- [ ] Bing Webmaster Tools — 사이트 등록 + IndexNow 키 등록
- [ ] (해당 시) Daum 검색등록

---

## F. 콘텐츠 렌더링

### F-1. 블로그 목록 (`/blog`)
- [ ] 발행된 글 12개씩 페이지네이션
- [ ] 카테고리 필터 탭 노출
- [ ] 검색 박스 동작 (`?search=...`)
- [ ] 검색 시 noindex 적용
- [ ] 사이드바: 인기글 5개 + 카테고리 + 뉴스레터 폼
- [ ] 각 PostCard: 카테고리 뱃지 + 썸네일 + 제목 + 발췌 + 작성자 + 날짜 (KST) + 읽기 시간

### F-2. 카테고리 페이지 (`/blog/[category]`)
- [ ] 잘못된 슬러그는 404
- [ ] 활성 카테고리 탭 강조
- [ ] 페이지네이션 동작 (`?page=2`)

### F-3. 태그 페이지 (`/blog/tag/[tag]`)
- [ ] 잘못된 태그는 404 또는 빈 결과
- [ ] 글 < 3개일 때 noindex
- [ ] 태그명이 한글일 때 URL 인코딩 정상

### F-4. 개별 포스트 (`/blog/[category]/[slug]`)
- [ ] 잘못된 슬러그는 404
- [ ] Breadcrumb (홈 → 블로그 → 카테고리 → 글)
- [ ] 카테고리 뱃지
- [ ] H1 = post.title
- [ ] 작성자 + 발행일 (Asia/Seoul) + 읽기 시간
- [ ] 썸네일 이미지 — `priority` + `fetchPriority="high"` (LCP 최적화)
- [ ] SummaryBox — `posts.summary` 가 있으면 노출
- [ ] PostContent — Markdown → HTML 정상 렌더 (테이블 반응형 wrapper, 외부 링크 보안 속성)
- [ ] InlineCTA — 본문 중간 (program 또는 ctaType에 맞춰)
- [ ] BottomCTA — 글 하단
- [ ] FAQSection — `schema_markup` 에 FAQPage 있으면 자동 노출 + Schema 임베드
- [ ] ReferencesList — `references` 배열을 번호 매긴 리스트로
- [ ] RelatedPosts — 같은 카테고리 다른 글 3개

### F-5. 목차 (TOC) 동작
- [ ] 데스크톱(≥1024px): 우측 sticky, 부모 컨테이너 끝에서 absolute로 고정
- [ ] 모바일: 접힘/펼침 accordion
- [ ] 스크롤 시 활성 헤딩 강조 (Intersection Observer)
- [ ] H2/H3에 자동 ID 부여되어 앵커 클릭 시 정확히 점프

### F-6. 다이나믹 OG 이미지
- [ ] `/blog/[category]/[slug]/opengraph-image` 직접 접근 시 1200x630 PNG 반환
- [ ] 한국어 제목이 정상 렌더 (Pretendard 폰트 또는 프로젝트 폰트)
- [ ] 폰트 로드 실패 시 기본 폰트로 폴백 (오류 없이)
- [ ] og:image 메타에 자동 등록 (Next.js 자동)

### F-7. CTA 매칭 (런타임)
새 글에 `counseling_program_id`를 직접 INSERT 한 뒤 페이지 진입:
- [ ] 매칭된 프로그램의 `cta_heading` + `cta_button_text`가 InlineCTA / BottomCTA에 표시
- [ ] `counseling_program_id`가 NULL인 글에서 카테고리의 `default_program_id`로 폴백
- [ ] 그래도 없으면 cta_type 기반 일반 링크(/counseling 또는 /programs)로 표시

---

## G. 성능 / 보안 / 접근성

### G-1. Core Web Vitals (PageSpeed Insights)
https://pagespeed.web.dev/
- [ ] LCP < 2.5s (모바일/데스크톱)
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] 블로그 글 페이지 모바일 점수 ≥85

### G-2. 이미지 최적화
- [ ] PostCard / 본문 이미지가 `next/image` `<Image>` 컴포넌트로 렌더 (WebP/AVIF 변환)
- [ ] 모든 이미지에 `alt` 속성 (장식용은 빈 문자열)
- [ ] LCP 이미지(글 썸네일)에 `priority` + `fetchPriority="high"`
- [ ] 카드 이미지에 `sizes` 속성 명시 (반응형 srcset)

### G-3. 폰트 최적화
- [ ] `next/font/local` 또는 `next/font/google` 사용 (자동 self-host)
- [ ] `display: 'swap'` 명시 (CLS 방지)
- [ ] `--font-*` CSS 변수로 노출

### G-4. 분석 스크립트 전략
- [ ] GA4 / Meta Pixel 스크립트가 `strategy="lazyOnload"` (FID/INP 보호)
- [ ] 환경변수 미설정 시 스크립트 미주입

### G-5. 보안 헤더
- [ ] HTTPS 강제 (Vercel 자동) — `http://` 접근 시 https로 리다이렉트
- [ ] 외부 링크 모두 `rel="noopener noreferrer"` (rehypeExternalLinks 자동)
- [ ] 폼 제출 시 RLS 정책으로 INSERT만 허용 (SELECT 차단 — 다른 유저 데이터 노출 방지)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 가 클라이언트 번들에 포함되지 않음 (Network 탭에서 검색)

### G-6. 접근성
- [ ] HTML lang 속성 명시 (`<html lang="ko">`)
- [ ] Skip to main content 링크 존재 (`#main-content`)
- [ ] `<main id="main-content">` 존재
- [ ] 헤딩 계층 정상 (H1 1개 → H2 → H3 순서, 점프 없음)
- [ ] 폼 라벨 + aria-label
- [ ] 페이지네이션 `aria-current="page"`, `aria-label="이전/다음 페이지"`
- [ ] TOC `aria-label="목차"`, accordion `aria-expanded` / `aria-controls`

### G-7. 빌드 / 번들 분석
```bash
ANALYZE=true npm run build
```
- [ ] 블로그 글 페이지 First Load JS < 200KB (목표)
- [ ] markdown 처리(remark/rehype)가 클라이언트 번들에 포함되지 않음 — Server Component 검증
- [ ] Supabase 클라이언트가 클라이언트 번들에 포함된 경우 ANON_KEY만 사용 (SERVICE_ROLE_KEY 절대 X)

---

## 검증 자동화 헬퍼

다음 명령으로 일부 항목을 자동으로 검증:

```bash
# A-6. 빌드
npm run build

# B-1, B-2. 스키마/인덱스
psql "$SUPABASE_DB_URL" -c "\\dt"
psql "$SUPABASE_DB_URL" -c "\\d posts"

# E-1. sitemap
curl -fsSL https://your-domain.com/sitemap.xml | xmllint --format - | head -40

# E-2. robots
curl -fsSL https://your-domain.com/robots.txt

# C, D. 메타 + Schema
curl -fsSL https://your-domain.com/blog/<cat>/<slug> | grep -E '<meta|<title|application/ld\+json' | head -30

# F-6. OG image
curl -fsSL https://your-domain.com/blog/<cat>/<slug>/opengraph-image -o /tmp/og.png && file /tmp/og.png
# → "PNG image data, 1200 x 630"

# E-4. ISR 수동 갱신
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"...","path":"/blog/<cat>/<slug>"}'
```

---

## 검증 결과 기록 양식

매 이식마다 이 표를 채워 검증 이력으로 보관하세요:

| 섹션 | 통과 항목 / 전체 | 비고 |
|------|---------------|------|
| A. 디렉토리 구조 | __ / 18 | |
| B. DB 스키마 | __ / 24 | |
| C. SEO 메타 | __ / 16 | |
| D. JSON-LD | __ / 9 | |
| E. 사이트맵 / robots / IndexNow | __ / 16 | |
| F. 콘텐츠 렌더링 | __ / 28 | |
| G. 성능 / 보안 / 접근성 | __ / 22 | |
| **합계** | **__ / 133** | |

목표:
- **MVP 출시 가능:** A + B + C + D + E + F (111개) ≥95% 통과
- **Production-ready:** + G (22개) ≥85%
