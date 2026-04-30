# Blog DB Schema Guide

`supabase/migrations/001_initial_schema.sql` + `002_counseling_programs.sql` 에서 정의한 9개 테이블의 사용 가이드입니다.

## 테이블 구조 한눈에 보기

```
┌─────────────────┐         ┌──────────────────────┐
│   categories    │◄────────│ posts                │
│  - id (PK)      │ N:1     │  - category_id (FK)  │
│  - slug         │         │  - counseling_program_id (FK)
│  - target_audience      │           │  - keywords[]        │
│  - default_program_id (FK)           │  - schema_markup     │
│                 │         │  - references        │
│                 │         │  - status            │
└─────────────────┘         └──────────────────────┘
                                    │
                                    │ 1:N (post_tags)
                                    ▼
                            ┌──────────────────────┐
                            │ tags                 │
                            │  - slug              │
                            └──────────────────────┘
                                    
                            ┌──────────────────────┐
                            │ authors              │
                            │  - slug, credentials │
                            └──────────────────────┘
                                    ▲
                                    │ N:1
                                    │ posts.author_id

┌──────────────────────────┐    ┌──────────────────────┐
│ counseling_programs      │◄───│ posts                │
│  - slug, match_keywords  │    │  - counseling_program_id
│  - is_active, sort_order │    │                      │
│  - is_cta_enabled        │    │                      │
└──────────────────────────┘    └──────────────────────┘
            ▲
            │
            │ categories.default_program_id (폴백)

┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ contact_inquiries    │    │ program_registrations│    │ newsletter_subscribers│
│  - utm_*             │    │  - status            │    │  - email (unique)    │
│  - status            │    │                      │    │  - is_active         │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

## 핵심 테이블

### posts — 블로그 본체

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `id` | UUID | uuid_generate_v4() |
| `title` | TEXT | H1 제목, 30-60자 권장 |
| `slug` | TEXT UNIQUE | 영문 소문자+하이픈, 3-5단어 |
| `excerpt` | TEXT | 카드/메타에 노출 (155자 이내) |
| `content` | TEXT | Markdown 본문 |
| `summary` | TEXT | "이 글의 핵심" 박스 (200-400자) |
| `keywords` | TEXT[] | SEO 키워드 (CTA 매칭에도 사용) |
| `category_id` | UUID FK | NOT NULL |
| `thumbnail_url` | TEXT | 카드/OG 이미지 |
| `author_id` | UUID FK | nullable |
| `status` | TEXT CHECK | 'draft' \| 'published' \| 'archived' |
| `meta_title` | TEXT | 30-60자 |
| `meta_description` | TEXT | 120-155자 |
| `og_image_url` | TEXT | 미설정 시 thumbnail_url로 폴백 |
| `schema_markup` | JSONB | FAQPage 등 추가 JSON-LD |
| `references` | JSONB | `[{name, url, type, description}]` |
| `cta_type` | TEXT | 'consultation' \| 'education' \| 'newsletter' |
| `reading_time` | INTEGER | 분 단위. 자동 계산: ceil(content.length/400) |
| `view_count` | INTEGER | 인기 글 정렬용 |
| `is_featured` | BOOLEAN | 홈페이지 노출용 |
| `published_at` | TIMESTAMPTZ | KST(+09:00) 권장 |
| `counseling_program_id` | UUID FK | CTA 매칭 결과 캐시 |

**핵심 인덱스**
- `idx_posts_slug` — 개별 글 조회 (1쿼리)
- `idx_posts_status_published` — 발행 글 정렬 (Partial: `WHERE status='published'`)
- `idx_posts_category` — 카테고리 페이지
- `idx_posts_keywords` — GIN 인덱스 (`@>` 배열 포함 검색용, 인링크 시스템에서 사용)
- `idx_posts_fulltext` — to_tsvector('simple', ...) 풀텍스트 (보조 검색)

### categories — 7개 카테고리 시스템

`target_audience`로 콘텐츠를 두 트랙(B2C/B2B)으로 분리합니다:

| target_audience | default_cta_type | 의미 |
|-----------------|------------------|------|
| client | consultation | 일반 사용자, 1:1 상담 예약으로 전환 |
| client | newsletter | 일반 사용자, 뉴스레터로 lead 확보 |
| professional | education | 전문가, 교육 프로그램 등록으로 전환 |

새 도메인에 이식할 때 `target_audience` 값을 자유롭게 바꿔도 됩니다 (예: `'enterprise'`, `'individual'`, `'free'`, `'paid'`).

`default_program_id`는 카테고리 → 기본 CTA 상품으로 연결. 글에 매칭이 실패하면 이 값으로 폴백.

### counseling_programs — 도메인 상품/서비스

`match_keywords` 배열이 CTA 매칭의 핵심입니다:

```sql
-- 예시
INSERT INTO counseling_programs (title, slug, cta_heading, cta_button_text, match_keywords) VALUES
  ('부부상담', 'couple', '부부상담 알아보기', '예약하기',
   ARRAY['부부상담', '부부갈등', '커플', '결혼', '이혼']);
