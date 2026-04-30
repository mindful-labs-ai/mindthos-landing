const METRICS = [
  { value: '평균 22분', label: '회기당 절감되는 기록 시간', note: '내부 사용자 측정' },
  { value: '87%', label: '상담노트 양식 그대로 사용 비율', note: '베타 사용자 N=42' },
  { value: '4.7 / 5', label: '결과 신뢰도 평가', note: 'AI 피드백 도움 정도' },
  { value: '0건', label: '학습 데이터 노출 사례', note: '계약상 분리 · 감사 로그' },
];

const TESTIMONIALS = [
  {
    quote:
      '"같은 회기에서 축어록부터 사례개념화까지 한 곳에 정리되니 다음 회기 준비가 수월해요."',
    role: '센터 상담사 · 7년차',
  },
  {
    quote:
      '"심리검사 결과와 면담 기록을 묶어 한 사람의 이야기로 정리해주는 게 가장 인상적이었습니다."',
    role: '병원 임상심리사',
  },
  {
    quote:
      '"수퍼비전 발표 양식까지 자동 정리되어, 첫 수련생 시기에 큰 도움이 됐습니다."',
    role: '수련 9개월차 수련생',
  },
];

const ORGS = ['센터 A', '센터 B', '대학 상담센터', '병원 정신건강의학과', '기업 EAP', '학회 협력'];

export function SocialProof() {
  return (
    <section
      id="proof"
      className="border-b border-[var(--line-2)] bg-[var(--bg-base)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">상담 현장에서 검증되는 변화</p>
          <h2>
            기록 시간은 줄고,
            <br />
            해석에 들이는 집중은 늘어납니다.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-[var(--line-1)] bg-[var(--bg-warm)] p-5"
            >
              <p className="t-num text-[length:var(--t-h2-mobile)] font-bold text-[var(--brand-primary-dark)] md:text-[length:var(--t-h2)]">
                {m.value}
              </p>
              <p className="mt-2 text-[length:var(--t-small)] font-semibold text-[var(--text-heading-strong)]">
                {m.label}
              </p>
              <p className="mt-1 text-[length:var(--t-meta)] text-[var(--text-muted)]">
                {m.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.role}
              className="flex h-full flex-col rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6"
            >
              <blockquote className="text-[length:var(--t-body)] leading-relaxed text-[var(--text-primary)]">
                {t.quote}
              </blockquote>
              <figcaption className="mt-auto pt-5 text-[length:var(--t-meta)] font-medium text-[var(--text-muted)]">
                — {t.role}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            함께하는 기관
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {ORGS.map((org) => (
              <li
                key={org}
                className="flex h-12 items-center justify-center rounded-md border border-[var(--line-1)] bg-[var(--bg-warm)] text-[length:var(--t-small)] font-medium text-[var(--text-secondary)]"
              >
                {org}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
