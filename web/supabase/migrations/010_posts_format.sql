-- 010_posts_format.sql
-- 블로그 글 포맷 분류 — article / listicle / guide
-- AEO/GEO 액션 플랜 §B4 (action-plan.md)
-- 참조: web/docs/aeo-geo-research/action-plan.md
-- 작성: 2026-05-29
--
-- 동기:
--   AI 인용 데이터(Evertune 25,000 URL) 기준 전체 인용 63% / 상업 쿼리 인용
--   40.86% 가 ranked listicle 페이지. format 분기로 키워드 인텐트와 맞는
--   포맷의 글이 자동 생성되도록 한다.
--
-- 적용:
--   Supabase Dashboard SQL Editor
--   https://supabase.com/dashboard/project/ulrxefpxlsbpjgvpxxor/sql/new
--
-- 안전성:
--   - DEFAULT 'article' 로 기존 published 글 939건 자동 분류 (적절 — 대부분 정보성)
--   - CHECK 제약으로 잘못된 값 INSERT 방지
--   - 블로그 페이지 렌더링은 마크다운 그대로라 즉시 영향 없음 (number 매긴 H2 도 잘 렌더링)
--
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'article'
    CHECK (format IN ('article', 'listicle', 'guide'));

CREATE INDEX IF NOT EXISTS idx_posts_format
  ON posts (format);

COMMENT ON COLUMN posts.format IS
  '글 포맷. article=정보성(기본), listicle=추천·비교 ranked, guide=종합 정리. select-daily-topics.ts inferFormat() 결정.';
