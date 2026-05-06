import { HifiLanding } from '@/components/home/HifiLanding';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { SITE_CONFIG } from '@/constants/site';

export const revalidate = 3600;

export const metadata = generatePageMetadata({
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  path: '/',
});

export default function HomePage() {
  return <HifiLanding />;
}
