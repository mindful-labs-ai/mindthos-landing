import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Users,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata({
  title: '교육 프로그램',
  description:
    '상담사·기관을 위한 마음토스 활용 교육·세미나·웨비나. 신청 방법과 진행 일정 안내.',
  path: '/education',
});

const PROGRAMS = [
  {
    icon: <GraduationCap className="h-5 w-5" aria-hidden />,
    badge: '온라인 워크숍',
    title: '마음토스 첫걸음 — 상담사용 활용 워크숍',
    duration: '90분',
    audience: '개인 상담사 / 수련생',
    body: '가입부터 첫 회기 노트 생성까지 손에 익히는 입문 워크숍. 비식별 처리·인용 추적·SOAP/DAP 양식 분기를 실제 사례로 다룹니다.',
  },
  {
    icon: <Building2 className="h-5 w-5" aria-hidden />,
    badge: '기관 도입 세미나',
    title: '기관 도입 의사결정자 세미나',
    duration: '60분',
    audience: '센터장 · 기관 운영진',
    body: '보안 정책·로깅·관리자 권한·계약 절차를 정리한 의사결정자 대상 세미나. 도입 후 운영 데이터와 개선 사례를 공유합니다.',
  },
  {
    icon: <Users className="h-5 w-5" aria-hidden />,
    badge: '슈퍼바이저 라운드테이블',
    title: '슈퍼비전 양식 활용 라운드테이블',
    duration: '120분',
    audience: '슈퍼바이저 · 사례지도교수',
    body: '사례개념화 출력물을 슈퍼비전에 어떻게 활용할지 함께 다듬는 소그룹 모임. 본인 사례를 가져오면 공동 검토합니다.',
  },
];

const PAST_FEEDBACK = [
  {
    quote:
      'SOAP 양식에 맞춘 노트가 회기 직후 정리되어 있어서, 다음 회기 준비 시간이 절반으로 줄었습니다.',
    role: '개인 상담사 · 5년차',
  },
  {
    quote:
      '기관 도입 검토 자료가 한 번에 정리되어 의사결정 회의가 한 번에 끝났습니다.',
    role: '기관 운영진',
  },
];

export default function EducationPage() {
  return (
    <>
      <section className="border-b border-[var(--line-1)] bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">교육 프로그램</p>
          <h1 className="mt-3 max-w-3xl">
            상담사·기관을 위한 마음토스 활용 교육
          </h1>
          <p className="mt-5 max-w-prose text-[length:var(--t-lead)] text-[var(--text-body)]">
            도구 사용법만이 아니라 내담자 동의·비식별 처리·슈퍼비전 활용까지 —
            상담 윤리에 부합하는 활용 방법을 함께 다룹니다.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
            >
              교육 신청하기 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">진행 중인 프로그램</p>
          <h2 className="mt-3">대상별로 정교하게 설계된 3 가지 트랙</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {PROGRAMS.map((p) => (
              <li
                key={p.title}
                className="flex flex-col rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-pale)] text-[var(--brand-primary-dark)]">
                  {p.icon}
                </span>
                <p className="mt-4 text-[length:var(--t-eyebrow)] font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)]">
                  {p.badge}
                </p>
                <h3 className="mt-2 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                  {p.title}
                </h3>
                <p className="mt-3 text-[var(--text-body)]">{p.body}</p>
                <dl className="mt-5 space-y-1.5 text-[length:var(--t-small)]">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    <dt className="sr-only">진행 시간</dt>
                    <dd>{p.duration}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    <dt className="sr-only">대상</dt>
                    <dd>{p.audience}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">신청 방법</p>
          <h2 className="mt-3">3 단계로 신청 완료</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: '1) 문의',
                body: '문의 폼에서 희망 프로그램과 일정을 알려주세요.',
              },
              {
                title: '2) 일정 확정',
                body: '담당자가 1 영업일 이내 회신해 일정·인원을 확정합니다.',
              },
              {
                title: '3) 진행',
                body: '온라인 또는 기관 방문 형태로 진행합니다. 자료는 이후 공유됩니다.',
              },
            ].map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[var(--line-warm)] bg-[var(--bg-base)] p-6"
              >
                <p className="text-[length:var(--t-small)] font-semibold text-[var(--brand-primary-dark)]">
                  {step.title}
                </p>
                <p className="mt-2 text-[var(--text-body)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">이전 회차 후기</p>
          <h2 className="mt-3">참여 상담사·기관의 이야기</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {PAST_FEEDBACK.map((fb) => (
              <li
                key={fb.role}
                className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-6"
              >
                <p className="text-[length:var(--t-lead)] text-[var(--text-primary)]">
                  &ldquo;{fb.quote}&rdquo;
                </p>
                <p className="mt-4 text-[length:var(--t-small)] text-[var(--text-muted)]">
                  — {fb.role}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--bg-deep)] text-[var(--text-on-dark)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] text-center md:py-[var(--section-py-desktop)]">
          <h2 className="text-[length:var(--t-h2-mobile)] text-[var(--text-on-dark)] md:text-[length:var(--t-h2)]">
            우리 기관에 맞는 회차로 진행하시겠어요?
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-on-dark-muted)]">
            기관 단위 단독 진행도 가능합니다. 인원·일정·주제를 맞춰 설계해
            드립니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact?type=institution-inquiry"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] sm:w-auto"
            >
              기관 단독 회차 문의
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
