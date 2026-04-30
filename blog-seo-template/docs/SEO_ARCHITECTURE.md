# SEO Architecture Guide

이 시스템은 **검색엔진 → 블로그 → 전환** 퍼널을 위해 설계되었습니다. 각 SEO 레이어의 코드 위치와 동작 방식을 정리합니다.

## 1. 메타데이터 — `lib/seo/metadata.ts`

Next.js의 `generateMetadata()` 헬퍼 2종:

| 헬퍼 | 용도 | 출력 |
|-----|-----|-----|
| `generatePostMetadata(post)` | 개별 블로그 포스트 | title, description, keywords, canonical, og:article, twitter:summary_large_image |
| `generatePageMetadata({title,description,path,image?})` | 일반 페이지 (홈, 카테고리, 정적 페이지) | title, description, canonical, og:website |

**핵심 규칙**
- `meta_title` 30-60자 (한국어), `meta_description` 120-155자
- `canonical`은 항상 `${SITE_URL}${path}` 절대 URL
- og:article의 `publishedTime`/`modifiedTime`는 ISO-8601
- og:image는 1200x630 (있으면 명시, 없으면 OG 동적 생성으로 폴백)

**페이지별 적용**

```ts
// app/blog/[category]/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  return generatePostMetadata({
    title: post.title, meta_title: post.meta_title, ...
  });
}
```

**검색에서 제외할 페이지** — 검색 결과 페이지나 thin content 태그는 `robots: { index: false, follow: true }`로 처리. 인덱싱은 막되 링크는 따라가게 합니다 (예: `/blog?search=*`, `/blog/tag/X` (글 < 3개)).

## 2. 구조화 데이터 (JSON-LD) — `lib/seo/schema.ts`

8개 스키마 생성 함수:

| 함수 | 스키마 타입 | 위치 |
|-----|-----------|------|
| `generateArticleSchema(post)` | BlogPosting | 개별 포스트 페이지 |
| `generateFAQSchema(faqs)` | FAQPage | FAQSection 컴포넌트 안 |
| `generateBreadcrumbSchema(items)` | BreadcrumbList | 모든 깊은 페이지 |
| `generateOrganizationSchema()` | Organization | layout.tsx (전역) |
| `generateLocalBusinessSchema()` | LocalBusiness + MedicalBusiness | 홈/about (지역 사업자) |
| `generatePersonSchema(person)` | Person | /team/[slug] |
| `generateWebSiteSchema()` | WebSite + SearchAction | layout.tsx (전역, SiteLinks 검색박스용) |
| `generateCourseSchema(course)` | Course + CourseInstance | /programs/[slug] (교육 도메인) |
| `generateServiceSchema(service)` | Service | /counseling/[slug] (서비스 도메인) |

**임베드 방법** — `components/seo/SchemaMarkup.tsx`:

```tsx
<SchemaMarkup schema={[articleSchema, breadcrumbSchema]} />
// 또는
<SchemaMarkup schema={singleSchema} />
```

배열로 전달하면 `<script type="application/ld+json">`이 여러 개 생성됩니다 (구글 권장).

**FAQ Schema 자동 추출** — `components/blog/FAQSection.tsx`가 `posts.schema_markup` JSONB 필드에서 FAQPage 타입을 자동 인식하여 본문 시각적 노출 + Schema 동시 임베드.

## 3. 사이트맵 — `app/sitemap.ts`

Supabase 데이터로 동적 생성:

```
정적 페이지 (priority 1.0~0.3, changeFrequency 명시)
  ├── 홈, /blog, /about, /contact, ...
  
+ 동적 페이지 (Supabase 쿼리)
  ├── /blog/[category]/[slug]      모든 발행 글 (priority 0.7)
  ├── /blog/[category]              모든 카테고리
  ├── /blog/tag/[tag]               글 ≥3개인 태그만 (thin content 회피)
  └── /team/[slug]                  모든 작성자
```

**핵심 규칙**
- `lastModified`는 `posts.updated_at` 사용 (구글이 fresh content 신호로 판단)
- 태그 페이지는 `post_tags` join 후 `>= 3` 필터 (thin content 인덱싱 막기)
- noindex 페이지(검색 결과, /api/, 작업 중 페이지)는 sitemap에서 제외

**제출 위치**
- Google Search Console — `${SITE_URL}/sitemap.xml`
- Naver Search Advisor — 동일
- Bing Webmaster Tools — 동일

## 4. robots.txt — `app/robots.ts`

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /actions/

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

CCBot(Common Crawl), Bytespider(ByteDance) 차단 — AI 크롤러 학습 데이터 거부 (브랜드 정책에 따라 조정).

## 5. IndexNow — `app/api/indexnow/route.ts`

Bing/Yandex가 지원하는 즉시 인덱싱 프로토콜.

```
GET  /api/indexnow         → INDEXNOW_KEY 평문 반환 (소유권 인증)
POST /api/indexnow         → {"urls":[...]} 받아서 indexnow.org에 forwarding
```

**설정 절차**
1. `.env`에 `INDEXNOW_KEY` 환경변수 정의 (32자 이상 랜덤)
2. `public/${INDEXNOW_KEY}.txt` 파일 생성, 내용은 키 평문 (또는 GET /api/indexnow가 응답하므로 별도 파일 불필요)
3. 글 발행 직후 `POST /api/indexnow` 호출:
   ```ts
   await fetch(`${SITE_URL}/api/indexnow`, {
     method: 'POST',
     body: JSON.stringify({ urls: [`${SITE_URL}/blog/${cat}/${slug}`] }),
   });
   ```

