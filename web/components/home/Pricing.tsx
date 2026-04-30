import Link from 'next/link';
import { Check } from 'lucide-react';

type Plan = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '₩0',
    period: '/ 월',
    desc: '핵심 기능 체험을 위한 무료 플랜',
    features: [
      '월 5회기 처리',
      '축어록 + 상담노트 기본 양식',
      '학습 미사용 · 암호화 저장',
    ],
    cta: { label: '무료로 시작하기', href: '/contact?type=free-trial' },
  },
  {
    name: 'Pro',
    price: '₩39,000',
    period: '/ 월',
    desc: '개인 상담사를 위한 가장 인기 있는 플랜',
    features: [
      '월 60회기 처리',
      '5개 기능 전체 (축어록·상담노트·사례개념화·가계도·심리검사 해석)',
      'AI 피드백 + 양식 분기',
      '우선 지원',
    ],
    cta: { label: 'Pro 시작하기', href: '/contact?type=free-trial' },
    highlight: true,
  },
  {
    name: 'Team',
    price: '₩89,000',
    period: '/ 월',
    desc: '소규모 센터·수련 그룹 운영용',
    features: [
      '월 200회기 처리',
      '계정 5개 + 슈퍼비전 양식',
      '팀 사용 통계 · 권한 관리',
    ],
    cta: { label: 'Team 시작하기', href: '/contact?type=free-trial' },
  },
  {
    name: 'Institution',
    price: '맞춤',
    period: '',
    desc: '대형 기관·병원·대학 상담센터',
    features: [
      '회기 무제한 + SLA',
      'SSO · 감사 로그 · 권한 정책',
      '기관 양식 커스터마이즈 · 보안 검토',
    ],
    cta: { label: '기관 도입 상담', href: '/contact?type=institution-inquiry' },
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-b border-[var(--line-2)] bg-[var(--bg-base)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">필요한 만큼만, 부담 없이</p>
          <h2>
            상담 규모에 맞춰
            <br />
            플랜을 골라 쓰세요.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            모든 플랜에는 학습 미사용·암호화 저장·비식별 처리가 기본 포함됩니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl bg-[var(--bg-base)] p-6 ${
                plan.highlight
                  ? 'border-[1.5px] border-[var(--brand-primary)] shadow-sm'
                  : 'border border-[var(--line-1)]'
              }`}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-6 rounded-full bg-[var(--brand-primary)] px-3 py-1 text-[length:var(--t-meta)] font-semibold text-[var(--text-primary)]">
                  추천
                </span>
              ) : null}
              <p className="text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                {plan.name}
              </p>
              <p className="mt-2 text-[length:var(--t-small)] text-[var(--text-body)]">
                {plan.desc}
              </p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="t-num text-[length:var(--t-h2-mobile)] font-bold text-[var(--text-heading-strong)] md:text-[length:32px]">
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className="text-[length:var(--t-small)] text-[var(--text-muted)]">
                    {plan.period}
                  </span>
                ) : null}
              </p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[length:var(--t-small)] text-[var(--text-body)]"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary-dark)]"
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.cta.href}
                className={`mt-auto inline-flex items-center justify-center rounded-lg px-4 py-3 text-[length:var(--t-cta)] font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-[var(--brand-primary)] text-[var(--text-primary)] hover:bg-[var(--brand-primary-dark)] hover:text-white'
                    : 'border border-[var(--line-1)] text-[var(--text-primary)] hover:border-[var(--brand-primary-dark)]'
                }`}
              >
                {plan.cta.label}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-[length:var(--t-meta)] text-[var(--text-muted)]">
          * 가격은 베타 기간 안내가이며, 정식 출시 시 조정될 수 있습니다.
        </p>
      </div>
    </section>
  );
}
