import Link from 'next/link';
import { ShieldCheck, Lock, KeyRound, FileCheck2, Trash2 } from 'lucide-react';

const TIMELINE = [
  {
    no: '01',
    label: '업로드',
    desc: '전송 순간부터 암호화되어 이동합니다.',
    badge: 'HTTPS · TLS',
    icon: Lock,
  },
  {
    no: '02',
    label: '암호화 저장',
    desc: '원문은 그대로 저장되지 않습니다.',
    badge: 'AES-256 · 비식별화',
    icon: KeyRound,
  },
  {
    no: '03',
    label: 'AI 처리',
    desc: '내담자 기록은 학습에 사용되지 않습니다.',
    badge: '학습 분리 · 메모리 격리',
    icon: ShieldCheck,
  },
  {
    no: '04',
    label: '결과 반환',
    desc: '본인 계정에서만 확인할 수 있고, 접근은 기록됩니다.',
    badge: '접근 로그',
    icon: FileCheck2,
  },
  {
    no: '05',
    label: '삭제',
    desc: '언제든 삭제할 수 있고, 삭제 이력을 확인할 수 있습니다.',
    badge: '감사 로그 · 삭제 확인',
    icon: Trash2,
  },
];

export function TrustStrip() {
  return (
    <section
      id="security"
      className="border-b border-[var(--line-2)] bg-[var(--bg-base)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">내담자의 비밀이 먼저 지켜져야 하니까</p>
          <h2>상담 기록은 AI보다 먼저, 안전하게 다뤄져야 하니까요.</h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            녹음이 어디로 가고, 어떻게 보호되고, 언제 삭제되는지.
            <br className="hidden md:block" />
            상담 기록이 처리되는 흐름을 단계별로 투명하게 보여드립니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="h-full rounded-2xl border border-[var(--line-1)] bg-[var(--bg-base)] p-7 sm:p-9">
              <h3 className="text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                마음토스 개발팀이
                <br />
                함께 지키는 보안 원칙
              </h3>
              <div className="mt-4 h-px bg-[var(--line-2)]" />
              <p className="mt-5 text-[var(--text-body)]">
                상담 기록은 기능 개발보다 먼저 보호 기준을 정하고, 백엔드·AI·보안 담당자가
                함께 검토합니다.
              </p>
              <ul className="mt-6 space-y-2">
                {['보안 담당', '백엔드 엔지니어', 'AI 엔지니어'].map((role) => (
                  <li
                    key={role}
                    className="inline-flex w-full rounded-full border border-[var(--line-1)] px-4 py-2 text-[length:var(--t-small)] text-[var(--text-secondary)]"
                  >
                    {role}
                  </li>
                ))}
              </ul>
              <div className="mt-6 h-px bg-[var(--line-2)]" />
              <blockquote className="mt-5 text-[var(--text-body)]">
                &ldquo;기술 자랑이 아니라, 상담사가 내담자에게 한 약속을 같이 지키는 일이라고
                생각합니다.&rdquo;
              </blockquote>
              <Link
                href="/security/how-we-protect"
                className="mt-7 inline-flex items-center rounded-lg border-[1.5px] border-[var(--brand-primary-dark)] px-5 py-2.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-pale)]"
              >
                상담 기록을 지키는 설계 보기 →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-[length:var(--t-small)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              상담 기록이 보호되는 흐름
            </p>
            <ol className="mt-5 space-y-6 border-l border-[var(--line-1)] pl-6 sm:pl-8">
              {TIMELINE.map(({ no, label, desc, badge, icon: Icon }) => (
                <li key={no} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line-1)] bg-[var(--bg-base)] sm:-left-[39px]"
                  >
                    <Icon className="h-3 w-3 text-[var(--brand-primary-dark)]" />
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[length:var(--t-meta)] text-[var(--text-muted)]">
                      {no}
                    </span>
                    <h3 className="text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                      {label}
                    </h3>
                  </div>
                  <p className="mt-2 text-[var(--text-body)]">{desc}</p>
                  <span className="mt-3 inline-block rounded-full border border-[var(--line-1)] bg-[var(--bg-warm)] px-3 py-1 text-[length:var(--t-meta)] font-medium text-[var(--text-secondary)]">
                    {badge}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
