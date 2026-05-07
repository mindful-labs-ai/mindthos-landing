import type { Metadata } from 'next';
import { HifiLanding } from '@/components/home/HifiLanding';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateSoftwareApplicationSchema } from '@/lib/seo/schema';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';

export const revalidate = 3600;

/* 홈은 title.template("%s | 마음토스") 적용 시 브랜드명이 중복되므로 absolute 로 우회. */
const homeMetadata = generatePageMetadata({
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  path: '/',
});

export const metadata: Metadata = {
  ...homeMetadata,
  title: {
    absolute: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  },
};

export default function HomePage() {
  return (
    <>
      <SchemaMarkup schema={generateSoftwareApplicationSchema()} />
      <HifiLanding />
    </>
  );
}
