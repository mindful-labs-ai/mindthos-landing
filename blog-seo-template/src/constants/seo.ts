import { SITE_CONFIG } from './site';

export const DEFAULT_SEO = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
  },
} as const;
