# 마음토스 블로그 마이그레이션 계획 (Webflow → Supabase)

> 작성일: 2026-05-06
> 단일 진실 원본. 마이그레이션 전 / 중 / 후 모든 의사결정의 기준.

---

## 0. 한 줄 요약

Baserow 'Mindthos Blog' (table `763048`, 820 row) 의 발행 글 전체를
Supabase `posts` 스키마로 옮기되, **slug · 본문 · 메타 · 발행일 · 썸네일**을 1:1 보존하고
Webflow 사이트와 정확히 동일한 URL/메타로 응답해 SEO 손실을 0 에 수렴시킨다.

---

## 1. 확정된 의사결정 (사용자 입력 + 본 문서 합의)

| 항목 | 결정 | 비고 |
| --- | --- | --- |
| 본문 형식 | **HTML → Markdown 결정론 변환** | `body-result-first` 단일 컬럼이 원문. §2 참조 |
| 본문 변환 도구 | turndown + GFM(table) + 커스텀 룰 | Claude CLI 는 본문에 직접 손대지 않음 |
| Claude CLI 활용 | **메타데이터 보강 게이트**로 한정 | excerpt / summary / keywords / FAQ schema 만 |
| 카테고리 | Baserow 의 `Category` 컬럼 그대로 적용 | 현재 4종(general-blog 등) **폐기** 후 재시드 |
| 썸네일 | 사용자가 Supabase Storage 에 **파일명 유지**해 직접 업로드 | 스크립트는 URL 매칭만 |
| 필터 | **없음 — 발행된 모든 글** | 별도 완료 플래그 검증 안 함 |
| 저자 | 모두 `마음토스` 단일 author | `authors.slug = 'mindthos'` |
| 발행일 | **Webflow CMS 의 published date** | Baserow 의 `Last Modified Time` 아님 |

---

## 2. 본문 변환 — 왜 결정론인가, Claude CLI 는 어디 쓰나

### 2.1 판단 결과

**본문은 결정론 변환만, Claude CLI 는 본문 외 메타데이터 보강에만.**

### 2.2 근거

| 차원 | 결정론 (turndown 등) | Claude CLI 본문 변환 |
| --- | --- | --- |
| 재현성 | 동일 입력 → 동일 출력 (멱등) | 호출마다 미세 차이 — **SEO 치명** |
| 본문 충실도 | 원문 토큰 보존 | rewording / 의역 위험 |
| 비용 | 0 | 820 글 × 큰 입력/출력 |
| 시간 | 분 단위 | 시간 단위 (30~60s × 820) |
| 검증 | diff 가능 | diff 불가 |
| 롤백 | 재실행 시 동일 | 재실행 시 다른 결과 |

검색엔진은 **현재 ranking 중인 정확한 토큰열**을 본다.
의역 한 번이 키워드 매칭 / 위치 / 길이를 흔들면 순위 회귀의 원인이 된다.
따라서 본문 텍스트는 한 글자도 바꾸지 않는 결정론 파이프라인이 정답.

### 2.3 그러면 Claude CLI 는 어디서 가치를 만드나

**본문에 손대지 않고도 가치가 있는 작업 4가지** — Claude CLI skill 로 묶는다.

1. **excerpt 생성/검증** — Baserow `short-discription` 이 비어있거나 155 자 초과 시 본문 첫 단락 기반 압축
2. **summary 생성** — `SummaryBox` 박스용 200~400 자 (현재 페이지 컴포넌트 의존)
3. **keywords 추출** — `keyword` 컬럼이 단일 문자열인데 `posts.keywords TEXT[]` 로 분할 + 본문에서 추가 3~5개 추출
4. **FAQ → JSON-LD `FAQPage` 자동 생성** — 본문에 Q/A 형태가 있으면 `posts.schema_markup` 으로 구조화

이 4가지는 **본문 텍스트를 바꾸지 않고**, 누락된 메타만 채운다. 따라서 비결정성이 SEO 본문 ranking 에 영향을 주지 않는다.

### 2.4 Claude CLI Skill 설계

