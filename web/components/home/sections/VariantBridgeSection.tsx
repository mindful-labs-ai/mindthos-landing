import Image from 'next/image';
import { Fragment } from 'react';
import type { BridgeConfig, BridgePreview } from '@/constants/landing-variants';

/**
 * 유입 경로별 브릿지 섹션 (T3 기획 §3-4).
 *
 * hero 바로 다음에 삽입되는 유일한 신규 섹션. 이 소구 유입자의 문제(pain)를 짚고
 * → 마음토스가 그 기능으로 어떻게 푸는지(solution)를 즉시 대비시켜, 첫 스크롤에서
 * "내 얘기다 + 바로 이거다" 를 만든다. 두 카드 모두 이미지 슬롯을 두어, 문제 장면과
 * 해결 화면(약속-체험 일치)을 시각적으로 보여준다. 이미지 미확보 시 공간만 예약.
 *
 * 기존 섹션 순서는 건드리지 않고 이 카드 한 장으로 개인화를 흡수 → 홈 회귀면적 0.
 */

function renderLines(lines: string[]): React.ReactNode {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

const CheckIcon = () => (
  <svg
    className="vbridge-ico vbridge-ico--sol"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 10.5 L 8.2 14.5 L 16 5.5" />
  </svg>
);

const DotIcon = () => (
  <svg
    className="vbridge-ico vbridge-ico--pain"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="6" y1="10" x2="14" y2="10" />
  </svg>
);

/** 카드 이미지 슬롯 — 이미지가 있으면 렌더, 없으면 공간만 예약한 플레이스홀더. */
function BridgeMedia({ image }: { image?: BridgePreview | null }) {
  if (image) {
    return (
      <figure className="vbridge-media">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 768px) 100vw, 460px"
        />
      </figure>
    );
  }
  return (
    <div className="vbridge-media vbridge-media--empty" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="10" width="34" height="28" rx="3" />
        <circle cx="17" cy="20" r="3" />
        <path d="M41 32 L31 23 L15 38" />
      </svg>
    </div>
  );
}

export interface VariantBridgeSectionProps {
  bridge: BridgeConfig;
  ctaLabel: string;
  ctaHref: string;
  ctaLocation: string;
}

export function VariantBridgeSection({
  bridge,
  ctaLabel,
  ctaHref,
  ctaLocation,
}: VariantBridgeSectionProps) {
  return (
    <section className="wf-section vbridge" data-funnel-section="variant_bridge">
      <div className="container">
        <div className="vbridge-head">
          <h2 className="t-h2 vbridge-title">{renderLines(bridge.title)}</h2>
        </div>

        <div className="vbridge-grid">
          {/* 문제 */}
          <div className="vbridge-col vbridge-col--pain">
            <p className="vbridge-col-label">이런 적 있으셨죠</p>
            <ul className="vbridge-list">
              {bridge.pains.map((p, i) => (
                <li key={i} className="vbridge-item">
                  <DotIcon />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <BridgeMedia image={bridge.painImage} />
          </div>

          <div className="vbridge-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </div>

          {/* 해결 */}
          <div className="vbridge-col vbridge-col--sol">
            <p className="vbridge-col-label vbridge-col-label--sol">마음토스라면</p>
            <ul className="vbridge-list">
              {bridge.solutions.map((s, i) => (
                <li key={i} className="vbridge-item">
                  <CheckIcon />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <BridgeMedia image={bridge.solutionImage} />
          </div>
        </div>

        <div className="vbridge-cta">
          <a
            className="btn primary lg"
            href={ctaHref}
            data-cta-intent="signup"
            data-cta-location={ctaLocation}
            data-cta-label={ctaLabel}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
