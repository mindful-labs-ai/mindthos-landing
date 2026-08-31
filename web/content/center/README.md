# 센터 도입 소개서 덱 (콜드메일 전용)

`/center/v1` `/center/v2` `/center/v3` 에서 서빙되는 완전 자립형 단일 HTML.
서빙 로직: `app/center/[version]/route.ts` — 파일을 그대로 읽어 `</head>` 직전에
noindex·OG 타이틀·GA4(center_view) 만 주입한다. **이 폴더의 HTML 은 절대 손으로
수정하지 않는다.**

## 원본 (마케팅 레포 — 읽기·복사만)

`mindthos-marketing/campaigns/mindthos-prod/creatives/b2b-proposal/dist/`

| 경로 | 버전 | 원본 |
|---|---|---|
| /center/v1 | V1 시범 운영 | `V1_시범운영/proposal-deck.html` |
| /center/v2 | V2 AirPods 패키지 | `V2_에어팟/proposal-deck.html` |
| /center/v3 | V3 홈페이지 패키지 | `V3_홈페이지/proposal-deck.html` |

## 오퍼 변경 시 교체 절차

마케팅 쪽이 dist 를 재빌드하면, 해당 파일을 같은 이름으로 덮어쓰고 배포하면 끝:

```bash
SRC=~/Documents/GitHub/mindthos-marketing/campaigns/mindthos-prod/creatives/b2b-proposal/dist
cp "$SRC/V1_시범운영/proposal-deck.html" v1.html
cp "$SRC/V2_에어팟/proposal-deck.html"   v2.html
cp "$SRC/V3_홈페이지/proposal-deck.html" v3.html
```

## 콜드메일 링크 포맷

```
https://mindthos.com/center/v{n}?utm_source=coldmail&utm_medium=email&utm_campaign=b2b-pilot-2026q3&utm_content={배치}&r={수신자ID}
```

`r` 은 GA4 `center_view` 이벤트 파라미터로만 수집되고 화면에는 노출되지 않는다.
