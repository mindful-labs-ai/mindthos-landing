import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/actions/'],
      },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
