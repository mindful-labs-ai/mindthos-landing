'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

const CASES = [
  {
    id: 'case-01',
    code: 'CASE 01',
    category: '불안·수면 문제',
    person: '20대 직장인 · 첫 회기',
    desc: '업무 스트레스와 수면 어려움을 호소한 초기 상담',
    chips: ['축어록', '상담노트'],
  },
  {
    id: 'case-02',
    code: 'CASE 02',
    category: '가족 갈등',
    person: '30대 성인 · 3회기',
    desc: '부모와의 관계 갈등이 반복적으로 언급된 상담',
    chips: ['가계도', '사례개념화'],
  },
  {
    id: 'case-03',
    code: 'CASE 03',
    category: '심리검사 해석',
    person: '대학생 · MMPI + SCT 포함',
    desc: '검사 결과와 면담 기록을 함께 해석해야 하는 사례',
    chips: ['심리검사 해석', 'AI 피드백'],
  },
];

const SOAP = [
  { letter: 'S', label: 'Subjective', body: '"잠을 자려고 누우면 계속 생각이 나요."' },
  { letter: 'O', label: 'Objective', body: '침묵 3회, 목소리 떨림, 피로감 반복 언급' },
  {
    letter: 'A',
    label: 'Assessment',
    body: '업무 스트레스와 자기비난이 수면 어려움으로 이어지는 패턴 가능성',
  },
  {
    letter: 'P',
    label: 'Plan',
    body: '다음 회기에서 수면 루틴, 회피 행동, 직무 스트레스 상황을 점검',
  },
];