```
.claude/skills/blog-enrich/
├── SKILL.md                # 메타·트리거
└── prompts/
    ├── excerpt.md          # 본문 → 155자 excerpt
    ├── summary.md          # 본문 → 200~400자 SummaryBox
    ├── keywords.md         # 본문 → keywords[] 5~8개
    └── faq.md              # 본문 → FAQPage JSON-LD (없으면 null)
```

Skill 호출 인터페이스 (스크립트에서):

```bash
# Node.js 스크립트가 각 글마다 호출
claude -p "$(cat prompts/excerpt.md)\n\n---\n\n$BODY_MD" \
  --output-format json --max-turns 1 > /tmp/excerpt.json
```

**핵심 가드레일** — 모든 prompt 끝에 다음을 반드시 포함:

> 본문 어떤 텍스트도 수정하지 않는다. 입력 본문에서 단어를 새로 만들지 않는다.
> 응답은 JSON 한 객체만, 없으면 `{ "value": null }`.

### 2.5 Claude CLI 를 안 쓰는 케이스

- 카테고리 매핑: 결정론 mapping 테이블 (§4.1)
- references 변환: outlink-N + outlink-N-title → 결정론 reshape
- 슬러그 정규화: 결정론 (소문자 / 하이픈 / 영문)

---

## 3. 데이터 매핑 (Baserow → Supabase `posts`)

| Supabase 컬럼 | 출처 | 변환 규칙 |
| --- | --- | --- |
| `id` | (생성) | uuid_generate_v4() |
| `title` | Baserow `Name` | trim |
| `slug` | Baserow `slug` | 소문자, 공백 → `-`, 영문/숫자/하이픈만 |
| `excerpt` | Baserow `short-discription` | 비었거나 >155자면 Claude `excerpt.md` 게이트 |
| `content` | Baserow `body-result-first` | HTML → Markdown (turndown + GFM) |
| `summary` | (Claude `summary.md`) | 200~400자, 실패 시 NULL |
| `keywords` | Baserow `keyword` | split(`,`) trim → `text[]` + Claude 보강 |
| `category_id` | Baserow `Category` | §4.1 mapping → categories.id |
| `thumbnail_url` | Baserow `thumbnail` | §6 매칭 룰 |
| `author_id` | (고정) `mindthos` | §4.2 |
| `status` | (고정) `'published'` | 마이그레이션 대상은 모두 발행 |
| `meta_title` | Baserow `Name` (≤60자면 그대로) | 60자 초과 시 truncate(...60) |
| `meta_description` | Baserow `short-discription` | 동일하게 truncate(...155) |
| `og_image_url` | Baserow `thumbnail` 동일 | 별도 OG 미보유 시 thumbnail 폴백 |
| `schema_markup` | (Claude `faq.md`) | FAQ 추출 결과 또는 NULL |
| `references` | Baserow `outlink-1/2/3` + `outlink-N-title` | `[{name,url,type}]` JSON, type 휴리스틱 §4.3 |
| `cta_type` | (카테고리 default) | categories.default_cta_type |
| `reading_time` | content 길이 / 500 | round up |
| `view_count` | 0 | |
| `is_featured` | false | |
| `published_at` | **Webflow CMS publish date** | §5 |
| `created_at` | published_at 동일 | 정렬 안정성 |
| `updated_at` | Baserow `Last Modified Time` | |
| `counseling_program_id` | (NULL) | 카테고리 default_program_id 가 폴백 |

본문 어셈블 룰:
- `body-result-first` 만 사용 (단일 컬럼)
- `body-1`...`body-5` / `content-N-chart` / `content-N-img` 무시 (이미 `body-result-first` 가 최종 어셈블 결과)
- HTML → Markdown 변환 시:
  - `<h2>` → `##`
  - `<figure><table>...</table></figure>` → GFM 표
  - `<img>` → `![alt](src)` 단, src 도 §6 매칭 룰로 Supabase Storage URL 변환
  - `<b>` → `**`
  - `<a href>` → `[text](url)` (외부 링크는 본문 안에서 그대로)

---

## 4. 스키마 변경 사항

### 4.1 `categories` 재시드 — `003_replace_categories_with_webflow.sql`

기존 4종(`general-blog`/`tech-blog`/`guides`/`case-studies`)은 **사용자가 설정하지 않은 임시값**.
Baserow 의 실제 카테고리 분포를 뽑아 Webflow 운영 기준에 맞게 재시드한다.

