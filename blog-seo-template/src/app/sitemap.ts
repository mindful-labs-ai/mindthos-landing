import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://andotherlife.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 빌드 시점을 기본 lastModified로 사용 (정적 페이지는 코드 변경 시 자동 갱신)
  const now = new Date();

  // noindex 페이지(/about/philosophy, /about/facility, /programs/[slug])는 sitemap에서 제외
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/programs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/counseling`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/counseling/individual`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/counseling/couple`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/counseling/family`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/counseling/child-youth`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/counseling/young-adult`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/counseling/psychological-testing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/counseling/social-contribution`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/counseling/eap`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  let postPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];
  let tagPages: MetadataRoute.Sitemap = [];
  let teamPages: MetadataRoute.Sitemap = [];

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, category:categories(slug)')
      .eq('status', 'published');

    if (posts) {
      postPages = posts.map((post: { slug: string; updated_at: string; category: { slug: string } | null }) => ({
        url: `${SITE_URL}/blog/${post.category?.slug || 'uncategorized'}/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at');

    if (categories) {
      categoryPages = categories.map((cat: { slug: string; updated_at: string | null }) => ({
        url: `${SITE_URL}/blog/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : now,
      }));
    }

    // 태그 페이지는 글 3개 이상인 경우에만 sitemap에 포함 (thin content 회피)
    const TAG_INDEX_MIN_POSTS = 3;
    const { data: tagsRaw } = await supabase
      .from('tags')
      .select('slug, post_tags(post_id)');

    if (tagsRaw) {
      tagPages = (tagsRaw as { slug: string; post_tags: { post_id: string }[] | null }[])
        .filter((tag) => (tag.post_tags?.length ?? 0) >= TAG_INDEX_MIN_POSTS)
        .map((tag) => ({
          url: `${SITE_URL}/blog/tag/${tag.slug}`,
          lastModified: now,
        }));
    }

    const { data: authors } = await supabase
      .from('authors')
      .select('slug, updated_at');

    if (authors) {
      teamPages = authors.map((author: { slug: string; updated_at: string | null }) => ({
        url: `${SITE_URL}/team/${author.slug}`,
        lastModified: author.updated_at ? new Date(author.updated_at) : now,
      }));
    }
  } catch {
    // Supabase not configured yet, return static pages only
  }

  return [...staticPages, ...categoryPages, ...tagPages, ...teamPages, ...postPages];
}
