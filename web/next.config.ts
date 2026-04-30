import type { NextConfig } from 'next';

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
];

const nextConfig: NextConfig = {
  images: {
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
    return [
      // 제품 — /about-service 의 핵심 기능 섹션으로
      {
        source: '/product',
        destination: '/about-service#features',
        permanent: false,
      },
      {
        source: '/product/:slug*',
        destination: '/about-service#features',
        permanent: false,
      },
      // 기관용 — /contact 기관 도입 폼으로
      {
        source: '/for-institutions',
        destination: '/contact?type=institution-inquiry',
        permanent: false,
      },
      // 보안 — /about-service 보안 섹션
      {
        source: '/security',
        destination: '/about-service#security',
        permanent: false,
      },
      {
        source: '/security/how-we-protect',
        destination: '/about-service#security',
        permanent: false,
      },
      {
        source: '/security/privacy-policy',
        destination: '/privacy',
        permanent: false,
      },
      { source: '/security/terms', destination: '/terms', permanent: false },
      // 가격 — 랜딩 §09 anchor
      { source: '/pricing', destination: '/#pricing', permanent: false },
      // 회사 — /about-service 회사 섹션
      {
        source: '/about',
        destination: '/about-service#company',
        permanent: false,
      },
      // 리소스 — /blog 통합
      { source: '/resources', destination: '/blog', permanent: false },
      {
        source: '/resources/blog',
        destination: '/blog',
        permanent: false,
      },
      {
        source: '/resources/tech-blog',
        destination: '/blog',
        permanent: false,
      },
      {
        source: '/resources/guides',
        destination: '/guide',
        permanent: false,
      },
      {
        source: '/resources/case-studies',
        destination: '/blog',
        permanent: false,
      },
      // 리소스 글 상세 → /blog/[slug]
      {
        source: '/resources/:category/:slug',
        destination: '/blog/:slug',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
