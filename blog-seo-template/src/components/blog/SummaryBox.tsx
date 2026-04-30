interface SummaryBoxProps {
  summary: string | null;
}

export function SummaryBox({ summary }: SummaryBoxProps) {
  if (!summary) return null;

  return (
    <div
      className="my-6 rounded-r-lg border-l-4 border-[#2d6a4f] bg-[#e7e2da] p-5"
      role="note"
      aria-label="핵심 요약"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2d6a4f]">
        이 글의 핵심
      </p>
      <p className="text-sm leading-relaxed text-[#2f3331]">{summary}</p>
    </div>
  );
}
