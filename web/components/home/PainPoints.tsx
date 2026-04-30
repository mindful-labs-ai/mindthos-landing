import { ArrowDown } from 'lucide-react';

const SMALL_PAINS = [
  {
    label: '해석 검증',
    quote: '내 해석에 빈틈은 없을까',
    desc: '직관은 있지만 점검이 필요할 때.',
    visual: ['가설 A', '가설 B', '놓친 단서'],
    tag: 'AI 피드백 · 사례개념화',
  },
  {
    label: '수용자별 정리',
    quote: '같은 내용도 다르게 써야 할 때',
    desc: '톤·길이·양식이 달라질 때.',
    visual: ['내담자용', '슈퍼비전용', '기관용'],
    tag: '상담노트 · 양식 분기',
  },
  {
    label: '다음 회기 연결',
    quote: '다음 회기, 어디서 이어갈까',
    desc: '가설과 개입 방향을 다시 정리해야 할 때.',
    visual: ['지난 회기 핵심', '다음 회기 개입 방향'],
    tag: '사례개념화 · 통합 인사이트',
  },
  {
    label: 'AI 사용 불안',
    quote: 'AI에게 맡겨도 괜찮을까',
    desc: '자의적 해석·보안·할루시네이션이 걱정될 때.',
    visual: ['학습 미사용', '암호화', '비식별'],
    tag: 'Trust & Security',
  },
];

export function PainPoints() {
  return (
    <section
      id="problems"
      className="border-b border-[var(--line-2)] bg-[var(--bg-warm)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">상담이 끝난 뒤에도 남는 일들</p>
          <h2>
            기록은 남았지만,
            <br />
            해석은 여전히 흩어져 있으니까요.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            검사 결과, 면담 기록, 이전 회기, 가계도까지.
            <br className="hidden md:block" />
            상담사는 흩어진 단서를 하나의 이해로 묶어야 합니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-12">
          <article className="lg:col-span-7">
            <div className="h-full rounded-2xl border-[1.5px] border-[var(--text-primary)] bg-[var(--bg-base)] p-7 sm:p-9">
              <p className="inline-block rounded-full border border-[var(--line-1)] px-3 py-1 text-[length:var(--t-meta)] font-semibold text-[var(--text-secondary)]">
                통합 해석
              </p>
              <blockquote className="mt-5 text-[length:var(--t-h3)] font-medium leading-relaxed text-[var(--text-heading-strong)] sm:text-[length:var(--t-h2-mobile)]">
                &ldquo;검사 결과랑 면담 기록을
                <br />한 이야기로 엮는 게 제일 어려워요.&rdquo;
              </blockquote>
              <div className="mt-6 flex flex-wrap gap-2">
                {['MMPI', 'SCT', '면담 기록', '이전 회기', '가계도'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[var(--line-1)] bg-[var(--bg-warm)] px-3 py-1 text-[length:var(--t-meta)] text-[var(--text-secondary)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="my-5 flex justify-center text-[var(--text-muted)]">
                <ArrowDown className="h-5 w-5" aria-hidden />
              </div>
              <div className="rounded-xl border-2 border-[var(--text-primary)] bg-[var(--bg-warm)] px-5 py-4 text-center">
                <p className="text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                  한 사람에 대한
                  <br className="sm:hidden" /> 통합 해석으로 정리
                </p>
              </div>
              <div className="mt-6 h-px bg-[var(--line-2)]" />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--brand-primary-dark)]/40 bg-[var(--brand-primary-pale)] px-3 py-1 text-[length:var(--t-meta)] font-medium text-[var(--brand-primary-dark)]">
                  연결 기능 · 심리검사 해석
                </span>
              </div>
            </div>
          </article>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SMALL_PAINS.map((p) => (
                <article
                  key={p.label}
                  className="flex h-full flex-col rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] p-5 transition-colors hover:border-[var(--text-primary)]"
                >
                  <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {p.label}
                  </p>
                  <blockquote className="mt-2 font-semibold text-[var(--text-heading-strong)]">
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>
                  <p className="mt-2 text-[length:var(--t-small)] text-[var(--text-body)]">
                    {p.desc}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.visual.map((v) => (
                      <span
                        key={v}
                        className="rounded border border-[var(--line-1)] bg-[var(--bg-warm)] px-2 py-0.5 text-[length:11px] text-[var(--text-secondary)]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  <p className="mt-auto pt-3 text-[length:var(--t-meta)] text-[var(--brand-primary-dark)]">
                    {p.tag}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
