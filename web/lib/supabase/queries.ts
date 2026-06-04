import { cache } from 'react';
import { createStaticClient } from './static';
import type { Database } from './types';
import type { Post } from '@/types/blog';

type Category = Database['public']['Tables']['categories']['Row'];
type CounselingProgram =
  Database['public']['Tables']['counseling_programs']['Row'];

/**
 * 본 모듈의 모든 함수는 cookies 없는 `createStaticClient` 를 사용해
 * generateStaticParams / sitemap.ts 등 빌드 타임에서도 안전하게 호출 가능합니다.
 * 단, RLS 가 anon 권한으로 평가되므로 **공개 데이터(발행된 글, 활성 카테고리 등)** 만 조회하세요.
 * 인증 사용자 전용 쿼리(어드민, 회원 영역)는 `lib/supabase/server.ts` 의 클라이언트로 별도 모듈을 만들어주세요.
 */

export async function getPublishedPosts(options?: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
}): Promise<{ posts: Post[]; total: number }> {
  const { page = 1, perPage = 12, categorySlug } = options ?? {};
  const supabase = createStaticClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let categoryId: string | undefined;
  if (categorySlug) {
    const categories = await getCategories();
    categoryId = categories.find((c) => c.slug === categorySlug)?.id;
  }

  const baseQuery = supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  const { data, count, error } = await (categoryId
    ? baseQuery.eq('category_id', categoryId)
    : baseQuery);
  if (error) throw error;
  return { posts: (data ?? []) as Post[], total: count ?? 0 };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data as Post;
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export async function getFeaturedPosts(limit = 6): Promise<Post[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getLatestPosts(limit = 6): Promise<Post[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Post[];
}

export const getCounselingPrograms = cache(
  async (): Promise<CounselingProgram[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('counseling_programs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
);

export async function getCounselingProgramBySlug(
  slug: string
): Promise<CounselingProgram | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('counseling_programs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getCounselingProgramById(
  id: string
): Promise<CounselingProgram | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('counseling_programs')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();
  if (error) return null;
  return data;
}

export const getPopularPosts = cache(async (limit = 5): Promise<Post[]> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[getPopularPosts]', error);
    return [];
  }
  return (data ?? []) as Post[];
});

export async function searchPosts(
  query: string,
  options?: { page?: number; perPage?: number }
): Promise<{ posts: Post[]; total: number }> {
  const { page = 1, perPage = 12 } = options ?? {};
  const supabase = createStaticClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  // Strip PostgREST .or() meta characters and ilike wildcards; cap length to avoid abuse.
  const safeQuery = query
    .replace(/[%_,()*\\]/g, ' ')
    .trim()
    .slice(0, 80);
  if (!safeQuery) return { posts: [], total: 0 };
  const { data, count, error } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)', { count: 'exact' })
    .eq('status', 'published')
    .or(
      `title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%,summary.ilike.%${safeQuery}%`
    )
    .order('published_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { posts: (data ?? []) as Post[], total: count ?? 0 };
}

export interface ArchivePost {
  slug: string;
  title: string;
  category: { name: string; slug: string } | null;
}

// PostgREST 기본 max-rows(보통 1000)에 걸려 조용히 잘리는 것을 방지하는 명시적 상한.
// 글 수가 이 값을 넘으면 아카이브가 일부 글을 누락하므로 상향 필요.
const ARCHIVE_MAX_POSTS = 5000;

/**
 * 아카이브 페이지용 — 발행된 전체 글을 최소 필드로 1회 조회.
 * 모든 글에 크롤 가능한 평면 내부 링크를 제공해 롱테일 글의 색인 발견을 돕는다.
 */
export async function getAllPostsForArchive(): Promise<ArchivePost[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('posts')
    .select('slug, title, category:categories(name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(0, ARCHIVE_MAX_POSTS - 1);
  if (error) throw error;

  // category 조인은 to-one 이지만 PostgREST 타입은 배열로 추론 → 단일 객체로 정규화.
  type Row = { slug: string; title: string; category: { name: string; slug: string } | { name: string; slug: string }[] | null };
  return (data ?? []).map((raw) => {
    const row = raw as Row;
    const category = Array.isArray(row.category) ? (row.category[0] ?? null) : row.category;
    return { slug: row.slug, title: row.title, category };
  });
}

export async function getPostsTotalForCategory(
  categorySlug?: string
): Promise<number> {
  const supabase = createStaticClient();
  let query = supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');
  if (categorySlug) {
    const cats = await getCategories();
    const cat = cats.find((c) => c.slug === categorySlug);
    if (!cat) return 0;
    query = query.eq('category_id', cat.id);
  }
  const { count } = await query;
  return count ?? 0;
}
