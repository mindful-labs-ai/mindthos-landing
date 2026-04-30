-- ============================================
-- 002 — counseling_programs (도메인 상품/서비스 테이블)
-- ============================================
-- 이 테이블은 "블로그 글 → 상품 페이지 CTA" 자동 매칭의 핵심입니다.
-- 도메인이 다르면 테이블명/컬럼명만 바꾸고 구조는 그대로 사용:
--   - 심리상담 → counseling_programs
--   - SaaS    → products / pricing_plans
--   - 학원    → courses
--   - 의료    → services
-- 핵심은 match_keywords 배열 — posts.keywords 와의 양방향 includes로 매칭됩니다.
-- ============================================

CREATE TABLE counseling_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  cta_heading TEXT,         -- "OO상담 자세히 알아보기" 같은 헤딩
  cta_button_text TEXT,     -- "예약하기", "신청하기" 등
  match_keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_cta_enabled BOOLEAN DEFAULT TRUE,  -- 상품은 살아있지만 CTA 비활성화하고 싶을 때
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- posts에 FK 추가 — 매칭 결과 캐싱
ALTER TABLE posts ADD COLUMN counseling_program_id UUID REFERENCES counseling_programs(id);

-- categories에 FK 추가 — 매칭 실패 시 카테고리 폴백
ALTER TABLE categories ADD COLUMN default_program_id UUID REFERENCES counseling_programs(id);

CREATE INDEX idx_counseling_programs_slug ON counseling_programs(slug);
CREATE INDEX idx_counseling_programs_active ON counseling_programs(is_active, sort_order)
  WHERE is_active = TRUE;
CREATE INDEX idx_posts_counseling_program ON posts(counseling_program_id)
  WHERE counseling_program_id IS NOT NULL;

ALTER TABLE counseling_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active programs" ON counseling_programs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage programs" ON counseling_programs
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 시드 예시 (도메인에 맞게 교체)
-- ============================================
-- INSERT INTO counseling_programs (title, slug, subtitle, cta_heading, cta_button_text, match_keywords, sort_order) VALUES
--   ('개인상담', 'individual', '1:1 심리상담', '개인상담 알아보기', '예약하기',
--    ARRAY['개인상담', '심리상담', '우울', '불안', '번아웃'], 1),
--   ('부부상담', 'couple', '커플/배우자 상담', '부부상담 알아보기', '예약하기',
--    ARRAY['부부상담', '부부갈등', '커플', '결혼', '이혼'], 2);

-- 카테고리 폴백 매핑 예시
-- UPDATE categories c SET default_program_id = cp.id
--   FROM counseling_programs cp
--   WHERE c.slug = 'mental-health' AND cp.slug = 'individual';
