# 마음토스 AEO / GEO / SEO 개선 액션 플랜

- **작성일**: 2026-05-27
- **베이스**: `web/docs/aeo-geo-research/01–11` + 현재 코드 점검 결과
- **컨텍스트**: 마음토스 = 한국어 정신건강 B2B SaaS (상담사 대상). 정신건강 = **강한 YMYL** → AI 인용 진입장벽 최고 수준
- **읽는 법**: 각 액션에 **Impact / Effort / 근거 노트** 표기. 우선순위 P0 ~ P3.

---

## 0. 현재 상태 점검 요약

### ✅ 이미 잘 되어있는 것 (유지)

| 영역 | 현황 | 근거 |
|------|------|------|
| AI 봇 명시 허용 | `web/app/robots.ts` 에 GPTBot/OAI-SearchBot/ChatGPT-User/ClaudeBot/PerplexityBot/Google-Extended/Applebot-Extended 모두 Allow. CCBot/Bytespider Block | `#10` 권고와 부합 |
| llms.txt | `web/public/llms.txt` 한국어 정보 + AI 사용 정책 명시 | Google 공식 #1 권고와 충돌 없음 (있어도 무해) |
| 스키마 시스템 | Organization, WebSite, SoftwareApplication, BlogPosting, BreadcrumbList, FAQPage, Person, VideoObject, Course | 기본은 견고 |
| 사이트 검증 | Google, Naver, Bing, Meta 모두 설정 (`web/app/layout.tsx`) | `#10` Bing 등록 요건 충족 |
| 정적 생성 | 발행 글 100% 빌드 타임 prerender (`generateStaticParams`) | 색인 회복 fix 반영됨 |
| ISR | 1시간 revalidate | OK |
| 블로그 컴포넌트 | SummaryBox, TOC, FAQSection, ReferencesList, RelatedPosts, InlineCTA, BottomCTA | 골격 완성 |
| Pretendard 로컬화 | woff2 self-host | LCP/페이지 경험 신호 |
| 자동 발행 시스템 | `scripts/publish-blog` (insert-inlinks, refine, enrich) | 운영 인프라 OK |

### ⚠️ 발견된 갭 (11개)

| # | 갭 | 영향 | 근거 노트 |
|---|----|------|----------|
| G1 | **Anthropic 3-봇 구조 미반영** — `Claude-User` / `Claude-SearchBot` 명시 누락, `Claude-Web` (deprecated) 남아있음 | Claude.ai 인용 트래픽 손실 가능 | #10 |
| G2 | **MedicalWebPage 스키마 부재** — 현재 BlogPosting만 사용 | YMYL E-E-A-T 시그널 약함 | #11 |
| G3 | **FAQ 스키마 자동 주입이 신규 글에도 작동** — 2026-05-07 rich result 폐지 후 ROI 낮음 | 우선순위 자원 낭비 | #8 |
| G4 | **본문 첫 30% "직접 답" 패턴 미설계** — SummaryBox는 있지만 답변 박스로 명시되지 않음 | AI 인용 발췌 위치 44.2%가 첫 30%인데 활용 못함 | #3, #4 |
| G5 | **inline citation 본문 시스템 미보장** — ReferencesList는 끝에 모음. 본문 안 학술 링크 의무 규칙 없음 | YMYL 인용 후보 자동 탈락 ("Unlinked claims don't count") | #11 |
| G6 | **검수의 byline / hasCredential / affiliation 학술기관 미지원** — Person 스키마에 자격증명·검수 기관 필드 없음 | Perplexity 21+ 소스 인용 풀에서 밀림 | #11 |
| G7 | **Listicle / Ranked Top-N 템플릿 부재** — 자동 발행이 일반 article 위주 | 상업·결정성 쿼리 인용 40.86% 손실 | #4 |
| G8 | **passage-level 작성 가이드라인 부재** — 각 H2 self-contained 여부 점검 안 됨 | fan-out 쿼리 1/3 인용 기회 누락 | #3, #7 |
| G9 | **Entity moat 약함** — Wikidata/Crunchbase/LinkedIn 부재, 한국 시장 entity (네이버 지식백과·복지부 등) 미연결 | Knowledge graph 신호 약함 | #5, #9 |
| G10 | **GEO 측정 자동화 없음** — SOMV / AI Citation Frequency 수동 트래킹 없음 | 효과 측정 불가 | #5 |
| G11 | **scaled content abuse 리스크** — 자동 발행이 정책 위반 가능. 검수 워크플로우 명시화 필요 | 2026-05-21 코어 업데이트 대응 | #1, #6 |

