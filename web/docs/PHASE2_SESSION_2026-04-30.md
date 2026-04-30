# Phase 2 작업 로그 — 2026-04-30

> 단일 세션에서 §2 (Pretendard 로컬화) + §3 (랜딩 11 섹션) 완료.
> §0 (Supabase 백엔드) 는 MCP 도구 노출 미스로 차단 — 다음 세션 인계.

---

## 완료한 작업

### §2. Pretendard 로컬화 ✅

| 변경 | 파일 | 내용 |
|---|---|---|
| jsDelivr CDN 제거 | `app/globals.css:1` | `@import url('https://cdn.jsdelivr.net/...')` 삭제 |
| next/font/local 추가 | `app/layout.tsx` | 6 weight (300/400/500/600/700/800) `public/fonts/Pretendard-*.woff2` 로딩, `--font-pretendard` 변수 노출 |
| `--font-sans` 갱신 | `app/globals.css` | `var(--font-pretendard)` 우선, 시스템 폰트 폴백 체인 유지 |
| `<html>` className | `app/layout.tsx` | `${pretendard.variable} ${plexMono.variable}` |

검증: `npm run build` → 23 정적 라우트 prerender, font 라이센스 OK (이미 `andotherlife-web/public/fonts/` 와 동일).

### §3. 랜딩 11 섹션 ✅

`web/components/home/` 신규 11 파일 + `web/app/page.tsx` 교체.

| # | 섹션 | 파일 | 핵심 구성 | 카피 출처 |
|:---:|---|---|---|---|
| 01 | Hero | `Hero.tsx` | 그라디언트 + 상담노트 카드 (4필드 + 커서 블링크) + Trust chip 3개 | `06-content/hero/hero-v2-draft.md` |
| 02 | Trust & Security | `TrustStrip.tsx` | 좌 팀 카드 / 우 5단계 세로 타임라인 (업로드→암호화→AI→반환→삭제) | `sections/security-v2-draft.md` |
| 03 | 문제 공감 | `PainPoints.tsx` | Big Pain (통합 해석 chip 5 → 결과) + Small Pain 2×2 | `sections/problems-v2-draft.md` |
| 04 | 핵심 기능 5축 | `FeatureTabs.tsx` | 클라이언트 탭 (심리검사 해석 기본) + WHEN 문구 + 공통 Mindthos AI 프레임 | `sections/features-v2-draft.md` |
| 05 | 샘플 체험 | `SampleExperience.tsx` | Collapsed→Expanded · Step 1-4 (사례 선택→처리→SOAP 결과→시작) | `sections/sample-experience-v2-draft.md` |
| 06 | 페르소나 | `PersonasTimeline.tsx` | 5 상황 카드 그리드 (3+2) — 직함 ❌ 상황 ✅ | `sections/personas-v2-draft.md` |
| 07 | vs 범용 AI | `VsAI.tsx` | 5행 비교 (학습/양식/사례개념화/심리검사/보안) | 자체 작성 |
| 08 | 후기 + 정량 | `SocialProof.tsx` | 4 metric + 3 후기 + 6 기관 로고 placeholder | 자체 작성 (실 수치 미정) |
| 09 | 가격 | `Pricing.tsx` | 4 플랜 (Free/Pro/Team/Institution) · Pro 추천 1.5px 테두리 | `plans-v2.md` 미작성 → placeholder |
| 10 | FAQ | `FAQ.tsx` | Accordion · 열림 시 brand-primary-pale bg | 자체 작성 6 Q&A |
| 11 | 최종 CTA | `FinalCTA.tsx` | bg-deep 다크 + 두 CTA + 보안 한 줄 | 자체 작성 |

### 코딩 규칙 준수
- ✅ 디자인 토큰 변수만 (`var(--brand-primary)`, `bg-[var(--brand-primary)]`)
- ✅ Tailwind arbitrary value (인라인 style ❌ — §3 신규 컴포넌트만)
- ✅ lucide-react 아이콘만 (이모지 ❌)
- ✅ `motion-safe:` / `prefers-reduced-motion` (Hero 커서 블링크)
- ✅ `'use client'` — FeatureTabs / SampleExperience / FAQ 만

### 검증
```
npm run typecheck  → 0 errors
npm run lint       → 0 issues
npm run build      → 23 routes prerender, exit 0
```

---

## 차단된 작업

### §0. Supabase 백엔드 — MCP 도구 미노출 ⚠️

**현 상태**: `claude mcp list` 에서 `supabase: ✓ Connected` 확인. 그러나 이 세션의 deferred tools 목록에 `mcp__supabase__*` 가 등록되지 않아 직접 invoke 불가.

