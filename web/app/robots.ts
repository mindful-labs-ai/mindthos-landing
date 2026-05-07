import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      /* 일반 크롤러: API 내부 경로 차단, IndexNow 키 검증 경로(/api/indexnow) 만 허용 */
      {
        userAgent: '*',
        allow: ['/', '/api/indexnow'],
        disallow: ['/api/', '/actions/'],
      },
      /* AI 검색·인용 봇 — GEO 가시성 확보를 위해 명시 허용 */
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      /* 학습 데이터 아카이버 — 차단 유지 (라이브 AI 검색에는 영향 없음) */
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Bytespider', disallow: '/' },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
