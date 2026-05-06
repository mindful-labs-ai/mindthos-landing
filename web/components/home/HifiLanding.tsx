'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { HeroSection } from './sections/HeroSection';
import { TrustEncryptSection } from './sections/TrustEncryptSection';
import { PainSection } from './sections/PainSection';
import { FeatureTabsSection } from './sections/FeatureTabsSection';
import { SampleExperienceSection } from './sections/SampleExperienceSection';
import { PersonasSection } from './sections/PersonasSection';
import { VsCompareSection } from './sections/VsCompareSection';
import { MetricsSection } from './sections/MetricsSection';
import { PricingSection } from './sections/PricingSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';

export function HifiLanding() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* Promo top 은 components/layout/PromoBanner.tsx 가 자체 dismiss + has-promo-top toggle 처리.
       하단 모바일 sticky CTA(.promo-bottom) 는 home 전용으로 본 컴포넌트에 그대로 둠. */
    {
      const KEY = 'mt-promo-1month-dismissed';
      const html = document.documentElement;
      const bottom = document.querySelector<HTMLElement>('[data-promo-bottom]');
      const isDismissed = (): boolean => {
        try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
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
        bottom.querySelectorAll<HTMLElement>('[data-promo-close]').forEach(btn => {
          const handler = () => {
            try { sessionStorage.setItem(KEY, '1'); } catch {}
            applyBottomState(true);
          };
          btn.addEventListener('click', handler);
          cleanups.push(() => btn.removeEventListener('click', handler));
        });
      }
    }

    /* === §02 / §03 fade-up ===
       NOTE: This effect targets DOM nodes from BOTH §02 (TrustEncryptSection — .trust-team,
       .trust-protect-3 .trust-protect-item) AND §03 (PainSection — .pain-scenes .pain-scene).
       Because the IntersectionObserver group spans two sibling sections, it stays in the
       parent (HifiLanding) rather than being moved into either child component. */
    const fadeUpGroups: Array<{ sel: string; cls: string; threshold: number; rootMargin: string }> = [
      { sel: '.trust-team, .trust-protect-3 .trust-protect-item', cls: 'trust-rise', threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      { sel: '.pain-scenes .pain-scene', cls: 'pain-rise', threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    ];
    for (const g of fadeUpGroups) {
      const targets = document.querySelectorAll<HTMLElement>(g.sel);
      if (!targets.length) continue;
      targets.forEach(el => el.classList.add(g.cls));
      const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-in-view'));
        continue;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-in-view');
            io.unobserve(e.target);
          }
        });
      }, { threshold: g.threshold, rootMargin: g.rootMargin });
      targets.forEach(el => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
    <>
      {/* GNB + 상단 promo 배너는 app/(site)/layout.tsx 가 <Header /> + <PromoBanner /> 로 통일 렌더. */}
      <HeroSection />
      <TrustEncryptSection />
      <PainSection />
      <FeatureTabsSection />
      <SampleExperienceSection />
      <PersonasSection />
      <VsCompareSection />
      <MetricsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
  <footer className="footer">
    <div className="container">
      <div className="footer-top">
        <div className="footer-brand">
          <Link className="footer-logo" href="/" aria-label="마음토스 홈">
            <Image src="/logo-mindthos.webp" alt="마음토스" width={420} height={108} />
          </Link>
          <div className="footer-info">
            <div className="footer-info-block">
              <h5>SNS</h5>
              <div className="footer-info-row">
                <a href="https://www.instagram.com/mindthos.official" target="_blank" rel="noopener noreferrer">Instagram</a>
                <span className="footer-info-sep" aria-hidden="true">|</span>
                <a href="https://www.threads.net/@mindthos.official" target="_blank" rel="noopener noreferrer">Threads</a>
              </div>
            </div>
            <div className="footer-info-block">
              <h5>이메일</h5>
              <div className="footer-info-row">
                <a href="mailto:business@mindfullabs.ai">business@mindfullabs.ai</a>
              </div>
            </div>
            <div className="footer-info-block">
              <h5>주소</h5>
              <p className="footer-info-text">서울특별시 성동구 뚝섬로13길 38,<br/>4층 (성수동)</p>
            </div>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h5>회사 소개</h5>
            <ul>
              <li><a href="https://www.mindfullabs.ai" target="_blank" rel="noopener noreferrer">마인드풀랩스</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>마음토스</h5>
            <ul>
              <li><Link href="/">서비스 소개</Link></li>
              <li><a href="https://rare-puppy-06f.notion.site/v2-2cfdd162832d801bae95f67269c062c7" target="_blank" rel="noopener noreferrer">사용 가이드</a></li>
              <li><a href="https://open.kakao.com/me/Mindthos" target="_blank" rel="noopener noreferrer">문의</a></li>
              <li><a href="/resources/blog">블로그</a></li>
              <li><a href="https://rare-puppy-06f.notion.site/v2-2cfdd162832d801bae95f67269c062c7" target="_blank" rel="noopener noreferrer">워크숍 자료 다운로드</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>약관</h5>
            <ul>
              <li><a href="https://app.mindthos.com/terms?type=service" target="_blank" rel="noopener noreferrer">서비스 이용약관</a></li>
              <li><a href="https://app.mindthos.com/terms?type=privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="copyright">Copyright © Mindful Labs Inc. | All Rights Reserved</div>
        <div className="legal-info">
          사업자등록번호 786-88-03152 | 통신판매신고번호 제2025-서울마포-0943호 |<br/>
          마인드풀랩스 주식회사(Mindful Labs Inc.) | 대표: 강호남<br/>
          서울특별시 성동구 뚝섬로13길 38, 4층 (성수동)
        </div>
      </div>
    </div>
  </footer>
<div className="promo-bottom" data-promo-bottom role="region" aria-label="신규 가입 프로모션">
  <div className="promo-bottom-msg">
    <span className="promo-tag">NEW</span>
    <span className="promo-bottom-text">신규 가입 시 첫 1개월 무료</span>
  </div>
  <a className="btn primary" href="https://app.mindthos.com" data-promo-cta>무료로 시작하기</a>
  <button type="button" className="promo-close" data-promo-close aria-label="프로모션 배너 닫기">✕</button>
</div>

    </>
  );
}
