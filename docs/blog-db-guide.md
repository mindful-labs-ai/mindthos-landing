# 블로그 DB 구조 & 작동 방식 가이드

> 대상: 영상 기반 블로그를 마음토스 / 앤아더라이프에 발행하고, 이걸 네이버 블로그에도 다시 올리고자 하는 팀원
>
> 핵심 한 줄: **글은 Supabase `posts` 테이블에 row로 들어가고, 사이트는 그 row를 읽어 ISR(1시간)로 렌더한다.**

---

## 1. 큰 그림

```
[ 작성자 ]
   │
   │ ① 글 작성 (제목/본문/메타)
   ▼
[ Supabase Studio ]
   │  ├─ posts (row INSERT)
   │  └─ Storage: blog-images (썸네일 .webp 업로드)
   │
   │ ② revalidate API 호출 (선택, 1시간 안 기다리려면)
   ▼
[ Next.js 사이트 ]
   ├─ /blog                 ← 목록 (ISR)
   ├─ /blog/<slug>          ← 상세 (마크다운 → HTML, ISR)
   ├─ /sitemap.xml          ← Supabase 자동 수집
   └─ /api/revalidate, /api/indexnow
```

- 어드민/CMS는 **없습니다.** 발행은 곧 Supabase Studio 에서 row 추가.
- 마음토스 (`mindthos.com`) 와 앤아더라이프 (`andotherlife.com`) 는 **DB 스키마가 거의 동일** — 컬럼명, 인덱스, RLS 정책까지 같습니다. 시드 데이터(카테고리 슬러그, 도메인 용어)만 다릅니다.

---

## 2. DB 스키마 — `posts` 한 글이 어떻게 저장되나

> 원본: `web/supabase/migrations/001_initial_schema.sql`
> 운영: Supabase 프로젝트 `ulrxefpxlsbpjgvpxxor` (ap-southeast-1)

### 2.1 `posts` 컬럼 (핵심만 추림)

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | UUID | PK, 자동 |
| `title` | TEXT | 제목 (H1 으로 렌더, 본문에 또 쓰지 말 것) |
| `slug` | TEXT UNIQUE | URL — `/blog/<slug>`. 영문 소문자 + 하이픈, 3–5단어 |
| `excerpt` | TEXT | 카드/메타 description (≤155자) |
| `summary` | TEXT | 본문 상단 “이 글의 핵심” 박스 (200–400자) |
| `content` | TEXT | **마크다운 본문**. H1 안 씀, H2 부터 시작 |
| `keywords` | TEXT[] | CTA 매칭/검색에 사용 |
| `category_id` | UUID FK | `categories.id` 참조 (필수) |
| `author_id` | UUID FK | `authors.id` 참조 (NULL 허용) |
| `counseling_program_id` | UUID FK | CTA 매칭 — 마음토스는 제품 4종, 앤아더라이프는 교육/상담 프로그램 |
| `thumbnail_url` | TEXT | 보통 `https://<supabase>/storage/v1/object/public/blog-images/blog/<uuid>.webp` |
| `og_image_url` | TEXT | NULL 이면 `opengraph-image.tsx` 가 동적 생성 |
| `status` | TEXT | `draft` / `published` / `archived` — **published 만 공개** |
| `meta_title` | TEXT | 30–60자, 키워드 앞쪽 |
| `meta_description` | TEXT | 120–155자 |
| `schema_markup` | JSONB | FAQPage JSON-LD 객체 (선택) |
| `references` | JSONB | 외부 참고 자료 배열 |
| `cta_type` | TEXT | `free-trial` / `institution-inquiry` / `newsletter` |
| `reading_time` | INT | 분, 자동 계산 가능 (`content.length / 500`) |
| `is_featured` | BOOL | 홈 노출 |
| `published_at` | TIMESTAMPTZ | KST 기준 발행 시각 |
| `created_at` / `updated_at` | TIMESTAMPTZ | 자동 |

### 2.2 부속 테이블

- `categories` — 슬러그 + 이름 + 기본 CTA. 마음토스 운영 카테고리는 `005_categories_finalize.sql` 참고 (사례개념화, 상담 스킬, 수련 실전, 운영, 자기돌봄, 트렌드, 커리어, 마음토스(기술)).
- `authors` — 마음토스는 `mindthos-team` 단일. 앤아더라이프는 다수 가능.
- `tags` + `post_tags` — 다대다. 없어도 동작합니다.
- `counseling_programs` — 각 글 본문 하단/중간에 들어가는 CTA 박스 매칭 대상. 글에 직접 program_id 지정하거나, 카테고리의 `default_program_id` 폴백.
- `contact_inquiries` / `program_registrations` / `newsletter_subscribers` — 폼 제출 저장. 글과 직접 관계 없음.

