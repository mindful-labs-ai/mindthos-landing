# Claude 작업 가이드 — Blog SEO Template 이식

이 폴더(`blog-seo-template/`)는 검증된 SEO 블로그 시스템의 **개발 + 배포** 영역 재사용 패키지입니다. 콘텐츠 자동 발행 / 운영 도구는 별도라 이 패키지에 포함되지 않습니다.

새 프로젝트에서 이식 작업을 시작할 때 Claude는 이 문서를 먼저 읽고 작업하세요.

## 작업 시작 전 체크리스트

다음 정보를 사용자에게 확인하거나 추측 가능 시 진행:

- [ ] **도메인** — 어떤 산업/주제? (예: 심리상담, SaaS, 학원, 헬스케어, 미디어)
- [ ] **카테고리** — 블로그를 몇 개 카테고리로 나눌지? (5-10개 권장)
- [ ] **타겟 독자** — B2C 단일 / B2B 단일 / 혼합?
- [ ] **전환 목표** — 폼 제출 / 결제 / 뉴스레터 / 자료 다운로드?
- [ ] **언어** — 한국어 / 영어 / 다국어?
- [ ] **기존 디자인 시스템** — Tailwind 토큰? shadcn/ui? 자체 컴포넌트?

## 이식 단계 (권장 순서)

### 1단계: DB 스키마 적용

```bash
# Supabase 프로젝트 생성 후 (또는 기존 프로젝트에)
# Dashboard → SQL Editor 에서 실행
cat supabase/migrations/001_initial_schema.sql  # 9개 테이블
cat supabase/migrations/002_counseling_programs.sql  # 상품 매칭 테이블
```

이식 시 결정:
- `categories` 시드: 도메인 카테고리로 교체
- `counseling_programs` 테이블명: 도메인에 맞는 이름으로 변경 가능 (예: `services`, `products`)
  - 단, 컬럼 구조는 그대로 유지 (slug, match_keywords, cta_heading, cta_button_text)
- `contact_inquiries` 컬럼: 도메인 폼 필드에 맞게 ALTER

→ 자세한 가이드: `docs/BLOG_DB_SCHEMA.md`

### 2단계: 코드 복사

```
src/lib/        → 프로젝트의 lib/ 또는 동일 위치
src/types/      → 프로젝트의 types/
src/constants/  → 프로젝트의 constants/
src/components/seo/SchemaMarkup.tsx → components/seo/
src/components/blog/* → components/blog/
src/app/blog/*  → app/blog/
src/app/api/*   → app/api/
src/app/sitemap.ts, robots.ts → app/
src/app/layout.tsx → 기존 layout.tsx에 SEO 메타 + Schema 부분 병합
```

`@/` import alias가 동일하면 그대로 동작. 다르면 일괄 치환.

### 3단계: 디자인 적용

이 템플릿의 컴포넌트는 **앤아더라이프 색상 토큰**(예: `#2d6a4f`, `#b1f0ce`, `#f3f4f0`)이 하드코딩되어 있습니다. 작업:
- 모든 hex 색상을 새 디자인 시스템의 Tailwind 토큰으로 치환
- 폰트 스타일 (`font-dangam`, `font-sans`)을 프로젝트 폰트로 교체
- `prose` 클래스 사용 시 `@tailwindcss/typography` 설치 필요

**미포함 컴포넌트** (디자인 의존성으로 별도 구현 필요):
- `Header`, `Footer` — 네비게이션
- `Breadcrumb` — 빵부스러기 (간단)
- `InlineCTA`, `BottomCTA`, `FloatingCTAWrapper` — 본문 CTA 카드
- `NewsletterForm` — 사이드바 폼
- `Accordion` (`@/components/ui/accordion`) — FAQSection이 의존. shadcn/ui로 설치 권장

→ 인터페이스 가이드: `docs/CONVERSION_FUNNEL.md` 의 "CTA 컴포넌트 구조"

### 4단계: 환경변수

`docs/ENV_VARIABLES.md` 참조. 최소 필요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### 5단계: SEO 자산 + 검증 코드

- `public/og-default.png` (1200x630)
- `public/apple-touch-icon.png`, `icon.png`, `favicon.ico`
- 검색엔진 사이트 소유권 인증 코드 (Google / Naver / Bing) 발급 후 `layout.tsx` 의 `metadata.verification` 에 입력
- IndexNow 키 발급 (32자 이상 랜덤) → `INDEXNOW_KEY` 환경변수 + `public/${INDEXNOW_KEY}.txt` 정적 파일

### 6단계: Vercel 배포

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# ... 나머지 환경변수 push
vercel deploy --prod
```

배포 후:
- Google Search Console / Naver Search Advisor / Bing Webmaster Tools 등록
- 각 도구에서 `https://your-domain.com/sitemap.xml` 제출
- Bing 에서 IndexNow 키 등록

### 7단계: 검증

`docs/VERIFICATION_CHECKLIST.md` 를 위에서 아래로 따라가며 검증.
약 120개 항목, 8개 섹션 (디렉토리 / DB / 메타 / Schema / 사이트맵 / 렌더링 / 성능보안접근성).

