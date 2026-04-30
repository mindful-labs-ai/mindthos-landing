import { SITE_CONFIG } from '@/constants/site';

export function generateArticleSchema(post: {
  title: string;
  excerpt?: string | null;
  content: string;
  published_at?: string | null;
  updated_at: string;
  thumbnail_url?: string | null;
  author?: { name: string; slug?: string } | null;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    headline: post.title,
    description: post.excerpt || '',
    ...(post.thumbnail_url ? {
      image: {
        '@type': 'ImageObject',
        url: post.thumbnail_url,
        width: 1200,
        height: 630,
      },
    } : {}),
    datePublished: post.published_at || post.updated_at,
    dateModified: post.updated_at,
    url: post.url,
    author: {
      '@type': 'Person',
      name: post.author?.name || SITE_CONFIG.name,
      ...(post.author?.slug ? { url: `${SITE_CONFIG.url}/team/${post.author.slug}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/icon.png`,
        width: 192,
        height: 192,
      },
    },
    inLanguage: SITE_CONFIG.language,
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
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

export function generateOrganizationSchema() {
  const sameAs = [
    SITE_CONFIG.social?.kakao,
    SITE_CONFIG.social?.naver,
    SITE_CONFIG.social?.instagram,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/icon.png`,
      width: 192,
      height: 192,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
      ...(SITE_CONFIG.phone ? { telephone: SITE_CONFIG.phone } : {}),
      ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
    },
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'MedicalBusiness'],
    '@id': `${SITE_CONFIG.url}/#local-business`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    ...(SITE_CONFIG.phone ? { telephone: SITE_CONFIG.phone } : {}),
    ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/icon.png`,
      width: 192,
      height: 192,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.streetAddress,
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: SITE_CONFIG.hours.weekday.open,
        closes: SITE_CONFIG.hours.weekday.close,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: SITE_CONFIG.hours.saturday.open,
        closes: SITE_CONFIG.hours.saturday.close,
      },
    ],
    priceRange: '₩₩',
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
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    inLanguage: SITE_CONFIG.language,
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

export function generateCourseSchema(course: {
  name: string;
  description: string;
  slug: string;
  instructor: string;
  duration: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE_CONFIG.url}/programs/${course.slug}`,
    name: course.name,
    description: course.description,
    url: `${SITE_CONFIG.url}/programs/${course.slug}`,
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      instructor: {
        '@type': 'Person',
        name: course.instructor,
      },
    },
  };
}

export function generateServiceSchema(service: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_CONFIG.url}/counseling/${service.slug}`,
    name: service.name,
    description: service.description,
    url: `${SITE_CONFIG.url}/counseling/${service.slug}`,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${SITE_CONFIG.url}/#local-business`,
    },
    serviceType: '심리상담',
    areaServed: {
      '@type': 'City',
      name: '서울',
    },
  };
}