선행 작업 (Phase 0):

```bash
# Baserow JSON 캐시에서 카테고리 distinct + 빈도 집계
jq -r '.results[] | .Category' .data/baserow-all.json | sort | uniq -c | sort -rn
```

추정 카테고리 (확정은 §6 Phase 0):
- 임상/실무 인사이트
- 커리어
- 슈퍼비전
- 보안 / AI 기술
- 도입 사례
- ...

확정 후 마이그레이션:

```sql
-- 003_replace_categories_with_webflow.sql
DELETE FROM categories;  -- 시드만 들어있어 안전. 본 마이그레이션은 마이그레이션 1번 전에 실행 금지
INSERT INTO categories (name, slug, description, target_audience, default_cta_type, sort_order)
VALUES
  ('커리어', 'career', '...', 'counselor', 'free-trial', 1),
  /* 분포 분석 후 채움 */
  ;
```

`slug` 는 한글 카테고리명을 영문으로 명명 (Webflow 기존 path 와 일치하는지 확인).

### 4.2 `authors` 단일 시드

```sql
INSERT INTO authors (name, slug, title, bio, role, is_active, sort_order)
VALUES (
  '마음토스',
  'mindthos',
  '상담사를 위한 안전한 AI 파트너',
  '마음토스 팀이 직접 작성·감수합니다.',
  'team',
  TRUE,
  1
)
ON CONFLICT (slug) DO NOTHING;
```

### 4.3 references 변환 룰

```ts
function inferType(url: string): 'academic' | 'government' | 'industry' {
  if (/\.go\.kr|\.gov\b/.test(url)) return 'government';
  if (/scholar|pubmed|doi\.org|riss|kci/.test(url)) return 'academic';
  return 'industry';
}
```

`outlink-N` 비어있으면 skip. 모두 비면 `references = []`.

---

## 5. Webflow CMS 발행일 가져오기

### 5.1 필요한 정보 (사용자가 제공해야 함)

- Webflow Site ID — `mcp__webflow__data_sites_tool > list_sites` 로 조회 가능
- Blog Collection ID — site 의 Collections 목록에서 식별
- 또는 Webflow API token (REST 직접 호출)

### 5.2 매칭

Baserow row 의 `slug` 와 Webflow CMS item 의 `slug` 가 동일 (Baserow → Webflow 동기화 구조).
Webflow item 의 `lastPublished` (또는 `createdOn`) 를 `posts.published_at` 으로 사용.

```ts
// 의사 코드
for (const baserowRow of baserowRows) {
  const wfItem = webflowItems.find((i) => i.fieldData.slug === baserowRow.slug);
  if (!wfItem) {
    log.warn(`No Webflow match: ${baserowRow.slug}`);
    continue;
  }
  post.published_at = wfItem.lastPublished ?? wfItem.createdOn;
}
```

매칭 실패 row 는 별도 리스트로 저장하고 사용자 검토 후 수동 처리 — 자동 fallback 금지.

---

## 6. 썸네일 매칭 룰 (사용자가 직접 업로드)

### 6.1 사용자 작업

Baserow `thumbnail` 컬럼에 저장된 경로 (`blog/<uuid>.webp`) 를
**파일명 그대로** Supabase Storage `blog-images` 버킷에 업로드.

권장 디렉토리: `blog-images/blog/<uuid>.webp` — Baserow 경로의 `blog/` 접두어 유지.
이러면 `posts.thumbnail_url` 이 단순한 URL prefix 부착으로 끝남.

### 6.2 스크립트 변환

```ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/blog-images`;

post.thumbnail_url = baserow.thumbnail
  ? `${PUBLIC_PREFIX}/${baserow.thumbnail}` // e.g. /blog/<uuid>.webp
  : null;
