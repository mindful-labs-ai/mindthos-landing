import { HeroSection } from './sections/HeroSection';
import { TrustEncryptSection } from './sections/TrustEncryptSection';
import { FeatureTabsSection } from './sections/FeatureTabsSection';
import { MetricsSection } from './sections/MetricsSection';
import { PricingSection } from './sections/PricingSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import { DevicesSection, NewFeaturesSection, MobileAppSection } from './sections/AppFirstSections';
import { ChatSection } from './sections/AppFirstClient';
import { HifiLandingEffects } from './HifiLandingEffects';
import { LandingFunnelTracker } from './LandingFunnelTracker';

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
      {/* GNB는 app/(site)/layout.tsx 가 <Header /> 로 통일 렌더(상단 promo 배너는 2026-11-06 제거). */}
      <HeroSection appFirst />
      {/* 2026-11-06 순서: 기기(언제 어디서든) → 채팅 → 기능 탭 → 모바일 앱 → 신기능. 보안은 그 뒤에서 받친다. */}
      <DevicesSection />
      <ChatSection />
      <FeatureTabsSection />
      <MobileAppSection />
      <NewFeaturesSection />
      <TrustEncryptSection kicker="그리고, 이 모든 걸 안전하게" lean />
      {/* 2026-11-06: 샘플 체험·범용 AI 비교·하단 무료 바는 위 새 섹션·보안·FAQ와 겹쳐 홈에서 뺐다(변형 랜딩은 유지). */}
      <MetricsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      {/* Footer는 app/(site)/layout.tsx 가 <Footer /> 로 통일 렌더. */}
      <HifiLandingEffects />
      <LandingFunnelTracker />
    </>
  );
}
