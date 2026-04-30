'use client';

import { useState } from 'react';
import { ArrowDown } from 'lucide-react';

type Feature = {
  id: string;
  name: string;
  headline: string;
  when: string;
  desc: string;
  painTags: string[];
  inputs: string[];
  process: string;
  result: string;
};

const FEATURES: Feature[] = [
  {
    id: 'psych-test',
    name: '심리검사 해석',
    headline: '검사와 면담을 하나의 해석으로',
    when: '검사 결과와 면담을 함께 봐야 할 때',
    desc: 'MMPI, SCT, HTP, PAI 같은 검사 자료와 면담 기록을 함께 참고해 흩어진 단서를 상담사의 해석 구조로 정리합니다.',
    painTags: ['통합 해석', '해석 검증'],
    inputs: ['MMPI', 'SCT', 'HTP', 'PAI', '면담 기록'],
    process: '흩어진 단서를 해석 구조로 묶음',
    result: '통합 해석',
  },
  {
    id: 'transcribe',
    name: '축어록',
    headline: '회기의 분위기까지 담는 축어록',
    when: '회기 흐름을 다시 따라가야 할 때',
    desc: '녹음 파일을 올리면 회기 단위로 정리합니다. 발화·침묵·한숨처럼 상담 흐름을 이해하는 데 필요한 단서를 함께 남깁니다.',
    painTags: ['다음 회기 연결'],
    inputs: ['녹음 파일'],
    process: '발화·침묵·한숨 태깅',
    result: '회기 축어록',
  },
  {
    id: 'note',
    name: '상담노트',
    headline: '매번 다른 양식도, 바로 쓸 수 있게',
    when: '기관마다 양식이 달라 헷갈릴 때',
    desc: 'SOAP, DAP, BIRP 등 익숙한 양식에 맞춰 상담 기록을 정리합니다. 기관 양식이나 개인 작업 방식에 맞게 수정할 수 있습니다.',
    painTags: ['수용자별 정리'],
    inputs: ['줄글 기록'],
    process: '양식 분기 (SOAP / DAP / BIRP)',
    result: '양식별 상담노트',
  },
  {
    id: 'concept',
    name: '사례개념화 + AI 피드백',
    headline: '내 해석에 빈틈은 없는지 함께 점검',
    when: '내 해석을 한 번 더 점검하고 싶을 때',
    desc: '반복 패턴, 핵심 주제, 대안 가설을 함께 정리합니다. 상담사의 판단을 대신하지 않고, 놓친 관점을 확인하는 보조 역할을 합니다.',
    painTags: ['해석 검증', '다음 회기 연결'],
    inputs: ['상담 기록'],
    process: '반복 패턴 추출 + 대안 가설',
    result: '사례개념화 + AI 피드백',
  },
  {
    id: 'genogram',
    name: '가계도',
    headline: '대화 속 관계 단서를 가계도로 정리',
    when: '대화 속 가족 관계를 정리해야 할 때',
    desc: '축어록과 기록 속 가족 관계 단서를 바탕으로 가계도 초안을 제안합니다. 반복되는 관계 패턴과 주요 갈등 지점을 함께 확인할 수 있습니다.',
    painTags: ['통합 해석'],
    inputs: ['축어록', '기록'],
    process: '가족 단서 추출 → 노드·관계선',
    result: '가계도 초안',
  },
];

export function FeatureTabs() {
  const [active, setActive] = useState<string>(FEATURES[0].id);
  const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0];

  return (
    <section
      id="features"
      className="border-b border-[var(--line-2)] bg-[var(--bg-base)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">필요한 순간에 꺼내 쓰는 상담 도구들</p>
          <h2>
            상담 방식은 달라도,
            <br />
            필요한 도움은 마음토스 안에 있습니다.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            축어록이 필요한 상담사도, 상담노트가 급한 상담사도,
            <br className="hidden md:block" />
            검사 해석과 사례개념화가 막막한 상담사도 있습니다.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-[var(--line-2)] pb-2 sm:gap-3" role="tablist">
          {FEATURES.map((f) => {
            const isActive = f.id === active;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(f.id)}
                className={`rounded-t-lg border-b-2 px-3 py-2 text-[length:var(--t-small)] font-semibold transition-colors sm:px-4 ${
                  isActive
                    ? 'border-[var(--brand-primary-dark)] text-[var(--text-heading-strong)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="inline-block rounded-full border border-[var(--line-1)] bg-[var(--bg-warm)] px-3 py-1 text-[length:var(--t-meta)] font-semibold text-[var(--text-secondary)]">
              {current.name}
            </p>
            <h3 className="mt-4 text-[length:var(--t-h2-mobile)] font-semibold text-[var(--text-heading-strong)] md:text-[length:var(--t-h2)]">
              {current.headline}
            </h3>
            <p className="mt-3 text-[length:var(--t-lead)] text-[var(--brand-primary-dark)]">
              &ldquo;{current.when}&rdquo;
            </p>
            <p className="mt-4 text-[var(--text-body)]">{current.desc}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {current.painTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--brand-primary-dark)]/40 bg-[var(--brand-primary-pale)] px-3 py-1 text-[length:var(--t-meta)] font-medium text-[var(--brand-primary-dark)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-warm)] p-5 sm:p-7">
              <div className="rounded-lg border border-[var(--line-1)] bg-[var(--bg-base)] px-4 py-2.5 text-[length:var(--t-meta)] font-medium text-[var(--text-warm-dark)]">
                Mindthos AI · {current.name}
              </div>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="mb-2 text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    입력 자료
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {current.inputs.map((i) => (
                      <span
                        key={i}
                        className="rounded border border-[var(--line-1)] bg-[var(--bg-base)] px-3 py-1 text-[length:var(--t-small)] text-[var(--text-secondary)]"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center text-[var(--text-muted)]">
                  <ArrowDown className="h-5 w-5" aria-hidden />
                  <p className="mt-1 text-[length:var(--t-meta)]">{current.process}</p>
                  <ArrowDown className="mt-1 h-5 w-5" aria-hidden />
                </div>
                <div className="rounded-lg border-[1.5px] border-[var(--brand-primary-dark)] bg-[var(--bg-base)] px-4 py-3.5 text-center">
                  <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)]">
                    결과
                  </p>
                  <p className="mt-1 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                    {current.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
