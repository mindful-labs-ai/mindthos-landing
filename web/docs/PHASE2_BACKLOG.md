# Phase 2 Backlog — mindthos-web

> Phase 1 (프로젝트 부트스트랩) 완료 시점의 남은 작업 단일 진실 원본.
> 이 문서는 **각 항목을 독립적으로 픽업 가능**하도록 작성됐습니다.
> 작업 종료 시 항목 옆에 ✅ 와 PR/커밋 링크를 추가하세요.

---

## 0. 백엔드 인프라 (Supabase) 적용 ✅

**완료 — 2026-05-06**

- ✅ Supabase 프로젝트 `ulrxefpxlsbpjgvpxxor` (Mindthos-Landing, ap-southeast-1) 사용
- ✅ Migration 001+002 적용됨 (9 테이블 + 시드 + RLS + 인덱스)
- ✅ 카테고리 4종 + counseling_programs 4종(transcribe/progress-note/conceptualization/genogram) + categories.default_program_id 매핑
- ✅ Storage 버킷 `blog-images` (public, 5MB)
- ✅ `.env.local` 의 모든 Supabase / IndexNow / Revalidation 키 채워짐 + IndexNow 검증 정적 파일 생성
- ✅ Management API 스크립트: `scripts/apply-supabase-migrations.sh`

---

## 1. 정적 자산 (High priority) ☐

- [ ] `web/public/og-default.png` (1200×630, 마음토스 그린 그라디언트 + 로고)
- [ ] `web/public/apple-touch-icon.png` (180×180)
- [ ] `web/public/icon.png` (192×192)
- [ ] `web/public/favicon.ico`
- [ ] (선택) Naver verification HTML

> 동적 OG 이미지는 `/blog/[slug]/opengraph-image` 가 처리. 정적 og-default 는 외부 페이지(홈 등) 공유용 폴백.

---

## 2. Pretendard 로컬화 ✅

**완료 — 2026-04-30 (claude). 이후 라운드에서 weight 다이어트.**

- ✅ `next/font/local` 6 weight 도입, jsDelivr CDN 제거
- ✅ 2026-05-06: `Pretendard-Light.woff2` (300) 제거 — 사용처 0건 검증 후 (~92KB 절감, 5 weight 유지)
- ⏸ Pretendard Variable woff2 단일 파일 통합은 별도 PR (`perf/font-variable` — `docs/refactor-deferred.md` §4 참조)

---

## 3. 랜딩 11 섹션 본 구현 ✅

**완료 — 2026-04-30 (claude).**

- ✅ `components/home/HifiLanding.tsx` monolith 로 11 섹션 모두 구현
- ⏸ 3,290줄 monolith 를 9~11개 sub-component로 분할은 별도 PR (`feat/hifi-section-split` — `docs/refactor-deferred.md` §1 참조)

---

## 4. 마음토스 제품 4종 상세 페이지 본 구현 ☐ (Mid)

**상태: 미구현. `/product/{transcribe, progress-note, conceptualization, genogram}` 가 next.config redirect 로 `/` 흡수 중.**

별도 페이지 본 구현 결정 시:
1. `app/(site)/product/[slug]/page.tsx` 생성 (Hero + 가치 + 흐름 + 트러스트 + 관련 글 + CTA)
2. `next.config.ts` redirect 5건 제거
3. `lib/supabase/queries.ts` `getCounselingProgramBySlug()` 사용

---

## 5. 폼 본 구현 ⏸ (Mid — 보류)

**현재 폼 없음 — `/contact`는 카카오톡 오픈채팅으로 외부 redirect.**

뉴스레터 / 상담 문의 폼 도입 시:
1. `lib/validations/{contact,newsletter}.ts` 재생성 (이전 라운드에서 dead 로 삭제됨)
2. `react-hook-form` + `@hookform/resolvers` deps 재설치 (이전 라운드 제거됨)
3. `BlogSidebar.tsx` 의 "곧 오픈" placeholder 를 NewsletterForm 으로 교체

---

## 6. 블로그 시스템 본 구현 ✅

**완료 — 2026-05-06 (claude). `feat/blog-system` 브랜치.**

- ✅ 14 blog 컴포넌트 (`components/blog/*.tsx`)
- ✅ `/blog` 목록 (페이지네이션, 카테고리 필터, 검색, 사이드바, Blog Schema)
- ✅ `/blog/[slug]` 상세 (Markdown→HTML, sticky TOC, FAQ, References, RelatedPosts, InlineCTA, BottomCTA, BlogPosting+Breadcrumb+FAQPage Schema, ISR=3600)
- ✅ `/blog/[slug]/opengraph-image` 동적 OG (next/og)
- ✅ `/api/revalidate` (timingSafeEqual) + `/api/indexnow`
- ✅ Supabase 운영 가이드: `docs/blog-publishing.md`
- ✅ 첫 더미 글 발행됨: `/blog/ai-transcription-counseling-security`

---

## 7. 가격 4단 + 크레딧 계산기 ☐ (Mid)

- ✅ 가격 4 플랜 카드 — HifiLanding §09 안에 포함
- [ ] 크레딧 계산기 (별도 컴포넌트, `'use client'` + useState)
- [ ] `mindthos-landing-design/07-features/pricing-plan/plans-v2.md` 작성 (현재 미정)

---

## 8. 법무 본문 교체 ⏸ (외부 의존)

