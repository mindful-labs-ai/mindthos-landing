import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

export function FinalCTA() {
  return (
    <section
      id="cta"
      className="bg-[var(--bg-deep)] py-[var(--section-py-tablet)] text-[var(--text-on-dark)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] text-center">
        <p className="eyebrow text-[var(--text-on-dark-muted)]">
          상담사를 위한 안전한 AI 파트너
        </p>
        <h2 className="mt-3 text-[length:var(--t-display-mobile)] leading-tight text-[var(--text-on-dark)] md:text-[length:var(--t-display)]">
          오늘 회기부터,
          <br />
          마음토스와 함께 정리해보세요.
        </h2>
        <p className="mx-auto mt-5 max-w-prose text-[var(--text-on-dark-muted)]">
          무료로 시작 · 신용카드 정보 없이 가입할 수 있습니다.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact?type=free-trial"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] sm:w-auto"
          >
            무료로 시작하기 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact?type=institution-inquiry"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-white/40 px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-on-dark)] transition-colors hover:bg-white/5 sm:w-auto"
          >
            기관 도입 상담
          </Link>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 text-[length:var(--t-small)] text-[var(--text-on-dark-muted)]">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          학습 미사용 · 저장 전 암호화 · 개인정보 비식별
        </p>
      </div>
    </section>
  );
}