### 2.3 RLS (보안)

- 공개 SELECT: `posts WHERE status = 'published'` 만 노출
- 쓰기: 인증된 세션(=Supabase Studio 로그인 또는 service-role 키)만 가능
- 따라서 **익명 키로는 published 글만 보입니다.** 운영자는 Studio 에서 로그인 상태로 작업.

---

## 3. 글 작성 — 실제 발행 절차

> 정식 문서: `web/docs/blog-publishing.md` (이 가이드의 원본)

### 3.1 한 글 INSERT 템플릿

Supabase Studio → SQL Editor 에 그대로 붙여 값만 채워 실행하면 됩니다.

```sql
INSERT INTO posts (
  title, slug, excerpt, summary, content, keywords,
  category_id, author_id, counseling_program_id,
  thumbnail_url, og_image_url,
  meta_title, meta_description,
  cta_type, status, published_at, is_featured
) VALUES (
  '제목 (30-60자)',
  'english-slug-3-5-words',
  '카드/메타 발췌 (≤155자)',
  '이 글의 핵심 박스 (200-400자)',
  $$## H2 섹션 1

본문 마크다운…

## H2 섹션 2

…
$$,
  ARRAY['키워드1', '키워드2'],
  (SELECT id FROM categories WHERE slug = 'career'),
  (SELECT id FROM authors WHERE slug = 'mindthos-team' LIMIT 1),
  (SELECT id FROM counseling_programs WHERE slug = 'transcribe'),
  'https://ulrxefpxlsbpjgvpxxor.supabase.co/storage/v1/object/public/blog-images/blog/<uuid>.webp',
  NULL,
  '메타 타이틀',
  '메타 디스크립션',
  'free-trial',
  'published',
  (NOW() AT TIME ZONE 'Asia/Seoul')::timestamptz,
  FALSE
);
```

### 3.2 본문 작성 규칙

- **H1 쓰지 않음** — 페이지 컴포넌트가 `title` 을 H1 으로 박습니다.
- 본문은 `## H2` 부터 시작.
- 마크다운 + GFM(표) 지원. 외부 링크는 자동으로 `target="_blank" rel="noopener noreferrer"` 부착.
- 인라인 HTML 일부 허용(`<strong>`, `<em>` 등) — 단, **rehype-sanitize 로 화이트리스트만 통과**. 현재 화이트리스트는 `web/lib/markdown/processor.ts` 참고.
- 이미지: `![alt](URL)` — URL 은 Supabase Storage public URL 권장 (next.config.ts 의 `remotePatterns` 에 등록되어 있어야 next/image 가 동작).

### 3.3 썸네일 업로드

1. **Supabase Studio → Storage → `blog-images` 버킷** 에 1200×630 WebP 업로드.
2. 공개 URL 복사 → `posts.thumbnail_url` 에 저장.
3. OG 이미지 따로 만들지 않으면 NULL → 동적 OG (`app/(site)/blog/[slug]/opengraph-image.tsx`) 가 자동 폴백.

### 3.4 발행 후 캐시 갱신 (선택)

ISR 1시간을 기다리지 않으려면:

```bash
# .env.local 에서 REVALIDATION_SECRET 가져오기
SECRET="$(grep '^REVALIDATION_SECRET=' web/.env.local | cut -d= -f2)"
SLUG="english-slug"

# Next.js ISR 즉시 갱신
curl -X POST https://mindthos.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SECRET\",\"paths\":[\"/blog\",\"/blog/$SLUG\"]}"

# Bing/Yandex 인덱싱 ping
curl -X POST https://mindthos.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d "{\"urls\":[\"https://mindthos.com/blog/$SLUG\"]}"
```

> Google Search Console 은 IndexNow 미지원 — sitemap.xml 갱신 후 자연 색인 대기.

### 3.5 수정/비공개/삭제

```sql
-- 수정 (updated_at 자동 갱신)
UPDATE posts SET content = $$…$$ WHERE slug = '…';

-- 비공개
UPDATE posts SET status = 'archived' WHERE slug = '…';

-- 영구 삭제 (post_tags 도 ON DELETE CASCADE 로 자동)
DELETE FROM posts WHERE slug = '…';
```

수정 후에도 §3.4 의 revalidate 호출 권장.

---

## 4. 영상(YouTube/Vimeo) 을 본문에 넣으려면

