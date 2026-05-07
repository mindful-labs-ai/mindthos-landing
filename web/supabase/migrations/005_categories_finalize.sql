-- ============================================
-- 005 — 카테고리 확정 (마이그레이션 직전)
-- ============================================
-- 1) Baserow 운영 카테고리 7종 추가 (career 는 003 에 이미 시드)
-- 2) tech-blog → '마음토스' 이름만 변경 (slug 유지: URL 호환)
-- 3) 부트스트랩용 카테고리 3종 (general-blog / guides / case-studies) 삭제
--
-- 외래키 주의:
--   posts.category_id 는 ON DELETE 미지정 = RESTRICT.
--   삭제 대상 카테고리에 묶인 posts 가 있으면 DELETE 실패. 마이그레이션 1차 (1+5 글) 에선 모두 'career'.
-- ============================================

BEGIN;

-- 1. 신규 카테고리 INSERT (멱등)
INSERT INTO categories (name, slug, description, target_audience, default_cta_type, sort_order) VALUES
  ('사례개념화 & 이론', 'case-conceptualization', '사례개념화와 상담 이론', 'counselor', 'free-trial', 1),
  ('상담 스킬', 'counseling-skills', '상담 현장에 바로 쓰는 스킬과 기법', 'counselor', 'free-trial', 2),
  ('수련 실전', 'training', '수련 과정과 실전 노하우', 'counselor', 'free-trial', 3),
  ('운영 & 프리랜서', 'operations', '사설 상담 운영과 프리랜서 가이드', 'counselor', 'free-trial', 5),
  ('자기돌봄', 'self-care', '상담사의 번아웃과 자기돌봄', 'counselor', 'free-trial', 6),
  ('트렌드 & 기타', 'trends', '상담 분야의 새 동향과 기타', 'counselor', 'free-trial', 7)
ON CONFLICT (slug) DO NOTHING;

-- 2. career sort_order 재배치 (글 수 기준 4번째)
UPDATE categories SET sort_order = 4 WHERE slug = 'career';

-- 3. tech-blog 이름 변경 (slug 유지) + sort_order 끝으로
UPDATE categories
   SET name = '마음토스', sort_order = 8
 WHERE slug = 'tech-blog';

-- 4. 부트스트랩 더미 글 정리 (general-blog 카테고리에 묶인 1개)
DELETE FROM posts WHERE slug = 'ai-transcription-counseling-security';

-- 5. 미사용 부트스트랩 카테고리 DELETE (참조 posts 없어야 성공)
DELETE FROM categories WHERE slug IN ('general-blog', 'guides', 'case-studies');

COMMIT;