**시도한 우회**:
1. `ToolSearch` 다양한 쿼리 → 0 results
2. `supabase` CLI 직접 실행 → 미설치
3. `npx @supabase/mcp-server-supabase --help` (액세스 토큰 인자) → 권한 정책에서 거부 (Credential Leakage)

**권장 다음 단계**:
- 옵션 A: 사용자가 새 Claude Code 세션 시작 → MCP 도구가 자동 등록되면 다음 명령으로 진행
  - `list_organizations` → `create_project` (mindthos-marketing-staging, ap-northeast-2)
  - `apply_migration` × 2 (`001_initial_schema.sql` + `002_counseling_programs.sql`)
  - `create_storage_bucket` (`blog-images` public)
- 옵션 B: 사용자 수동 (`supabase` CLI 또는 Dashboard SQL Editor)
- 옵션 C: 운영 프로젝트 재사용 — 비추 (production 데이터)

---

## 남은 백로그 (우선순위 순)

### 🔴 High — 출시 차단

| § | 항목 | 상태 | 메모 |
|---|---|---|---|
| 0 | Supabase 적용 | ☐ | 다음 세션에서 MCP 사용 |
| 1 | og/favicon/icon.png/apple-touch-icon | ☐ | 디자이너 발주 — 1200×630 + 180/192/32 |

### 🟡 Mid — 컨텐츠/기능

| § | 항목 | 상태 | 의존 | 메모 |
|---|---|---|---|---|
| 4 | 제품 4종 상세 | ☐ | 0 | `/product/{transcribe,progress-note,conceptualization,genogram}` placeholder 교체 + `getCounselingPrograms()` 추가 |
| 5 | 폼 (contact + newsletter) | ☐ | 0 | RHF + zod (스키마 이미 있음) → `contact_inquiries`, `newsletter_subscribers` INSERT |
| 6 | 블로그 시스템 | ☐ | 0 | `blog-seo-template/src/components/blog/` 9 컴포넌트 포팅 + `/resources/[category]/[slug]` 라우트 |
| 7 | 가격 — 크레딧 계산기 | △ | — | 4 플랜 카드는 §3 Pricing 안에서 완료 / 별도 `/pricing` 본 구현 + 크레딧 계산기 클라이언트 컴포넌트 미구현 |

### 🟢 Low — 마무리

| § | 항목 | 상태 | 메모 |
|---|---|---|---|
| 8 | 법무 본문 | ☐ | 외부 법무 검토 의존 (privacy / terms / how-we-protect) |
| 9 | 카테고리 v2 | ☐ | 콘텐츠 전략 확정 후 `003_categories_v2.sql` |
| 10 | inline → tailwind | △ | 새 home 섹션은 OK / 기존 Header / Footer / PrimaryCTA / 기타 페이지 placeholder 잔존 |
| 11 | Vercel 배포 | ☐ | 모든 high/mid 완료 후 — `vercel link` + env push + GSC/Naver/Bing 등록 |

### ⚪ Optional

| § | 항목 | 메모 |
|---|---|---|
| 12 | revalidate / indexnow API | 콘텐츠 발행 자동화 도입 시 |

---

## 다음 세션 진입점

Supabase MCP 가 정상 노출된다고 가정하면 권장 순서:

1. **§0 Supabase 적용** (15분) — MCP 로 신규 staging 프로젝트 + 2 마이그레이션 + storage bucket
2. **§5 폼 본 구현** (1-2h) — `/contact` 의 free-trial / institution-inquiry 분기 + Server Action POST
3. **§6 블로그 시스템** (2-3h) — `blog-seo-template/` 9 컴포넌트를 마음토스 토큰으로 포팅
4. **§4 제품 4종 상세** (1-2h) — `getCounselingPrograms()` 호출 + 페이지 본 구현
5. **§1 자산** + **§7 크레딧 계산기** — 디자인/카피 의존 항목
6. **§11 Vercel 배포** — 모든 high/mid 완료 후

---

## 참고 — 본 세션에서 만진 파일

```
M  web/app/layout.tsx              (next/font/local 추가)
M  web/app/globals.css              (jsDelivr 제거, --font-pretendard)
M  web/app/page.tsx                 (placeholder → 11 섹션 import)

A  web/components/home/Hero.tsx
A  web/components/home/TrustStrip.tsx
A  web/components/home/PainPoints.tsx
A  web/components/home/FeatureTabs.tsx
A  web/components/home/SampleExperience.tsx
A  web/components/home/PersonasTimeline.tsx
A  web/components/home/VsAI.tsx
A  web/components/home/SocialProof.tsx
A  web/components/home/Pricing.tsx
A  web/components/home/FAQ.tsx
A  web/components/home/FinalCTA.tsx

M  web/docs/PHASE2_BACKLOG.md       (진행 추적 표 갱신)
A  web/docs/PHASE2_SESSION_2026-04-30.md   (이 문서)
```
