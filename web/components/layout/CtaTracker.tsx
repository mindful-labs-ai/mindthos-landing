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

/**
 * Google Ads — Signup Click 전환 액션 (2026-05-11 생성).
 * Google Ads 콘솔에서 변경 시 함께 업데이트.
 */
const GOOGLE_ADS_SIGNUP_CONVERSION = 'AW-18147654629/bmg4CObehqscEOX3vM1D';

interface CtaPayload {
  cta_intent: string;
  cta_location: string;
  cta_label: string;
  cta_destination: string;
  cta_tier?: string;
  page_path: string;
}

/**
 * GA4 + Google Ads + Meta Pixel 이벤트 발사.
 *
 * @param onSignupConversionDone signup intent 일 때만 사용. Google Ads conversion
 *   이벤트의 `event_callback` 으로 전달돼 비콘 송신 성공 시 호출됨. 외부 도메인 이동
 *   (app.mindthos.com) 직전 race condition 방지용 — caller 가 navigation 을 지연.
 */
function emit(payload: CtaPayload, onSignupConversionDone?: () => void): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', payload);
    if (payload.cta_intent === 'signup') {
      /* 별도 key event 로 GA4 conversion / Google Ads import 가능. */
      window.gtag('event', 'signup_click', payload);
      /* Google Ads 전환 액션 — 외부 도메인 이동 시 event_callback 으로 race 방지. */
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_SIGNUP_CONVERSION,
        ...(onSignupConversionDone ? { event_callback: onSignupConversionDone } : {}),
      });
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

/* 일반 좌클릭만 navigation 가로채기 — modifier/middle/우클릭/새탭은 그대로. */
function isPlainLeftClick(e: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (e.defaultPrevented) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  return true;
}

/**
 * CTA Tracker — 사이트 전역 single delegated listener.
 *
 * 식별 우선순위:
 *   1) anchor 의 `data-cta-intent` 속성 (명시적)
 *   2) href 가 `app.mindthos.com` 이고 /terms 가 아닌 경우 → 자동 'signup' (안전망)
 *
 * Navigation 가로채기:
 *   외부 signup 링크 + 일반 좌클릭 인 경우에만 `preventDefault` + Google Ads
 *   `event_callback` 도착 후 `window.location` 이동 (또는 500ms 타임아웃).
 *   새 탭 / ctrl/cmd-click / middle-click 은 기존 동작 유지 — race 없음.
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

      const isExternalSignup =
        intent === 'signup' && anchor.href.includes(APP_HOST);
      const shouldDeferNav =
        isExternalSignup &&
        isPlainLeftClick(e, anchor) &&
        typeof window.gtag === 'function';

      if (shouldDeferNav) {
        e.preventDefault();
        const url = anchor.href;
        let navigated = false;
        const navigate = () => {
          if (navigated) return;
          navigated = true;
          window.location.href = url;
        };
        /* Failsafe — callback 누락 시 500ms 후 강제 이동. */
        window.setTimeout(navigate, 500);
        emit(payload, navigate);
      } else {
        emit(payload);
      }
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  return null;
}
