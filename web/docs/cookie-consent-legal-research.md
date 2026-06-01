# 쿠키 동의 배너: 법적 리스크와 필요성 리서치

> 작성일: 2026-05-19 · 관련 문서: [`google-ads-consent-mode.md`](./google-ads-consent-mode.md)
> 배경: "해외 사이트는 항상 쿠키 배너가 뜨는데 국내는 거의 없는 이유가
> 법적 이유인지 관행(스킬) 이유인지" 팀 슬랙 질문에 대한 리서치.

---

## 결론 먼저 (3줄)

- **EU/영국**: 비필수 쿠키는 설치 *전* 옵트인 동의가 **법적 의무** →
  안 하면 명백한 위법, 거액 과징금. 그래서 "의무처럼" 보임.
- **미국**: 배너 자체는 법 명시 의무 **아님**(옵트아웃 모델). 단 "고지 +
  판매/공유 거부" 의무를 채우는 가장 실용적 수단이라 다는 것 + EU 트래픽
  때문에도 닮.
- **한국**: 의외로 법문상으론 **EU에 가까운 옵트인**(식별가능 행태정보
  쿠키 = 개인정보, 사전 동의 대상). 배너가 드문 건 "법이 없어서"가 아니라
  **집행·관행 차이** — 그리고 2026 개정법으로 리스크가 커지는 추세.

---

## 1. EU/영국 — 사실상 의무인 이유

- 근거 법: **ePrivacy Directive(2002/58/EC)** 가 "단말기에 정보 저장·접근
  전 사전 동의" 의무를 만들고, **GDPR** 이 "유효한 동의"의 기준(자유롭게·
  구체적·사전·명확, 사전 체크박스·묵시 동의 불가)을 정의.
- **비필수 쿠키(광고·분석)는 깔리기 *전에* 옵트인 동의가 없으면 위법.**
  "계속 탐색 시 동의 간주", "Accept만 크게 + Reject 숨김"도 무효.
- 제재가 실제로 셉니다: 2025년 프랑스 CNIL이 하루에 **구글 €3.25억 +
  Shein €1.5억** 쿠키 위반 과징금. 상한은 전 세계 매출 4% 또는 €2천만.
- → EU 대상 사이트가 "거의 의무처럼" 배너를 다는 건, **실제로 의무이기
  때문.**

## 2. 미국 — "안 하면 불법?" → 배너 자체는 아님

- CCPA/CPRA 등 미국 주법은 **옵트아웃 모델**: 동의를 *전제*하고, 사용자가
  "내 정보 판매/공유 거부(Do Not Sell or Share)" 할 수 있게만 하면 됨.
- **법이 "쿠키 배너를 달아라"라고 명시하진 않음.** 다만 ⓐ 수집 시점 고지
  ⓑ 옵트아웃 수단 제공이 의무라, 이를 충족하는 가장 현실적 방법이 배너.
  고지·옵트아웃 미제공은 위법 소지.
- 미국 사이트가 EU/영국 방문자도 받으면 그쪽 옵트인 기준 때문에 결국
  배너를 닮(글로벌 사이트가 다 다는 이유).
- → "미국도 거의 의무처럼" = **법 명시 의무는 아니고, 고지·옵트아웃 의무
  + EU 동시 대응 때문에 사실상 표준화**된 것.

## 3. 한국 — 핵심 반전: 법은 더 엄격한데 배너는 드물다

- **법문상**: PIPA는 처리 근거의 기본이 **옵트인 동의**(사전·명시·구체).
  식별 가능하거나 행태정보가 개인 식별 수준이면 **쿠키도 개인정보** →
  사전 동의 대상. "일단 깔고 나중에 옵트아웃"은 PIPA상 불충분.
  **즉 법문만 보면 한국이 미국보다 엄격하고 EU에 가까움.**
