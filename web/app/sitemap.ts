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
    /* "서비스 소개"는 별도 페이지 없이 랜딩으로 연결 — /about-service 제거됨 (2026-05-04) */
    /* /guide 는 외부 Notion 문서로 대체 (constants/nav.ts NOTION_GUIDE_URL) — sitemap 제외 */
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/education`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    /* /contact 는 next.config.ts redirects 가 카카오톡 오픈채팅으로 외부 redirect — 사이트맵 제외 */
    /* 서비스 이용약관 / 개인정보처리방침은 app.mindthos.com/terms 외부 라우트 — 사이트맵 제외 */
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
      postPages = (posts as { slug: string; updated_at: string }[]).map((post) => ({
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