## 중요 패턴

### Supabase 클라이언트 3종 — 상황별 사용

| 컴포넌트 종류 | 사용 |
|--------------|------|
| `'use client'` | `lib/supabase/client.ts` |
| Server Component (cookies / Auth 필요) | `lib/supabase/server.ts` |
| `generateStaticParams()`, sitemap.ts | `lib/supabase/static.ts` (cookies 사용 시 빌드 실패 회피) |

`generateStaticParams`나 ISR 페이지에서 `server.ts`의 cookies를 부르면 빌드가 깨집니다. 데이터가 공개라면 `static.ts` 사용.

### Markdown 처리

`lib/markdown/processor.ts`는 다음을 보장:
- `~취소선` 단일 틸데 비활성화 (`singleTilde: false`) — 단일 ~가 취소선으로 잘못 변환되는 버그 방지
- 모든 `<table>` → 반응형 wrapper
- 모든 외부 링크 → `target=_blank rel=noopener noreferrer`
- H2/H3 → 자동 `id` 속성 (TOC 앵커)

### KST 타임스탬프

발행 시 `published_at`을 KST(+09:00)로 저장하면 직접 SQL 조회 시 한국 시간으로 보입니다:
```ts
function toKstISOString(d: Date): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return kst.toISOString().replace('Z', '+09:00');
}
```

날짜 표시는 항상 `timeZone: 'Asia/Seoul'` 명시 (Vercel은 UTC 환경).

### CTA 자동 매칭 (런타임)

`posts.counseling_program_id`는 콘텐츠 작성 시 어드민/SQL로 채워집니다 (이 템플릿은 자동 매칭 스크립트를 포함하지 않음). 페이지 렌더 시 매칭 알고리즘:
```
1. posts.counseling_program_id 사용 (있으면)
2. 없으면 categories.default_program_id 폴백
3. 그래도 없으면 cta_type 기반 일반 CTA 표시
```

자세한 구조는 `app/blog/[category]/[slug]/page.tsx` 참조.

## 검증

이식 완료 후 동작 확인:

```bash
# 1. 빌드 통과
npm run build

# 2. 로컬 DB에 글 1개 수동 INSERT 후 페이지 렌더링 확인
npm run dev
# → http://localhost:3000/blog/[category]/[slug]

# 3. Schema 검증
# Google Rich Results Test (https://search.google.com/test/rich-results)
# 페이지 URL 입력 → BlogPosting + FAQPage + BreadcrumbList 인식 확인

# 4. sitemap.xml 확인
curl https://your-domain.com/sitemap.xml | head -20

# 5. robots.txt 확인
curl https://your-domain.com/robots.txt

# 6. OG 이미지 동작 확인
# https://www.opengraph.xyz/url/<your-blog-url>
```

전체 검증은 `docs/VERIFICATION_CHECKLIST.md` 참조.

## 자주 묻는 질문

**Q: 이미 있는 Next.js 프로젝트에 이식할 때 충돌은?**
A: `app/blog/`, `app/sitemap.ts`, `app/robots.ts`가 기존에 있으면 충돌. 백업 후 교체. `lib/utils.ts`의 `cn()` 함수는 거의 모든 shadcn 프로젝트에 있으므로 import만 통일.

**Q: Markdown이 아니라 MDX/Notion으로 콘텐츠를 받고 싶어요.**
A: `lib/markdown/processor.ts`의 unified 파이프라인을 MDX 컴파일러나 Notion API 변환기로 교체. 출력은 동일한 HTML 문자열이어야 `PostContent.tsx`가 그대로 동작.

**Q: 한국어 외 언어로 이식하려면?**
A: 변경 필요한 파일:
- `lib/markdown/toc.ts` — 한글 정규식 (`가-힣`) 제거
- 컴포넌트의 `Asia/Seoul` 타임존 → 도메인 타임존
- `constants/site.ts`의 `locale: 'ko_KR'`, `language: 'ko'` 변경

**Q: Supabase가 아니라 자체 Postgres를 쓰고 싶어요.**
A: 가능. RLS는 Postgres 내장이라 그대로 사용. 클라이언트만 `pg`/`postgres`/`drizzle`로 교체. Auth가 필요하면 별도 (예: NextAuth, Clerk).

**Q: ISR이 아니라 SSG로만 빌드하고 싶어요.**
A: `app/blog/[category]/[slug]/page.tsx`에 `generateStaticParams()` 추가하고 `revalidate` 제거. 글이 많으면 빌드 시간이 길어지므로 ISR 권장.

**Q: 콘텐츠 작성 도구는 어떻게 만드나요?**
A: 이 패키지는 의도적으로 콘텐츠 작성/발행 도구를 포함하지 않습니다. 옵션:
- Supabase Studio 직접 사용 (간편, 적은 글 수)
- 자체 어드민 페이지 (`app/admin/posts/`) 구축 — Supabase Auth + RLS 인증 사용
- 헤드리스 CMS 연동 (Sanity, Contentful 등) — webhook으로 posts 테이블 동기화
