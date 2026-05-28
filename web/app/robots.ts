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
      /* AI 검색·인용 봇 — GEO 가시성 확보를 위해 명시 허용
       * (참조: web/docs/aeo-geo-research/10-ai-bot-robots-txt-configuration.md) */
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      /* Anthropic 3-봇 구조 (2026-02-26 발표). Claude-Web 은 deprecated — 제거. */
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-User', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      /* Bing 인덱스 = ChatGPT Search 백엔드. 명시 허용 필수. */
      { userAgent: 'Bingbot', allow: ['/', '/api/indexnow'], disallow: ['/api/', '/actions/'] },
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
