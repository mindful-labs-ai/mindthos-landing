import { SITE_CONFIG } from '@/constants/site';

export function generateOrganizationSchema() {
  const sameAs = [
    SITE_CONFIG.legalUrl,
    SITE_CONFIG.social?.instagram,
    SITE_CONFIG.social?.threads,
    SITE_CONFIG.social?.linkedin,
    SITE_CONFIG.social?.twitter,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.legalName,
    alternateName: [
      SITE_CONFIG.name,
      SITE_CONFIG.alternateName,
      SITE_CONFIG.legalNameEn,
    ],
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/og-default.png`,
      width: 1200,
      height: 630,
    },
    address: {
      '@type': 'PostalAddress',
      ...SITE_CONFIG.address,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    /* B2 — Generic 저자 라벨링: 마음토스가 다루는 전문 영역을 명시.
     * (action-plan.md §B2 + ai-review-workflow.md) */
    knowsAbout: [
      '정신건강',
      '심리상담',
      '임상 심리',
      '인지행동치료',
      '상담 기록 및 축어록',
      '사례개념화',
      '슈퍼비전',
      '상담사 자격 및 윤리',
      '위기 상담',
      '청소년 상담',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: {
        '@type': 'Language',
        name: 'Korean',
        alternateName: 'ko',
      },
      ...(SITE_CONFIG.phone ? { telephone: SITE_CONFIG.phone } : {}),
      ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
    },
  };
}

/**
 * 홈 페이지(/)에 주입되는 SoftwareApplication 스키마.
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${SITE_CONFIG.name} (${SITE_CONFIG.alternateName})`,
    alternateName: [SITE_CONFIG.name, SITE_CONFIG.alternateName],
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: '심리상담 업무 자동화',
    operatingSystem: 'Web, All modern browsers',
    description: SITE_CONFIG.description,
    inLanguage: 'ko-KR',
    url: `${SITE_CONFIG.url}/`,
    screenshot: `${SITE_CONFIG.url}/og-default.png`,
    softwareVersion: '1.0',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: `${SITE_CONFIG.legalName} (${SITE_CONFIG.legalNameEn})`,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/og-default.png`,
      },
      address: {
        '@type': 'PostalAddress',
        ...SITE_CONFIG.address,
      },
      ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
      sameAs: [
        SITE_CONFIG.legalUrl,
        SITE_CONFIG.social?.threads,
        SITE_CONFIG.social?.instagram,
      ].filter(Boolean),
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        description: '가볍게 시작하는 개인 상담사용 (500크레딧/월)',
        price: '8900',
        priceCurrency: 'KRW',
        eligibleRegion: { '@type': 'Country', name: 'KR' },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '8900',
          priceCurrency: 'KRW',
          unitText: 'MONTH',
        },
      },
      {
        '@type': 'Offer',
        name: 'Plus Plan',
        description: '성장을 위한 표준 플랜 (2,500크레딧/월)',
        price: '29900',
        priceCurrency: 'KRW',
        eligibleRegion: { '@type': 'Country', name: 'KR' },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '29900',
          priceCurrency: 'KRW',
          unitText: 'MONTH',
        },
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        description: '기관 및 헤비 유저용 (5,000크레딧/월)',
        price: '49900',
        priceCurrency: 'KRW',
        eligibleRegion: { '@type': 'Country', name: 'KR' },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '49900',
          priceCurrency: 'KRW',
          unitText: 'MONTH',
        },
      },
    ],
    featureList: [
      '상담사/내담자 자동 화자 분리',
      'AI 기반 고해상도 축어록 생성',
      '비언어적 표현(침묵, 한숨 등) 감지',
      '사례개념화 및 상담 분석 지원',
      '가족센터·EAP 등 기관 양식 자동 변환',
      '저장 전 암호화·접근 권한 분리 기반 보안 설계',
      '내담자 데이터 모델 학습 미사용 정책',
      '분석 후 오디오 파일 자동 파기 옵션',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.alternateName,
    description: SITE_CONFIG.description,
    inLanguage: 'ko-KR',
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateArticleSchema(post: {
  title: string;
  excerpt?: string | null;
  content: string;
  published_at?: string | null;
  updated_at: string;
  thumbnail_url?: string | null;
  author?: { name: string; slug?: string | null } | null;
  url: string;
}) {
  const authorBlock = post.author?.name
    ? {
        '@type': 'Person' as const,
        name: post.author.name,
        ...(post.author.slug
          ? { '@id': `${SITE_CONFIG.url}/blog/author/${post.author.slug}` }
          : {}),
      }
    : {
        '@type': 'Organization' as const,
        '@id': `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.legalName,
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
    headline: post.title,
    description: post.excerpt || '',
    ...(post.thumbnail_url
      ? {
          image: {
            '@type': 'ImageObject',
            url: post.thumbnail_url,
            width: 1200,
            height: 630,
          },
        }
      : {}),
    datePublished: post.published_at || post.updated_at,
    dateModified: post.updated_at,
    url: post.url,
    author: authorBlock,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/og-default.png`,
        width: 1200,
        height: 630,
      },
    },
    inLanguage: 'ko-KR',
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generatePersonSchema(person: {
  name: string;
  jobTitle?: string | null;
  description?: string | null;
  url?: string | null;
  image?: string | null;
  specialties?: string[] | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    ...(person.jobTitle ? { jobTitle: person.jobTitle } : {}),
    ...(person.description ? { description: person.description } : {}),
    ...(person.url ? { url: person.url } : {}),
    ...(person.image ? { image: person.image } : {}),
    ...(person.specialties?.length ? { knowsAbout: person.specialties } : {}),
    affiliation: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * 교육 프로그램용 Course 스키마.
 * Google Course Rich Result 자격 — startDate 미확정 시 Event보다 Course가 안전.
 */
export function generateCourseSchema(course: {
  name: string;
  description: string;
  url: string;
  educationalLevel?: string;
  audienceType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    url: course.url,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
    },
    inLanguage: 'ko-KR',
    ...(course.educationalLevel
      ? { educationalLevel: course.educationalLevel }
      : {}),
    ...(course.audienceType
      ? {
          audience: {
            '@type': 'Audience',
            audienceType: course.audienceType,
          },
        }
      : {}),
  };
}