**현재 상태**: 본문 마크다운은 `rehype-sanitize` 를 통과하는데, 화이트리스트에 `<iframe>` 이 없습니다. 즉 YouTube/Vimeo embed 코드를 본문에 그대로 붙여넣어도 **렌더 시 제거됩니다.**

선택지 2가지:

### A. (가장 간단) sanitize 화이트리스트에 `iframe` 추가

`web/lib/markdown/processor.ts` 의 `sanitizeSchema` 에 다음 추가:

```ts
const sanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'loading', 'title'],
    // …기존 항목 유지…
  },
};
```

그리고 본문에 직접 HTML 삽입:

```html
<div class="video-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="영상 제목"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>
```

> 보안 주의: `iframe` 을 열면 외부 도메인 임베드가 허용됩니다. CSP `frame-src` 에 `https://www.youtube.com https://player.vimeo.com` 등을 명시적으로 등록해 두는 게 안전.

### B. (권장) 영상 컬럼을 명시적으로 추가

```sql
ALTER TABLE posts ADD COLUMN video_url TEXT;          -- 원본 YouTube URL
ALTER TABLE posts ADD COLUMN video_provider TEXT;     -- 'youtube' / 'vimeo'
ALTER TABLE posts ADD COLUMN video_position TEXT;     -- 'hero' (썸네일 자리) / 'inline' (summary 박스 아래)
```

페이지 (`app/(site)/blog/[slug]/page.tsx`) 에서 `video_url` 이 있으면 `thumbnail` 자리에 임베드를 렌더. 본문 마크다운은 건드리지 않아도 됩니다.

→ 데이터 형태가 **구조화**되어 있어서 sitemap-video, schema.org `VideoObject` JSON-LD 같은 SEO 부가 작업이 깔끔해집니다. 네이버 블로그 재게시 자동화 시에도 `video_url` 만 보면 되니까 편함.

선택은 영상이 “있을 수도 / 없을 수도” 라면 **B**, “모든 글이 무조건 영상 기반” 이라면 **B 가 강제 필수**.

---

## 5. 네이버 블로그 재게시 (현재 미구현)

레포 안에 네이버 블로그 자동 발행 코드는 **없습니다.** 가능한 경로:

| 방식 | 난이도 | 비고 |
| --- | --- | --- |
| 수동 복붙 | 즉시 | `posts.content` 마크다운을 네이버 에디터에 붙여넣기. 표/이미지는 손봐야 함 |
| RSS 활용 | 중 | 사이트 `/rss.xml` 만들고 (현재 없음) 네이버는 RSS 자동 수집 미지원 — 자동 발행 안 됨 |
| 네이버 OpenAPI 활용 | 상 | 네이버는 외부 OpenAPI 로 블로그 글쓰기 비공개 (지원 종료). **공식 API 발행 불가** |
| 자동화 봇 (Puppeteer) | 상 | 비공식. 약관 위반 소지, 차단 위험. 비추천 |

현실적인 선택지는 **수동 복붙 워크플로를 빠르게 하는 것**:

1. Supabase 에서 글 row 조회 → `content` 컬럼 마크다운 + `thumbnail_url` 다운로드
2. (선택) 네이버 에디터 친화 변환:
   - 마크다운 → 네이버 에디터 호환 HTML 또는 텍스트
   - 표 → 이미지로 캡쳐하거나 단순 텍스트
   - YouTube embed → 네이버는 자체 동영상 첨부 UI 사용 (URL 입력)
3. 네이버 블로그에 글쓰기 → 본문 붙여넣기 → 영상 첨부 (URL 입력) → 발행

원천을 한 곳에 두려면 **이 변환 단계를 스크립트화** 하는 게 합리적입니다. 예:

```
scripts/export-to-naver/
├── src/
│   ├── 1-fetch-post.ts        # slug 받아서 posts row 조회
│   ├── 2-md-to-naver.ts       # 마크다운 → 네이버 HTML/텍스트 변환
│   └── 3-pack.ts              # 본문 + 이미지 ZIP 으로 저장 (복붙 편의)
```

지금 단계에서는 **수동 발행 + 변환 스크립트 1개** 가 가장 비용 대비 좋습니다.

---

## 6. 영상 기반 블로그 워크플로 제안

“영상 1개 → 마음토스/앤아더라이프 블로그 글 → 네이버 블로그 글” 파이프라인 초안:

1. **영상 업로드** (YouTube 또는 사내 호스팅, public/unlisted)
2. **글 작성** — 영상 스크립트(자막) 기반으로 H2 5–8 개로 정리. 본문 2,000자+.
3. **DB 입력** — 위 §3.1 템플릿. `video_url` (§4-B 도입 시) 또는 본문 직접 embed (§4-A).
4. **썸네일** — YouTube 썸네일 그대로 또는 1200×630 별도 제작 후 Storage 업로드.
5. **검증** — `published_at = NOW()`, `status = 'published'` → `/blog/<slug>` 200 응답 확인.
6. **revalidate + IndexNow** — §3.4 명령.
7. **네이버 재게시** — §5 의 수동 절차 또는 변환 스크립트.

---

## 7. 알아두면 좋은 환경 / 인프라

| 항목 | 값 |
| --- | --- |
| 마음토스 Supabase project | `ulrxefpxlsbpjgvpxxor` (ap-southeast-1) |
| 앤아더라이프 Supabase project | 별도 (`andotherlife-web/supabase/.temp/linked-project.json` 참조) |
| Storage 버킷 | `blog-images` (public, 5MB, image/*) |
| 사이트 URL | `https://mindthos.com/blog/<slug>` / `https://andotherlife.com/blog/<category>/<slug>` |
| ISR 갱신 주기 | 1시간 (`export const revalidate = 3600`) |
| 캐시 즉시 갱신 | `POST /api/revalidate` + `POST /api/indexnow` |
| 마크다운 파이프라인 | remark-parse → remark-gfm → remark-rehype → rehype-raw → rehype-slug → rehype-sanitize → rehype-stringify (`web/lib/markdown/processor.ts`) |
| sitemap | `app/sitemap.ts` 가 Supabase `posts WHERE status='published'` 자동 수집 |
| robots.txt | `app/robots.ts` (CCBot/Bytespider 차단됨) |

---

## 8. 마음토스 vs 앤아더라이프 차이

| 항목 | 마음토스 (`web/`) | 앤아더라이프 (`andotherlife-web/`) |
| --- | --- | --- |
| URL 구조 | `/blog/<slug>` | `/blog/<category>/<slug>` |
| `cta_type` 기본 | `free-trial` / `institution-inquiry` | `consultation` / `education` / `newsletter` |
| 카테고리 시드 | 사례개념화, 상담 스킬, 수련 실전, 커리어, 운영, 자기돌봄, 트렌드, 마음토스 | 마음건강, 심리상담 이야기, 관계/소통, 아동·청소년, 자기성장, 전문가 칼럼, 교육·자격 |
| Author | 단일 `mindthos-team` | 다수 (상담사 프로필) |
| `counseling_programs` 시드 | 축어록 / 상담노트 / 사례개념화 / 가계도 (제품) | 상담/교육 프로그램 |
| 발행 자동화 | 없음 (수동 INSERT) | `scripts/publish-test.ts` 파이프라인 일부 자동화 (Gemini 검증, 이미지 생성, CTA 매칭) |

DB **컬럼 구조 자체는 동일** — 같은 INSERT 템플릿이 양쪽에서 동작합니다. 다른 건 카테고리 슬러그 / CTA 값 / author 정도.

---

## 9. 다음 액션 (이 글을 보는 사람 기준)

- [ ] Supabase Studio 로그인 권한 받기 (마음토스 / 앤아더라이프 각각)
- [ ] `posts` 테이블 한번 열어보기 — row 1개 풀어서 컬럼 감 잡기
- [ ] 테스트 글 1개 `status='draft'` 로 INSERT → 사이트 어드민 페이지 없으니 SQL로 SELECT 해서 확인
- [ ] 영상 포함 발행 정책 결정 — §4-A (간단) vs §4-B (구조화) 중 선택 → 결정되면 코드 변경 1회만 진행하면 됨
- [ ] 네이버 재게시 — 수동으로 1개 해보고 변환 스크립트 필요 시 §5 처럼 작성

문서/코드 참조:

- `web/docs/blog-publishing.md` — 발행 절차 원본
- `web/docs/blog-migration-plan.md` — Webflow 이관 / 마이그레이션 컨텍스트
- `web/supabase/migrations/001_initial_schema.sql` — 스키마 원본
- `web/supabase/migrations/005_categories_finalize.sql` — 운영 카테고리 확정본
- `web/lib/markdown/processor.ts` — 마크다운 → HTML 파이프라인 (sanitize 화이트리스트 위치)
- `web/app/(site)/blog/[slug]/page.tsx` — 글 상세 페이지 (영상 컬럼 추가 시 수정 지점)
- `scripts/migrate-blog/` — Webflow → Supabase 마이그레이션 스크립트 (참고용)