export function SampleExperience() {
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  return (
    <section
      id="sample"
      className="border-b border-[var(--line-2)] bg-[var(--bg-elevated)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">샘플로 먼저 확인하기</p>
          <h2>
            실제 자료를 올리기 전,
            <br />
            마음토스의 결과를 먼저 확인해보세요
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            준비된 가상 사례를 선택하면, 회기 흐름이 어떻게 정리되는지 단계별로 확인할
            수 있습니다.
            <br className="hidden md:block" />
            로그인 없이 부담 없이 살펴보세요.
          </p>

          {!expanded ? (
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setStep(1);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-dark)] hover:text-white"
              >
                샘플 체험 시작하기 <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[length:var(--t-meta)] text-[var(--text-muted)]">
                로그인 없이 확인할 수 있습니다.
              </p>
            </div>
          ) : null}
        </div>

        {expanded ? (
          <div className="mx-auto mt-10 max-w-[880px] rounded-2xl border-[1.5px] border-[var(--line-1)] bg-[var(--bg-base)] p-6 sm:p-9">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={`h-2 rounded-full transition-all ${
                      n === step
                        ? 'w-6 bg-[var(--brand-primary-dark)]'
                        : n < step
                          ? 'w-2 bg-[var(--brand-primary-soft)]'
                          : 'w-2 bg-[var(--line-1)]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[length:var(--t-meta)] font-medium text-[var(--text-muted)]">
                Step {step} / 4
              </span>
            </div>

            {step === 1 ? (
              <Step1 onSelect={() => setStep(2)} />
            ) : step === 2 ? (
              <Step2 onNext={() => setStep(3)} />
            ) : step === 3 ? (
              <Step3 onNext={() => setStep(4)} />
            ) : (
              <Step4 onReset={() => setStep(1)} />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Step1({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="mt-7">
      <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Step 1 / 4 · 가상 사례 선택
      </p>
      <p className="mt-2 text-[var(--text-body)]">
        실제 내담자 자료 없이, 준비된 가상 사례로 결과 흐름을 먼저 확인해보세요.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {CASES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={onSelect}
            className="group flex flex-col rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] p-5 text-left transition-all hover:border-[var(--brand-primary-dark)] hover:shadow-sm"
          >
            <p className="text-[length:var(--t-meta)] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              {c.code}
            </p>
            <p className="mt-1 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
              {c.category}
            </p>
            <p className="mt-1 text-[length:var(--t-small)] text-[var(--text-secondary)]">
              {c.person}
            </p>
            <p className="mt-3 text-[length:var(--t-small)] text-[var(--text-body)]">
              {c.desc}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[var(--line-1)] bg-[var(--bg-warm)] px-2 py-0.5 text-[length:11px] text-[var(--text-secondary)]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[length:var(--t-small)] font-semibold text-[var(--brand-primary-dark)]">
              이 사례로 결과 보기 <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  const chips = [
    '학습 미사용',
    '저장 전 암호화',
    '개인정보 비식별',
    '상담 기록 구조화',
    '결과 카드 생성',
  ];
  const flow = ['입력 자료', '보안 처리', 'AI 정리', '결과 생성'];
  return (
    <div className="mt-7">
      <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Step 2 / 4 · 처리 중
      </p>
      <p className="mt-2 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
        마음토스가 회기 자료를 정리하고 있어요.
      </p>
      <p className="mt-2 text-[var(--text-body)]">
        가상 데이터지만, 실제 회기와 동일한 안전 처리 흐름을 따릅니다.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {flow.map((step, i) => (
          <span key={step} className="flex items-center gap-2 sm:gap-3">
            <span className="rounded-lg border border-[var(--line-1)] bg-[var(--bg-warm)] px-3 py-1.5 text-[length:var(--t-small)] text-[var(--text-secondary)]">
              {step}
            </span>
            {i < flow.length - 1 ? (
              <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
            ) : null}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-full border border-[var(--brand-primary-dark)]/40 bg-[var(--brand-primary-pale)] px-3 py-1 text-[length:var(--t-meta)] font-medium text-[var(--brand-primary-dark)]"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-7 text-center">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-dark)] hover:text-white"
        >
          다음 <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Step3({ onNext }: { onNext: () => void }) {
  const tabs = ['축어록', '상담노트', '사례개념화'];
  return (
    <div className="mt-7">
      <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Step 3 / 4 · 결과 미리 보기
      </p>
      <p className="mt-2 text-[var(--text-body)]">
        같은 회기에서 만들어진 결과입니다. 위 탭으로 전환해 보세요.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-[var(--line-2)] pb-2">
        {tabs.map((t, i) => (
          <span
            key={t}
            className={`rounded-t-lg border-b-2 px-3 py-1.5 text-[length:var(--t-small)] font-semibold ${
              i === 1
                ? 'border-[var(--brand-primary-dark)] text-[var(--text-heading-strong)]'
                : 'border-transparent text-[var(--text-muted)]'
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            입력 자료 요약
          </p>
          <ul className="mt-2 space-y-1 text-[length:var(--t-small)] text-[var(--text-body)]">
            <li>· 회기 녹음 48분</li>
            <li>· 상담사 메모 2건</li>
            <li>· 이전 회기 요약 1건</li>
          </ul>
        </div>
        <div>
          <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            추출된 핵심 단서
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['수면 어려움', '업무 스트레스', '자기비난', '회피 패턴'].map((c) => (
              <span
                key={c}
                className="rounded border border-[var(--line-1)] bg-[var(--bg-warm)] px-2.5 py-0.5 text-[length:var(--t-meta)] text-[var(--text-secondary)]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border-[1.5px] border-[var(--line-1)]">
          {SOAP.map((row, i) => (
            <div
              key={row.letter}
              className={`flex gap-3 p-4 sm:p-5 ${
                i < SOAP.length - 1 ? 'border-b border-[var(--line-2)]' : ''
              }`}
            >
              <p className="font-mono text-[length:var(--t-h3)] font-semibold text-[var(--brand-primary-dark)]">
                {row.letter}
              </p>
              <div>
                <p className="text-[length:var(--t-meta)] font-semibold text-[var(--text-secondary)]">
                  — {row.label}
                </p>
                <p className="mt-1 text-[length:var(--t-small)] text-[var(--text-primary)]">
                  {row.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            함께 생성된 결과
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--line-1)] bg-[var(--bg-warm)] p-4">
              <p className="text-[length:var(--t-small)] font-semibold text-[var(--text-heading-strong)]">
                가계도 초안
              </p>
              <p className="mt-1 text-[length:var(--t-meta)] text-[var(--text-body)]">
                관계 단서 4개 감지 · 주요 갈등 축 표시
              </p>
            </div>
            <div className="rounded-lg border border-[var(--line-1)] bg-[var(--bg-warm)] p-4">
              <p className="text-[length:var(--t-small)] font-semibold text-[var(--text-heading-strong)]">
                심리검사 해석 요약
              </p>
              <p className="mt-1 text-[length:var(--t-meta)] text-[var(--text-body)]">
                MMPI/SCT 단서와 면담 내용을 함께 참고한 해석 초안
              </p>
            </div>
          </div>
        </div>

        <p className="rounded-md border border-[var(--line-2)] bg-[var(--bg-warm)] px-4 py-3 text-[length:var(--t-meta)] text-[var(--text-muted)]">
          결과는 상담사의 검토를 위한 초안입니다. 진단이나 확정 판단을 대신하지 않습니다.
        </p>

        <div className="text-right">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-dark)] hover:text-white"
          >
            내 회기로 이어가기 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step4({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-7 text-center">
      <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Step 4 / 4 · 시작하기
      </p>
      <p className="mt-3 text-[length:var(--t-h2-mobile)] font-semibold text-[var(--text-heading-strong)] md:text-[length:var(--t-h2)]">
        가상 회기는 여기까지입니다.
        <br />
        내 회기로 같은 흐름을 이어가 보세요.
      </p>
      <Link
        href="/contact?type=free-trial"
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary-dark)] px-6 py-3 text-[length:var(--t-cta)] font-semibold text-white transition-colors hover:bg-[var(--brand-primary-soft)] hover:text-[var(--text-primary)]"
      >
        내 회기로 시작하기 <ArrowRight className="h-4 w-4" />
      </Link>
      <div className="mt-3">
        <button
          type="button"
          onClick={onReset}
          className="text-[length:var(--t-small)] text-[var(--text-muted)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
        >
          ← 다른 가상 사례 다시 보기
        </button>
      </div>
      <p className="mt-3 text-[length:var(--t-meta)] text-[var(--text-muted)]">
        무료로 시작 · 신용카드 정보 없이 가입
      </p>
    </div>
  );
}
