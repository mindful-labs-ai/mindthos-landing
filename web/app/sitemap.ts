import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';
import { BLOG_PAGE_SIZE } from '@/constants/blog';

const SITE_URL = SITE_CONFIG.url;

/**
 * 사이트맵 v2 (2026-04-30) — 외부 5 페이지 + 랜딩 + 약관 2 + 블로그 글.
 * 단일 진실 원본: ../mindthos-landing-design/02-plan/current/site-map-v2.md
 *
 * lastModified 는 정적 페이지의 실제 콘텐츠 최종 수정일로 하드코딩.
 * 매 빌드마다 갱신되면 Googlebot 의 lastModified 신뢰도가 떨어져 무시됩니다.
 * 콘텐츠 변경 시 해당 페이지의 날짜만 갱신해 주세요.
 */
const STATIC_PAGE_DATES = {
  home: new Date('2026-05-07'),
  blog: new Date('2026-05-07'),
  education: new Date('2026-05-07'),
  security: new Date('2026-05-07'),
} as const;

type VideoMeta = NonNullable<MetadataRoute.Sitemap[number]['videos']>[number];

interface PostRow {
  slug: string;
  updated_at: string;
  title: string;
  excerpt: string | null;
  summary: string | null;
  published_at: string | null;
  video_url: string | null;
  video_provider: string | null;
  thumbnail_url: string | null;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

/**
 * 동영상 글의 sitemap-video 확장 메타. 필수(title·thumbnail_loc·description·
 * content_loc|player_loc)를 못 채우면 null 반환 → 해당 글은 동영상 메타 없이 URL 만 색인.
 */
function buildVideoMeta(post: PostRow): VideoMeta | null {
  if (!post.video_url || !post.thumbnail_url) return null;

  const description = (post.excerpt || post.summary || post.title || '').slice(0, 2048);
  if (!description) return null;

  const base: Omit<VideoMeta, 'content_loc' | 'player_loc'> = {
    title: post.title.slice(0, 100),
    thumbnail_loc: post.thumbnail_url,
    description,
    ...(post.published_at ? { publication_date: post.published_at } : {}),
  };

  if (post.video_provider === 'youtube') {
    const id = extractYouTubeId(post.video_url);
    if (!id) return null;
    return { ...base, player_loc: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  // 자체 호스팅 mp4 등 — 미디어 파일을 직접 가리킨다.
  return { ...base, content_loc: post.video_url };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: STATIC_PAGE_DATES.home, changeFrequency: 'weekly', priority: 1.0 },
    /* "서비스 소개"는 별도 페이지 없이 랜딩으로 연결 — /about-service 제거됨 (2026-05-04) */
    /* /guide 는 외부 Notion 문서로 대체 (constants/nav.ts NOTION_GUIDE_URL) — sitemap 제외 */
    { url: `${SITE_URL}/blog`, lastModified: STATIC_PAGE_DATES.blog, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/education`, lastModified: STATIC_PAGE_DATES.education, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/security`, lastModified: STATIC_PAGE_DATES.security, changeFrequency: 'monthly', priority: 0.6 },
    /* /contact 는 next.config.ts redirects 가 카카오톡 오픈채팅으로 외부 redirect — 사이트맵 제외 */
    /* 서비스 이용약관 / 개인정보처리방침은 app.mindthos.com/terms 외부 라우트 — 사이트맵 제외 */
  ];

  let postPages: MetadataRoute.Sitemap = [];
  const paginationPages: MetadataRoute.Sitemap = [];

  try {
    const { createStaticClient } = await import('@/lib/supabase/static');
    const supabase = createStaticClient();
    const { data: posts, count } = await supabase
      .from('posts')
      .select(
        'slug, updated_at, title, excerpt, summary, published_at, video_url, video_provider, thumbnail_url',
        { count: 'exact' },
      )
      .eq('status', 'published');

    if (posts) {
      postPages = (posts as PostRow[]).map((post) => {
        const video = buildVideoMeta(post);
        return {
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          // 동영상 글이면 sitemap-video 확장 메타 첨부 (Next 16 네이티브 videos 필드).
          ...(video ? { videos: [video] } : {}),
        };
      });
    }

    // 경로형 페이지네이션(/blog/page/N, 2페이지~) — 롱테일 글 발견용 크롤 경로.
    const total = count ?? posts?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
    for (let p = 2; p <= totalPages; p++) {
      paginationPages.push({
        url: `${SITE_URL}/blog/page/${p}`,
        lastModified: STATIC_PAGE_DATES.blog,
        changeFrequency: 'daily',
        priority: 0.4,
      });
    }
  } catch {
    // Supabase not yet configured — return static pages only.
  }

  // 전체 글 아카이브 — 모든 글에 평면 내부 링크를 제공하는 색인 허브.
  const archivePage: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog/archive`,
      lastModified: STATIC_PAGE_DATES.blog,
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...archivePage, ...paginationPages, ...postPages];
}