---

> **2026-05-27 업데이트**: A5 (검수) 와 B2 (저자 표시) 는 사용자 결정으로 **사람 검수 ❌, AI 자동화 only** 로 재설계됨.
> - A5 → 6-stage AI 다중 검수 + Master Doc fact-check 시스템(`ai-review-workflow.md` / `master-docs-architecture.md`)
> - B2 → 실명 자문위원회·별도 페이지는 헤비하다는 판단으로 폐기. **기존 `authors` 테이블 활용한 generic "마음토스 임상 심리 전문가" 라벨링** 으로 단순화. 마이그레이션 008 에서 authors 신규 컬럼 블록도 제거됨.

## Phase 1 — Quick Wins (1주 내 완료 가능)

### A1. robots.ts — Anthropic 3-봇 구조 + Bingbot 명시 (P0)

**파일**: `web/app/robots.ts`

- `Claude-Web` (deprecated) **제거**
- `Claude-User`, `Claude-SearchBot` 명시 Allow 추가
- `Bingbot` 명시 Allow 추가 (현재 와일드카드 `*`로만 허용 — ChatGPT Search 의존도 큼)
- `Perplexity-User` 유지

**Impact**: High (인용 트래픽 누락 차단)
**Effort**: 10분
**근거**: `#10`
**검증**: Vercel preview에서 `/robots.txt` GET → 새 user-agent 룰 확인

---

### A2. FAQ 스키마 자동 주입 우선순위 하향 (P0) — ❌ **반영하지 않기로 결정 (2026-05-29)**

> **결정**: 이 액션은 진행하지 않는다. FAQSection UI·기존 마크업·enrich 자동 FAQ 생성을 모두 현행 유지한다.

**파일**: `web/app/(site)/blog/[slug]/page.tsx:168-174`

현재 로직:
```ts
const faqs = extractFAQs(post.schema_markup);
if (faqs.length > 0) {
  schemas.push(generateFAQSchema(faqs));
}
```

조치:
- FAQSection UI는 **유지** (사용자 가치 있음 — Google FAQ rich result 폐지는 UI 효과만)
- `generateFAQSchema` 주입은 유지하되 **enrich 스크립트의 자동 FAQ 생성을 중단**
- 기존 글의 FAQ 마크업은 그대로 둔다 (Google: "unused structured data doesn't cause problems")

**Impact**: Medium (자원 재배분, 위험 회피)
**Effort**: 30분 (publish-blog 스크립트 점검 + flag)
**근거**: `#8`

---

### A3. SummaryBox를 "직접 답" 블록으로 의미 강화 (P0)

**파일**: `web/components/blog/SummaryBox.tsx` + 발행 파이프라인

- SummaryBox는 본문 첫 단락 = **AI 발췌 위치 44.2% 영역**
- 발행 파이프라인의 `summary` 생성 규칙을 변경:
  - **첫 1-2 문장이 그 자체로 질문에 답하는 self-contained passage** 가 되도록
  - 예: "ADHD 검사는 정신건강의학과 또는 임상심리 전문 기관에서 받을 수 있으며, 종합심리검사(K-WAIS, MMPI-2 등 포함)는 8-15만 원, 단축 스크리닝은 무료-3만 원 수준이다."
  - 절대 도입부 hook ("…때문에 많은 사람들이…") 으로 시작하지 않는다
- HTML 구조에 `data-ai-answer="true"` 속성 추가 (모니터링용)

**Impact**: High (모든 글의 인용 후보 위치 활용)
**Effort**: 2시간 (스크립트 프롬프트 수정 + 기존 글 일괄 재생성은 별도 작업)
**근거**: `#3`, `#4`

---

### A4. Bing Webmaster Tools에 sitemap 재등록 확인 (P0) — ✅ **완료 (2026-05-29)**

> **완료**: Bing Webmaster Tools 에서 sitemap 재등록·제출 상태 확인 완료.

