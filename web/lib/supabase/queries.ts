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
  const { data } = await supabase
    .from('posts')
    .select('*, category:categories(*), author:authors(*)')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit);
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
  const safeQuery = query.replace(/[%_]/g, '\\$&');
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
