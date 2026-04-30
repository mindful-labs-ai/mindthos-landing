export const SITE_CONFIG = {
  name: '앤아더라이프 심리상담연구소',
  shortName: '앤아더라이프',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://andotherlife.com',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'business@mindfullabs.ai',
  phone: process.env.NEXT_PUBLIC_SITE_PHONE || '070-8989-7532',
  description: '앤아더라이프 심리상담연구소 - 전문 심리상담과 가족치료, 부부상담, 아동청소년상담을 제공합니다.',
  locale: 'ko_KR',
  language: 'ko',
  address: {
    streetAddress: '잔다리로 73, 5층',
    addressLocality: '마포구',
    addressRegion: '서울특별시',
    postalCode: '04051',
    addressCountry: 'KR',
    full: '서울시 마포구 잔다리로 73, 5층',
  },
  geo: {
    latitude: 37.5540,
    longitude: 126.9164,
  },
  hours: {
    weekday: { open: '10:00', close: '19:00' },
    saturday: { open: '10:00', close: '15:00' },
    sunday: null,
  },
  social: {
    kakao: process.env.NEXT_PUBLIC_KAKAO_CHANNEL || 'https://pf.kakao.com/_xlFhps',
    naver: process.env.NEXT_PUBLIC_NAVER_BLOG || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM || '',
  },
} as const;

export const REVALIDATION = {
  blog: 3600,       // 1 hour
  static: 86400,    // 24 hours
  home: 3600,       // 1 hour
} as const;

export const PAGINATION = {
  postsPerPage: 12,
} as const;