- Bing 등록은 verification만 되어있고, sitemap 제출 확인 필요
- ChatGPT Search는 Bing 인덱스 의존 → **Bing에 인덱싱 안 되면 ChatGPT 인용 자동 제외**

**조치**:
- Bing Webmaster Tools 로그인 → `https://mindthos.com/sitemap.xml` 제출 상태 확인
- 색인 카운트가 Google 색인과 큰 차이 있는지 확인
- IndexNow 키가 Bing에도 등록됐는지 확인 (`/api/indexnow` 라우트 사용)

**Impact**: High (ChatGPT 인용 게이트)
**Effort**: 30분
**근거**: `#10`

---

### A5. AI 다중 검수 워크플로우 (P0) — **사람 검수 ❌, AI 자동화 only**

**상세 설계**: [`ai-review-workflow.md`](./ai-review-workflow.md), [`master-docs-architecture.md`](./master-docs-architecture.md)

**원칙**: 사람이 글마다 검수하지 않는다. AI 가 여러 패스로 글을 본다. 운영자는 prompt·master doc 만 관리.

**6-stage 파이프라인**:
- Stage 0 — Claude 초안 (현행)
- Stage 1 — Claude self-reflection (AEO 체크리스트 자기 점검 → 1차 수정)
- Stage 2 — Gemini AEO/구조 검증 (passage 단독성, summary 직접답변, citations)
- Stage 3 — Gemini fact 검증 + **master doc 대조** (토픽 추론 → master 로드 → 모순 검출)
- Stage 4 — Gemini 임상·윤리 검증 (자격 범위, 광고 표현, 스티그마)
- Stage 5 — Claude 수정 (모든 critique 통합 → 본문 수정)
- Stage 6 — Re-verify (1회 한정) → 통과 시 발행, 실패 시 `auto_review_queue=true` 격리

**핵심 컴포넌트 — Master Document 시스템**:
- `docs/fact-master/{topic-slug}.md` — YMYL 토픽별 정답지
- Claim · Source · Confidence triple 구조
- AI 합성 + cross-LLM 검증으로 작성, 분기 자동 refresh
- Phase 1 — ADHD / MDD / 공황 / GAD / CBT-DBT-ACT 5개 우선 작성

**DB 변경 — 마이그레이션 008 재설계**:
- `posts.ai_review` JSONB — 모든 stage 결과 통합
- `posts.auto_review_queue` boolean — 격리 글 표식
- `posts.fact_check_topics` text[] — 매칭된 master doc slug
- `posts.review_iterations` int — revise 패스 횟수
- 사람 검수 컬럼(`reviewed_by` 등) **삭제**

**Impact**: Critical (콘텐츠 신뢰성 핵심 + 자동화 운영 유지)
**Effort**: M (Stage 2-4 분리) + L (Master doc 시스템 + Stage 3 통합)
**근거**: `#1`, `#6`, `#11`, 사용자 결정 (AI-only 검수)

**비용 정책**: 글당 평균 $0.15-0.25, 최악 $0.5. 일 5편이면 월 ~$25-75. 토큰 더 써도 OK.

---

## Phase 2 — 콘텐츠 시스템 강화 (2-4주)

### B1. MedicalWebPage 스키마 도입 (P1) — ✅ **완료 (2026-05-29)**

> **완료**: `web/lib/seo/schema.ts` 에 `generateMedicalWebPageSchema()` + `isMentalHealthCategory()` + `inferMedicalConditions()` 추가, `page.tsx` 에서 임상/정신건강 카테고리(case-conceptualization·counseling-skills·training·self-care)에 BlogPosting 과 동시 주입.
> **DB 컬럼 추가 없이** 기존 데이터로 파생(B2 단순화 방향과 일치):
> - `reviewedBy` = 저자(마음토스 임상 심리 전문가), `lastReviewed` = `post.updated_at`(AI 다중 검수 시점)
> - `about` = 제목·키워드에서 결정적으로 추론한 MedicalCondition (우울/공황/불안/ADHD/PTSD 등, 최대 3개, 명확 매칭 시에만)
> - `specialty` = `Psychiatric` (schema.org MedicalSpecialty enum), `medicalAudience` = Clinician + Patient
> 아래는 원래 설계 메모(컬럼 추가 안)이며 참고용으로만 보존.

**파일**: `web/lib/seo/schema.ts` + `web/app/(site)/blog/[slug]/page.tsx`