## 6. ISR (Incremental Static Regeneration)

| 페이지 | revalidate (초) | 의미 |
|-------|---------------|------|
| `/blog` | 3600 (1시간) | 새 글이 1시간 내 노출 |
| `/blog/[category]` | 3600 | 카테고리 페이지 동일 |
| `/blog/[category]/[slug]` | 3600 | 본문 수정 1시간 내 반영 |
| 정적 페이지 | 86400 (24시간) | 거의 변하지 않음 |
| sitemap.ts | 자동 (Vercel) | 빌드 시점 + ISR |

**수동 갱신** — 글 발행 직후 `POST /api/revalidate`:
```ts
await fetch(`${SITE_URL}/api/revalidate`, {
  method: 'POST',
  body: JSON.stringify({ secret: process.env.REVALIDATION_SECRET, path: '/blog/mental-health' }),
});
```

## 7. 동적 OG 이미지 — `opengraph-image.tsx`

`next/og`의 ImageResponse로 1200x630 PNG 동적 생성:
- Pretendard Bold 폰트 임베드 (한국어 정확 렌더)
- 그라데이션 배경 + 제목 자동 줄바꿈
- 폰트 로드 실패 시 기본 폰트 폴백

소셜 공유(Facebook, X/Twitter, 카톡) 시 자동 노출. og:image 메타에 별도 URL을 넣지 않아도 Next.js가 자동으로 `[slug]/opengraph-image.png`를 등록.

## 8. 성능 (Core Web Vitals)

| 메트릭 | 목표 | 어디서 보장 |
|-------|-----|------------|
| LCP < 2.5s | 첫 화면 이미지 priority + fetchPriority="high" | `app/blog/[category]/[slug]/page.tsx` `<Image priority fetchPriority="high"/>` |
| INP < 200ms | TableOfContents의 sticky scroll listener는 passive | `components/blog/TableOfContents.tsx` |
| CLS < 0.1 | 모든 이미지 width/height 명시, 폰트 swap | layout.tsx의 `display: 'swap'` |

**스크립트 전략** — GA4/Pixel은 `strategy="lazyOnload"` (FID/INP 보호)
**이미지 최적화** — `next/image`가 자동 WebP/AVIF 변환 + 반응형 srcset 처리 (썸네일 업로드 시 1200px WebP로 사전 압축 권장)

## 9. 본문 마크다운 SEO

`lib/markdown/processor.ts` 의 unified 파이프라인:

```
remarkParse           Markdown AST
  └─ remarkGfm        테이블, 체크박스, 취소선 (singleTilde:false ← ~ 단일 취소선 오작동 방지)
  └─ remarkRehype     HTML AST (allowDangerousHtml: true)
  └─ rehypeSlug       H2/H3 자동 ID 생성 (TOC 앵커, headline-anchor SEO)
  └─ rehypeResponsiveTable   <table> → <div class="table-responsive"><table></div>
  └─ rehypeExternalLinks     http(s)://* 자동 target=_blank rel=noopener noreferrer
  └─ rehypeStringify  HTML 문자열
```

**커스텀 플러그인 2개**
- `rehypeResponsiveTable` — 모바일 테이블 가로 스크롤 보장
- `rehypeExternalLinks` — 모든 외부 링크에 보안 속성 자동 부여 (XSS 방지)

## 10. 한국어 SEO 기준

`context/seo-guidelines.md` 참조. 핵심 수치:

| 항목 | 권장 |
|-----|-----|
| 본문 길이 | 2,000-5,000자 (마크다운 제거 후) |
| H2 개수 | 5-8개 (글 길이 비례) |
| 키워드 밀도 | 0.5-3.0% |
| 첫 문단 | 100자 내 핵심 키워드 |
| meta_title | 30-60자 |
| meta_description | 120-155자 |
| FAQ | 4-6개 |
| 참고 자료 | 1-5개 (학술/정부/전문기관) |
| 내부 링크 | 2-4개 (같은 카테고리 + 상품 페이지) |
| 외부 링크 | 1-3개 (신뢰 출처) |
| URL 슬러그 | 3-5단어, 영문 소문자, 하이픈 |

## 11. SEO 체크리스트 (글 발행 전)

콘텐츠 작성/발행 도구에서 다음을 검증한 뒤 INSERT 하세요.

기술적
- [ ] meta_title 30-60자 + 키워드 앞쪽 30자 내
- [ ] meta_description 120-155자 + 행동 유도 문구
- [ ] H1 1개, H2 5-8개, 최소 2개 H2에 키워드
- [ ] 첫 문단 100자 내 키워드
- [ ] 이미지 alt 작성
- [ ] 내부 링크 2-4개 (관련 글 + InlineCTA)
- [ ] 외부 링크 1-3개 (학술/정부)
- [ ] 슬러그 3-5단어
- [ ] URL canonical 자동 설정 (page.tsx의 generateMetadata가 처리)

구조화 데이터 (이 템플릿이 자동 처리)
- [ ] BlogPosting Schema 자동
- [ ] FAQ Schema (`schema_markup` JSONB 필드에 FAQPage 객체 INSERT 시 자동)
- [ ] BreadcrumbList Schema 자동

콘텐츠 품질
- [ ] 본문 2,000자 이상
- [ ] 브랜드 voice 준수 (`context/brand-voice.md`)
- [ ] YMYL 안전 규칙 (해당 시)
- [ ] references 배열 채움
