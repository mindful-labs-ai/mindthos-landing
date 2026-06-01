# 마음토스 내부 링크 맵

## 1. 사이트 핵심 구조

```
mindthos.com/
├── /                        랜딩 (11 섹션 monolith)
├── /blog                    블로그 목록
│   └── /blog/[slug]         개별 글 (카테고리 prefix 없음)
├── /security                보안 페이지
├── /academy                 전문상담사 2급 올인원 패스
└── /api/{revalidate,indexnow}

외부 (CTA · 행동 유도)
├── app.mindthos.com         가입 / 제품 사용 (free-trial 유입)
├── open.kakao.com/me/Mindthos   카카오톡 오픈채팅 (institution-inquiry · 일반 문의)
└── rare-puppy-06f.notion.site  Notion 사용 가이드 (/guide /resources/guides 리다이렉트)

리다이렉트 (참고)
├── /counseling, /contact, /inquiry, /for-institutions  →  KAKAO_INQUIRY_URL
├── /product, /product/*                                 →  /
├── /pricing                                              →  /#pricing
├── /resources, /resources/*                              →  /blog 또는 Notion
└── /security/{privacy-policy,terms}                      →  app.mindthos.com/terms
```

마음토스 블로그 URL 은 **카테고리 prefix 없음**. `/blog/[slug]` 직격.

---

## 2. 카테고리별 CTA 매핑

| 카테고리 | 주 CTA (`cta_type`) | 본문 자연 링크 후보 |
|---------|------------------|-------------------|
| case-conceptualization | `free-trial` (사례개념화 AI) | 같은 카테고리 글, training |
| counseling-skills | `free-trial` (축어록·진행기록) | 같은 카테고리 글, case-conceptualization |
| training | `free-trial` (수련 시간 기록) | counseling-skills, career |
| career | `newsletter` 또는 `free-trial` | training, operations |
| operations | `free-trial` 또는 `institution-inquiry` | counseling-skills, trends |
| self-care | `newsletter` | counseling-skills |
| trends | `newsletter` | 모든 카테고리 |
| tech-blog | `free-trial` 또는 `institution-inquiry` | 보안 페이지(`/security`), counseling-skills |

`cta_type` 미지정 시 카테고리 default (`categories.default_cta_type`) 가 자동 적용. 강제 지정이 필요한 글에만 `posts.cta_type` 설정.

---

## 3. CTA 컴포넌트별 책임

| 컴포넌트 | 위치 | 책임 |
|---------|------|------|
| `InlineCTA` | 본문 중간 (마크다운 본문 직후) | 글 주제와 매칭된 `counseling_programs` row 1개 / 카테고리 default 폴백 |
| `BottomCTA` | 글 하단 | InlineCTA 와 같은 매칭 결과 사용 |
| 본문 내 인링크 | 본문 안 마크다운 | 자동 삽입 (insert-inlinks.ts) 또는 작성 시 수동 |

InlineCTA / BottomCTA 가 알아서 처리하므로, **본문에 같은 목적지로 강제 링크 추가 금지**.

---

## 4. CTA 타입별 도착 페이지

| `cta_type` | 도착지 | 앵커 텍스트 권장 |
|-----------|-------|----------------|
| `free-trial` | `app.mindthos.com/?utm=...` | "마음토스 무료로 시작하기", "축어록 무료로 써보기" |
| `institution-inquiry` | `open.kakao.com/me/Mindthos` | "기관 도입 상담", "마음토스 기관용 알아보기" |
| `newsletter` | `/about-service#features` 또는 뉴스레터 폼 | "마음토스 더 알아보기", "기능 살펴보기" |

본문 인링크는 위 CTA 와 **별개로** 같은 블로그 내부 글로만 연결 (외부 도메인 강제 ❌).

---

## 5. 본문 인링크 규칙 (2-4개)

```
[필수] 1-2개: 같은 카테고리 또는 직접 관련 주제 블로그 글
[권장] 1개: 보조 카테고리 (예: counseling-skills ↔ case-conceptualization)
[선택] 0-1개: 마음토스 보안 / 제품 설명 글 (tech-blog) — 신뢰 보강용
```

### 링크 배치 위치
| 위치 | 링크 유형 | 비고 |
|-----|---------|-----|
| 본문 중간 자연스러운 맥락 | 관련 블로그 글 | 문장 흐름 우선 |
| 섹션 말미 | 심화 정보 글 | "더 자세히 — [글 제목](/blog/slug)" |
| 본문 마지막 문단 직전 | 핵심 보조 글 | 결론을 강화 |

