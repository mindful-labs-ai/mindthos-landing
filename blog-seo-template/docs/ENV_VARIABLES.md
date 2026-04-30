# Environment Variables

`.env.local` (Next.js dev/prod) 환경변수.

## 필수 (Supabase)

```bash
# Supabase 프로젝트 설정 (Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                       # 클라이언트/서버 모두 사용
SUPABASE_SERVICE_ROLE_KEY=eyJ...                           # 서버 액션/어드민 전용 (RLS 우회)
```

`SUPABASE_SERVICE_ROLE_KEY`는 어드민 페이지나 서버 액션에서 RLS를 우회해야 할 때만 사용. 일반 페이지 렌더는 ANON_KEY로 충분 (RLS 정책이 발행 글만 노출).

## 사이트 설정

```bash
# 사이트 기본 정보 (constants/site.ts에서 폴백 기본값 있음)
NEXT_PUBLIC_SITE_URL=https://example.com                   # 절대 URL, 끝에 / 없이
NEXT_PUBLIC_SITE_EMAIL=hello@example.com
NEXT_PUBLIC_SITE_PHONE=02-1234-5678

# 소셜 채널 (Organization Schema의 sameAs에 자동 포함)
NEXT_PUBLIC_KAKAO_CHANNEL=https://pf.kakao.com/_xxxxx
NEXT_PUBLIC_NAVER_BLOG=https://blog.naver.com/xxx
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/xxx
```

## 분석 (선택)

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Meta(Facebook) Pixel
NEXT_PUBLIC_META_PIXEL_ID=1234567890

# 검색엔진 사이트 소유권 (layout.tsx의 metadata.verification에 채움)
# Google Search Console, Naver Search Advisor에서 발급받은 키
```

## ISR 수동 갱신 (선택)

```bash
# /api/revalidate 호출 시 검증할 시크릿 (32자 이상 랜덤)
REVALIDATION_SECRET=...

# IndexNow 키 (Bing/Yandex 즉시 인덱싱)
INDEXNOW_KEY=...
```

`INDEXNOW_KEY`는 `public/${INDEXNOW_KEY}.txt` 파일로도 노출되어야 합니다 (Bing이 검증). 또는 `/api/indexnow` GET 핸들러가 응답하므로 별도 파일 불필요.

## 검증 매트릭스

| 환경변수 | 위치 | 필수 / 선택 | 미설정 시 |
|---------|------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client/server/static | 필수 | 빌드/런타임 실패 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 동일 | 필수 | 빌드/런타임 실패 |
| `SUPABASE_SERVICE_ROLE_KEY` | 어드민/서버 액션 | 어드민 사용 시 필수 | RLS 차단으로 INSERT/UPDATE 실패 |
| `NEXT_PUBLIC_SITE_URL` | sitemap.ts, robots.ts, schema.ts | 권장 | constants/site.ts 폴백 |
| `NEXT_PUBLIC_GA_ID` | layout.tsx | 선택 | GA4 스크립트 미로드 |
| `NEXT_PUBLIC_META_PIXEL_ID` | layout.tsx | 선택 | Pixel 스크립트 미로드 |
| `REVALIDATION_SECRET` | api/revalidate/route.ts | 선택 | 401 반환 |
| `INDEXNOW_KEY` | api/indexnow/route.ts | 선택 | 폴백 키 응답 |

## .env.local 예시

```bash
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# === Site ===
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SITE_EMAIL=hello@example.com
NEXT_PUBLIC_SITE_PHONE=02-1234-5678

# === Analytics ===
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890

# === ISR / IndexNow ===
REVALIDATION_SECRET=<32+ chars random>
INDEXNOW_KEY=<32+ chars random>
```

## Vercel 환경변수 동기화

```bash
# 로컬 → Vercel 푸시
vercel env pull .env.local

# Vercel에 추가 (production)
vercel env add NAME production
```

`NEXT_PUBLIC_*` prefix가 붙은 변수만 클라이언트 번들에 포함됩니다. 그 외는 Server-only.