- 현재 `BlogPosting` 스키마만 사용
- `category` 가 "정신건강·심리·증상" 류일 때 **BlogPosting + MedicalWebPage 동시 주입**
- 필드:
  - `medicalAudience`: Patient / HealthProfessional
  - `lastReviewed`: 마지막 의료 검수일
  - `reviewedBy`: 검수의 Person 스키마
  - `about`: MedicalCondition / MentalHealth 엔티티 (예: "주요우울장애", "ADHD")
  - `specialty`: MedicalSpecialty (Psychiatry / Psychology)

**구현 안**:
```ts
// schema.ts 신규 함수
export function generateMedicalWebPageSchema(post: {
  title: string;
  url: string;
  excerpt?: string;
  medical_condition?: string;
  reviewer?: { name: string; jobTitle: string; affiliation?: string };
  reviewed_at?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: post.title,
    url: post.url,
    description: post.excerpt,
    inLanguage: 'ko-KR',
    medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    ...(post.reviewer
      ? {
          reviewedBy: {
            '@type': 'Person',
            name: post.reviewer.name,
            jobTitle: post.reviewer.jobTitle,
            ...(post.reviewer.affiliation
              ? {
                  affiliation: {
                    '@type': 'Organization',
                    name: post.reviewer.affiliation,
                  },
                }
              : {}),
          },
          lastReviewed: post.reviewed_at,
        }
      : {}),
    ...(post.medical_condition
      ? {
          about: {
            '@type': 'MedicalCondition',
            name: post.medical_condition,
          },
        }
      : {}),
  };
}
```

**DB 변경**:
- `posts` 테이블에 `medical_reviewer_id`, `reviewed_at`, `medical_condition` 컬럼
- `authors` 테이블에 `medical_credentials`, `affiliation_org`, `affiliation_url` 컬럼

**Impact**: High (정신건강 YMYL 인용 진입장벽 통과)
**Effort**: 1-2일 (스키마 함수 + 마이그레이션 + UI 표시)
**근거**: `#11`

---

### B2. Generic 저자 라벨링 — "마음토스 임상 심리 전문가" (P1)

A5 가 AI-only 검수로 갔고, 실명 자문위원진 인선 + 별도 페이지 운영은 너무 헤비함이라
**기존 `authors` 테이블 활용한 generic 라벨링으로 단순화**.

**파일**: `web/app/(site)/blog/[slug]/page.tsx` 헤더 + `lib/seo/schema.ts` Person 스키마 + Supabase `authors` row

**작업 내용**:

1. **`authors` 테이블 row 업데이트** (또는 신규)
   - 기존 `mindthos-team` author 의 라벨을 다음으로 갱신:
     - `name`: '마음토스 임상 심리 전문가'
     - `title`: '임상 심리 전문가'
     - `bio`: '마음토스 콘텐츠는 임상 심리 가이드라인 기반 시스템으로 작성·검수됩니다. 정신건강·심리 영역의 학회 가이드라인, DSM-5-TR, KDCA 데이터를 master document 로 두고 다중 AI 검수를 거칩니다.'
     - `credentials`: `['임상 심리 가이드라인 기반']`
     - `specialties`: `['우울', '불안', '공황', 'ADHD', '외상', '인지행동치료', '상담 기록']`
     - `profile_image_url`: 브랜드 그린 심볼 또는 추상적 일러스트 (실명 사진 ❌)
   - 또는 별도 author row `mindthos-clinical` 신규 생성하고 카테고리 default_author 갈아끼움

2. **블로그 헤더 byline 강화** (`page.tsx:243-256`)
   - 현재: `저자명 · jobTitle · 게시일 · 약 N분`
   - 유지하되 visual hierarchy 강화: 임상 전문가 라벨이 잘 보이도록.
   - 푸터(또는 InlineCTA 위)에 작은 disclosure 라인:
     "본 글은 마음토스 임상 심리 가이드라인 기반 시스템으로 작성·검수되었습니다."
     → `/security` 또는 별도 `/about/content-policy` 짧은 페이지로 링크

3. **`generatePersonSchema` 활용** (이미 존재 — 추가 작업 없음)
   - `jobTitle`, `description`, `knowsAbout`(specialties) 필드가 이미 author 데이터에서 채워짐
   - `affiliation` 은 `Organization @id` 로 마인드풀랩스 가리킴 (이미 작동)

