import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';

const SITE_URL = SITE_CONFIG.url;

/**
 * 사이트맵 v2 (2026-04-30) — 외부 5 페이지 + 랜딩 + 약관 2 + 블로그 글.
 * 단일 진실 원본: ../mindthos-landing-design/02-plan/current/site-map-v2.md
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/about-service`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/education`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let postPages: MetadataRoute.Sitemap = [];

  try {
    const { createStaticClient } = await import('@/lib/supabase/static');
    const supabase = createStaticClient();
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('status', 'published');

    if (posts) {
      postPages = (
        posts as unknown as { slug: string; updated_at: string }[]
      ).map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Supabase not yet configured — return static pages only.
  }

  return [...staticPages, ...postPages];
}
