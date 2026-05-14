# Naver 회원가입 전환 추적 — 앱 팀 핸드오프

> 작성일: 2026-05-14
> Owner: 마케팅 + 앱 개발팀 공동
> 관련 PR: 랜딩 — `web/app/layout.tsx`, `web/components/layout/CtaTracker.tsx`

## 배경

네이버 검색광고의 "회원가입(`sign_up`)" 전환을 정확히 측정하려면 **실제 가입이 완료된 시점**(서버 응답 200 OK 이후)에 `wcs.trans({ type: 'sign_up' })` 가 발사되어야 합니다.

랜딩(`mindthos.com`)은 이미 PV 스크립트 + `custom001`("signup_click" 라벨, CTA 클릭 의도) 발사가 설치되어 있지만, 실제 회원가입 완료는 `app.mindthos.com` 도메인에서 발생하므로 **앱 측에서 추가 작업이 필요**합니다.

## 이벤트 분리

| 이벤트 | 발사 위치 | 의미 | 측정 가치 |
|---|---|---|---|
| `custom001` (라벨: signup_click) | `mindthos.com` (랜딩) | "무료 시작" CTA 클릭 | 광고 → 클릭 깔때기 (상단) |
| `sign_up` | `app.mindthos.com` (앱) — **이 핸드오프 범위** | 실제 가입 완료 | 광고 → 최종 전환 (하단) |

두 이벤트가 동시에 존재해야 네이버 콘솔에서 "클릭 의도 vs 실제 가입" 깔때기 분석이 가능합니다.

## 앱 팀 작업 체크리스트

### 1. AccountId 공유

- **AccountId**: `s_bfc366d6236`
- 랜딩의 `NEXT_PUBLIC_NAVER_WCS_ID` 와 동일한 값을 사용해야 동일 사이트로 집계됩니다.
- 환경별로 다른 값 사용 ❌ (광고 데이터가 분산됨).

### 2. `wcslog.js` 로드

앱 도메인(`app.mindthos.com`)의 공통 영역(루트 레이아웃 / `_app.tsx` / 공용 head)에 PV 스크립트 설치:

```html
<script type="text/javascript" src="//wcs.naver.net/wcslog.js"></script>
<script type="text/javascript">
  if (!wcs_add) var wcs_add = {};
  wcs_add["wa"] = "s_bfc366d6236";
  if (window.wcs) {
    wcs.inflow("mindthos.com");  // ← 1차 도메인 통일 필수
    wcs_do();
  }
</script>
```

**중요:** `wcs.inflow("mindthos.com")` 의 인자는 랜딩과 **동일**해야 합니다. 서로 다르면 `NACOOKIE` 가 분리되어 광고 클릭 → 가입 전환 매칭이 끊깁니다.

### 3. 가입 완료 시점에 `sign_up` 발사

회원가입 API 응답 200 OK 직후 (혹은 가입 완료 페이지 렌더 시) 호출:

```ts
declare global {
  interface Window {
    wcs?: {
      trans: (conv: Record<string, unknown>) => void;
      inflow: (domain?: string) => void;
    };
    wcs_add?: Record<string, string>;
  }
}

export function trackNaverSignupComplete(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.wcs?.trans !== 'function') return;
  if (!window.wcs_add) window.wcs_add = {};
  window.wcs_add['wa'] = 's_bfc366d6236';
  window.wcs.trans({ type: 'sign_up' });
}
```

**발사 위치 권장 우선순위:**
1. **서버에서 가입 처리 → 클라이언트가 완료 응답 받은 직후** (가장 정확).
2. 가입 완료 페이지 (`/welcome` 등) `useEffect` 1회. (라우팅 기반 추적)
3. ⚠️ 가입 폼 submit 직전 ❌ — 실패해도 전환 카운트되어 부풀려짐.

### 4. 중복 발사 방지

SPA 라우팅 / 페이지 새로고침으로 동일 사용자가 여러 번 발사되지 않도록:

- **세션 스토리지 가드**: `sessionStorage.getItem('naver_signup_fired')` 체크 후 1회만 발사.
- 또는 서버에서 가입 직후 1회만 반환되는 플래그 응답 기반.

```ts
const KEY = 'naver_signup_fired';
if (typeof window !== 'undefined' && !sessionStorage.getItem(KEY)) {
  trackNaverSignupComplete();
  sessionStorage.setItem(KEY, '1');
}
```

### 5. CSP 허용

앱의 Content-Security-Policy 헤더에 다음 origin 이 포함되어야 합니다 (랜딩과 동일):

- `script-src`: `wcs.naver.net`
- `connect-src` / `img-src`: `wcs.naver.net`, `wcs.naver.com`

### 6. 검증 (배포 후)

1. **DevTools Network 탭**: 가입 완료 시점에 `wcs.naver.net/m?...&type=sign_up&...` 요청 200 응답 확인.
2. **NACOOKIE 검증**: `app.mindthos.com` 의 `Application > Cookies` 에서 `NACOOKIE` 도메인이 `.mindthos.com` (앞에 점) 으로 설정되었는지 확인. 점이 없으면 inflow 인자가 다른 것.
3. **네이버 검색광고 콘솔**: 30분 ~ 수시간 후 "회원가입(sign_up)" 전환 카운트 증가 확인.
4. **광고 클릭 → 가입 매칭**: 네이버 검색광고로 유입된 세션이 가입 완료까지 가는 비율 확인 (`custom001` 발사량 대비 `sign_up` 발사량).

### 7. NHN Data 통지

설치 완료 후 NHN Data 측 정상 수집 확인 요청:

- 채널톡: <https://navercts.channel.io/home>
- Email: <navercts@nhndata.com>
- 통지 내용: "mindthos.com (랜딩) + app.mindthos.com (가입) 양 도메인 모두 wcs 설치 완료, AccountId s_bfc366d6236"

## 트러블슈팅

| 증상 | 원인 후보 | 점검 |
|---|---|---|
| 가입은 발생하는데 전환 0 | `wcs.inflow` 인자 불일치 | 양 도메인 모두 `"mindthos.com"` 인지 확인 |
| `wcs is undefined` 에러 | 스크립트 로드 전 호출 | `typeof window.wcs?.trans === 'function'` 가드 확인 |
| 전환수가 가입자 수보다 많음 | 중복 발사 | `sessionStorage` 가드 추가 (위 §4) |
| 네이버 광고 미유입 사용자도 전환 | 정상 — 모든 가입을 sign_up 으로 기록 (광고 매칭은 네이버 측에서 NACOOKIE 로 자동 필터) | 추가 작업 불필요 |

## 참고

- 가이드: <https://navercts.gitbook.io/guide/script_guide>
- 공식 문서: <https://naver.github.io/conversion-tracking/>
- 랜딩 측 PV 설치 위치: `web/app/layout.tsx:162-180`
- 랜딩 측 클릭 전환 (`custom001`) 설치 위치: `web/components/layout/CtaTracker.tsx`
