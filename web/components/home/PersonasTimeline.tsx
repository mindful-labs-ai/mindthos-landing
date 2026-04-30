const PERSONAS = [
  {
    label: '기록이 밀리는 상담사',
    quote: '"상담은 끝났는데, 노트 정리는 자꾸 뒤로 밀려요."',
    desc: '회기 직후의 기록 부담을 줄이고, 바로 쓸 수 있는 상담노트로 정리합니다.',
    visual: ['녹음 파일', '상담노트'],
    tags: ['상담노트', '축어록'],
  },
  {
    label: '해석을 점검하고 싶은 상담사',
    quote: '"내 해석에 빈틈은 없는지, 놓친 가설은 없는지 확인하고 싶어요."',
    desc: '직관은 있지만 한 번 더 점검이 필요할 때.',
    visual: ['내 해석', '가설 A', '가설 B'],
    tags: ['사례개념화', 'AI 피드백'],
  },
  {
    label: '심리검사 자료를 함께 보는 상담사',
    quote: '"검사 결과와 면담 기록이 따로 놀 때, 한 사람의 이야기로 묶기가 어려워요."',
    desc: 'MMPI·SCT·HTP 같은 검사 결과를 면담 맥락과 함께 정리합니다.',
    visual: ['MMPI', 'SCT', '면담 기록'],
    tags: ['심리검사 해석'],
  },
  {
    label: '관계 패턴을 정리해야 하는 상담사',
    quote: '"가족 관계와 반복되는 갈등 패턴을 한눈에 보고 싶어요."',
    desc: '회기에서 나온 관계 단서를 가계도와 사례개념화로 연결합니다.',
    visual: ['대화 단서', '관계 노드'],
    tags: ['가계도', '사례개념화'],
  },
  {
    label: '수퍼비전을 준비하는 수련생',
    quote: '"상담 내용을 어떻게 구조화해서 가져가야 할지 막막해요."',
    desc: '첫 수퍼비전, 학회 양식, 사례 발표를 앞둔 순간.',
    visual: ['회기 자료', '구조화된 사례 발표'],
    tags: ['축어록', '사례개념화', 'AI 피드백'],
  },
];

export function PersonasTimeline() {
  return (
    <section
      id="personas"
      className="border-b border-[var(--line-2)] bg-[var(--bg-base)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">각자의 상담 흐름에 맞게</p>
          <h2>
            상담사가 막히는 지점마다,
            <br />
            마음토스의 쓰임도 달라집니다.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            모든 기능을 다 쓸 필요는 없습니다.
            <br className="hidden md:block" />
            지금 막혀 있는 장면에 맞춰 필요한 도구만 골라 쓰면 됩니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p, i) => (
            <article
              key={p.label}
              className={`flex h-full flex-col rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6 transition-colors hover:border-[var(--text-primary)] ${
                i === 3 ? 'lg:col-start-1' : ''
              }`}
            >
              <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {p.label}
              </p>
              <blockquote className="mt-3 text-[length:var(--t-h3)] font-medium leading-relaxed text-[var(--text-heading-strong)]">
                {p.quote}
              </blockquote>
              <p className="mt-3 text-[length:var(--t-small)] text-[var(--text-body)]">
                {p.desc}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[length:11px] text-[var(--text-secondary)]">
                {p.visual.map((v, idx) => (
                  <span key={v} className="flex items-center gap-1.5">
                    <span className="rounded border border-[var(--line-1)] bg-[var(--bg-warm)] px-2 py-0.5">
                      {v}
                    </span>
                    {idx < p.visual.length - 1 ? <span aria-hidden>→</span> : null}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--brand-primary-dark)]/30 bg-[var(--brand-primary-pale)] px-2.5 py-0.5 text-[length:var(--t-meta)] font-medium text-[var(--brand-primary-dark)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
