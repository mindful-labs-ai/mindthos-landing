# Blog SEO Template — 재사용 가능한 SEO 블로그 시스템

이 폴더는 [앤아더라이프 심리상담연구소 웹사이트](https://andotherlife.com)에서 검증된 SEO 블로그 시스템의 **개발 + 배포 영역만** 추출한 재사용 패키지입니다. (자동 발행 / 콘텐츠 운영 파이프라인은 제외 — 별도 운영 도구로 분리)

디자인 토큰(색상, 폰트, 레이아웃)은 분리되어 있고, **DB 스키마 / SEO 설계 / 라우팅 / 컴포넌트**가 핵심입니다.

## 빠른 시작 (Claude에게 줄 명령)

새 프로젝트의 루트에 이 폴더를 그대로 복사한 뒤, Claude에게 다음과 같이 지시하세요:

```
blog-seo-template/ 폴더를 참고해서 이 프로젝트에 SEO 블로그 시스템을 이식해줘.
README.md → ARCHITECTURE.md → docs/ 순서로 읽고, 다음 단계를 따라:
1. supabase/migrations/ 의 SQL을 새 Supabase 프로젝트에 적용
2. src/ 코드를 프로젝트 구조에 맞게 복사 (디자인은 우리 프로젝트 디자인 시스템에 맞춰 수정)
3. .env.local 환경변수 채우기
4. Vercel 배포
5. docs/VERIFICATION_CHECKLIST.md 검증
```

## 이 패키지가 제공하는 것

| 영역 | 내용 |
|------|------|
| **DB 스키마** | Supabase Postgres 9 테이블 (posts, categories, tags, authors, post_tags, contact_inquiries, program_registrations, newsletter_subscribers, counseling_programs) + RLS + 인덱스 + 트리거 |
| **SEO 설계** | generateMetadata 패턴, JSON-LD 8종 (Article, FAQ, Breadcrumb, Organization, LocalBusiness, Person, WebSite, Course, Service), sitemap.ts (Supabase 데이터 기반 자동 생성), robots.ts, IndexNow API |
| **블로그 페이지** | 목록 / 카테고리 / 태그 / 개별 포스트 / 검색 / 페이지네이션 — 모두 ISR 1시간 |
| **콘텐츠 컴포넌트** | PostCard, PostContent (Markdown→HTML), TableOfContents (sticky), FAQSection (Schema 자동 생성), ReferencesList, RelatedPosts, BlogSidebar (인기글/뉴스레터/카테고리), Pagination, BlogSearch |
| **마크다운 처리** | remark + rehype 파이프라인, 테이블 반응형 래퍼, 외부 링크 자동 보안 속성, H2/H3 자동 ID 생성 |
| **OG 이미지 자동 생성** | next/og 기반 동적 OG 이미지 (제목 텍스트 자동 렌더링) |
| **CTA 자동 매칭 (런타임)** | 블로그 글 페이지 렌더 시 `posts.counseling_program_id` 또는 카테고리 폴백을 사용해 InlineCTA / BottomCTA를 동적으로 표시 |
| **분석 헬퍼** | GA4 + Meta Pixel 이벤트 (`view_content`, `cta_click`, `generate_lead`, `begin_form`, `phone_click`) |

## 폴더 구조

```
blog-seo-template/
├── README.md                       이 파일
├── ARCHITECTURE.md                 전체 시스템 아키텍처 + 데이터 흐름
├── CLAUDE.md                       Claude에게 줄 이식 가이드
├── package.json.example            의존성 목록
├── tsconfig.example.json           TypeScript paths/strict 설정 예시
├── docs/
│   ├── BLOG_DB_SCHEMA.md           DB 스키마 가이드
│   ├── SEO_ARCHITECTURE.md         SEO 설계 가이드
│   ├── CONVERSION_FUNNEL.md        블로그 → 전환 퍼널 설계
│   ├── ENV_VARIABLES.md            환경 변수
│   └── VERIFICATION_CHECKLIST.md   배포 후 검증 체크리스트
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  9개 테이블 + RLS + 인덱스 + 트리거
│       └── 002_counseling_programs.sql  상담 프로그램 테이블 + posts 연결
├── src/
│   ├── lib/
│   │   ├── supabase/{client,server,static,queries,types}.ts
│   │   ├── seo/{metadata,schema}.ts
│   │   ├── markdown/{processor,toc}.ts
│   │   ├── analytics/gtag.ts
│   │   ├── validations/{contact,newsletter}.ts
│   │   └── utils.ts
│   ├── types/{blog,form,seo}.ts
│   ├── constants/{site,seo,categories}.ts
│   ├── components/
│   │   ├── seo/SchemaMarkup.tsx
│   │   └── blog/{PostCard,PostContent,SummaryBox,TableOfContents,FAQSection,ReferencesList,RelatedPosts,CategoryFilter,BlogSearch,BlogSidebar,Pagination}.tsx
│   └── app/
│       ├── layout.tsx              루트 레이아웃 (메타 + Schema + GA + Pixel)
│       ├── sitemap.ts              Supabase 데이터로 동적 생성
│       ├── robots.ts
│       ├── blog/
│       │   ├── page.tsx            블로그 목록 + 검색
│       │   ├── [category]/page.tsx 카테고리 목록
│       │   ├── [category]/[slug]/page.tsx 개별 포스트
│       │   ├── [category]/[slug]/opengraph-image.tsx 동적 OG
│       │   └── tag/[tag]/page.tsx 태그 페이지
│       └── api/
│           ├── revalidate/route.ts ISR 수동 갱신
│           └── indexnow/route.ts   Bing/Yandex IndexNow
└── context/                        SEO/콘텐츠 가이드라인 (참고용)
    ├── seo-guidelines.md           한국어 SEO 기준 (그대로 사용 가능)
    ├── brand-voice.template.md     브랜드 톤앤매너 템플릿
    ├── style-guide.template.md     작문 스타일 템플릿
    └── internal-links-map.template.md  카테고리별 CTA 매핑 템플릿
```

## 기술 스택 전제 조건

- **Framework:** Next.js 15+ App Router (Server Components 기본)
- **Language:** TypeScript 5.x strict
- **DB/Auth:** Supabase (PostgreSQL 15+, Auth, Storage)
- **Markdown:** remark + rehype 파이프라인
- **Validation:** Zod
- **Hosting:** Vercel (또는 Next.js 호환)

## 옮길 때의 핵심 의사결정

이 패키지는 **앤아더라이프(심리상담)** 도메인에 특화된 일부 부분(카테고리 7종, CTA 매칭 로직)이 있습니다. 새 프로젝트에 이식할 때 다음을 결정하세요:

1. **카테고리 재정의**: `constants/categories.ts` 의 7개 카테고리를 도메인에 맞게 변경. `target_audience` (client/professional 또는 임의의 segment), `default_cta_type`은 도메인의 전환 목표에 맞춰 재설계.
2. **CTA 매칭 정책**: `counseling_programs` 테이블을 도메인 상품 테이블로 치환 (예: `services`, `products`, `programs`). `counseling_program_id` FK를 동일한 패턴으로 유지.
3. **언어**: 한국어 (`ko_KR`, `Asia/Seoul`) 전제. 영어/다국어로 이식하려면 `lib/markdown/toc.ts` 의 한글 정규식을 교체.
4. **디자인 토큰**: 컴포넌트의 hex 색상(`#2d6a4f`, `#b1f0ce` 등)을 새 디자인 시스템 토큰으로 일괄 치환.

## 다음 읽기

1. `ARCHITECTURE.md` — 전체 시스템 그림
2. `docs/BLOG_DB_SCHEMA.md` — DB 구조와 핵심 쿼리 패턴
3. `docs/SEO_ARCHITECTURE.md` — SEO 메타, 스키마, 사이트맵, IndexNow
4. `docs/CONVERSION_FUNNEL.md` — 전환 퍼널 설계
5. `docs/VERIFICATION_CHECKLIST.md` — 배포 후 검증 (~120개 항목)

## 라이선스

이 패키지는 앤아더라이프 심리상담연구소의 내부 자산을 정리한 것입니다. 외부 배포 시 별도 라이선스 결정이 필요합니다.
