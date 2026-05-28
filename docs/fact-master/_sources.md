# 신뢰 Source Whitelist

Master doc 작성·갱신 시 AI 가 fetch 가능한 권위 출처 목록.
1차 출처(Tier 1)만 master 의 `sources_consulted` 에 등재.

---

## 한국 — 상담사 실무 영역 (Tier 1)

### 자격 관리 기관
| 기관 | URL | 관할 자격증 |
|------|-----|------------|
| 한국임상심리학회 (KCP) | https://www.kcp.or.kr/ | 임상심리전문가 |
| 한국상담심리학회 (KCPA) | https://krcpa.or.kr/ | 상담심리사 1·2급 |
| 한국상담학회 | https://counselors.or.kr/ | 전문상담사 1·2급, 학교/가족/교정 등 분과 |
| 한국정신건강사회복지학회 | https://www.kamhsw.or.kr/ | 정신건강사회복지사 |
| 한국청소년상담복지개발원 | https://www.kyci.or.kr/ | 청소년상담사 (여성가족부 위탁) |
| 한국산업인력공단 (Q-Net) | https://www.q-net.or.kr/ | 임상심리사 1·2급 국가자격 |

### 법령·정책·공식 공지
| 기관 | URL | 비고 |
|------|-----|------|
| 법제처 국가법령정보센터 | https://www.law.go.kr/ | 정신건강복지법·청소년복지지원법 등 현행 조문 |
| 보건복지부 정신건강정책과 | https://www.mohw.go.kr/ | 정신건강증진사업 안내, 바우처 |
| 국립정신건강센터 | https://www.ncmh.go.kr/ | 위기상담 표준 절차, 자살예방 가이드라인 |
| 자살예방백서 / 한국생명존중희망재단 | https://www.kfsp.or.kr/ | 자살 위기 평가·개입 |
| 여성가족부 | https://www.mogef.go.kr/ | 청소년상담복지센터, 청소년상담사, 1388 |
| 근로복지공단 EAP | https://www.kcomwel.or.kr/ | 근로자 지원 프로그램 (EAP) 가이드라인 |
| 보건복지부 복지로 | https://www.bokjiro.go.kr/ | 정신건강 심리상담 바우처 신청 정보 |

---

## 한국 — 조건/장애 영역 (Phase 3 master 작성 시)

| 기관 | URL |
|------|-----|
| 대한신경정신의학회 | https://www.knpa.or.kr/ |
| 대한소아청소년정신의학회 | https://www.kacap.or.kr/ |
| 대한정신건강의학과의사회 | http://www.onmaum.com/ |
| KDCA (질병관리청, 정신건강 통계) | https://www.kdca.go.kr/ |

---

## 국제 (Tier 1)

| 기관 / 자료 | URL / 출처 |
|------------|-----------|
| DSM-5-TR | American Psychiatric Association (2023) |
| ICD-11 | https://icd.who.int/ |
| NICE Guidelines | https://www.nice.org.uk/ |
| NIMH | https://www.nimh.nih.gov/ |
| CDC Mental Health | https://www.cdc.gov/mentalhealth/ |
| WHO Mental Health | https://www.who.int/health-topics/mental-health |
| Cochrane Reviews | https://www.cochranelibrary.com/ |
| APA (American Psychological Association) | https://www.apa.org/ |
| Columbia Lighthouse Project (C-SSRS) | https://cssrs.columbia.edu/ |

---

## 학술 DB

| DB | URL | 비고 |
|----|-----|------|
| PubMed | https://pubmed.ncbi.nlm.nih.gov/ | 영문 학술 |
| KISS | https://kiss.kstudy.com/ | 한국학술정보 |
| RISS | https://www.riss.kr/ | 한국교육학술정보원 |
| KCI | https://www.kci.go.kr/ | 한국학술지인용색인 |

---

## 차단 출처 (master 인용 ❌)

- 위키피디아 — 직접 인용 금지. (출처 추적용으로만 사용 OK)
- 일반 health 블로그·매체 (헬스조선·코메디닷컴·웹MD 한국 등)
- 광고성 의료기관 사이트
- Reddit, 네이버 카페·블로그, 익명 커뮤니티
- 위 Tier 1 기관이 아닌 사기업 / 단체의 자체 가이드
- 출판 연도 5년 초과 자료 (특정 토픽은 더 짧음 — 통계는 2년)

---

## 갱신 시 검증 절차

1. 각 master 의 `sources_consulted` URL 들이 200 응답을 주는가? (dead link 검출)
2. 같은 URL 에서 본문이 변경됐는가? (diff 검출)
3. 새 가이드라인 발표·법령 개정 사실이 있는가? (외부 모니터링)
4. Tier 1 외 출처가 슬쩍 추가됐는가? (whitelist 위반 검출)
