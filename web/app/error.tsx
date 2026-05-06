'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-narrow px-gutter py-24 text-center">
      <h1 className="mb-4">문제가 발생했어요</h1>
      <p className="mb-8 text-[var(--text-body)]">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-[var(--brand-primary)] px-6 py-3 font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
      >
        다시 시도
      </button>
    </div>
  );
}