```

콘텐츠 작성/발행 도구가 `posts.keywords`와 `match_keywords`를 양방향 substring 비교하여 가장 매칭이 많은 프로그램의 id를 `posts.counseling_program_id`에 저장하는 패턴을 사용하세요. 매칭이 없으면 `categories.default_program_id`로 폴백합니다 (페이지 렌더 단에서 자동 처리).

## 자주 쓰는 쿼리 패턴

### 발행 글 조회 (페이지네이션 + 카테고리 + 작성자 join)

```ts
// lib/supabase/queries.ts 의 getPublishedPosts() 참조
const { data, count } = await supabase
  .from('posts')
  .select('*, category:categories(*), author:authors(*)', { count: 'exact' })
  .eq('status', 'published')
  .eq('category_id', categoryId)
  .order('published_at', { ascending: false })
  .range(from, to);
```

### 키워드 기반 인링크 후보 조회 (GIN 인덱스 활용)

```ts
const { data } = await supabase
  .from('posts')
  .select('id, slug, title, excerpt, keywords, categories(slug)')
  .eq('status', 'published')
  .neq('slug', currentSlug)
  .contains('keywords', [keyword])  // GIN 인덱스 사용
  .order('published_at', { ascending: false })
  .limit(5);
```

### 인기 글 (view_count 정렬)

```ts
const { data } = await supabase
  .from('posts')
  .select('id, title, slug, category:categories(slug)')
  .eq('status', 'published')
  .order('view_count', { ascending: false })
  .limit(5);
```

### 풀텍스트 검색 (보조)

```ts
const { data } = await supabase
  .from('posts')
  .select('*, category:categories(*), author:authors(*)')
  .eq('status', 'published')
  .or(`title.ilike.%${q}%,content.ilike.%${q}%,summary.ilike.%${q}%`)
  .order('published_at', { ascending: false })
  .limit(20);
```

## 발행 시 KST 타임스탬프 처리

Postgres TIMESTAMPTZ는 내부적으로 UTC로 저장되지만, Wire format은 `+09:00`으로 보내면 직접 SQL 조회 시 한국 시간으로 보입니다:

```ts
function toKstISOString(d: Date): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return kst.toISOString().replace('Z', '+09:00');
}
```

콘텐츠를 INSERT/UPDATE 하는 모든 진입점(어드민, 외부 CMS 동기화, 마이그레이션)에서 동일 헬퍼를 사용하세요. 페이지 렌더 시 날짜 표시는 항상 `timeZone: 'Asia/Seoul'` 명시 (Vercel은 UTC 환경).

## 클라이언트 3종 (`lib/supabase/`)

- **`client.ts`** — 브라우저 (createBrowserClient, NEXT_PUBLIC_*만 사용)
- **`server.ts`** — Server Component (createServerClient + cookies(), Auth 세션 처리)
- **`static.ts`** — Static / SSG / generateStaticParams (cookies 미사용 — 빌드 타임 사용 가능)

**선택 기준**
| 상황 | 사용 |
|------|------|
| `'use client'` 컴포넌트 | client.ts |
| Server Component (페이지/레이아웃) | server.ts (cookies 필요) 또는 static.ts (공개 데이터만) |
| `generateStaticParams()` | static.ts (cookies 호출 시 빌드 실패) |
| sitemap.ts | static.ts |

## RLS 정책 요약

```
모든 익명 사용자:
  ✅ posts SELECT (status='published'만)
  ✅ categories, tags, authors, post_tags, counseling_programs SELECT
  ✅ contact_inquiries, program_registrations, newsletter_subscribers INSERT

인증된 사용자 (관리자):
  ✅ 모든 테이블 ALL
```

서비스 롤 키(`SUPABASE_SERVICE_ROLE_KEY`)는 RLS를 우회 — 어드민 페이지나 서버 액션에서만 사용. 절대 클라이언트 번들에 노출 금지.

## 새 도메인으로 이식 체크리스트

- [ ] `categories` 시드 — 도메인의 7-10개 카테고리로 교체
- [ ] `target_audience` 값 — 도메인의 사용자 세그먼트로 재정의
- [ ] `cta_type` 값 — 도메인의 전환 목표로 재정의
- [ ] `counseling_programs` → 도메인 상품 테이블명으로 변경 (또는 그대로 두고 의미만 재정의)
- [ ] `contact_inquiries` 컬럼 — 도메인 폼 필드에 맞게 ALTER (preferred_date, counseling_type 등)
- [ ] `references.type` enum 값 — academic/government/industry → 도메인 출처 카테고리
