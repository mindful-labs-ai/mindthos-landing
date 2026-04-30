export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  summary: string | null;
  keywords: string[];
  category_id: string;
  thumbnail_url: string | null;
  author_id: string | null;
  status: 'draft' | 'published' | 'archived';
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  schema_markup: Record<string, unknown> | null;
  references: Reference[] | null;
  cta_type: string;
  reading_time: number | null;
  view_count: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  category?: Category;
  author?: Author;
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  target_audience: 'client' | 'professional';
  default_cta_type: string;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  default_program_id: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  profile_image_url: string | null;
  credentials: string[];
  specialties: string[];
  created_at: string;
}

export interface Reference {
  name: string;
  url: string;
  type: 'academic' | 'government' | 'industry';
  description?: string;
}

export interface CounselingProgram {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  cta_heading: string | null;
  cta_button_text: string | null;
}
