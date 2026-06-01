# AEO/GEO 구현 로그 — 2026-05-29

> 액션 플랜(`action-plan.md`) B1·B3 구현 + 저자(author) 시스템 정합/통일 작업 기록.
> 본 문서는 "무엇을·왜·어디를 고쳤는가"의 단일 진실 원본. 상태 추적은 `action-plan.md` 매트릭스 참조.

---

## 1. B1 — MedicalWebPage 스키마 도입 ✅

**목적**: 정신건강(강한 YMYL) 글에 "검수된 의료 정보"임을 명시 → AI 인용(AI Overviews·Perplexity 등) 진입 신호 확보.

**구현 (DB 컬럼 추가 없음 — 기존 데이터로 파생, B2 단순화 방향과 일치)**
- `web/lib/seo/schema.ts`
  - `generateMedicalWebPageSchema()` — MedicalWebPage JSON-LD 생성
  - `isMentalHealthCategory(slug)` — 임상/정신건강 카테고리 판정
    - 대상: `case-conceptualization`, `counseling-skills`, `training`, `self-care`
    - 제외(비즈니스): `career`, `operations`, `trends`, `tech-blog`
  - `inferMedicalConditions(text)` — 제목·키워드에서 질환(MedicalCondition) 결정적 추론(우울/공황/불안/ADHD/PTSD/강박/양극성/조현병/섭식/번아웃/수면, 최대 3개, 명확 매칭 시에만)
- `web/app/(site)/blog/[slug]/page.tsx`
  - 임상 카테고리 글에 `BlogPosting`과 **동시 주입**
  - 필드 매핑: `reviewedBy`=저자, `lastReviewed`=`post.updated_at`(AI 다중 검수 시점), `about`=추론 질환, `specialty`='Psychiatric'(schema.org enum), `medicalAudience`=Clinician+Patient

**검증**: 생성 JSON-LD가 schema.org 유효 구조임을 단위 테스트로 확인.

---

## 2. B3 — inline citation 게이트 ✅ (2레이어)

**목적**: "Unlinked claims don't count" — 통계·수치 주장에 inline 출처 링크가 없으면 AI 인용 풀에서 탈락. 발행 전 강제.

**레이어 1 — AI 검수 (선행 구현되어 있었음)**
- `verifiers/aeo-structure.ts`의 Gemini 검수가 `inlineCitationsMissing` 점검 → mustFix 승격.
- 한계: `NANOBANANA_API_KEY` 필요·비결정적.

**레이어 2 — 결정적 게이트 (신규)**
- `scripts/publish-blog/src/verifiers/citation-check.ts` — `verifyCitations()`
  - 정규식으로 본문 문단 스캔. 통계·수치 주장(유병률 %, N명/배/건 등) 문단에 inline 링크 없으면 검출.
  - **AI 키 없이도 항상 작동** (결정적).
  - 임상/YMYL 카테고리: 수치 미인용 → `mustFix`(revise) / 그 외·연구키워드만: `notes`(차단 안 함) → false-positive·파이프라인 안정성 보호.
- `scripts/publish-blog/src/verifiers/types.ts` — `VerifierStage`에 `'citation_check'` 추가
- `scripts/publish-blog/src/publish.ts` — **Step 2 재구성**
  - citation 게이트는 `skipReview`가 아니면 **항상** 실행
  - AI 검수(AEO/상담사/fact)는 `NANOBANANA_API_KEY` 있을 때만 추가
- `scripts/publish-blog/daily-auto-publish.sh` — fix 프롬프트에 `[citation_check]` 처리 지침 추가(출처 부착 또는 수치 단정 완화)

**검증**: 5개 케이스(임상 미인용→revise / 인용됨→pass / 비임상→notes / 주장없음→pass / 연구키워드→notes) 설계대로 동작 확인.

---

## 3. 저자(author) slug 정합 — 버그 수정 ✅

**발견한 문제**: 실제 저자 row의 slug는 **`mindthos`**(004 시드)인데, 다음이 모두 존재하지 않는 **`mindthos-team`**을 참조 →
- 마이그레이션 009가 `WHERE slug = 'mindthos-team'` → **0건 매칭 → 한 번도 적용 안 됨** (B2 라벨이 라이브가 아니었음)
- `publish.ts` `DEFAULT_AUTHOR_SLUG` + 일일 프롬프트 템플릿이 `mindthos-team` 조회 → 실패 시 `author_id = NULL` (published 939건 중 119건 NULL이었음)

