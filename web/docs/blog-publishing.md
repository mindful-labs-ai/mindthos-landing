# 블로그 글 발행 가이드 (Supabase 직접 운영)

마음토스 블로그는 별도 어드민 페이지 없이 **Supabase Dashboard 에서 직접** 발행합니다.

## 1. 글 작성

[Supabase Dashboard → Table Editor → posts](https://supabase.com/dashboard/project/ulrxefpxlsbpjgvpxxor/editor) 에서 새 row 추가, 또는 SQL Editor 에 다음 INSERT 템플릿 실행.

```sql
-- 카테고리 / 저자 ID 먼저 확인
SELECT id, slug, name FROM categories ORDER BY sort_order;
SELECT id, slug, name FROM authors WHERE is_active ORDER BY sort_order;
SELECT id, slug, title FROM counseling_programs WHERE is_active ORDER BY sort_order;

-- 글 INSERT (값 채워서 실행)
INSERT INTO posts (
  title, slug, excerpt, summary, content, keywords,
  category_id, author_id, counseling_program_id,
  thumbnail_url, og_image_url,
  meta_title, meta_description,
  cta_type, status, published_at, is_featured
) VALUES (
  '제목 (30-60자, 핵심 키워드 앞쪽)',
  'english-slug-3-5-words',
  '카드/메타에 노출되는 발췌 (155자 이내)',
  '"이 글의 핵심" 박스 본문 (200-400자)',
  $$# H1 안 씀 (page.tsx 가 title 을 H1 으로 렌더)

본문은 H2 로 시작.

## H2 섹션 1

…마크다운 본문 (2,000자 이상 권장)…

## H2 섹션 2

…
$$,
  ARRAY['키워드1', '키워드2', '키워드3'],
  (SELECT id FROM categories WHERE slug = 'general-blog'),
  (SELECT id FROM authors WHERE slug = 'mindthos-team' LIMIT 1),  -- 없으면 NULL
  (SELECT id FROM counseling_programs WHERE slug = 'transcribe'), -- 매칭할 제품
  'https://…/thumbnail.webp',  -- Storage blog-images 버킷 권장
  NULL,  -- og_image_url 없으면 thumbnail 폴백 + 동적 OG
  '메타 타이틀 (30-60자)',
  '메타 디스크립션 (120-155자, 행동 유도 포함)',
  'free-trial',     -- 'free-trial' | 'institution-inquiry' | 'newsletter'
  'published',      -- 'draft' | 'published' | 'archived'
  (NOW() AT TIME ZONE 'Asia/Seoul')::timestamptz,
  FALSE             -- is_featured (홈페이지 노출용)
);
```

### KST 타임스탬프

`published_at` 은 위 템플릿처럼 `(NOW() AT TIME ZONE 'Asia/Seoul')::timestamptz` 로 저장하면 직접 SQL 조회 시 한국 시간으로 보입니다.

### 태그 연결 (선택)

```sql
-- 태그가 없으면 먼저 생성
INSERT INTO tags (name, slug) VALUES ('상담노트', 'progress-note')
  ON CONFLICT (slug) DO NOTHING;

-- 글에 태그 연결
INSERT INTO post_tags (post_id, tag_id)
SELECT
  (SELECT id FROM posts WHERE slug = 'english-slug-3-5-words'),
  (SELECT id FROM tags WHERE slug = 'progress-note');
```

### 썸네일 / OG 이미지 업로드

[Storage → blog-images](https://supabase.com/dashboard/project/ulrxefpxlsbpjgvpxxor/storage/buckets/blog-images) 에 1200x630 WebP 파일 업로드 → public URL 복사.

OG 이미지를 따로 만들지 않으면 `app/(site)/blog/[slug]/opengraph-image.tsx` 가 동적 생성합니다.

## 2. 발행 후 캐시 갱신

새 글 INSERT 또는 기존 글 UPDATE 후, 1시간 ISR 을 기다리지 않으려면 수동 트리거.

### A. 자체 revalidate (권장 — Next.js ISR 즉시 갱신)

`web/.env.local` 의 `REVALIDATION_SECRET` 사용:

```bash
SECRET="$(grep '^REVALIDATION_SECRET=' web/.env.local | cut -d= -f2)"
SLUG="english-slug-3-5-words"

curl -X POST https://mindthos.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SECRET\",\"paths\":[\"/blog\",\"/blog/$SLUG\"]}"
```

(개발 중에는 `https://mindthos.com` 대신 `http://localhost:3000`)

### B. IndexNow (Bing/Yandex 즉시 인덱싱)

```bash
SLUG="english-slug-3-5-words"

curl -X POST https://mindthos.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d "{\"urls\":[\"https://mindthos.com/blog/$SLUG\"]}"
```

성공 시 응답: `{"ok":true,"status":202,"forwardedUrls":1}`

> Google Search Console 은 IndexNow 미지원 — sitemap.xml 자동 갱신 후 색인 대기.

### C. 한 번에 둘 다

새 글 발행 시 자주 쓰는 콤보:

```bash
SECRET="$(grep '^REVALIDATION_SECRET=' web/.env.local | cut -d= -f2)"
BASE="https://mindthos.com"
SLUG="english-slug-3-5-words"

# Revalidate ISR
curl -sX POST "$BASE/api/revalidate" -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SECRET\",\"paths\":[\"/blog\",\"/blog/$SLUG\"]}"
echo

# Ping IndexNow
curl -sX POST "$BASE/api/indexnow" -H "Content-Type: application/json" \
  -d "{\"urls\":[\"$BASE/blog/$SLUG\"]}"
echo
```

## 3. 글 수정 / 비공개 / 삭제

```sql
-- 본문/제목 수정 — updated_at 트리거가 자동 갱신
UPDATE posts SET title = '…', content = $$…$$, updated_at = NOW()
  WHERE slug = 'english-slug-3-5-words';

-- 비공개 (인덱스에서 제거)
UPDATE posts SET status = 'archived' WHERE slug = '…';

-- 영구 삭제 (post_tags 도 ON DELETE CASCADE 로 자동 삭제)
DELETE FROM posts WHERE slug = '…';
```

수정/삭제 후에도 위 §2 의 revalidate + indexnow 명령으로 캐시 갱신.

## 4. SEO / AEO 발행 전 점검 (글 1개당)

### 4-1. 기본 SEO

- [ ] meta_title 30-60자 + 키워드 앞쪽 30자 내
- [ ] meta_description 120-155자 + 행동 유도
- [ ] H2 5-8개 (글 길이 비례), 최소 2개 H2 에 키워드
- [ ] 첫 문단 100자 내 핵심 키워드
- [ ] 본문 2,000자 이상
- [ ] 슬러그 3-5단어 영문 소문자 하이픈
- [ ] thumbnail_url 또는 OG 동적 생성 작동 확인
- [ ] keywords 배열 채움 (CTA 매칭에 사용)
- [ ] cta_type 적절 (`free-trial` / `institution-inquiry` / `newsletter`)
- [ ] counseling_program_id 매칭 (없으면 카테고리 default 폴백)
- [ ] FAQ 추가 시 `schema_markup` JSONB 에 FAQPage 객체 INSERT

### 4-2. AEO/GEO 점검 (액션 플랜 §A3 — AI 인용 최적화)

- [ ] **`summary` 첫 1-2 문장이 그 자체로 글 제목 질문의 답** — 인용 발췌 위치 (본문 첫 30%) 활용. "이 글에서는…", "최근 들어…" 같은 hook 시작 금지.
- [ ] 각 H2 직후 첫 문장 = 그 H2 질문의 답 (passage-level self-contained)
- [ ] 의학·통계·연구 주장은 본문 안 inline 링크 부착 (`[근거명](URL)`)
- [ ] `references` 배열에 academic/government 출처 1개 이상 (정신건강 카테고리)
- [ ] (예정) `medical_condition` 컬럼 — B1 MedicalWebPage 스키마 데이터

### 4-3. 검수 점검 (액션 플랜 §A5)

- [ ] Gemini 자동 검증 (publish.ts Step 2) factErrors / clinicalRisks 모두 통과
- [ ] **정신건강·심리 카테고리는 사람 검수 필수** — `reviewed_by`, `reviewed_at` 채움
- [ ] 검수자가 본 글 출처·자격 범위·임상 권고를 확인했음 (의료광고 사전심의 대상이면 별도 진행)

### FAQ 예시 (`schema_markup` 컬럼)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "축어록은 안전한가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "전 구간 암호화 …" }
    }
  ]
}
```

## 5. 작성자 / 카테고리 관리

```sql
-- 새 작성자
INSERT INTO authors (name, slug, title, bio, credentials, specialties, is_active, sort_order)
VALUES ('홍길동', 'hong-gildong', '임상심리사 1급',
  '소개 문구', ARRAY['임상심리사 1급', 'KCP'], ARRAY['CBT'], TRUE, 10);

