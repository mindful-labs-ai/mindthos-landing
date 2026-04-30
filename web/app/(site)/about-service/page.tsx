import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getCounselingPrograms } from '@/lib/supabase/queries';
import { SITE_CONFIG } from '@/constants/site';

export const revalidate = 3600;

export const metadata = generatePageMetadata({
  title: '서비스 소개',
  description:
    '마음토스가 무엇이고, 어떻게 작동하며, 어떤 보안 위에 서 있는지 — 상담사·기관 도입 검토를 위한 종합 안내.',
  path: '/about-service',
});

const PROCESS = [
  {
    title: '1) 가입',
    body: '이메일·소속만으로 시작합니다. 신용카드 정보는 필요하지 않습니다.',
  },
  {
    title: '2) 회기 업로드 / 입력',
    body: '녹음 파일을 업로드하거나 직접 텍스트를 붙여 넣습니다. 저장 전부터 암호화됩니다.',
  },
  {
    title: '3) 자동 정리',
    body: '축어록 → 상담노트 → 사례개념화 → 가계도 흐름으로 한 번에 정리됩니다.',
  },
  {
    title: '4) 검토 / 보정',
    body: '결과를 그대로 사용하지 않고, 상담사가 직접 검토·수정합니다. AI 는 보조이지 결정자가 아닙니다.',
  },
  {
    title: '5) 회기 종료 시 삭제',
    body: '보관 정책에 따라 자동 삭제 또는 최소 기간만 보관됩니다.',
  },
];

const SECURITY = [
  {
    icon: <Lock className="h-5 w-5" aria-hidden />,
    title: '학습 미사용',
    body: '내담자 데이터는 어떤 모델 학습에도 사용되지 않습니다.',
  },
  {
    icon: <Shield className="h-5 w-5" aria-hidden />,
    title: '저장 전 암호화',
    body: '업로드 즉시 암호화되며, 저장 시에도 암호화 상태가 유지됩니다.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" aria-hidden />,
    title: '비식별 자동화',
    body: '이름·연락처·주소·기관명 등 식별 정보는 자동 마스킹됩니다.',
  },
];

const FAQ_ITEMS = [
  {
    q: '내담자 동의는 어떻게 받나요?',
    a: '서비스 내 동의서 템플릿을 제공합니다. 회기 시작 전 내담자에게 마음토스 사용 사실을 안내·동의받고 기록을 남기는 흐름입니다.',
  },
  {
    q: 'AI 가 잘못된 노트를 만들면 어떡하나요?',
    a: '마음토스는 보조이며 결정은 항상 상담사 몫입니다. 모든 결과물은 회기 발화 인용 출처와 함께 표기되어 검증이 쉽습니다.',
  },
  {
    q: '기관 도입은 어떤 절차인가요?',
    a: '문의 → 데모 → 보안 검토 → 계약 → 온보딩 순서이며 평균 2-3주 소요됩니다. 기관 단위 SSO·로깅·관리자 권한을 지원합니다.',
  },
];

export default async function AboutServicePage() {
  const programs = await getCounselingPrograms();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--line-1)] bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">서비스 소개</p>
          <h1 className="mt-3 max-w-3xl">
            상담사를 위한 안전한 AI 파트너, 마음토스
          </h1>
          <p className="mt-5 max-w-prose text-[length:var(--t-lead)] text-[var(--text-body)]">
            축어록·상담노트·사례개념화·가계도까지 — 회기 전후의 정리 업무를
            안전하게 한 곳에서 처리합니다. 학습에 사용되지 않으며, 저장 전부터
            암호화됩니다.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact?type=free-trial"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
            >
              무료로 시작하기 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact?type=institution-inquiry"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-[var(--brand-primary-dark)] bg-transparent px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-pale)]"
            >
              기관 도입 상담
            </Link>
          </div>
        </div>
      </section>

      {/* 5 핵심 기능 */}
      <section id="features" className="bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">핵심 기능</p>
          <h2 className="mt-3">상담 업무 흐름 그대로</h2>
          <p className="mt-4 max-w-prose text-[var(--text-body)]">
            마음토스는 단일 기능이 아니라 회기 전후 정리 업무 흐름 전반을
            처리합니다. 축어록 → 노트 → 사례개념화 → 가계도가 한 번에 이어집니다.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {programs.map((p) => (
              <li
                key={p.slug}
                className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-6"
              >
                <h3 className="text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                  {p.title}
                </h3>
                {p.subtitle ? (
                  <p className="mt-2 text-[var(--text-body)]">{p.subtitle}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 보안 구조 */}
      <section id="security" className="bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">보안 구조</p>
          <h2 className="mt-3">안전이 디폴트입니다</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {SECURITY.map((s) => (
              <li
                key={s.title}
                className="rounded-2xl border border-[var(--line-warm)] bg-[var(--bg-base)] p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-pale)] text-[var(--brand-primary-dark)]">
                  {s.icon}
                </span>
                <h3 className="mt-4 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[var(--text-body)]">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 도입 절차 */}
      <section className="bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">도입 절차</p>
          <h2 className="mt-3">5 단계로 안전하게 도입</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {PROCESS.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-5"
              >
                <p className="text-[length:var(--t-small)] font-semibold text-[var(--brand-primary-dark)]">
                  {step.title}
                </p>
                <p className="mt-2 text-[length:var(--t-body-tight)] text-[var(--text-body)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">자주 묻는 질문</p>
          <h2 className="mt-3">검토에 자주 나오는 질문</h2>
          <ul className="mt-10 space-y-4">
            {FAQ_ITEMS.map((item) => (
              <li
                key={item.q}
                className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6"
              >
                <p className="flex items-start gap-2 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 shrink-0 text-[var(--brand-primary-dark)]"
                    aria-hidden
                  />
                  {item.q}
                </p>
                <p className="mt-3 text-[var(--text-body)]">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 회사 — Footer 회사 컬럼에서 anchor 진입 */}
      <section
        id="company"
        className="border-t border-[var(--line-1)] bg-[var(--bg-base)]"
      >
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">회사</p>
          <h2 className="mt-3">{SITE_CONFIG.legalName}</h2>
          <p className="mt-4 max-w-prose text-[var(--text-body)]">
            마인드풀랩스는 상담사가 안심하고 맡길 수 있는 AI 파트너를 만듭니다.
            상담 데이터는 학습에 사용되지 않으며, 보안과 사용성 양쪽을
            타협하지 않습니다.
          </p>
          {SITE_CONFIG.email ? (
            <p className="mt-4">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="font-semibold text-[var(--brand-primary-dark)] hover:underline"
              >
                {SITE_CONFIG.email}
              </a>
            </p>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--bg-deep)] text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] text-center md:py-[var(--section-py-desktop)]">
          <h2 className="text-[length:var(--t-h2-mobile)] text-[var(--text-on-dark)] md:text-[length:var(--t-h2)]">
            오늘 회기부터 함께 정리해보세요
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-on-dark-muted)]">
            무료로 시작 · 신용카드 정보 없이 가입할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact?type=free-trial"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] sm:w-auto"
            >
              무료로 시작하기 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact?type=institution-inquiry"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-white/40 px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-on-dark)] transition-colors hover:bg-white/5 sm:w-auto"
            >
              기관 도입 상담
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
