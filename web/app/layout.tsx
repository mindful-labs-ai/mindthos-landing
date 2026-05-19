import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import './hifi.css';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { UtmForwarder } from '@/components/layout/UtmForwarder';
import { CtaTracker } from '@/components/layout/CtaTracker';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/seo/schema';
import { SITE_CONFIG } from '@/constants/site';

const pretendard = localFont({
  src: [
    {
      path: '../public/fonts/PretendardVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
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
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      /* Naver Search Advisor 사이트 소유 확인 — 기존 webflow head 에서 이관 (2026-05-07) */
      'naver-site-verification':
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ||
        '0052a5554759a4860f31ad1b50a910b37e0a2b9b',
      /* Bing Webmaster Tools 사이트 소유 확인 (2026-05-07) */
      'msvalidate.01':
        process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
        'C280F0528DA0B9B0B2619158CE80E0E8',
      /* Meta(Facebook) Business 도메인 인증 — 광고 도메인 소유 확인 (2026-05-12) */
      'facebook-domain-verification':
        process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION ||
        'g27flcq964r59pbptxt4vf6i54yhc9',
    },
  },
  /**
   * Favicon — Next.js 16 파일 컨벤션 사용.
   * 단일 진실 원본: `app/icon.svg` (브랜드 그린 #44CE4B 심볼)
   * Next 가 자동으로 `<link rel="icon" type="image/svg+xml" href="/icon">` 주입.
   * apple-touch-icon (iOS 홈스크린)·legacy ICO 는 디자이너 자산 확정 후 별도 PR.
   */
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
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18147654629';
  const naverWcsId =
    process.env.NEXT_PUBLIC_NAVER_WCS_ID || 's_bfc366d6236';

  return (
    <html lang="ko" className={`${pretendard.variable} ${plexMono.variable}`}>
      <head />
      <body className="min-h-screen antialiased">
        {/*
          Consent Mode v2 — 동의 배너 미운영(A안). 기본값을 모두 granted 로
          선언해 v2 파라미터(ad_user_data / ad_personalization) 형식만 충족.
          gtag config 보다 반드시 먼저 실행돼야 하므로 beforeInteractive.
        */}
        <Script id="consent-mode-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted',
            });
            gtag('js', new Date());
          `}
        </Script>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('config', '${gaId}', {
                  linker: { domains: ['mindthos.com', 'app.mindthos.com'] },
                  send_page_view: true,
                });
              `}
            </Script>
          </>
        ) : null}
        {googleAdsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('config', '${googleAdsId}');
              `}
            </Script>
          </>
        ) : null}
        {naverWcsId ? (
          <>
            <Script
              src="//wcs.naver.net/wcslog.js"
              strategy="afterInteractive"
            />
            <Script id="naver-wcs-init" strategy="afterInteractive">
              {`
                if (!window.wcs_add) window.wcs_add = {};
                window.wcs_add["wa"] = "${naverWcsId}";
                if (!window._nasa) window._nasa = {};
                if (window.wcs) {
                  window.wcs.inflow("mindthos.com");
                  window.wcs_do();
                }
              `}
            </Script>
          </>
        ) : null}
        {pixelId ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
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
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                alt=""
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        ) : null}
        <SchemaMarkup
          schema={[generateOrganizationSchema(), generateWebSiteSchema()]}
        />
        <UtmForwarder />
        <CtaTracker />
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
