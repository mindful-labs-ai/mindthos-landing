declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function pageview(url: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_ID) return;
  window.gtag('config', GA_ID, { page_path: url });
}

export function trackEvent(
  action: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  if (window.gtag && GA_ID) {
    window.gtag('event', action, params ?? {});
  }
  if (window.fbq) {
    window.fbq('trackCustom', action, params ?? {});
  }
}

export const Events = {
  ctaClick: 'cta_click',
  generateLead: 'generate_lead',
  beginForm: 'begin_form',
  viewContent: 'view_content',
  phoneClick: 'phone_click',
  newsletterSubscribe: 'newsletter_subscribe',
} as const;
