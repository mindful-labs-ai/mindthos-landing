import { resolveCTA, type CTAProgram } from './_cta';

interface InlineCTAProps {
  ctaType: string;
  program?: CTAProgram | null;
}

export function InlineCTA({ ctaType, program }: InlineCTAProps) {
  const cta = resolveCTA(ctaType, program);

  return (
    <div className="my-10 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-gradient-pair)] p-8 text-center">
      {cta.kicker && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] opacity-70">
          {cta.kicker}
        </p>
      )}
      <h3 className="mb-4 text-[length:var(--t-h3)] font-semibold text-[var(--text-primary)]">
        {cta.heading}
      </h3>
      <a
        href={cta.href}
        {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="inline-block rounded-xl bg-[var(--bg-base)] px-6 py-3 text-[length:var(--t-cta)] font-semibold text-[var(--brand-primary-dark)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {cta.buttonText}
      </a>
    </div>
  );
}
