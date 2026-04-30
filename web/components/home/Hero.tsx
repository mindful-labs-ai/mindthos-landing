import Link from 'next/link';
import { Lock } from 'lucide-react';

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-gradient-pair)]"
    >
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 gap-10 px-[var(--gutter)] py-[var(--section-py-tablet)] md:grid-cols-2 md:gap-12 md:py-[var(--section-py-desktop)]">
        <div className="flex flex-col justify-center">
          <p className="eyebrow mb-4">상담사를 위한 안전한 AI agent</p>
          <h1 className="text-[var(--text-heading-strong)]">
            상담사를 위한
            <br />
            안전한 AI agent,
            <br />
            <span className="text-[var(--text-primary)]">마음토스</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[length:var(--t-lead)] text-[var(--text-primary)]">
            상담이 끝난 뒤에도 남는 기록과 해석의 부담.
            <br />
            마음토스가 안전하게 정리하고, 다음 회기까지 이어줍니다.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[length:var(--t-small)] text-[var(--text-warm-dark)]">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            <span>내담자 데이터는 학습에 사용되지 않으며, 저장 전부터 암호화됩니다.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact?type=free-trial"
              className="inline-flex items-center rounded-lg bg-[var(--text-primary)] px-6 py-3 text-[length:var(--t-cta)] font-semibold text-[var(--text-on-dark)] transition-colors hover:bg-[var(--text-warm-dark)]"
            >
              무료로 시작하기
            </Link>
            <Link
              href="#trust"
              className="inline-flex items-center rounded-lg border-[1.5px] border-[var(--text-primary)] px-6 py-3 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-white/30"
            >
              기록이 지켜지는 과정 보기 →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-dashed border-white/40 p-3 sm:p-5">
            <div className="rounded-lg border-[1.5px] border-[var(--text-primary)] bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--line-2)] bg-[var(--bg-warm)] px-4 py-2.5 text-[length:var(--t-meta)] text-[var(--text-warm-dark)]">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                <span className="font-medium">안전한 AI 처리 영역</span>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <NoteField
                  label="주호소"
                  value="업무 스트레스로 인한 수면 어려움"
                />
                <NoteField
                  label="상담 목표"
                  value="수면 위생 재구성 + 인지 재구조화"
                />
                <NoteField
                  label="개입 방향"
                  value="CBT 기반 자동사고 탐색·대체"
                />
                <NoteField label="다음 회기 메모" value="수면 일지 작성·검토" cursor />
              </div>
              <div className="border-t border-[var(--line-2)] px-5 py-2 text-[length:var(--t-meta)] text-[var(--text-muted)]">
                ※ 가상 사례 · 예시
              </div>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <TrustChip>학습 미사용</TrustChip>
              <TrustChip>암호화 저장</TrustChip>
              <TrustChip>비식별 처리</TrustChip>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoteField({
  label,
  value,
  cursor,
}: {
  label: string;
  value: string;
  cursor?: boolean;
}) {
  return (
    <div>
      <p className="text-[length:var(--t-meta)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[length:var(--t-body-tight)] text-[var(--text-primary)]">
        {value}
        {cursor ? (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[var(--text-primary)] motion-safe:animate-pulse"
          />
        ) : null}
      </p>
    </div>
  );
}

function TrustChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--text-primary)]/40 bg-white/70 px-3 py-1 text-[length:var(--t-meta)] font-medium text-[var(--text-primary)] backdrop-blur-sm">
      {children}
    </span>
  );
}
