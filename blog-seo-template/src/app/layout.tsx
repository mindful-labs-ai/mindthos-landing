// 루트 레이아웃 — SEO 메타 + JSON-LD 임베드 + 사이트 전역 분석 스크립트
//
// 이식 가이드:
//   - 폰트, 색상, Header/Footer/CTA는 새 프로젝트의 디자인 시스템으로 교체하세요.
//   - generateOrganizationSchema()와 generateWebSiteSchema()는 모든 페이지의 <head>에
//     1회 임베드되도록 layout.tsx에 두는 것이 표준입니다.
//   - GA4/Meta Pixel은 lazyOnload 전략 — Core Web Vitals(LCP/INP) 보호.

import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/schema';
import { SITE_CONFIG } from '@/constants/site';

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
  twitter: { card: 'summary_large_image' },
  // 검색엔진 사이트 소유권 인증 — 필요한 값을 채우세요
  verification: {
    other: {
      // 'naver-site-verification': ['<naver-key>'],
      // 'google-site-verification': '<google-key>',
    },
  },
  robots: { index: true, follow: true },
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
  themeColor: '#000000', // 브랜드 컬러로 교체
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;       // ex: G-XXXXXXXXXX
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID; // ex: 123456789

  return (
    <html lang={SITE_CONFIG.language}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
            <Script id="ga4" strategy="lazyOnload">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        {PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="lazyOnload">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${PIXEL_ID}');
              fbq('track', 'PageView');
            `}</Script>
            <noscript>
              <img height="1" width="1" style={{ display: 'none' }} alt=""
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
            </noscript>
          </>
        )}

        <SchemaMarkup schema={[generateOrganizationSchema(), generateWebSiteSchema()]} />

        <a href="#main-content"
           className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:px-4 focus:py-2">
          본문으로 건너뛰기
        </a>

        {/* Header / Footer 는 프로젝트 디자인 시스템으로 교체 */}
        <main id="main-content" className="pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