**수정 (`mindthos-team` → `mindthos`)**
- `scripts/publish-blog/src/publish.ts` — `DEFAULT_AUTHOR_SLUG = 'mindthos'`
- `scripts/publish-blog/daily-auto-publish.sh` — 프롬프트 JSON 템플릿 + dry-run 더미
- `web/supabase/migrations/009_authors_clinical_labeling.sql` — `WHERE slug = 'mindthos'`

---

## 4. 저자 라벨 통일 + null fallback ✅

**결정**: 저자를 **'마음토스 상담·임상 심리 전문가'**로 통일. `author_id`가 null이어도 이 값으로 표기.

**DB 적용 (라이브)**
- author row(`slug=mindthos`) 갱신:
  - `name` = '마음토스 상담·임상 심리 전문가'
  - `title` = '상담·임상 심리 전문가'
  - `bio` / `credentials` / `specialties` 임상 시그널로 채움
- 백필: published **943건 전부** 이 저자에 연결 → `author_id` NULL **0건**

**코드 레벨 fallback (DB에 null이 남아도 안전)**
- `web/constants/site.ts` — `DEFAULT_AUTHOR` 상수 추가(DB 라벨과 동일)
- `web/app/(site)/blog/[slug]/page.tsx` — `const author = post.author?.X ?? DEFAULT_AUTHOR.X`로 해석 후 **모든 사용처 적용**:
  - 화면 byline / Article 스키마 author / **Person 스키마(항상 주입)** / MedicalWebPage `reviewedBy` / `generateMetadata` / `BlogPageTracker`
- → 미래에 `author_id`가 null로 들어가도 화면·스키마 모두 항상 표기됨.

**byline 중복 제거**
- 이름에 직함이 이미 포함되면 title 표기 생략(`!author.name.includes(author.title)`).
- 현재: "마음토스 상담·임상 심리 전문가 · 2026년… · 약 N분" / 향후 실명 저자엔 "홍길동 · 임상심리전문가"로 직함 유지.

---

## 5. 블로그 목록 카드에서 저자 제거 ✅

- `web/components/blog/PostCard.tsx` — 카드 하단에서 저자명 표기 제거(날짜·읽기시간만).
- 사유: 긴 저자 라벨이 카드에서 2줄 줄바꿈되어 그리드 정렬을 깨뜨림. 저자/임상 신뢰 신호는 **상세 페이지 byline + 스키마에서만** 필요(목록 카드는 SEO/AEO 이점 없음). RelatedPosts도 같은 컴포넌트라 함께 반영.

---

## 변경 파일 목록

| 파일 | 변경 |
|---|---|
| `web/lib/seo/schema.ts` | B1 — MedicalWebPage 함수 3종 |
| `web/app/(site)/blog/[slug]/page.tsx` | B1 주입 + 저자 fallback + byline |
| `web/constants/site.ts` | `DEFAULT_AUTHOR` 상수 |
| `web/components/blog/PostCard.tsx` | 카드 저자명 제거 |
| `web/supabase/migrations/009_authors_clinical_labeling.sql` | slug 정합 + 라벨 통일 |
| `scripts/publish-blog/src/verifiers/citation-check.ts` | B3 결정적 게이트 (신규) |
| `scripts/publish-blog/src/verifiers/types.ts` | `citation_check` stage |
| `scripts/publish-blog/src/publish.ts` | Step 2 재구성 + slug |
| `scripts/publish-blog/daily-auto-publish.sh` | fix 프롬프트 + slug |

## DB 작업 (라이브 적용 완료)

- authors(`slug=mindthos`): 라벨/credentials/specialties/bio 통일 갱신
- posts: `author_id` NULL → `mindthos` 백필 (published 943/943 연결, NULL 0)

## 검증

- `scripts/publish-blog`: `npm run typecheck` 통과
- `web`: `tsc --noEmit` + eslint 통과
- citation 게이트·MedicalWebPage 스키마 단위 동작 확인
- 프로덕션 HTML 실측: 저자 라벨이 byline(보이는 영역)에 노출됨 확인

## 배포/후속

- 상세 페이지는 ISR(`revalidate=3600`) + 빌드 프리렌더 → **새 라벨/스키마는 재배포 또는 ISR 재검증 후 반영**. DB는 이미 반영됨.
- `/blog/author/[slug]` 라우트는 부재 — Person 스키마 `url`이 가리키는 저자 페이지 없음(기존부터 동일). 필요 시 별도 작업.
