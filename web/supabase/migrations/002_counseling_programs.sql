-- ============================================
-- 002 — counseling_programs (블로그 → CTA 자동 매칭 핵심)
-- ============================================
-- 마음토스 도메인에서는 "마음토스 제품/플랜" 매칭에 그대로 사용.
-- 테이블명은 blog-seo-template 호환 위해 counseling_programs 유지.
-- 시드는 마음토스 4개 핵심 제품 + 플랜으로 교체.
-- ============================================

CREATE TABLE counseling_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  cta_heading TEXT,
  cta_button_text TEXT,
  match_keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_cta_enabled BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ADD COLUMN counseling_program_id UUID REFERENCES counseling_programs(id);
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
-- 시드 — 마음토스 제품 4종
-- ============================================
INSERT INTO counseling_programs
  (title, slug, subtitle, cta_heading, cta_button_text, match_keywords, sort_order) VALUES
  ('축어록', 'transcribe', '회기 녹음을 안전하게 텍스트로',
   '축어록 자동화 살펴보기', '무료로 시작하기',
   ARRAY['축어록', '녹취', '전사', '녹음', 'transcribe', '텍스트화'], 1),
  ('상담노트', 'progress-note', 'SOAP·DAP 기반 상담 노트 자동 정리',
   '상담노트 살펴보기', '무료로 시작하기',
   ARRAY['상담노트', 'progress note', 'SOAP', 'DAP', '회기록', '진척 노트'], 2),
  ('사례개념화', 'conceptualization', '이론 기반 사례개념화 보조',
   '사례개념화 살펴보기', '무료로 시작하기',
   ARRAY['사례개념화', 'case conceptualization', 'CBT', '정신역동', 'formulation'], 3),
  ('가계도', 'genogram', '가족 구조와 패턴을 시각화',
   '가계도 살펴보기', '무료로 시작하기',
   ARRAY['가계도', 'genogram', '가족치료', '가족 구조', '세대 도식'], 4);

-- 카테고리 폴백 — 모든 카테고리는 (당분간) 무료 체험으로 안내
UPDATE categories c SET default_program_id = cp.id
  FROM counseling_programs cp
  WHERE cp.slug = 'transcribe'
    AND c.slug IN ('general-blog', 'tech-blog', 'guides', 'case-studies');