4. **Organization 스키마 확장** (`lib/seo/schema.ts` 의 `generateOrganizationSchema`)
   - `medicalSpecialty: ['Psychiatry', 'ClinicalPsychology']` 추가
   - `member` 필드는 추가하지 않음 (실명 위원진 없음)
   - `knowsAbout` 필드로 다루는 영역 명시: `['정신건강', '심리상담', '임상 심리', '인지행동치료', ...]`

5. **DB 마이그레이션 영향 없음**
   - `authors.medical_credentials` 같은 신규 컬럼 ❌ — 기존 컬럼 (`title`, `credentials`, `specialties`) 로 충분
   - 마이그레이션 008 에서 authors 신규 컬럼 블록 제거됨

**Impact**: Medium-High (E-E-A-T 신호 + AI 인용 진입장벽 통과 — 실명 없어도 specialty/credentials 시그널 OK)
**Effort**: 2-3시간 (author row 갱신 + 스키마 함수 보강 + 짧은 콘텐츠 정책 페이지)
**근거**: `#11` YMYL 인용, `#7` Brand Trust, 사용자 결정 (실명 자문위원회는 헤비 → generic 라벨링 타협)

**트레이드오프**:
- ✅ 운영 부담 거의 없음 (인선·페이지 운영 X)
- ✅ E-E-A-T specialty/credentials 시그널 일부 확보
- ⚠️ Perplexity 등이 "named clinician" 을 강하게 가중치 줄 경우 실명 위원진보다 약함
- ⚠️ 그러나 master doc + AI 다중 검수 시스템 + Organization 스키마가 트리오로 작동하면 실용적 수준의 신뢰 신호는 만들어짐

---

### B3. inline citation 규칙 + 자동 검증 (P1) — ✅ **완료 (2026-05-29)**

> **완료**: 2개 레이어로 구현됨.
> 1. **AI 레이어 (선행 구현됨)**: `verifiers/aeo-structure.ts` 의 Gemini 검수가 `inlineCitationsMissing` 를 점검 → mustFix 승격. 단 NANOBANANA_API_KEY 필요·비결정적.
> 2. **결정적 레이어 (신규)**: `verifiers/citation-check.ts` `verifyCitations()` — 정규식으로 본문을 스캔해 통계·수치 주장(유병률 %, N명, N배 등)에 문단 내 inline 링크가 없으면 검출. **AI 키 없이도 항상 작동**.
>    - 임상/YMYL 카테고리(case-conceptualization·counseling-skills·training·self-care): 수치 미인용 → `mustFix`(revise, exit 3 → fact-fix 루프가 출처 부착/수치 완화)
>    - 그 외 카테고리·연구 키워드만 있는 경우: `notes` 만 (발행 차단 안 함)
>    - `publish.ts` Step 2 재구성: citation 게이트는 `skipReview` 아니면 항상 실행, AI 검수는 키 있을 때만. `daily-auto-publish.sh` fix 프롬프트에 `[citation_check]` 처리 지침 추가.

**파일**: `scripts/publish-blog/src/refine-existing.ts` + `web/lib/markdown/processor.ts`

- 발행 프롬프트에 규칙 추가:
  - "모든 통계·연구·의학적 주장에는 [출처명](URL) 형태로 inline 링크 부착"
  - 가능 출처: PubMed, 보건복지부, 정신의학회, 임상심리학회, 대학병원
- 자동 검증:
  - 본문에 "%", "연구", "조사", "보고서", "환자" 같은 클레임 키워드가 있는데 inline 링크가 없으면 발행 실패
  - 검증 스크립트: `scripts/publish-blog/src/validate-citations.ts` 신규

**Impact**: High ("Unlinked claims don't count" — 이거 하나로 인용률 차이 큼)
**Effort**: 2일 (프롬프트 + 검증 스크립트 + 기존 글 마이그레이션)
**근거**: `#11`

---

### B4. Listicle / Ranked Top-N 템플릿 도입 (P1)

**파일**: `scripts/publish-blog/src/select-daily-topics.ts` + 새 템플릿

