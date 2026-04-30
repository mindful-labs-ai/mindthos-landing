import { ExternalLink } from 'lucide-react';
import type { Reference } from '@/types/blog';

interface ReferencesListProps {
  references: Reference[] | null;
}

export function ReferencesList({ references }: ReferencesListProps) {
  if (!references || references.length === 0) return null;

  return (
    <section className="mt-10 border-t border-[#e0ddd8] pt-8">
      <h2 className="mb-4 text-lg font-semibold text-[#2f3331]">참고 자료</h2>
      <ol className="space-y-2">
        {references.map((ref, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#5c605d]">
            <span className="mt-0.5 shrink-0 font-medium text-[#2f3331]">{i + 1}.</span>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#2d6a4f] hover:underline transition-colors"
            >
              {ref.name}
              {ref.description && (
                <span className="text-[#5c605d]"> — {ref.description}</span>
              )}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
