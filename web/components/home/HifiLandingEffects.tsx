'use client';

import { useEffect } from 'react';

/**
 * HifiLanding 의 비동기 인터랙션 효과만 담당하는 마이크로 클라이언트 컴포넌트.
 * - 하단 모바일 sticky CTA(.promo-bottom) 의 sessionStorage dismiss 처리
 * - §02 TrustEncryptSection / §03 PainSection 의 fade-up IntersectionObserver
 *
 * 이렇게 분리해 두면 HifiLanding 컨테이너 자체는 Server Component 로 둘 수 있고,
 * 페이지 단위 SSR 마크업 노출 + 정적 prerender 효율이 향상됩니다.
 */
export function HifiLandingEffects() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* 하단 모바일 sticky CTA dismiss — sessionStorage 1회 닫기 */
    {
      const KEY = 'mt-promo-1month-dismissed';
      const html = document.documentElement;
      const bottom = document.querySelector<HTMLElement>('[data-promo-bottom]');
      const isDismissed = (): boolean => {
        try {
          return sessionStorage.getItem(KEY) === '1';
        } catch {
          return false;
        }
      };
      const applyBottomState = (dismissed: boolean): void => {
        if (dismissed) {
          if (bottom) bottom.style.display = 'none';
          html.classList.remove('has-promo-bottom');
        } else {
          html.classList.add('has-promo-bottom');
        }
      };
      applyBottomState(isDismissed());
      if (bottom) {
        bottom
          .querySelectorAll<HTMLElement>('[data-promo-close]')
          .forEach((btn) => {
            const handler = () => {
              try {
                sessionStorage.setItem(KEY, '1');
              } catch {}
              applyBottomState(true);
            };
            btn.addEventListener('click', handler);
            cleanups.push(() => btn.removeEventListener('click', handler));
          });
      }
    }

    /* §02 / §03 fade-up — DOM 노드가 두 sibling 섹션에 걸쳐 있으므로 부모에서 처리. */
    const fadeUpGroups: Array<{
      sel: string;
      cls: string;
      threshold: number;
      rootMargin: string;
    }> = [
      {
        sel: '.trust-team, .trust-protect-3 .trust-protect-item',
        cls: 'trust-rise',
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
      },
      {
        sel: '.pain-scenes .pain-scene',
        cls: 'pain-rise',
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    ];
    for (const g of fadeUpGroups) {
      const targets = document.querySelectorAll<HTMLElement>(g.sel);
      if (!targets.length) continue;
      targets.forEach((el) => el.classList.add(g.cls));
      const prefersReduced = matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReduced || !('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-in-view'));
        continue;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('is-in-view');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: g.threshold, rootMargin: g.rootMargin },
      );
      targets.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
