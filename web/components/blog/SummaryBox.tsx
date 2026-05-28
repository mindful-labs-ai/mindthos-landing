import { BookOpen } from 'lucide-react';

interface SummaryBoxProps {
  summary: string | null;
}

/**
 * 본문 첫 30% 영역의 self-contained 직접 답변 블록.
 * 생성형 AI 인용 발췌 위치(약 44% 인용이 첫 30%에서 나옴)에 위치하므로,
 * `summary` 텍스트는 "글 소개" 가 아니라 글 제목 질문에 대한 단독 답변으로 작성한다.
 * 작성 규칙: web/docs/aeo-geo-research/action-plan.md §A3
 */
export function SummaryBox({ summary }: SummaryBoxProps) {
  if (!summary) return null;

  return (
    <div
      className="my-6 rounded-r-lg border-l-4 border-[var(--brand-primary)] bg-[var(--bg-warm)] p-5"
      role="note"
      aria-label="핵심 답변"
      data-ai-answer="true"
    >
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)]">
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        핵심 답변
      </p>
      <p className="text-small leading-relaxed text-[var(--text-body)]">{summary}</p>
    </div>
  );
}
