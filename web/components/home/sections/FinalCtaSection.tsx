'use client';

import { useEffect } from 'react';
import { StoreBadges } from './AppFirstSections';

export function FinalCtaSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §11 final CTA in-view === */
    {
      const section = document.querySelector('.final-cta-section');
      if (section) {
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || !('IntersectionObserver' in window)) {
          section.classList.add('final-in-view');
        } else {
          const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting && e.intersectionRatio >= 0.18) {
                section.classList.add('final-in-view');
                io.unobserve(section);
              }
            });
          }, { threshold: [0, 0.18, 0.4] });
          io.observe(section);
          cleanups.push(() => io.disconnect());
        }
      }
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
<section className="wf-section final-cta-section" data-funnel-section="final_cta">
  <div className="container">
    <div className="wf-marker">
      <span className="num">11</span>
      <span className="name">최종 CTA</span>
      <span className="purpose">와이어프레임 문구 회수 · 중앙 카드 · primary + secondary + trust chip 3 (preview UI 없음)</span>
    </div>

    
    <div className="final-cta-inner">
      <p className="v2-eyebrow center">상담사를 위한 안전한 AI 파트너</p>
      <h2 className="final-cta-h2">상담 기록 정리,<br/>이제 더 가볍게</h2>
      <div className="final-cta-btns">
        <a
          className="btn lg primary"
          href="https://app.mindthos.com"
          data-cta-intent="signup"
          data-cta-location="final_cta"
          data-cta-label="무료로 써 보기"
        >무료로 써 보기 <span className="arr" aria-hidden="true">→</span></a>
        <a
          className="final-cta-link"
          href="/contact?type=institution-inquiry"
          data-cta-intent="institution_inquiry"
          data-cta-location="final_cta"
          data-cta-label="기관 도입 상담"
        >기관 도입 상담</a>
      </div>
      <div id="app" className="v2-final-app">
        <p>상담 직후 휴대폰으로 녹음을 올려 보세요</p>
        <StoreBadges location="final_cta" />
      </div>
    </div>
  </div>

  
  
</section>
  );
}