```

### 6.3 검증

업로드 누락 검증을 위해 Phase 6 에서 모든 `thumbnail_url` 에 HEAD 요청 → 200 인지 확인.
404 시 마이그레이션 차단 (사용자에게 누락 파일 리스트 출력).

### 6.4 본문 안 이미지 (`<img src="blog/...">`) 도 동일 룰

본문 HTML → Markdown 변환 단계에서 `src` 가 `blog/` 로 시작하면 `${PUBLIC_PREFIX}/<src>` 로 prefix 부착.

---

## 7. SEO 1:1 보존 체크리스트 ★

> 본 절은 **마이그레이션의 핵심**. 스크립트가 끝나도 이 체크리스트를 통과하지 못하면 운영 전환 금지.

### 7.1 URL 정합성

| 항목 | Webflow 현황 | 새 사이트 | 처리 |
| --- | --- | --- | --- |
| 경로 구조 | `/blog/<slug>` | `/blog/<slug>` | OK — 동일 |
| trailing slash | `/blog/post` (slash 없음) | next.config.ts 기본 (slash 없음) | **검증 필요** |
| 대소문자 | 모두 소문자 | next 기본 case-sensitive | slug 정규화 강제 |
| 쿼리/fragment | 검색엔진 별도 URL | — | 영향 없음 |

**자동 검증 스크립트** (`scripts/migrate-blog/scripts/verify-urls.ts`):

```ts
// 1. Webflow sitemap.xml 다운로드
// 2. 모든 URL 추출 (정규식 또는 fast-xml-parser)
// 3. 각 URL 을 새 사이트 (스테이징) 에 GET → 200 확인
// 4. 200 아닌 URL 리스트 출력
```

**trailing slash 결정** — Webflow 가 slash 없이 운영 중이면 `next.config.ts` 에 명시적으로:
```ts
const nextConfig: NextConfig = { trailingSlash: false, /* ... */ };
```
그리고 `redirects()` 에 `/blog/:slug/` → `/blog/:slug` 301 추가.

**카테고리 페이지 URL** — 현재 `/blog?category=<slug>` 쿼리 기반. Webflow 도 동일 패턴인지 확인 필요. 다르면 redirect 추가.

### 7.2 메타데이터 1:1 복제

각 글이 다음을 모두 갖춰야 한다 (현재 코드가 이미 처리하지만 마이그레이션 시 **데이터에 값이 들어있는지** 검증).

- [x] `<title>` — `generateMetadata()` 에서 `meta_title || title` 사용 중
- [x] `meta description` — 동일
- [x] OG: `og:title`, `og:description`, `og:image`, `og:type=article`, `article:published_time`, `article:author`
- [x] Twitter Card — `summary_large_image`
- [x] canonical — `${SITE_CONFIG.url}/blog/${slug}`
- [x] JSON-LD: `Article` + `BreadcrumbList` 이미 적용됨 (`page.tsx` L93-115)
- [ ] **OG image** — 마이그레이션 직후 `og_image_url` 또는 `thumbnail_url` 둘 중 하나는 반드시 채워야 함. NULL 인 글이 있으면 동적 OG (`opengraph-image.tsx`) 가 폴백되는지 검증

검증 스크립트 (`scripts/migrate-blog/scripts/verify-meta.ts`):

```ts
// 1. Webflow 사이트의 모든 글에 대해 fetch → cheerio 로 메타 추출
// 2. 새 사이트(스테이징)의 동일 슬러그에 대해 동일하게 추출
// 3. diff 표로 출력 (제목/디스크립션/캐노니컬/OG)
```

### 7.3 렌더링 방식 (가장 중요)

**현재 상태 — 정상**:
- `app/(site)/blog/[slug]/page.tsx`: Server Component
- `export const revalidate = 3600;` → ISR 1시간
- `generateStaticParams()` 로 빌드 타임 prerender
- `generateMetadata()` 비동기, slug 단위로 메타 동적 생성
- 본문 HTML 렌더링은 server-side `processMarkdown()` → `<div dangerouslySetInnerHTML>` 로 박는 것이지만 **HTML 자체는 서버에서 만들어지므로** 검색엔진이 빈 페이지를 보지 않음

**점검 사항**:
- [ ] 빌드 후 `next build` 산출물에서 `/blog/<slug>` 가 prerendered (`/blog/[slug].html` 생성) 되는지 확인
- [ ] view-source 로 봤을 때 본문 텍스트가 HTML 안에 있어야 함 (CSR 없음)
- [ ] `dynamicParams = true` — 빌드 후 추가된 글도 ISR 로 정상 응답하는지

### 7.4 이미지 / Core Web Vitals

**현재 next.config.ts**:
```ts
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    { protocol: 'https', hostname: 'cdn.prod.website-files.com' },
  ],
}
```

- [x] Supabase Storage `*.supabase.co` 등록됨
- [x] `[slug]/page.tsx` thumbnail 은 `next/image` + `priority` + `fetchPriority="high"` (LCP 최적화 OK)
- [ ] **본문 안 이미지** — markdown 의 `![]()` 가 `<img>` 로 렌더되는지 확인. 그렇다면 lazy loading 누락 가능 → markdown processor 에 rehype 플러그인으로 `loading="lazy"` 자동 부착 권장
- [ ] **CLS 방지** — 본문 이미지에 width/height 누락 시 reflow → markdown 에 `width × height` 또는 `aspect-ratio` 부착 룰

**개선 제안 — 본문 markdown 이미지 컴포넌트화**:
현재 `<div dangerouslySetInnerHTML>` 로 박혀 next/image 가 적용 안 됨. 향후 `react-markdown` 또는 rehype-react 로 전환해 `<img>` → next/image 컴포넌트 매핑이 이상적이지만, **마이그레이션 1차 범위는 아님** — 별도 후속 작업.

### 7.5 인프라

- [x] sitemap.xml — `app/sitemap.ts` 가 Supabase posts 자동 수집. 마이그레이션 후 글 수 = Webflow 글 수 인지 확인
- [x] robots.txt — `app/robots.ts` 정상 (CCBot/Bytespider 차단 OK, sitemap 등록됨)
- [ ] **404 진짜 코드** — `not-found.tsx` 가 진짜 404 status 반환하는지 (Vercel 환경에서 `notFound()` 호출은 자동으로 404)
- [ ] **soft 404 방지** — 200 으로 빈 페이지 반환되는 케이스 없는지
- [ ] **RSS** — Webflow 에 RSS 피드 있었으면 동일 경로 유지. 없었으면 신규 도입 보류
- [ ] **hreflang** — 단일 언어 (ko) 사이트라 불필요
- [x] **IndexNow** — 키 등록됨 (`public/<KEY>.txt`), 발행 후 ping 가능

### 7.6 Webflow → 새 사이트 redirect 가 필요한 패턴

Webflow CMS 가 자동 생성하던 잔여 URL 들:

- [ ] `/blog?category=<webflow_cat>` 와 새 카테고리 slug 가 다르면 301
- [ ] Webflow 의 author 페이지 (`/author/<name>` 등) 가 있었으면 — 마음토스 팀 author 로 통합 가능하니 `/blog` 로 301
- [ ] Webflow 의 tag 페이지 — 새 사이트는 tag 페이지 없음. 발견되면 `/blog` 로 301
- [ ] Webflow `sitemap.xml` 에서 발견된 모든 URL 검증 후 누락 path → redirect 추가

이 redirect 들은 `next.config.ts` `redirects()` 에 추가.

### 7.7 전환 당일 (DNS 컷오버)

전환 D-7 ~ D+30 체크리스트:

- D-7 — DNS TTL 을 300s 로 단축 (롤백 시간 최소화)
- D-3 — 스테이징에서 Webflow 사이트의 모든 URL 200 응답 검증 완료
- D-3 — Webflow 사이트와 새 사이트 메타 1:1 diff 통과
- D-1 — 새 sitemap.xml 의 글 수 = Webflow 사이트 글 수 일치 확인
- D-day 컷오버:
  1. DNS A/AAAA 또는 CNAME 을 Vercel 로 전환
  2. Vercel 도메인 인증 / TLS 발급 확인
  3. `/sitemap.xml`, `/robots.txt`, `/blog`, `/blog/<top-3-slug>` 수동 200 확인
  4. Google Search Console 에서 새 사이트 sitemap 제출
  5. 상위 트래픽 5~10 글 "URL 검사 → 색인 요청" 즉시 트리거
  6. IndexNow `/api/indexnow` POST 로 모든 글 URL 한 번 ping
- D+1 ~ D+7 — 매일 GSC 의 페이지 보고서 모니터링:
  - 404 / soft 404 / 리다이렉션 오류 / 색인됨이지만 사이트맵에 제출되지 않음
  - 갑자기 늘어나면 즉시 조사
- D+7 ~ D+30 — 트래픽/순위는 일시 출렁임 정상. **URL 구조 추가 변경 절대 금지**
- D+30 — 회복 안 된 상위 글 list 화 후 개별 분석 (메타/콘텐츠 변동 / 백링크 / 인덱스 이슈)

---

## 8. 디렉토리 구조 / 파일별 책임

```
mindthos-landing/
├── scripts/
│   └── migrate-blog/
│       ├── README.md                    # 운영 가이드 (Phase 별 명령)
│       ├── package.json                 # turndown, ofetch, @supabase/supabase-js, fast-xml-parser, cheerio
│       ├── tsconfig.json
│       ├── .env.example                 # BASEROW_TOKEN, WEBFLOW_TOKEN, SUPABASE_*, REVALIDATION_SECRET
│       ├── src/
│       │   ├── 0-categories.ts          # Baserow 카테고리 분포 분석 → categories-mapping.json
│       │   ├── 1-fetch-baserow.ts       # 페이지네이션, 모두 fetch → .data/baserow-all.json
│       │   ├── 2-fetch-webflow.ts       # CMS items → slug→publishDate map → .data/webflow-dates.json
│       │   ├── 3-fetch-webflow-sitemap.ts  # Webflow sitemap.xml 다운 → .data/webflow-urls.json
│       │   ├── 4-transform.ts           # HTML→MD, 매핑, references, slug 정규화 → .data/posts.json
│       │   ├── 5-enrich.ts              # Claude CLI skill 호출 → 누락 메타 채움
│       │   ├── 6-verify-thumbnails.ts   # Storage HEAD 200 검증 → 누락 리포트
│       │   ├── 7-upsert-supabase.ts     # posts/post_tags upsert (slug 키)
│       │   ├── 8-verify-urls.ts         # Webflow URL 모두 새 사이트에서 200 확인
│       │   ├── 9-verify-meta.ts         # Webflow ↔ 새 사이트 메타 diff
│       │   └── lib/
│       │       ├── baserow.ts           # REST client + retry/throttle
│       │       ├── webflow.ts           # CMS API client
│       │       ├── supabase.ts          # service-role client
│       │       ├── html-to-md.ts        # turndown + GFM + 커스텀 룰
│       │       ├── claude-cli.ts        # claude -p ... --output-format json wrapper
│       │       ├── normalize.ts         # slug, references, keywords 정규화
│       │       └── log.ts
│       └── .data/                       # gitignored
│           ├── baserow-all.json
│           ├── webflow-dates.json
│           ├── webflow-urls.json
│           ├── categories-mapping.json
│           ├── posts.json
│           ├── enrichment.json
│           └── reports/
│               ├── thumbnails-missing.txt
│               ├── url-200.txt
│               └── meta-diff.txt
├── web/
│   ├── supabase/
│   │   └── migrations/
│   │       ├── 003_replace_categories.sql  # 시드 교체
│   │       └── 004_seed_mindthos_author.sql
│   └── docs/
│       └── blog-migration-plan.md       # ★ 본 문서
└── .claude/
    └── skills/
        └── blog-enrich/
            ├── SKILL.md
            └── prompts/
                ├── excerpt.md
                ├── summary.md
                ├── keywords.md
                └── faq.md