| 페이지 | 현재 |
|---|---|
| `/security` | `app/(site)/security/page.tsx` 본문 정상 (보안 카드 그리드) |
| 서비스 이용약관 | `https://app.mindthos.com/terms?type=service` 외부 라우트로 통합 |
| 개인정보처리방침 | `https://app.mindthos.com/terms?type=privacy` 외부 라우트로 통합 |

이용약관/개인정보처리방침이 외부에 있으므로 web 작업 없음.

---

## 9. 콘텐츠 카테고리 확정 ✅ (현 4종 유지)

- ✅ 4 카테고리 시드: general-blog / tech-blog / guides / case-studies
- ✅ 마음토스 4 제품과 default_program_id 매핑 (모두 transcribe로 폴백)
- 콘텐츠 전략 확장 시 신규 마이그레이션 003 추가

---

## 10. 인라인 style → Tailwind arbitrary value 통일 ✅ (대부분)

**Footer 14개 hex 마이그레이션 완료 — 2026-05-06.**

- ✅ Footer.tsx: 14개 hex inline style → `text-[var(--ink)]`, `text-[var(--brand-hover)]`, `border-[var(--line)]` 등 hifi 토큰
- ⏸ Header.tsx 모바일 패널 inline styles 일부 잔존 (안전성 동기 — `docs/refactor-deferred.md` §7 참조)

---

## 11. Vercel 배포 + 검색엔진 등록 ☐ (Low — 모든 phase 끝나고)

```bash
cd web
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add REVALIDATION_SECRET production
vercel env add INDEXNOW_KEY production
vercel deploy --prod
```

배포 후:
- Google Search Console + sitemap.xml 제출
- Naver Search Advisor + sitemap.xml 제출
- Bing Webmaster Tools + IndexNow 키 등록
- Lighthouse 검증 (LCP < 2.5s · INP < 200ms · CLS < 0.1)
- CSP report-only 1주 모니터 후 enforce 전환 (`docs/refactor-deferred.md` §3)

---

## 12. revalidate / indexnow API ✅

**완료 — 2026-05-06.**

- ✅ `app/api/revalidate/route.ts` — POST + REVALIDATION_SECRET (timingSafeEqual)
- ✅ `app/api/indexnow/route.ts` — GET=key, POST=indexnow.org 포워딩
- ✅ IndexNow 키 정적 파일 `public/{KEY}.txt`

---

## 진행 추적

| 항목 | 우선순위 | 상태 | 비고 |
|---|:---:|:---:|---|
| 0. Supabase 적용 | 🔴 | ✅ | 2026-05-06 |
| 1. og/favicon 자산 | 🔴 | ☐ | 디자이너 발주 |
| 2. Pretendard 로컬화 | 🔴 | ✅ | + 2026-05-06 weight 300 제거 |
| 3. 랜딩 11 섹션 | 🔴 | ✅ | monolith. 분할은 deferred §1 |
| 4. 제품 4종 상세 | 🟡 | ☐ | 현재 redirect 로 흡수 |
| 5. 폼 본 구현 | 🟡 | ⏸ | 카카오톡 오픈채팅 외부 redirect 운영 중 |
| 6. 블로그 시스템 | 🟡 | ✅ | 2026-05-06 |
| 7. 가격 4단 + 계산기 | 🟡 | △ | §09 안에 4 카드 / 계산기 미구현 |
| 8. 법무 본문 | 🟢 | ✅ | 외부 라우트로 통합 |
| 9. 카테고리 v2 | 🟢 | ✅ | 4 placeholder 유지 |
| 10. inline → tailwind | 🟢 | ✅ | Footer 마이그레이션 완료 / Header inline 일부 잔존 |
| 11. Vercel 배포 | 🟢 | ☐ | 정적 자산 + 콘텐츠 확보 후 |
| 12. revalidate/indexnow API | ⚪ | ✅ | 2026-05-06 |

> 우선순위: 🔴 High · 🟡 Mid · 🟢 Low · ⚪ Optional
> 상태: ✅ 완료 · △ 부분 완료 · ☐ 미진행 · ⏸ 결정 대기

## 차후 PR (별도 브랜치 권장)

- `feat/hifi-section-split` — HifiLanding 3,290줄 → sub-components (deferred §1)
- `feat/hifi-token-canonical` — hifi 잔여 토큰 reconcile (deferred §2)
- `chore/csp-enforce` — CSP report-only → enforce (deferred §3)
- `perf/font-variable` — Pretendard Variable woff2 단일 파일 (deferred §4)
- `perf/education-lcp` — /education hero priority (deferred §5)
- `chore/theme-utility-migration` — `text-[length:var(--t-*)]` → Tailwind utility (deferred §6)

자세한 spec: `docs/refactor-deferred.md`

---

## 참고 자료 (절대 변경 ❌ — 단일 진실 원본)

- `mindthos-landing-design/CLAUDE.md` — 마음토스 랜딩 작업 규칙
- `mindthos-landing-design/05-design/design-tokens.md` v1.2 — 디자인 토큰 단일 진실 원본
- `mindthos-landing-design/04-wireframes/final/wireframe-v2-final.html` — 와이어 lock-in
- `mindthos-landing-design/05-design/hifi/landing-v1-hifi.html` — 하이파이 작업본
- `blog-seo-template/` — 블로그 시스템 패키지 원본
- `andotherlife-web/` — 동일 패턴 best practice 레퍼런스
