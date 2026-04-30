import { SITE_CONFIG } from '@/constants/site';

export function generateOrganizationSchema() {
  const sameAs = [
    SITE_CONFIG.social?.instagram,
    SITE_CONFIG.social?.linkedin,
    SITE_CONFIG.social?.twitter,
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
    author: {
      '@type': 'Person',
      name: post.author?.name || SITE_CONFIG.name,
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
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}
