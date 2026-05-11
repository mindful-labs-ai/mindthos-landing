import { resolveCTA, type CTAProgram } from './_cta';

interface BottomCTAProps {
  ctaType: string;
  program?: CTAProgram | null;
}

export function BottomCTA({ ctaType, program }: BottomCTAProps) {
  const cta = resolveCTA(ctaType, program);

  return (
    <section className="mt-12 w-full rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-gradient-pair)] px-6 py-10 text-center md:px-8 md:py-12">
      <p className="mb-2 text-small font-medium text-[var(--text-primary)] opacity-70">
        마음토스가 처음이신가요?
      </p>
      {cta.kicker && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] opacity-60">
          {cta.kicker}
        </p>
      )}
      <h2 className="mb-6 text-h2-mobile font-semibold text-[var(--text-primary)] md:text-h2">
        {cta.heading}
      </h2>
      <a
        href={cta.href}
        {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        data-cta-intent={cta.ctaIntent}
        data-cta-location="blog_bottom"
        data-cta-label={cta.buttonText}
        className="inline-block whitespace-nowrap rounded-xl bg-[var(--bg-base)] px-6 py-3 text-base font-semibold text-[var(--brand-primary-dark)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 md:px-8 md:py-4 md:text-lead"
      >
        {cta.buttonText}
      </a>
    </section>
  );
}