-- 새 카테고리 (현재 4종으로 충분 — 추가 시에만)
INSERT INTO categories (name, slug, description, target_audience, default_cta_type, default_program_id, sort_order)
VALUES ('연구·논문', 'research', '연구 결과 요약', 'counselor', 'free-trial',
  (SELECT id FROM counseling_programs WHERE slug = 'transcribe'), 5);
```

## 6. 발행 워크플로 요약

1. Supabase Studio 에서 글 INSERT (status='draft' 로 먼저)
2. **사람 검수 — 정신건강·심리 카테고리 필수** (§7 참조)
3. (선택) 태그 연결, 썸네일 업로드
4. status='published' 로 전환, published_at = KST NOW
5. `curl /api/revalidate` 로 ISR 즉시 갱신
6. `curl /api/indexnow` 로 Bing/Yandex 인덱싱 trigger
7. Google Search Console 에서는 sitemap 재제출 또는 자연 크롤 대기

## 7. AI 다중 검수 워크플로 (사람 검수 ❌)

마음토스 블로그는 **사람이 글마다 검수하지 않는다**. AI 가 다중 패스로 글을 검수한다.
운영자는 **prompt 와 master doc 만 관리**하면 된다.

상세 설계: [`aeo-geo-research/ai-review-workflow.md`](./aeo-geo-research/ai-review-workflow.md)
Master doc 시스템: [`aeo-geo-research/master-docs-architecture.md`](./aeo-geo-research/master-docs-architecture.md)

### 7-1. 6-stage 파이프라인 요약

```
Stage 0  Claude 초안 작성 (skill/script)
Stage 1  Claude self-reflection — 자기 글 AEO 체크리스트 점검 + 1차 수정
Stage 2  Gemini AEO/구조 검증 — passage 단독성, summary 직접답변, citations
Stage 3  Gemini fact 검증 + master doc 대조 — 토픽 추론 → master 로드 → 모순 검출
Stage 4  Gemini 임상·윤리 검증 — 자격 범위, 광고 표현, 스티그마, 유해 권고
Stage 5  Claude 수정 패스 — Stage 2-4 critique 모두 반영해서 본문 수정
Stage 6  Re-verify (1회 한정) — Stage 2-4 다시 → 통과 시 발행
```

### 7-2. 통과 / 실패 분기

- 모두 통과 → status='published' 로 발행, `ai_review` JSONB 에 모든 stage 결과 기록
- 1회 revise 후도 실패 → `status='draft'` + `auto_review_queue=true` 로 격리
- `unsafeAdvice` (자살·자해·약물 자가조절 등) 1건 이상 → 즉시 큐 (revise 도 금지)

### 7-3. DB 기록 (마이그레이션 008 신규 컬럼)

```sql
posts.ai_review            -- JSONB: 모든 stage 결과 통합
posts.auto_review_queue    -- bool: AI 검수 실패로 격리
posts.fact_check_topics    -- text[]: Stage 3 매칭된 master doc slug
posts.review_iterations    -- int: revise 패스 횟수 (0 또는 1)
posts.medical_condition    -- text: MedicalWebPage.about 용 (Phase 2)
```

### 7-4. 운영자의 책임 (글마다 검수 ❌, 시스템만 관리)

- **Prompt 갱신** — Stage 1-5 각 프롬프트 (`.claude/skills/blog-enrich/prompts/`, publish.ts)
- **Master doc 추가·갱신** — `docs/fact-master/{slug}.md` (master-docs-architecture.md 참조)
- **Auto review queue 처리** — 주 1회 큐 글들의 `ai_review` JSON 확인 → 막힌 stage 원인 분석 → prompt/master 보완 → 재실행
- **분기 master refresh** — 외부 가이드라인 변경 반영 (자동 스크립트)

### 7-5. Auto review queue 조회

```sql
-- AI 검수 실패로 격리된 글
SELECT id, slug, title, ai_review->'stages' AS stages, review_iterations
FROM posts
WHERE auto_review_queue = true
ORDER BY updated_at DESC;

