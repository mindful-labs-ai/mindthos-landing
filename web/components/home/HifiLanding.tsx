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
import { HifiLandingEffects } from './HifiLandingEffects';

/**
 * 홈 랜딩 컨테이너 — Server Component.
 * 인터랙션 효과(IntersectionObserver, sessionStorage promo dismiss) 는
 * 별도 마이크로 client 컴포넌트(HifiLandingEffects) 에 격리해 두었습니다.
 * 자식 섹션은 'use client' 지만 SSR HTML 출력은 정상적으로 일어나므로
 * AI 크롤러·검색엔진은 본문을 그대로 인덱싱·인용할 수 있습니다.
 */
export function HifiLanding() {
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
      {/* Footer는 app/(site)/layout.tsx 가 <Footer /> 로 통일 렌더. */}
      <div
        className="promo-bottom"
        data-promo-bottom
        role="region"
        aria-label="신규 가입 프로모션"
      >
        <div className="promo-bottom-msg">
          <span className="promo-tag">NEW</span>
          <span className="promo-bottom-text">신규 가입 시 첫 1개월 무료</span>
        </div>
        <a
          className="btn primary"
          href="https://app.mindthos.com/?utm_source=landing&utm_medium=display&utm_campaign=banner"
          data-promo-cta
        >
          무료로 시작하기
        </a>
      </div>

      <HifiLandingEffects />
    </>
  );
}
