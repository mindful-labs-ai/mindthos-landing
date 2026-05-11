'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const APP_HOST = 'app.mindthos.com';

interface CtaPayload {
  cta_intent: string;
  cta_location: string;
  cta_label: string;
  cta_destination: string;
  cta_tier?: string;
  page_path: string;
}

function emit(payload: CtaPayload): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', payload);
    if (payload.cta_intent === 'signup') {
      /* 별도 key event 로 GA4 conversion / Google Ads import 가능. */
      window.gtag('event', 'signup_click', payload);
    }
  }
  if (typeof window.fbq === 'function' && payload.cta_intent === 'signup') {
    /* Meta Pixel 표준 이벤트 — Ads Manager 에서 Lead 전환 최적화로 사용. */
    window.fbq('track', 'Lead', {
      content_name: payload.cta_label,
      content_category: payload.cta_location,
    });
  }
}

/**
 * CTA Tracker — 사이트 전역 single delegated listener.
 *
 * 식별 우선순위:
 *   1) anchor 의 `data-cta-intent` 속성 (명시적)
 *   2) href 가 `app.mindthos.com` 이고 /terms 가 아닌 경우 → 자동 'signup' (안전망)
 *
 * preventDefault 안 함 — 새 탭, ctrl/cmd-click, 미들 클릭도 정상.
 * gtag 가 lazyOnload 라 초기 클릭에 미발사 가능성 있음 — 분석 가치는 충분.
 */
export function CtaTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;

      const explicitIntent = anchor.dataset.ctaIntent;
      const href = anchor.getAttribute('href') ?? '';
      const autoSignup =
        !explicitIntent && href.includes(APP_HOST) && !href.includes('/terms');
      const intent = explicitIntent ?? (autoSignup ? 'signup' : null);
      if (!intent) return;

      const label =
        anchor.dataset.ctaLabel ??
        (anchor.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);

      const payload: CtaPayload = {
        cta_intent: intent,
        cta_location: anchor.dataset.ctaLocation ?? 'unknown',
        cta_label: label,
        cta_destination: anchor.href || href,
        page_path:
          pathname ??
          (typeof window !== 'undefined' ? window.location.pathname : ''),
      };
      if (anchor.dataset.ctaTier) payload.cta_tier = anchor.dataset.ctaTier;

      emit(payload);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  return null;
}