```

---

## 9. Phase 별 실행 순서

### Phase 0 — 준비 (반나절)

- [ ] Baserow Personal Access Token 발급 (DB ID `332779`, Table `763048` 읽기 권한)
- [ ] Webflow API Token 발급 (사이트 단위)
- [ ] Webflow Site ID / Blog Collection ID 확인
- [ ] Webflow 의 현재 sitemap.xml 백업 (`.data/webflow-urls.json`)
- [ ] Supabase Storage 에 `blog-images` 버킷 존재 / public 정책 확인
- [ ] `scripts/migrate-blog/` 부트스트랩 (package.json, tsconfig)

### Phase 1 — 데이터 수집 (1시간)

```bash
pnpm tsx src/1-fetch-baserow.ts           # 820 row → JSON
pnpm tsx src/2-fetch-webflow.ts           # publish date 매핑
pnpm tsx src/3-fetch-webflow-sitemap.ts   # 모든 URL 캐시
pnpm tsx src/0-categories.ts              # 카테고리 분포 표
```

산출:
- `categories-mapping.json` 초안 (카테고리명 → slug)

### Phase 2 — 카테고리 / Author 시드 (15분)

- [ ] `categories-mapping.json` 사용자 검토 (slug 가 Webflow 운영 path 와 맞는지)
- [ ] `003_replace_categories.sql` 작성 후 Supabase 적용
- [ ] `004_seed_mindthos_author.sql` 적용
- [ ] `getCategories()` 쿼리로 모든 row 가 새 카테고리에 매핑되는지 dry-run

### Phase 3 — 본문 변환 (결정론, 30분)

```bash
pnpm tsx src/4-transform.ts
```

산출: `.data/posts.json` — Supabase posts insert 형식 그대로의 객체 배열.

검증:
- [ ] `posts.json` 의 row 수 = Baserow 총 row 수 (실패 row 별도 리포트)
- [ ] 각 post 의 content 길이 > 500자 (단순 sanity)
- [ ] slug 중복 없음

### Phase 4 — Claude CLI 보강 (선택, ~수 시간)

```bash
pnpm tsx src/5-enrich.ts
```

각 post 에 대해 (필요한 경우만):
- excerpt 비어있거나 >155자 → 보강
- summary NULL → 생성
- keywords < 3개 → 추출 보강
- FAQ 형태 발견 시 schema_markup 채움

체크포인트:
- 비용/시간 모니터링 (1글 = ~6초 가정 → 820 × 6s ≈ 80분)
- 실패한 글은 skip 하고 NULL 유지 (마이그레이션 자체를 막지 않음)

### Phase 5 — 사용자 썸네일 업로드

사용자 작업 (병렬 진행 가능):
- Baserow 의 `thumbnail` 컬럼에 나온 모든 파일을 Supabase Storage `blog-images/` 에 동일 경로로 업로드

검증:
```bash
pnpm tsx src/6-verify-thumbnails.ts
# 모든 thumbnail_url HEAD 200 확인 → 누락 리스트 출력
```

누락이 있으면 마이그레이션 stop. 사용자가 누락분 업로드 후 재실행.

### Phase 6 — Supabase 업서트 (10분)

```bash
pnpm tsx src/7-upsert-supabase.ts --dry-run    # 변경 사항 미리보기
pnpm tsx src/7-upsert-supabase.ts              # 실행
```

- slug 기준 upsert (`ON CONFLICT (slug) DO UPDATE`)
- 트랜잭션 단위: 50 글씩 (Supabase POST 요청 한도 고려)
- 실패 row 는 별도 로그, 나머지 진행

### Phase 7 — SEO 검증 (스테이징, 1시간)

```bash
pnpm tsx src/8-verify-urls.ts          # Webflow URL 전부 200
pnpm tsx src/9-verify-meta.ts          # title/description/canonical/OG diff
```

추가 권장:
- Lighthouse: 임의 글 5개 → LCP < 2.5s / INP < 200ms / CLS < 0.1
- view-source 로 본문 텍스트가 HTML 안에 있는지 (CSR 아님)
- `next build && next start` 후 `/blog/<slug>` 가 prerendered HTML 인지

### Phase 8 — 컷오버 (전환 당일)

§7.7 체크리스트 그대로 실행.

---

## 10. 검증 / 롤백 전략

### 10.1 멱등성 보장

- 모든 phase 는 **재실행 가능** — 입력 변하지 않으면 출력 동일
- Phase 6 `7-upsert-supabase.ts` 는 slug 기반 upsert 라 부분 실행 후 재개 가능
- `.data/*.json` 캐시로 phase 간 분리

### 10.2 dry-run 우선

- 모든 phase 에 `--dry-run` 플래그
- DB 변경은 SQL `BEGIN ... ROLLBACK` 으로 미리 검증

### 10.3 롤백 시나리오

| 시나리오 | 대응 |
| --- | --- |
| 본문 변환 품질 이슈 발견 | `4-transform.ts` 수정 후 Phase 3~6 재실행 (멱등) |
| Supabase 업서트 후 잘못된 데이터 | `posts.status = 'archived'` 일괄 → 사이트에서 사라짐, sitemap 자동 재생성 |
| 카테고리 mapping 실수 | 새 003 마이그레이션으로 슬러그 교체 + posts.category_id 재할당 |
| 컷오버 후 트래픽 급락 | DNS 롤백 (TTL 300s 라 5분 내 복구), 원인 분석 후 재시도 |

### 10.4 데이터 백업

- 마이그레이션 직전 Supabase 스냅샷 (Dashboard → Database → Backups)
- Webflow 사이트는 컷오버 후 1개월 유지 (DNS 만 끊고 hosting 은 살림)

---

## 11. 운영 후속

### 11.1 발행일 정렬 안정성

`published_at` 이 Webflow 의 publish date 라 과거 시간이 들어가는데, `created_at` 도 동일하게 맞춰
정렬 일관성 확보 (이미 §3 매핑에 반영).

### 11.2 신규 글 발행 워크플로

기존 `web/docs/blog-publishing.md` 그대로 유지.
다만 author 가 모두 `mindthos` 단일이므로 `(SELECT id FROM authors WHERE slug = 'mindthos')` 로 INSERT 템플릿 업데이트.

### 11.3 미해결 / 후속 과제

- [ ] **본문 markdown 이미지 → next/image 매핑** — `react-markdown` + 커스텀 이미지 컴포넌트로 전환 (CWV 추가 개선)
- [ ] **이미지 lazy loading 보장** — markdown processor 에 rehype 플러그인 추가
- [ ] **author 다양화** — 외부 기고자 도입 시 `authors` 테이블 추가 시드
- [ ] **태그 도입 검토** — Baserow 의 `keyword` 가 단일 문자열이라 1차에는 `posts.keywords` 배열로만 흡수. 향후 `tags` + `post_tags` 정식 활용 시 백필 작업 필요

---

## 12. 빠른 참조

| 리소스 | 위치 |
| --- | --- |
| Baserow DB | `Mindful Labs` (id `332779`) → `Mindthos Blog` (id `763048`) |
| Supabase Project | `ulrxefpxlsbpjgvpxxor` (ap-southeast-1) |
| Storage 버킷 | `blog-images` (public, 5MB, image/*) |
| 새 사이트 URL 패턴 | `https://mindthos.com/blog/<slug>` |
| ISR | 1시간 (`export const revalidate = 3600`) |
| 캐시 갱신 | `POST /api/revalidate` + `POST /api/indexnow` |
| 본 문서 위치 | `web/docs/blog-migration-plan.md` |

---

## 부록 A — Claude CLI Skill 프롬프트 초안

### `.claude/skills/blog-enrich/prompts/excerpt.md`

```
너는 마음토스 블로그 편집 어시스턴트다.

입력: 블로그 글 본문 (마크다운)
출력: JSON 한 객체 — {"excerpt": "..."}

excerpt 규칙:
- 최대 155자 (한국어 기준)
- 본문 첫 단락의 핵심을 압축
- 본문 텍스트의 단어를 쓰되, 새로운 사실/주장은 만들지 않는다
- 마침표로 끝낸다
- 검색 결과 카드에 보일 광고 문구 톤 (행동 유도 약하게)

본문에 입력 외 정보를 추가하지 않는다.
응답은 JSON 한 객체뿐, 마크다운 코드펜스 금지.
```

### `summary.md`, `keywords.md`, `faq.md` 도 동일한 가드레일로 작성. 본문 텍스트 변경 금지 명시.

---

## 부록 B — 사용자가 다음에 해야 할 액션

1. **Baserow Personal Access Token** 발급 → `scripts/migrate-blog/.env` 에 `BASEROW_TOKEN`
2. **Webflow API Token** 발급 → `WEBFLOW_TOKEN`
3. **Webflow Site ID** 확인 → `WEBFLOW_SITE_ID`
4. **Supabase Storage `blog-images`** 버킷에 썸네일 파일 일괄 업로드 (Phase 5 — Phase 1~3 진행과 병렬 가능)
5. **본 문서 §4.1 카테고리 매핑 확정** — Phase 1 산출 후 사용자 검토
6. **컷오버 일정 합의** — 트래픽 낮은 시간대 + DNS TTL 단축 사전 적용