- 상업·결정성 쿼리(예: "심리상담 앱 추천", "ADHD 검사 어디", "정신과 비용 비교") 타깃 글은 **ranked listicle** 포맷으로 작성
- 템플릿 메타: `post.format = 'listicle' | 'article' | 'guide'`
- listicle 글은:
  - H2가 "1. ", "2. ", "3. " 으로 시작
  - 각 항목 = self-contained passage (단독 인용 가능)
  - SummaryBox 자리에 ranked list 미리보기 1-3위 노출
- 콘텐츠 카테고리별 비율 목표:
  - 정보성 (article) 60%
  - 결정성 (listicle) 30%
  - 가이드성 (long-form) 10%

**Impact**: High (상업 쿼리 인용 40.86%, 전체 인용 63% 영역 공략)
**Effort**: 3-4일 (템플릿·발행 파이프라인·디자인)
**근거**: `#4`

---

### B5. Passage-level 작성 가이드라인 (P2)

**파일**: `scripts/publish-blog/.claude/skills/blog-enrich/prompts/` 또는 발행 system prompt

- 각 H2 섹션이 **그 자체로 단독 인용 가능한 답변 단위** 가 되도록 system prompt 갱신
- 점검 규칙:
  - H2 직후 1-2 문장 = 그 H2 질문의 답
  - 한 H2 안에서 "위 표에서 보듯이…" 같은 이전 섹션 참조 금지
  - 모든 H2 = "[질문 형태] 또는 [명사구 답]" 으로 시작
- `extractToc` 출력에 passage 자가완결성 점수 자동 부여 (선택)

**Impact**: Medium-High (fan-out 쿼리 1/3 인용 기회)
**Effort**: 2일 (system prompt + 검증)
**근거**: `#3`, `#7`

---

### B6. 신규 글 자동 References 섹션 의무화 (P2)

**파일**: `scripts/publish-blog/src/publish.ts` + DB

- `posts.references` JSON 컬럼 (이미 있음 — `Reference[]` 타입) 의무 입력 검증
- 정신건강 카테고리는 최소 3개 academic/government 출처 의무
- 발행 시 references 미충족이면 status='draft' 유지

**Impact**: Medium (헬스 인용 풀에서 academic 출처 <1%인 시장 갭 공략)
**Effort**: 1일
**근거**: `#11`

---

## Phase 3 — Entity / Authority 빌딩 (1-3개월) — ❌ **진행하지 않기로 결정 (2026-05-29)**

> **결정**: Phase 3 전체(C1~C4)는 진행하지 않는다. Wikidata·LinkedIn·Crunchbase·한국 entity 빌딩·자문위원회 페이지는 현 단계에서 운영 부담 대비 우선순위가 낮다고 판단. 아래 내용은 향후 재검토용 아카이브로만 보존.

### C1. Wikidata 항목 생성 (P2)

- 마인드풀랩스 + 마음토스 (브랜드) 둘 다 Wikidata 항목 생성
- 한국어 + 영어 라벨 동시 설정
- 운영사·창업자·서비스 출시일·카테고리 (Mental health software) 명시
- 마음토스 공식 사이트가 Wikidata 항목의 official website로 등록
- `Organization` 스키마 `sameAs`에 Wikidata URL 추가

**Impact**: High (장기) — Knowledge Graph 진입
**Effort**: 1주 (외부 인용 자료 준비 포함)
**근거**: `#7`

---

### C2. LinkedIn 회사 페이지 + Crunchbase 등록 (P2)

- 환경변수 `NEXT_PUBLIC_LINKEDIN` 채우기 → 자동으로 Organization sameAs에 반영
- Crunchbase 회사 프로필 (영문)
- 두 곳 모두 동일한 회사명·주소·로고·창립일 일관성 유지 (NAP 일치)

**Impact**: Medium-High (entity 신호 + B2B 신뢰)
**Effort**: 3-5일
**근거**: `#7`

---

### C3. 한국 시장 entity 신호 빌딩 (P2)

`#9` 한국형 GEO 권고 반영:

- **네이버 지식백과** 등재 시도 (해당 카테고리 — 심리상담 도구 / B2B SaaS)
- **한국 정신의학회 / 한국임상심리학회 / 한국상담심리학회** 회원사·후원사 형태로 등재
- **보건복지부 정신건강 정책 페이지** 외부 링크
- 한국 언론(IT 매체 — TechM, ByLine, Bloter, 디지털타임스 등) earned coverage 1-2건/분기 목표
- 네이버 뉴스 / 네이버 블로그(공식) 운영 — 영문 LinkedIn 등가물

