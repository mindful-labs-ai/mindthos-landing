export interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}
