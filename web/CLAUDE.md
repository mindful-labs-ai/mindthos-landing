# CLAUDE.md — mindthos-web

이 문서는 Claude/Codex/Gemini 등 AI assistant 가 이 프로젝트에서 가장 먼저 읽어야 하는
작업 규칙입니다. 새 세션을 시작할 때 항상 먼저 확인하세요.

## 1. 프로젝트 정의

**마음토스 공식 웹사이트** — 상담사를 위한 안전한 AI 파트너 'Mindthos' 의 마케팅 + 자료실
사이트. 검색 유입 → 무료 시작 / 기관 도입 상담 으로 전환하는 마케팅 사이트입니다.

## 2. 핵심 포지셔닝 (변경 금지)

- **상담사를 위한 안전한 AI agent, 마음토스**
- 단일 기능 툴 ❌ → 상담 업무 전반 AI 파트너 ✅
- 보안 / 신뢰 최우선
- 페르소나 5분기: 기록에 지친 / 사례개념화 막막 / 기관 서식 / 가족체계 / 수련생

## 3. 톤 / 컬러 / 타이포 (단일 진실 원본)

`../mindthos-landing-design/05-design/design-tokens.md` (v1.2 이상) 가 디자인 시스템의
단일 진실 원본. 코드 변경 시 항상 토큰 문서를 먼저 확인.

### 컬러
- **메인 그린**: `#44ce4b` (`--brand-primary`, mindthos.com 운영 색)
- **hover**: `#40a755` (`--brand-primary-dark`)
- **다크 위 fill**: `#65c377` (`--brand-primary-soft`)
- **본문 텍스트**: `#1f1f1f` (`--text-primary`, warmth 유지)
- **본문 배경**: `#ffffff` / 섹션 alt `#f7f5f1` / 다크 `#181819`
- 그라디언트는 Hero 한정 `#44ce4b → #eeee76` 만 허용

### 폰트
- Pretendard Variable (본문) — `--font-pretendard`
- IBM Plex Mono (caption / data label) — `--font-mono`
- Webfont 또는 next/font/google 로 로드 — 새 family 추가 ❌

### 절대 금지
- 다크 모드 메인
- 화려한 그라디언트 (Hero 외)
- 이모지 본문 (SVG 아이콘만)
- 미취득 인증 배지
- 순흑 (#000) 본문 (#1f1f1f 사용)
- `--brand-primary` 위에 흰색 텍스트 (대비 부족 — `#1f1f1f` 사용)

## 4. 사이트 IA

`../mindthos-landing-design/02-plan/current/ia-structure.md` 참조. 11 섹션 홈 + 서브 페이지.

```
mindthos.com
├── 홈 (/)
├── 제품 (/product/{transcribe,progress-note,conceptualization,genogram})
├── 기관용 (/for-institutions)
├── 보안 (/security/{how-we-protect,privacy-policy,terms})
├── 가격 (/pricing)
├── 리소스 (/resources/{blog,tech-blog,guides,case-studies})
├── 회사 (/about)
└── 문의 (/contact)
```

## 5. 기술 스택

- **Framework**: Next.js 16 App Router (Server Components 기본)
- **Language**: TypeScript 5.x strict
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova)
- **DB**: Supabase (Postgres 15+ · RLS)
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: remark + rehype 파이프라인 (`lib/markdown/processor.ts`)
- **Hosting**: Vercel

> **Next.js 16 주의**: `cookies()` / `params` / `searchParams` 모두 async — `await` 필수.
> Tailwind v4 의 `@theme inline` 은 CSS 안에 있고 별도 config 파일 없음.

## 6. 코딩 컨벤션

### 파일명
- 컴포넌트: PascalCase (`PostCard.tsx`)
- 유틸/훅: camelCase (`useScrollSpy.ts`)
- 상수: camelCase 파일 + UPPER_CASE 변수

