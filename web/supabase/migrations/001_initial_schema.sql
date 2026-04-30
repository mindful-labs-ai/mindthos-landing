-- ============================================
-- mindthos-web — 초기 스키마
-- ============================================
-- PostgreSQL 15+ on Supabase
-- 9개 테이블 + RLS + 인덱스 + 트리거
-- 출처: blog-seo-template/supabase/migrations/001_initial_schema.sql
-- 도메인 차이: 카테고리 시드는 마음토스 리소스 4종으로 교체.
--             counseling_programs 테이블은 002 마이그레이션에서 추가.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  target_audience TEXT DEFAULT 'counselor',
  default_cta_type TEXT DEFAULT 'free-trial',
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  bio TEXT,
  profile_image_url TEXT,
  credentials TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  role TEXT DEFAULT 'author',
  education TEXT,
  career TEXT[] DEFAULT '{}',
  publications TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  category_id UUID NOT NULL REFERENCES categories(id),
  thumbnail_url TEXT,
  author_id UUID REFERENCES authors(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  schema_markup JSONB,
  "references" JSONB DEFAULT '[]'::jsonb,
  cta_type TEXT DEFAULT 'free-trial',
  reading_time INTEGER,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  inquiry_type TEXT,            -- 'free-trial' | 'institution-inquiry' | 'general' 등 마음토스 도메인 값
  preferred_date TEXT,
  message TEXT,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE program_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_name TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  affiliation TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source_url TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 인덱스
-- ============================================
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status_published ON posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_posts_category ON posts(category_id, published_at DESC);
CREATE INDEX idx_posts_featured ON posts(is_featured, published_at DESC) WHERE is_featured = TRUE;
CREATE INDEX idx_posts_updated ON posts(updated_at DESC);
CREATE INDEX idx_posts_keywords ON posts USING GIN(keywords);
CREATE INDEX idx_posts_fulltext ON posts USING GIN(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, ''))
);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_authors_active_sort ON authors(is_active, sort_order) WHERE is_active = TRUE;
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status, created_at DESC);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email) WHERE is_active = TRUE;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public can read authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public can read post_tags" ON post_tags FOR SELECT USING (true);

CREATE POLICY "Public can submit inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit registrations" ON program_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can manage posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage tags" ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage authors" ON authors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage post_tags" ON post_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can read inquiries" ON contact_inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can read registrations" ON program_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can read subscribers" ON newsletter_subscribers FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 카테고리 시드 — 마음토스 리소스 4종 (constants/categories.ts 와 일치)
-- ============================================
INSERT INTO categories (name, slug, description, target_audience, default_cta_type, sort_order) VALUES
  ('일반 블로그', 'general-blog', '상담 현장의 인사이트와 마음토스 활용 사례', 'counselor', 'free-trial', 1),
  ('기술 블로그', 'tech-blog', '마음토스의 보안, AI 기술, 인프라 이야기', 'general', 'free-trial', 2),
  ('상담사 가이드', 'guides', '마음토스 사용 가이드와 상담사 워크플로우 자료', 'counselor', 'free-trial', 3),
  ('도입 사례', 'case-studies', '기관/개인 상담사의 마음토스 도입 사례', 'institution', 'institution-inquiry', 4);

-- ============================================
-- updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
