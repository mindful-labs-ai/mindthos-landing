# SEO 색인 복구 — 랜딩/블로그 마이그레이션 후 (2026-05-19)

마이그레이션 후 블로그 글 다수가 색인되지 않던 문제의 진단·수정·검증 기록.
단일 진실 원본 — 후속 추이 측정 시 이 문서를 먼저 확인.

## 1. 증상

GSC 커버리지 드릴다운(2026-05-19) 기준:

| 버킷 | 건수 | 도메인 | 최종 크롤링 |
|---|---|---|---|
| 발견됨 – 색인 안 됨 | ~388 | `www` | `1970-01-01` (미크롤링) |
| 크롤링됨 – 색인 안 됨 | ~132 | `www` | 2026-05-17 |
| 리디렉션이 포함됨 | ~251 | `non-www` | 2026-05-17 |

GSC 사이트맵: `https://mindthos.com/sitemap.xml` (non-www) 894 제출 / **0 색인**.

## 2. 근본 원인 (증거 기반)

### 원인 1 — 블로그 글 100개만 정적 생성 🔴 (최대 원인)
- `web/app/sitemap.ts`는 발행글 **전체(~907)** 를 사이트맵에 노출 → Google이 전부 발견.
- `web/app/(site)/blog/[slug]/page.tsx`의 `generateStaticParams()`가
  `getPublishedPosts({ perPage: 100 })` → **빌드 시 100개만 정적 생성**.
- `dynamicParams = true` → 나머지 ~800개는 첫 요청 시 콜드 SSR
  (Supabase + 마크다운 처리 = 실측 **3.4초**).
- Googlebot이 느린 응답을 만나 크롤 속도를 스로틀링 → 수백 건이
  "발견됨 – 미크롤링" 상태로 적체. → 발견됨 388 + 크롤링됨 미색인 132의 직접 원인.

### 원인 2 — non-www → www 가 307 임시 리다이렉트 🔴
- 미들웨어·next.config에 www 리다이렉트 없음 → Vercel 도메인 자동 리다이렉트가
  **307(임시)** 로 동작. 307은 Google에 "임시, 원래 URL 유지" 신호 →
  도메인 신호 통합 지연, non-www 251건이 "리디렉션 포함"에 적체.

### 원인 3 — GSC에 non-www 사이트맵 제출
- 제출된 사이트맵이 non-www(자체 307 리다이렉트). 894 제출 / 0 색인.

### 원인 4 — 마이그레이션 리다이렉트 전부 `permanent: false`
- `next.config.ts`의 콘텐츠 이전 경로(`/resources*` 등)가 307 → 구 URL 신호 미전달.

### 정상 확인된 항목 (문제 아님)
- 블로그 페이지: HTTP 200, self-canonical(www), `robots: index,follow`,
  SSR 본문 정상(`<article>` 존재), robots.txt 크롤 허용.

## 3. 수정 내역

| ID | 작업 | 위치 | 담당 |
|---|---|---|---|
| P0-A | `generateStaticParams` → 발행글 전체 slug 정적생성 (경량 `select('slug')`) | `web/app/(site)/blog/[slug]/page.tsx` | 코드 |
| P0-B | non-www → www 를 308 영구 리다이렉트로 | Vercel Dashboard > Domains | 수동 |
| P1-A | GSC 사이트맵 `www`로 교체 + non-www 삭제 | Search Console API | API |
| P1-B | 콘텐츠 이전(내부) 10건 → `permanent: true`(301), 외부 8건 307 유지 | `web/next.config.ts` | 코드 |

커밋: `f68c1f8` → `main` 머지 `43b9a98`.
변경 파일: `web/app/(site)/blog/[slug]/page.tsx`, `web/next.config.ts`.

> `permanent: false` 유지 대상(의도적): `/guide`·`/resources/guides`(Notion),
> `/contact*`·`/inquiry`·`/for-institutions`(카카오), `/security/privacy-policy`·
> `/security/terms`(app.mindthos.com). 외부 목적지라 임시 유지.

## 4. 검증 결과 (배포 후 2026-05-19)

**정적 캐싱 (핵심 개선)**

| 페이지 | 이전 | 현재 (cache HIT) |
|---|---|---|
| 10-year-counselor-advice | 3.4s / MISS | 0.09s / HIT |
| adlerian-insight-… | 3+s / MISS | 0.07s / HIT |

빌드: `921/921` 정적 생성, `/blog/[slug]` = SSG (이전 100 → 전체 ~907), typecheck 통과.

**리다이렉트**: apex→www 308, `/resources`→`/blog` 308,
`/resources/blog/{slug}`→`/blog/{slug}` 308. 모두 영구.

**Google 색인 판정 (배포 직후 기준선)**

| 페이지 (CSV 출처) | 상태 |
|---|---|
| adlerian-insight (← 크롤링됨 미색인) | ✅ Submitted and indexed (전환됨) |
| eriksons-psychosocial (퀵윈) | ✅ Submitted and indexed |
| clinical-counseling-guide (상위글) | ✅ Submitted and indexed |
| 10-year-counselor-advice (← 발견됨 미색인) | ⏳ Discovered – not indexed (재크롤링 대기) |

## 5. 남은 작업 / 후속

- [ ] **GSC UI**: 색인>페이지 보고서 3개 이슈에서 각각 "수정 확인(Validate Fix)" 클릭
      (API 불가, UI 전용). 색인 API는 채용/동영상 전용이라 블로그 일괄 색인요청 불가.
- [ ] (선택) 핵심 글 URL 검사 → "색인 생성 요청"
- [ ] **2026-06-02경(1~2주 후)** 색인 추이 재조회로 정량 효과 측정
      — 발견됨/크롤링됨 미색인 건수 감소, 사이트맵 indexed 카운트 상승 확인

## 6. GSC 데이터 조회 환경 (재사용)

`claude-seo:seo-google` 스킬 + OAuth (Tier 1).

- 설정: `~/.config/claude-seo/google-api.json`
  (`oauth_client_path` = 재사용한 "BigQuery Claude MCP" 웹 클라이언트,
  `default_property: sc-domain:mindthos.com`)
- 토큰: `~/.config/claude-seo/oauth-token.json` (자동 갱신)
- 스크립트: `~/.claude/plugins/cache/agricidaniel-seo/claude-seo/1.8.0/scripts/`
  (`gsc_query.py`, `gsc_inspect.py`, `google_auth.py`)
- 재인증 필요 시: `bash ~/.config/claude-seo/auth.sh` (브라우저 동의 1회)
- 사이트맵 submit/delete는 스킬 미지원 → `google_auth.get_oauth_credentials`로
  `searchconsole` API 직접 호출(쓰기 스코프 `webmasters` 보유).
