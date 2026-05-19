/**
 * GA4 dataLayer 안전 푸시 헬퍼.
 *
 * layout.tsx 의 GA 스크립트는 `strategy="lazyOnload"` 이므로 컴포넌트 mount 시점에
 * `window.gtag` 가 아직 정의되지 않았을 수 있습니다. 표준 gtag shim(`dataLayer.push`)
 * 을 미리 깔아두면, gtag.js 로드 전에 발사된 이벤트도 dataLayer 큐에 적재됐다가
 * 로드 직후 정상 처리됩니다. (CtaTracker 의 클릭 이벤트는 사용자가 늦게 클릭하므로
 * gtag 가 이미 로드돼 있지만, landing_view/scroll 같은 자동 이벤트는 큐가 필요.)
 */
export function gtagEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtagShim() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
  window.gtag('event', name, params ?? {});
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
