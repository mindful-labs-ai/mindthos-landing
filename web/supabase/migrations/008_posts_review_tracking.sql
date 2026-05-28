-- 008_posts_review_tracking.sql
-- AI 다중 검수 워크플로우 — 검수 흔적 저장 컬럼
-- (사람 검수 ❌, 모두 AI 자동 검수)
-- 작성: 2026-05-27
-- 참조: web/docs/aeo-geo-research/ai-review-workflow.md

-- 1. posts 테이블에 AI 검수 결과 컬럼
-- 단일 JSONB 로 통합 — 다중 stage 결과를 유연하게 보관
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS ai_review jsonb,
  -- 예시 구조:
  -- {
  --   "stages": {
  --     "self_reflection": { "ran": true, "model": "claude-sonnet-4-6", "at": "..." },
  --     "aeo_structure":   { "score": 8.5, "must_fix": [], "model": "gemini-2-pro", "at": "..." },
  --     "fact_check":      {
  --       "topics": ["adhd"],
  --       "master_docs": ["adhd.md@2026-05-27"],
  --       "contradicts": [],
  --       "ambiguous": ["성인 ADHD 한국 유병률 수치 출처 미명시"],
  --       "missing_in_master": [],
  --       "model": "gemini-2-pro",
  --       "at": "..."
  --     },
  --     "clinical_ethics": { "score": 9.0, "must_block": [], "at": "..." }
  --   },
  --   "iterations": 1,
  --   "final_pass_at": "2026-05-27T10:00:00+09:00",
  --   "model_versions": { "writer": "claude-opus-4-7", "reviewer": "gemini-2-pro" }
  -- }
  ADD COLUMN IF NOT EXISTS auto_review_queue boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fact_check_topics text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS review_iterations integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS medical_condition text;
  -- medical_condition: B1 MedicalWebPage.about 스키마용 (예: '주의력결핍 과잉행동장애')

-- 2. (제거됨) authors 의료 자격 컬럼
-- 당초 별도 자문위원진 데이터용으로 추가하려 했으나, B2 가 "마음토스 임상 심리 전문가"
-- generic 저자 라벨로 단순화됨에 따라 신규 컬럼 불필요.
-- 기존 authors.title / authors.credentials / authors.specialties 활용으로 충분.

-- 3. 자동 검수 큐 — auto_review_queue=true 인 발행 글 (운영자 1회 확인 대상)
CREATE INDEX IF NOT EXISTS idx_posts_review_queue
  ON posts (id, updated_at DESC)
  WHERE auto_review_queue = true;

-- 4. fact-check 토픽별 통계용 (어느 토픽이 master doc 갱신 필요한지)
CREATE INDEX IF NOT EXISTS idx_posts_fact_check_topics
  ON posts USING gin (fact_check_topics);

COMMENT ON COLUMN posts.ai_review IS
  'AI 다중 검수 결과 통합. ai-review-workflow.md Stage 1-6 결과를 stages.* 에 누적 저장.';
COMMENT ON COLUMN posts.auto_review_queue IS
  'true = 자동 검수가 통과되지 않아 status=draft 로 격리된 글. 운영자가 prompt/master doc 보완 후 재실행.';
COMMENT ON COLUMN posts.fact_check_topics IS
  'Stage 3 에서 추론된 토픽 slug 목록. 어느 master doc 와 대조됐는지 빠른 조회용.';
COMMENT ON COLUMN posts.review_iterations IS
  'Stage 5 revise 가 몇 회 실행됐는가. 최대 1 (총 2 패스). 0 = revise 없이 1차 통과.';

-- 5. 기존 발행 글은 ai_review = null (legacy) — 새 워크플로우 적용 후 재검수 가능
-- 운영 호환성: 컬럼이 null 이어도 페이지 렌더링·SEO 에 영향 없음 (page.tsx 가 ai_review 미참조).
