-- ============================================
-- 003 — 카테고리 추가 (Webflow 운영 분류로 — INSERT only, 안전)
-- ============================================
-- 사용자가 운영하던 Webflow 카테고리 (Baserow 'Mindthos Blog' Category 컬럼) 분류를 추가한다.
-- 본 마이그레이션은 INSERT only — 기존 카테고리는 그대로 둔다.
-- 본격 일괄 마이그레이션 직전 005_remove_legacy_categories.sql 로 기존 4종 (general-blog/tech-blog/
-- guides/case-studies) 을 삭제할 예정.
--
-- 적용 절차:
--   1. scripts/migrate-blog 에서 'npm run categories' 실행 → .data/categories-mapping.json 산출
--   2. 영문 'slug' 결정 후 본 파일 INSERT 블록을 매핑에 맞춰 채움
--   3. bash scripts/apply-supabase-migrations.sh blog 로 적용
-- ============================================

INSERT INTO categories (name, slug, description, target_audience, default_cta_type, sort_order) VALUES
  ('커리어', 'career', '상담 전문가의 커리어 / 진로 가이드', 'counselor', 'free-trial', 1)
  -- (1개 글 테스트용 — 일괄 마이그레이션 시 추가 카테고리 행 INSERT)
ON CONFLICT (slug) DO NOTHING;
