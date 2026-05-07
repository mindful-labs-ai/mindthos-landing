export const SITE_CONFIG = {
  name: '마음토스',
  alternateName: 'Mindthos',
  shortName: '마음토스',
  legalName: '마인드풀랩스 주식회사',
  legalNameEn: 'Mindful Labs Inc.',
  legalUrl: 'https://www.mindfullabs.ai/',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mindthos.com',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'business@mindfullabs.ai',
  phone: process.env.NEXT_PUBLIC_SITE_PHONE || '',
  description:
    '상담사를 위한 안전한 AI 파트너. 축어록부터 사례개념화·가계도까지 상담 업무 전반을 한 곳에서.',
  tagline: '안심하고 맡길 수 있는 상담사의 AI 파트너',
  mission: '상담사를 위한 안전한 AI agent',
  locale: 'ko_KR',
  language: 'ko',
  timezone: 'Asia/Seoul',
  /** 운영 채널 — 빈 env면 기본값(공식 채널) 사용. JSON-LD sameAs 에 그대로 노출됨 */
  social: {
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM || 'https://www.instagram.com/mind.thos',
    threads:
      process.env.NEXT_PUBLIC_THREADS || 'https://www.threads.net/@mind.thos',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER || '',
  },
  /** Organization JSON-LD address — 사업장 정보 (site-map-v2 §4-3) */
  address: {
    streetAddress: '성동구 뚝섬로13길 38, 4층',
    addressLocality: '성수동',
    addressRegion: '서울',
    postalCode: '04782',
    addressCountry: 'KR',
  },
  /** 운영 사이트 색 — design-tokens.md v1.2 */
  brand: {
    primary: '#44ce4b',
    primaryDark: '#40a755',
    primarySoft: '#65c377',
    text: '#1f1f1f',
    textHeading: '#0e0e0e',
    bgBase: '#ffffff',
    bgWarm: '#f7f5f1',
    bgDeep: '#181819',
  },
} as const;

/**
 * 한국 사업자 정보 — Footer Bottom 노출.
 * site-map-v2.md §4-3 기준. 미확정 값은 빈 문자열로 두고, 출시 직전 채웁니다.
 */
export const BUSINESS_INFO = {
  companyName: process.env.NEXT_PUBLIC_BUSINESS_NAME || '마인드풀랩스 주식회사',
  ceo: process.env.NEXT_PUBLIC_BUSINESS_CEO || '',
  brn: process.env.NEXT_PUBLIC_BUSINESS_BRN || '',
  ecommerceLicense: process.env.NEXT_PUBLIC_BUSINESS_ECOMMERCE || '',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '',
  privacyOfficer: {
    name: process.env.NEXT_PUBLIC_PRIVACY_OFFICER_NAME || '',
    email:
      process.env.NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL ||
      'privacy@mindthos.com',
  },
} as const;

export const REVALIDATION = {
  blog: 3600, // 1시간
  static: 86400, // 24시간
  home: 3600,
} as const;

export const PAGINATION = {
  postsPerPage: 12,
} as const;