### 앵커 텍스트
- 목적지 글의 핵심 키워드 자연 포함
- "여기 클릭" / "이 글" ❌
- 같은 글에 같은 목적지로 2개 이상 ❌

---

## 6. 필러-클러스터 전략

각 카테고리에 **필러 글 1편 + 클러스터 5-10편** 구조 권장.

| 카테고리 | 필러 글 후보 |
|---------|------------|
| case-conceptualization | "사례개념화 가이드 — 첫 회기부터 종결까지 가설 갱신 5단계" |
| counseling-skills | "회기 안에서 쓰는 상담 스킬 30선" |
| training | "상담심리사 수련 로드맵 — 2급에서 슈퍼바이저까지" |
| career | "비전공자가 상담사가 되는 길 — 학점은행제·청소년상담사 통합 가이드" |
| operations | "1인 상담소 운영 매뉴얼 — 개업부터 세무·예약 자동화까지" |
| self-care | "상담사 자기돌봄 — 회기 사이부터 주간 루틴까지" |
| trends | "AI 상담 도구 도입 가이드 — 윤리·보안·임상 효용" |
| tech-blog | "마음토스 보안·데이터 보호 정책 — 학습 미사용·암호화·자동 파기" |

### 클러스터 링킹
- 클러스터 → 필러: 항상 링크 ("사례개념화 전체 가이드는 [여기]")
- 필러 → 클러스터: 본문 안 관련 세부 주제로 자연 분기
- 클러스터 ↔ 클러스터: 같은 카테고리 내 인접 주제만

---

## 7. 외부 링크 (학술 / 정부 / 전문기관)

마음토스 본문에서 외부 링크는 **참고문헌** 성격으로만 사용. 1-3개.

### 허용 출처
1. 보건복지부 / 국립정신건강센터 / 한국보건사회연구원
2. 한국심리학회 / 한국상담심리학회 / 한국상담학회
3. APA, WHO, ICD, NIMH 등 국제 기관
4. 피어 리뷰 학술지 (PubMed, DBpia, KCI 등)
5. 대학·연구소 (서울대, 연세대, 카이스트 등)

### 외부 링크 속성
```html
<a href="https://..." target="_blank" rel="noopener noreferrer">기관명</a>
```

`lib/markdown/processor.ts` 가 외부 링크에 보안 속성 자동 부여하므로 마크다운에 그냥 `[name](url)` 작성하면 됨.

---

## 8. 마음토스 제품 / 보안 페이지 인링크

블로그 본문에서 마음토스 제품을 언급할 때 권장 도착지:

| 언급 | 도착지 | 비고 |
|-----|-------|-----|
| 축어록 / 화자 분리 / STT | `https://app.mindthos.com/?utm=blog` | free-trial CTA 와 중복되지 않게 |
| 진행기록 / 회기 노트 자동화 | `app.mindthos.com` | 동일 |
| 사례개념화 AI | `app.mindthos.com` | |
| 제노그램 자동 생성 | `app.mindthos.com` | |
| 보안 / 데이터 보호 정책 | `/security` | 내부 페이지 |
| 약관 / 개인정보 | `https://app.mindthos.com/terms` | 외부 (마음토스 앱) |
| 기관 도입 문의 | `https://open.kakao.com/me/Mindthos` | KAKAO_INQUIRY_URL |

본문 1글에서 외부 마음토스 도메인 직접 링크는 **최대 1개**. 나머지는 InlineCTA / BottomCTA 가 담당.

---

## 9. 전환 퍼널

### 상담사 무료 시작 퍼널
```
블로그 글 (정보형 키워드 유입)
    ↓ InlineCTA 또는 본문 내 1개 링크
app.mindthos.com (UTM 추적)
    ↓ 가입 + Google Ads 전환 이벤트
무료 사용 시작
```

### 기관 도입 퍼널
```
블로그 글 (EAP / 기관 키워드 유입)
    ↓ InlineCTA / BottomCTA
open.kakao.com/me/Mindthos (KAKAO_INQUIRY_URL)
    ↓ 카카오톡 오픈채팅 상담
도입 협의
```

---

## 10. 금지 사항

- 같은 문장에서 동일 목적지로 2개 이상 링크 ❌
- 관련성 없는 글을 강제 연결 ❌
- "여기 클릭", "아래 링크" 등 비설명적 앵커 ❌
- 한 글에 `app.mindthos.com` 직접 링크 2개 초과 ❌ (CTA 컴포넌트가 담당)
- 자기 글로 셀프 링크 ❌ (자기 참조)
- 발행되지 않은 글로의 링크 (404 위험) — `insert-inlinks.ts` 가 `status='published'` 만 필터링하므로 자동 안전