- **그런데 왜 국내 사이트엔 배너가 드문가 (법적 vs 관행)** →
  **둘 다 아니고 "집행·관행" 차이**:
  - 한국 규제·집행은 전통적으로 **회원가입/서비스 이용 시점의
    "개인정보 수집·이용 동의"**, 해외이전, 민감·고유식별정보에 집중.
    쿠키 단위 배너 문화·집행이 EU만큼 정착하지 않음.
  - 맞춤형 광고는 방통위 **「온라인 맞춤형 광고 개인정보보호
    가이드라인」** 상 통제권(옵트아웃) 제공 중심으로 운영돼 옴.
  - 결과적으로 "배너 부재 자체로 대규모 제재" 사례가 EU만큼 두드러지지
    않아 관행적으로 안 달아 온 것 — **법이 면제해줘서가 아님.**
- **추세 주의**: 2026.3 개정 PIPA가 2026.9.11 시행되며 과징금 강화,
  **픽셀·SDK·쿠키 행태정보 수집이 개인정보보호위원회(PIPC) 감독
  초점**으로 부상 중. 국내도 리스크가 커지는 방향.

---

## 4. 우리 사이트(A안: 배너 없음) 리스크 평가

| 대상 | 현재 A안 리스크 | 판단 |
|---|---|---|
| 국내 트래픽 중심 | 법문상 위반 소지 **존재**(식별가능 행태정보 쿠키 사전 동의 미수). 단 현재까지 배너 부재 단독 대규모 제재는 적었음 | **중간·상승 추세** — 당장 급박하진 않으나 개정법으로 커짐 |
| EU/영국 유입 | 비필수 쿠키 사전 동의 미수 = **명백 위법** | EU 광고/유입 발생 시 **즉시 B안 필요** |
| 미국 유입 | 고지·옵트아웃 미제공 시 소지 | 보통 EU 대응에 흡수됨 |

→ [`google-ads-consent-mode.md`](./google-ads-consent-mode.md) 권고와 일치:
**국내 한정·트래픽 작을 땐 A안 유지 가능하나, EU 유입/트래픽·리스크
확대 시 동의 배너(B안) 전환이 정답.** 특히 **2026.9 개정 PIPA 시행 전
재검토 권장.**

---

## 5. 권고 요약

1. **현 시점(국내 타겟, 트래픽 초기)**: A안(배너 없음 + Consent Mode v2
   granted) 유지 가능. 단 "리스크 없음"이 아니라 "관행상 제재 가능성 낮음"
   임을 인지.
2. **트리거 발생 시 B안(동의 배너 + 실제 Consent Mode) 전환**:
   - EU/영국 광고 집행 또는 유의미한 해외 유입 발생
   - 2026.9.11 개정 PIPA 시행 도래
   - 광고용 픽셀/SDK(메타 픽셀 등) 비중 확대
3. B안 작업 범위: 동의 배너 UI + 카테고리(필수/분석/광고) 선택 +
   Consent Mode `update` 연동 + 개인정보처리방침 쿠키 항목 보강.

---

## Sources

- [iubenda — Cookies and the GDPR: What's Really Required?](https://www.iubenda.com/en/help/5525-cookies-gdpr-requirements/)
- [Consenteo — GDPR Cookie Consent in 2026 (ePrivacy, enforcement)](https://www.consenteo.com/knowledge-hub/GDPR/gdpr_cookie_consent_2026)
- [CookieYes — US Cookie Consent Requirements Explained](https://www.cookieyes.com/blog/us-cookie-consent-requirements/)
- [Osano — CCPA Cookie Consent Compliance](https://www.osano.com/articles/ccpa-cookie-consent)
- [Baker McKenzie — South Korea: Cookies, Online Tracking and Direct Marketing](https://resourcehub.bakermckenzie.com/en/resources/global-data-and-cyber-handbook/asia-pacific/south-korea/topics/cookies-online-tracking-and-direct-marketing)
- [CookieHub — PIPA South Korea Cookie Consent & Compliance Guide](https://www.cookiehub.com/pipa)
- [ICLG — Data Protection Laws and Regulations: Korea 2024-2025](https://iclg.com/practice-areas/data-protection-laws-and-regulations/korea)
- [방송통신위원회 — 온라인 맞춤형 광고 개인정보보호 가이드라인 (PDF)](https://kcc.go.kr/download.do?fileSeq=49004)

> ⚠️ 본 문서는 공개 자료 기반 리서치 요약이며 법률 자문이 아닙니다.
> 실제 컴플라이언스 결정 전 개인정보 전문 변호사 검토를 권장합니다.
