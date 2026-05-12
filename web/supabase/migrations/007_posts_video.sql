-- ============================================
-- 007 — posts: 영상 hero / inline 임베드 컬럼 3종
-- ============================================
-- 마음토스 블로그를 영상 기반 콘텐츠(@mindthos Reels 등)로 확장.
-- 본문 마크다운에 iframe 직접 삽입(§4-A) 대신 데이터 구조화(§4-B) 채택:
--   video_url 컬럼을 본문과 분리해 SEO(VideoObject JSON-LD)·사이트맵·재게시
--   자동화에 유리.
--
-- 이미 운영 DB 에는 적용 완료(수동) — 본 파일은 마이그레이션 히스토리 보존용.
-- 새 환경(로컬 / 프리뷰)에서 안전하게 재적용되도록 IF NOT EXISTS 사용.
-- ============================================

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS video_provider TEXT;
COMMENT ON COLUMN posts.video_provider IS
  'mp4 | supabase | youtube | vimeo';

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS video_position TEXT DEFAULT 'hero';
COMMENT ON COLUMN posts.video_position IS
  'hero | inline — 상세 페이지에서 어디에 영상을 노출할지';