-- 특정 master doc 가 fact-check 에서 자주 충돌하는지 (master 갱신 trigger)
SELECT t.topic, COUNT(*) as contradicts
FROM posts p,
     unnest(p.fact_check_topics) t(topic)
WHERE p.ai_review->'stages'->'fact_check'->'contradicts' != '[]'::jsonb
GROUP BY t.topic
ORDER BY contradicts DESC;
```

### 7-6. 토큰 비용 정책

글 1편당 평균 $0.15-0.25 (revise 없으면), 최악 $0.5 (revise 1회). 일 5편 발행 시 월 ~$25-75.
**토큰 비용보다 콘텐츠 신뢰성이 우선**. 마스터 doc 1개 작성에 $2-5 — 평생 자산이라 허용.

## 참고 — 환경 / 인프라

- DB: Supabase project `ulrxefpxlsbpjgvpxxor` (Mindthos-Landing, ap-southeast-1)
- Storage 버킷: `blog-images` (public, 5MB, image/* mime types)
- ISR revalidate: 1시간 (`REVALIDATION` 상수)
- IndexNow 키 검증 경로: `GET /api/indexnow` (평문 응답) + `public/{KEY}.txt`
- 컴포넌트 진입점: `app/(site)/blog/page.tsx`, `app/(site)/blog/[slug]/page.tsx`
