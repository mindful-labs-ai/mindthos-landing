-- ============================================
-- 004 — 'mindthos' 단일 author 시드
-- ============================================
-- 마이그레이션된 모든 기존 글의 author_id 가 가리킬 단일 저자.
-- 향후 외부 기고자 도입 시 별도 시드 추가.
-- ============================================

INSERT INTO authors (
  name,
  slug,
  title,
  bio,
  role,
  is_active,
  sort_order
) VALUES (
  '마음토스',
  'mindthos',
  '상담사를 위한 안전한 AI 파트너',
  '마음토스 팀이 직접 작성·감수합니다. 상담 현장의 인사이트와 마음토스 활용 사례를 전합니다.',
  'team',
  TRUE,
  1
)
ON CONFLICT (slug) DO NOTHING;
