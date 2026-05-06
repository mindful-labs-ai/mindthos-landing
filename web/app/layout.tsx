import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import './hifi.css';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/seo/schema';
import { SITE_CONFIG } from '@/constants/site';

const pretendard = localFont({
  src: [
    { path: '../public/fonts/Pretendard-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Pretendard-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/Pretendard-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/Pretendard-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/Pretendard-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'Segoe UI', 'Roboto', 'Noto Sans KR', 'sans-serif'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  applicationName: SITE_CONFIG.name,
  keywords: [
    '마음토스',
    'Mindthos',
    '상담사 AI',
    '심리상담 AI',
    '축어록',
    '상담 노트',
    '사례개념화',
    '가계도',
  ],
  authors: [{ name: SITE_CONFIG.legalName }],
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: SITE_CONFIG.brand.primary,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="ko" className={`${pretendard.variable} ${plexMono.variable}`}>
      <head />
      <body className="min-h-screen antialiased">
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {pixelId ? (
          <Script id="meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
        <SchemaMarkup
          schema={[generateOrganizationSchema(), generateWebSiteSchema()]}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-[var(--brand-primary-dark)]"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
