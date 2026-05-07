import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/constants/site';

export function generatePageMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_CONFIG.url}${options.path}`;
  const ogImages = options.image
    ? [{ url: options.image, width: 1200, height: 630, alt: options.title }]
    : [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ];
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    robots: options.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: 'website',
      images: ogImages,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: ogImages.map((img) => img.url),
    },
  };
}

interface PostMetadataInput {
  title: string;
  meta_title?: string | null;
  meta_description?: string | null;
  excerpt?: string | null;
  slug: string;
  category?: { slug: string; name: string } | null;
  thumbnail_url?: string | null;
  og_image_url?: string | null;
  published_at?: string | null;
  updated_at: string;
  author?: { name: string } | null;
  keywords?: string[];
}

export function generatePostMetadata(post: PostMetadataInput): Metadata {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || '';
  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const image = post.og_image_url || post.thumbnail_url || '';

  return {
    title,
    description,
    keywords: post.keywords?.join(', '),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
