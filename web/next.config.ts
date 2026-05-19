import type { NextConfig } from 'next';

/**
 * Content Security Policy — report-only 모드.
 * 본 사이트는 다음 외부 origin 을 의도적으로 사용:
 *  - Google Fonts (IBM Plex Mono via next/font/google) → fonts.gstatic.com / fonts.googleapis.com
 *  - GA4 (선택) → www.google-analytics.com / www.googletagmanager.com
 *  - Meta Pixel (선택) → connect.facebook.net / *.facebook.com
 *  - Supabase Storage 이미지 → *.supabase.co
 *  - cdn.prod.website-files.com (랜딩에 일부 외부 이미지)
 *  - app.mindthos.com (외부 redirect 대상이지만 frame 은 아님)
 *  - vercel insights (선택) → vitals.vercel-insights.com
 * inline script 가 (GA/Pixel/JSON-LD) 존재하므로 unsafe-inline 허용.
 * Report-only 로 시작 — 1주 모니터링 후 enforce 로 전환.
 */
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://cdn.prod.website-files.com https://www.google-analytics.com https://*.facebook.com https://i.ytimg.com",
  "media-src 'self' https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.facebook.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://app.mindthos.com",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  /**
   * 사이트맵 v1 → v2 전환 잔여 URL 흡수.
   * 출시 전이라 외부 색인은 없지만, 와이어 / 디자인 / 내부 문서에 남은 링크가 자연스럽게 흘러가도록 합니다.
   */
  async redirects() {
    /* 사용 가이드는 외부 Notion 문서로 운영 — /guide 또는 /resources/guides 진입 시
       모두 Notion 으로 직행. 단일 진실 원본: web/constants/nav.ts NOTION_GUIDE_URL */
    const NOTION_GUIDE_URL =
      'https://rare-puppy-06f.notion.site/v2-2cfdd162832d801bae95f67269c062c7';
    /* 문의 채널은 카카오톡 오픈채팅으로 운영 (내부 contact 페이지 제거).
       단일 진실 원본: web/constants/nav.ts KAKAO_INQUIRY_URL */
    const KAKAO_INQUIRY_URL = 'https://open.kakao.com/me/Mindthos';
    return [
      { source: '/guide', destination: NOTION_GUIDE_URL, permanent: false, basePath: false },
      // 문의 — 내부 contact 페이지 제거됨, 카카오톡 오픈채팅으로 직행
      { source: '/contact', destination: KAKAO_INQUIRY_URL, permanent: false, basePath: false },
      { source: '/contact/:path*', destination: KAKAO_INQUIRY_URL, permanent: false, basePath: false },
      { source: '/inquiry', destination: KAKAO_INQUIRY_URL, permanent: false, basePath: false },
      // 제품 — 별도 /product 라우트 없음, 홈으로 흡수 (영구 통합 → 301)
      { source: '/product', destination: '/', permanent: true },
      { source: '/product/:slug*', destination: '/', permanent: true },
      // 기관용 — 카카오톡 오픈채팅으로 직행 (내부 contact 폼 제거)
      {
        source: '/for-institutions',
        destination: KAKAO_INQUIRY_URL,
        permanent: false,
        basePath: false,
      },
      // 보안 — /security 는 실제 라우트(app/(site)/security/page.tsx). redirect 두면 라우트가 가려져 제거.
      // /security/* 하위 잔여 URL 만 흡수.
      { source: '/security/how-we-protect', destination: '/security', permanent: true },
      {
        source: '/security/privacy-policy',
        destination: 'https://app.mindthos.com/terms?type=privacy',
        permanent: false,
        basePath: false,
      },
      {
        source: '/security/terms',
        destination: 'https://app.mindthos.com/terms?type=service',
        permanent: false,
        basePath: false,
      },
      // 가격 — 랜딩 §09 anchor (라우트 영구 제거 → 301)
      { source: '/pricing', destination: '/#pricing', permanent: true },
      // 회사 — 별도 /about 라우트 없음, 홈으로 (라우트 영구 제거 → 301)
      { source: '/about', destination: '/', permanent: true },
      // 리소스 — /blog 통합 (영구 이전 → 301)
      { source: '/resources', destination: '/blog', permanent: true },
      {
        source: '/resources/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/resources/tech-blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/resources/guides',
        destination: NOTION_GUIDE_URL,
        permanent: false,
        basePath: false,
      },
      {
        source: '/resources/case-studies',
        destination: '/blog',
        permanent: true,
      },
      // 리소스 글 상세 → /blog/[slug] (영구 이전 → 301, 색인 신호 전달)
      {
        source: '/resources/:category/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