**Impact**: High (한국어 AI 응답 인용 풀 진입)
**Effort**: 분기별 운영
**근거**: `#9`

---

### C4. 검수 위원회 / 자문 페이지 (P2)

- `/about` 또는 `/clinical-advisory` 페이지 신규
- 자문 의료진·심리학자 명단 (Person 스키마)
- 각자 자격·소속·전공
- 위원회 회의록 / 검수 정책 공개
- 모든 헬스 콘텐츠 → 위원회 페이지 inbound link

**Impact**: High (E-E-A-T 결정적 신호)
**Effort**: 1-2주 (자문진 섭외 포함이면 더 김)
**근거**: `#11`

---

## Phase 4 — 측정 / 운영 (지속)

### D1. GEO 측정 시트 (P1)

`#5` 8 GEO Metrics 기반 월간 리포트:

| 섹션 | 출처 | 수집 방법 |
|------|------|----------|
| 전통 SEO | GSC | clicks/impr/CTR/position, page-2 키워드 |
| AI Citation Frequency | 4개 엔진 수동 | 정해진 30개 prompt를 매주 ChatGPT·Perplexity·AIO·Gemini에 입력 후 스프레드시트 기록 |
| Share of Model Voice | 같은 데이터 | (우리 노출 횟수) ÷ (전체 답변 수) |
| Entity Recognition | 같은 데이터 | "마음토스는 뭐 하는 서비스야?" 정확도 점수 (0-5) |
| Sentiment | 같은 데이터 | 톤 / 잘못된 정보 / hallucination 발견 시 기록 |
| Retrieval (bot hits) | 서버 로그 | GPTBot·PerplexityBot·Claude-User UA 카운트 |
| Conversion influence | GA4 | AI 도메인 referral, 브랜드 검색 lift |

**프롬프트 30개 초안 (정신건강 도메인)**:
- "상담사가 쓰는 AI 도구 추천"
- "축어록 자동 생성 서비스"
- "심리상담 노트 작성 AI"
- "사례개념화 도와주는 도구"
- "가계도 그리는 프로그램"
- "EAP 양식 자동 변환"
- "임상심리사 업무 자동화"
- "상담 기록 AI 보안"
- (이하 22개 — 별도 시트로 정리)

**Impact**: Critical (측정 없으면 전체 액션 효과 모름)
**Effort**: 초기 4시간 + 매주 1시간
**근거**: `#5`

---

### D2. AI 봇 hit 모니터링 대시보드 (P2)

- Vercel 로그에서 user-agent 별 hit 수 집계
- `web/app/api/bot-stats/` 라우트 (or Vercel Edge config)
- 주간 출력: GPTBot 200, PerplexityBot 80, Claude-User 30 같은 카운트
- 0이면 차단 / 라우팅 이슈 의심 신호

**Impact**: Medium (운영 가시성)
**Effort**: 1일 (Vercel 로그 / GA4 server events 연동)

---

### D3. 2026-05-21 코어 업데이트 사후 분석 (P0, 6월 초)

- GSC에서 5/20 이전 vs 5/21 이후 4주 비교
- 트래픽 / 클릭 / position 변동 큰 페이지 식별
- 변동의 원인: 콘텐츠 품질 / AI overoptimize / 다른 변수 분리
- 결과를 `web/docs/aeo-geo-research/post-mortem-may-2026-core-update.md` 로 정리

**Impact**: High (학습 사이클)
**Effort**: 4시간
**근거**: `#6`

---

## 우선순위 매트릭스 (요약)