### 컴포넌트
- Server Component 기본. `'use client'` 는 클라이언트 상태/이벤트 필요시만.
- Props interface 패턴, 화살표 함수.
- shadcn/ui 컴포넌트는 `components/ui/` 에서 import.

### 스타일
- Tailwind 유틸리티 + `cn()` (`lib/utils.ts`).
- 인라인 스타일 ❌. 색상 hex 직접 사용 대신 design token CSS variable 우선
  (`var(--brand-primary)`, `bg-[var(--brand-primary)]`).

### 데이터 페칭
- Server Component → `lib/supabase/server.ts`
- generateStaticParams / sitemap.ts → `lib/supabase/static.ts` (cookies 없음 — 빌드 안전)
- Browser → `lib/supabase/client.ts`
- 쿼리는 `lib/supabase/queries.ts` 에 중앙화

### SEO
- 모든 페이지에 `generateMetadata()` 또는 `metadata` 필수.
- 시맨틱 HTML (article, section, nav, main, aside).
- 이미지 alt 필수.
- 외부 링크: `target="_blank" rel="noopener noreferrer"`.
- JSON-LD: Article, FAQPage, BreadcrumbList, Organization, WebSite, Person 사용.

## 7. 작업 시작 시 점검

```
1. CLAUDE.md (이 문서)                                   ← 작업 규칙
2. ../mindthos-landing-design/INDEX.md                   ← 디자인 폴더 맵
3. ../mindthos-landing-design/02-plan/current/direction.md ← 현재 방향
4. ../mindthos-landing-design/05-design/design-tokens.md ← 토큰 단일 진실 원본
5. ../mindthos-landing-design/04-wireframes/final/wireframe-v2-final.html ← 와이어 lock-in
6. ../mindthos-landing-design/05-design/hifi/landing-v1-hifi.html         ← 하이파이 작업본
7. 작업 대상 파일                                          ← 실제 수정
```

## 7.5. 후속 작업 추적

후속 작업 진행 상황 + 차후 PR 권장 항목은 다음 문서를 단일 진실 원본으로 참조:

| 문서 | 내용 |
|---|---|
| `docs/PHASE2_BACKLOG.md` | Phase 2 항목 진행 추적 (✅ 완료 / △ 부분 / ☐ 미진행 / ⏸ 결정 대기) |
| `docs/refactor-deferred.md` | 시각 회귀 위험 / 디자인 결정 필요로 차후 PR 권장 항목 8개 spec |
| `docs/blog-publishing.md` | 블로그 글 발행 절차 (Supabase Studio + revalidate + IndexNow) |
| `.qa/qa-checklist.md` | 자동 + 수동 검증 체크리스트 (75 항목) |
| `.qa/qa-report.md` | 가장 최근 검증 결과 + Chrome headless 스크린샷 |

주요 완료 항목 (2026-05-06 기준):
- ✅ Supabase 인프라 + 마이그레이션 적용 + 시드
- ✅ Pretendard 로컬화 + Light(300) weight 제거 (~92KB 절감)
- ✅ 랜딩 11 섹션 monolith (sub-component 분할은 deferred)
- ✅ 블로그 시스템 (목록 + 상세 + OG + Schema + ISR)
- ✅ hifi.css 18,467줄 → 13 모듈 분할
- ✅ 25 raw `<img>` → `next/image`
- ✅ Footer 14 hex → CSS 토큰
- ✅ CSP report-only + timingSafeEqual + rehype-sanitize
- ✅ /api/revalidate + /api/indexnow

미완료 + 차후 PR 권장: HifiLanding 분할, hifi 토큰 reconcile, og/favicon 자산, Pretendard Variable 통합, CSP enforce 전환, /education hero priority.

## 8. Vercel 배포

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... 나머지 환경 변수 push (.env.example 참조)
vercel deploy --prod
```

배포 후:
- Google Search Console / Naver Search Advisor / Bing Webmaster Tools 등록
- sitemap.xml 제출
- IndexNow 키 등록
- Lighthouse 검증 (LCP < 2.5s · INP < 200ms · CLS < 0.1)
