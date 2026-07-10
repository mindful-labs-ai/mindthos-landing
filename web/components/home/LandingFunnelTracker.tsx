'use client';

import { useEffect, useRef } from 'react';
import { gtagEvent } from '@/lib/analytics';

/**
 * 랜딩 퍼널 계측 — 홈(HifiLanding) 전용 마이크로 client 컴포넌트.
 *
 *  - S0   `landing_view`         : 랜딩 도착(마운트) 1회
 *  - S0.1 `landing_section_view` : `[data-funnel-section]` 섹션 최초 노출 시 1회/섹션
 *  - S0.2 `landing_scroll_depth` : 50% / 90% 스크롤 도달 시 각 1회
 *
 * GA4 enhanced measurement 기본 `scroll` 은 90% 만 발사하므로 50% 가 누락되어
 * 별도 커스텀 이벤트로 50·90 을 모두 명시 발사한다. S0.3(cta_click) 은 기존
 * CtaTracker 가 이미 정상 수집 중이므로 여기서 다루지 않는다.
 */
export interface LandingFunnelTrackerProps {
  /**
   * 유입 경로 variant 식별자(genogram·transcribe·psy-test·resource 등).
   * 지정 시 landing_view·section_view·scroll_depth payload 에 동봉 → GA4 에서
   * variant 별 유입→가입 분해(T6). 미지정(홈) → 차원 없음.
   */
  variant?: string;
}

export function LandingFunnelTracker({ variant }: LandingFunnelTrackerProps = {}) {
  // React strict-mode 이중 실행 / 재마운트 시 중복 발사 방지.
  const firedView = useRef(false);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* variant 가 있으면 모든 퍼널 이벤트에 공통으로 실어 보낼 차원. */
    const dim = variant ? { variant } : {};

    /* ── S0. landing_view ─────────────────────────────────────────── */
    if (!firedView.current) {
      firedView.current = true;
      gtagEvent('landing_view', {
        page_path:
          typeof window !== 'undefined' ? window.location.pathname : '/',
        ...dim,
      });
    }

    /* ── S0.1 landing_section_view ────────────────────────────────── */
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-funnel-section]'),
    );
    if (sections.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            const id = el.dataset.funnelSection ?? 'unknown';
            const index = sections.indexOf(el);
            gtagEvent('landing_section_view', {
              section_id: id,
              section_index: index >= 0 ? index : undefined,
              ...dim,
            });
            io.unobserve(el); // 섹션당 1회
          }
        },
        // 섹션이 화면에 의미 있게 들어왔을 때(30%) — 스쳐 지나가는 노출 제외.
        { threshold: 0.3 },
      );
      sections.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    /* ── S0.2 landing_scroll_depth (50% / 90%) ────────────────────── */
    const thresholds = [50, 90] as const;
    const sent = new Set<number>();
    let ticking = false;
    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      for (const t of thresholds) {
        if (pct >= t && !sent.has(t)) {
          sent.add(t);
          gtagEvent('landing_scroll_depth', { percent_scrolled: t, ...dim });
        }
      }
      if (sent.size === thresholds.length) detach();
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    const detach = () => window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(detach);
    // 초기 뷰포트가 이미 50% 이상(짧은 화면)인 경우 대비 1회 즉시 측정.
    requestAnimationFrame(measure);

    return () => cleanups.forEach((fn) => fn());
  }, [variant]);

  return null;
}
