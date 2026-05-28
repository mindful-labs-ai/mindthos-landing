# Bing Webmaster Tools — 인덱싱 점검 체크리스트

- **작성일**: 2026-05-27
- **목적**: ChatGPT Search 인용 트래픽 확보. 액션 플랜 **A4** 항목.
- **배경**: ChatGPT Search 는 Bing 인덱스를 그대로 사용한다. Bing 에 색인 안 된 페이지는 Google 1위라도 ChatGPT 답변에서 자동 제외된다.

---

## 사전 상태

- `web/app/layout.tsx` 에 Bing 사이트 소유 확인 메타 태그(`msvalidate.01`)는 이미 박혀있음 (2026-05-07 작업).
- `web/app/api/indexnow/route.ts` IndexNow 라우트 + `public/{KEY}.txt` 키 검증 파일 존재.
- `scripts/publish-blog/src/publish.ts` 발행 시 IndexNow ping 자동 호출.

**즉 verification·IndexNow 인프라는 OK**. 빠진 단계는 **Bing Webmaster Tools 에서 sitemap 을 실제로 제출했는가** + **색인 카운트가 정상인가** 점검.

---

## 점검 절차 (30분, 1회성)

### 1. Bing Webmaster Tools 로그인
- URL: https://www.bing.com/webmasters/
- Microsoft 계정 (mindthos 운영 계정) 로그인.
- `mindthos.com` 사이트가 등록되어 있는지 확인.
  - **없으면**: "Add a site" → `https://mindthos.com` 입력 → "Already verified" 옵션 선택 (메타 태그 이미 박혀있음) → 즉시 등록.

### 2. Sitemaps 섹션 확인
- 좌측 메뉴 → **Sitemaps**
- 등록 목록에 `https://mindthos.com/sitemap.xml` 있는지 확인.
  - **없으면**: 우상단 "Submit sitemap" → 위 URL 입력 → 제출.
- Last Submitted / Last Crawled / URLs Submitted / URLs Indexed 컬럼 메모.

### 3. 색인 상태 비교
- 좌측 메뉴 → **Site Explorer** 또는 **Search Performance**
- Bing 색인 페이지 수 확인.
- Google Search Console 의 색인 페이지 수와 비교.
- **차이가 크면(예: Bing 50% 미만) 이슈 신호**:
  - robots.txt 변경 사항(A1 결과) 24-48시간 후 재크롤 대기
  - 또는 수동 URL Submission 으로 우선순위 페이지 강제 제출 (1일 10건 한도)

### 4. URL Inspection — 핵심 페이지 5건
다음 URL 을 하나씩 입력해서 색인 상태 확인:
- `https://mindthos.com/`
- `https://mindthos.com/blog`
- `https://mindthos.com/security`
- `https://mindthos.com/education`
- 인기 블로그 글 2-3건 (GSC clicks 상위)

각 URL 의 상태:
- ✅ Indexed → OK
- ⚠️ Discovered but not indexed → 컨텐츠 품질 / 내부 링크 점검
- ❌ Not found / blocked → robots.txt 또는 noindex 확인

### 5. IndexNow 상태 확인
- 좌측 메뉴 → **IndexNow** (있는 경우)
- 최근 ping 수 / 성공률 확인.
- 발행할 때마다 publish.ts 의 IndexNow ping 이 도달하는지 검증.

### 6. Bingbot 크롤 통계
- 좌측 메뉴 → **Crawl Information** / **Crawl Stats**
- 최근 30일 Bingbot 방문 수.
- 갑작스러운 0 또는 급감 → robots.txt 회귀 / 호스트 오류 의심.

---

## 액션 트리거 기준

| 신호 | 조치 |
|------|------|
| Bing 색인 < Google 색인의 50% | 색인 미반영 URL 일괄 정리 후 수동 Submit (1일 10건 한도) |
| URL Inspection "Discovered but not indexed" 5건 이상 | 해당 페이지 내부 링크 보강 + 컨텐츠 깊이 점검 |
| Bingbot 30일 방문 < 100 | robots.txt 및 서버 로그 분석 (방화벽 차단 의심) |
| IndexNow 성공률 < 80% | `web/app/api/indexnow/route.ts` 로그 + `INDEXNOW_KEY` env 확인 |

---

## 분기 점검

- **매 분기 1회**: Sitemap 재제출 + 색인 카운트 비교.
- **신규 글 50건 발행마다**: URL Inspection 으로 발행 글 표본 5건 색인 확인.
- **2026-05-21 코어 업데이트 영향 확인 (6월 초)**: 변동 페이지 Bing 색인 상태도 함께 확인 (Google 변동이 Bing 에 파급되는지).

---

## 참고

- A1 (robots.ts 변경) 후 Bing 반영까지 24-48시간 소요.
- ChatGPT Search 의 fan-out 쿼리는 Bing 인덱스에서 자체적으로 fetch 됨 — Google 에만 의존하면 ChatGPT 답변 인용 풀에서 영구 배제.
- 리서치 노트: `web/docs/aeo-geo-research/10-ai-bot-robots-txt-configuration.md`