| ID | 액션 | Phase | Impact | Effort | 의존성 |
|----|------|-------|--------|--------|--------|
| A1 | Anthropic 3-봇 + Bingbot 명시 | 1 | High | XS | ✅ 완료 |
| A2 | ~~FAQ 자동 주입 우선순위 하향~~ | 1 | Med | XS | ❌ 진행 안 함 |
| A3 | SummaryBox = 직접 답 블록 | 1 | High | S | △ 부분 |
| A4 | Bing Webmaster sitemap 확인 | 1 | High | XS | ✅ 완료 |
| A5 | 검수 워크플로우 명문화 | 1 | Med | S | — |
| B1 | MedicalWebPage 스키마 | 2 | High | M | ✅ 완료 (DB 컬럼 없이 파생) |
| B2 | Generic 저자 라벨링 ("마음토스 임상 심리 전문가") | 2 | Med-High | S | — |
| B3 | inline citation 의무·검증 | 2 | High | M | ✅ 완료 (결정적+AI 2레이어) |
| B4 | Listicle 템플릿 | 2 | High | L | 디자인 |
| B5 | Passage-level 가이드라인 | 2 | Med-High | S | — |
| B6 | References 의무화 | 2 | Med | S | — |
| C1 | ~~Wikidata 등록~~ | 3 | High (장기) | M | ❌ 진행 안 함 |
| C2 | ~~LinkedIn + Crunchbase~~ | 3 | Med-High | S | ❌ 진행 안 함 |
| C3 | ~~한국 entity 빌딩~~ | 3 | High | XL | ❌ 진행 안 함 |
| C4 | ~~검수 자문위원회 페이지~~ | 3 | High | L | ❌ 진행 안 함 |
| D1 | GEO 측정 시트 | 4 | Critical | 운영 | — |
| D2 | AI 봇 hit 대시보드 | 4 | Med | S | — |
| D3 | 5/21 코어 업데이트 분석 | 4 | High | XS | 6월 초 |

---

## 권장 실행 순서 (4주 스프린트)

**Week 1**: A1, A2, A4, A5, D1 시트 셋업 + 30개 프롬프트 첫 측정 (베이스라인)
**Week 2**: A3 + B5 (system prompt + SummaryBox 의미 강화) → 기존 글 일부 재생성
**Week 3**: B1 + B2 (MedicalWebPage + 검수의 byline) — DB 마이그레이션 함께
**Week 4**: B3 + B6 (citation 검증 + References 의무화) + D3 (5/21 코어 업데이트 사후 분석)

이후:
- Month 2: B4 (Listicle 템플릿)
- 지속: D1, D2
- ❌ Phase 3 (C1~C4) 는 진행하지 않기로 결정 (2026-05-29)

---

## 의도적으로 **하지 않을 것** (myths)

`#1`, `#7`, `#8` 종합:

- ❌ llms.txt 적극 최적화 — 현 상태 유지(있어서 무해, 추가 투자 X)
- ❌ FAQ/HowTo 스키마 신규 추가 — 2026-05-07 rich result 폐지
- ❌ 키워드 변형 페이지 양산 (scaled content abuse 정책)
- ❌ 인위적 mention / paid link 빌딩
- ❌ "Chunking" — 본문을 인위적으로 잘게 쪼개기
- ❌ AI 전용 별도 콘텐츠 작성 — 사람과 AI 모두에게 좋은 콘텐츠가 정답

---

## 부록 — 액션별 근거 노트

| 액션 | 주 근거 | 보조 |
|------|---------|------|
| A1 | #10 (Anthropic 3-봇 구조) | #7 #1 팩터 URL Accessibility |
| A2 | #8 (FAQ deprecation 2026-05-07) | — |
| A3 | #3 (44.2% 첫 30%) | #4 #7 |
| A4 | #10 (ChatGPT Search = Bing 인덱스) | — |
| A5 | #1 (Google scaled content policy), #6 (5/21 코어 업데이트) | — |
| B1 | #11 (MedicalWebPage YMYL) | — |
| B2 | #11 (Perplexity 21+ 소스 / Constitutional AI) | #7 #16 Brand Trust |
| B3 | #11 ("Unlinked claims don't count") | — |
| B4 | #4 (Evertune 리스티클 63%) | #3 |
| B5 | #3 (passage-level), #7 (Self-Contained Passages) | — |
| B6 | #11 (academic <1% 갭) | — |
| C1 | #7 (#16 Brand and Entity Trust, #21 Known Source) | — |
| C2 | #7 (entity moat) | — |
| C3 | #9 (한국 GEO 30% 로컬라이즈) | — |
| C4 | #11 (E-E-A-T 의료) | — |
| D1 | #5 (8 GEO Metrics) | — |
| D2 | #10 (bot hit signals) | — |
| D3 | #6 (코어 업데이트) | — |
