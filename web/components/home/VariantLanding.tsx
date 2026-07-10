import { Fragment } from 'react';
import { HeroSection } from './sections/HeroSection';
import { VariantBridgeSection } from './sections/VariantBridgeSection';
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
import { LandingFunnelTracker } from './LandingFunnelTracker';
import {
  DEFAULT_EYEBROW,
  ctaHref,
  type LandingVariant,
} from '@/constants/landing-variants';

/**
 * 유입 경로별 맞춤 랜딩 컨테이너 (T3 기획 §3-5).
 *
 * 홈(HifiLanding)과의 유일한 차이는 세 가지뿐:
 *   (a) hero 맞춤 카피 (eyebrow 로 브랜드 포지셔닝 유지 + headline 소구 교체)
 *   (b) hero 바로 다음 브릿지 섹션 1개 삽입
 *   (c) FeatureTabs 우선 탭
 * 그 아래 모든 섹션은 홈과 100% 동일 순서·컴포넌트(수정 없이 재사용).
 */

function lines(arr: string[]): React.ReactNode {
  return arr.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

export function VariantLanding({ cfg }: { cfg: LandingVariant }) {
  const href = ctaHref(cfg.cohortHint);
  const ctaLocationHero = `hero_${cfg.key}`;
  const ctaLocationBridge = `variant_bridge_${cfg.key}`;

  return (
    <>
      <HeroSection
        eyebrow={DEFAULT_EYEBROW}
        headline={lines(cfg.hero.headline)}
        sub={lines(cfg.hero.sub)}
        ctaLabel={cfg.hero.ctaLabel}
        ctaHref={href}
        ctaLocation={ctaLocationHero}
      />
      <VariantBridgeSection
        bridge={cfg.bridge}
        ctaLabel={cfg.hero.ctaLabel}
        ctaHref={href}
        ctaLocation={ctaLocationBridge}
      />
      <TrustEncryptSection />
      <PainSection />
      <FeatureTabsSection priorityTab={cfg.priorityTab} />
      <SampleExperienceSection />
      <PersonasSection />
      <VsCompareSection />
      <MetricsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />

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
          href={href}
          data-promo-cta
          data-cta-intent="signup"
          data-cta-location={`promo_banner_bottom_${cfg.key}`}
          data-cta-label={cfg.hero.ctaLabel}
        >
          {cfg.hero.ctaLabel}
        </a>
      </div>

      <HifiLandingEffects />
      <LandingFunnelTracker variant={cfg.key} />
    </>
  );
}
