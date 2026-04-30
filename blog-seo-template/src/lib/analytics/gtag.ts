// GA4 + Meta Pixel event helpers
// GA Measurement ID: G-XMZ28TZQ62
// Meta Pixel ID: 820230440523302

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function gtag(event: string, action: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(event, action, params);
  }
}

function fbq(action: string, event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(action, event, params);
  }
}

/** 랜딩페이지 조회 (광고 유입 후 페이지 확인) */
export function trackViewContent(contentName: string, contentCategory: string) {
  gtag('event', 'view_content', {
    content_name: contentName,
    content_category: contentCategory,
  });
  fbq('track', 'ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
  });
}

/** CTA 버튼 클릭 */
export function trackCTAClick(ctaName: string, ctaLocation: string, destination: string) {
  gtag('event', 'cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    link_url: destination,
  });
  fbq('trackCustom', 'CTAClick', {
    cta_name: ctaName,
    cta_location: ctaLocation,
  });
}

/** 상담 예약 폼 제출 완료 (전환) */
export function trackGenerateLead(counselingType: string) {
  gtag('event', 'generate_lead', {
    currency: 'KRW',
    value: 20000,
    counseling_type: counselingType,
  });
  fbq('track', 'Lead', {
    content_name: counselingType,
    currency: 'KRW',
    value: 20000,
  });
}

/** 상담 예약 폼 작성 시작 */
export function trackBeginForm() {
  gtag('event', 'begin_form', {
    form_name: 'contact_inquiry',
  });
  fbq('trackCustom', 'BeginForm', {
    form_name: 'contact_inquiry',
  });
}

/** 전화 클릭 */
export function trackPhoneClick() {
  gtag('event', 'phone_click', {
    event_category: 'contact',
  });
  fbq('track', 'Contact');
}
