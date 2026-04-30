import { Check, X } from 'lucide-react';

const ROWS = [
  {
    label: '내담자 데이터 학습',
    general: { icon: 'x' as const, text: '서비스에 따라 학습에 사용될 수 있음' },
    ours: { icon: 'check' as const, text: '학습에 사용되지 않음 (계약상 분리)' },
  },
  {
    label: '상담 양식',
    general: { icon: 'x' as const, text: 'SOAP/DAP/BIRP 등 상담 표준 미반영' },
    ours: { icon: 'check' as const, text: '기관 양식 분기 + 사용자 정의 가능' },
  },
  {
    label: '사례개념화 보조',
    general: { icon: 'x' as const, text: '단답형 응답 — 가설 검증 어려움' },
    ours: { icon: 'check' as const, text: '반복 패턴 + 대안 가설 + 놓친 관점' },
  },
  {
    label: '심리검사 해석',
    general: { icon: 'x' as const, text: 'MMPI/SCT 코드 패턴 해석 한계' },
    ours: { icon: 'check' as const, text: '검사 + 면담 통합 해석 구조' },
  },
  {
    label: '데이터 보호',
    general: { icon: 'x' as const, text: '개인 정보 처리 정책이 상담사 책임' },
    ours: { icon: 'check' as const, text: '저장 전 암호화 · 비식별 · 감사 로그' },
  },
];

export function VsAI() {
  return (
    <section
      id="vs"
      className="border-b border-[var(--line-2)] bg-[var(--bg-warm)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">그래서 마음토스인 이유</p>
          <h2>
            범용 AI로는 닿지 않는
            <br />
            상담 업무의 디테일이 있습니다.
          </h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            검사 양식, 사례개념화 구조, 안전한 데이터 처리.
            <br className="hidden md:block" />
            마음토스는 상담 업무를 처음부터 전제로 설계됐습니다.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[var(--line-1)] bg-[var(--bg-base)]">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.2fr]">
            <div className="hidden border-b border-[var(--line-2)] bg-[var(--bg-warm)] px-5 py-3 text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:block">
              항목
            </div>
            <div className="hidden border-b border-l border-[var(--line-2)] bg-[var(--bg-warm)] px-5 py-3 text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:block">
              범용 AI
            </div>
            <div className="hidden border-b border-l border-[var(--brand-primary-dark)]/30 bg-[var(--brand-primary-pale)] px-5 py-3 text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)] sm:block">
              마음토스
            </div>

            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`contents ${i > 0 ? '[&>*]:border-t [&>*]:border-[var(--line-2)]' : ''}`}
              >
                <div className="px-5 py-4 text-[length:var(--t-small)] font-semibold text-[var(--text-heading-strong)] sm:py-5">
                  {row.label}
                </div>
                <div className="flex items-start gap-2 border-l border-[var(--line-2)] px-5 py-4 text-[length:var(--t-small)] text-[var(--text-body)] sm:py-5">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--alert)]" aria-hidden />
                  <span>{row.general.text}</span>
                </div>
                <div className="flex items-start gap-2 border-l border-[var(--brand-primary-dark)]/20 bg-[var(--brand-primary-pale)]/40 px-5 py-4 text-[length:var(--t-small)] text-[var(--text-primary)] sm:py-5">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary-dark)]"
                    aria-hidden
                  />
                  <span>{row.ours.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
