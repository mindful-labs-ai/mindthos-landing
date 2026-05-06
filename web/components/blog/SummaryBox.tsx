import { BookOpen } from 'lucide-react';

interface SummaryBoxProps {
  summary: string | null;
}

export function SummaryBox({ summary }: SummaryBoxProps) {
  if (!summary) return null;

  return (
    <div
      className="my-6 rounded-r-lg border-l-4 border-[var(--brand-primary)] bg-[var(--bg-warm)] p-5"
      role="note"
      aria-label="핵심 요약"
    >
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)]">
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        이 글의 핵심
      </p>
      <p className="text-[length:var(--t-small)] leading-relaxed text-[var(--text-body)]">{summary}</p>
    </div>
  );
}
