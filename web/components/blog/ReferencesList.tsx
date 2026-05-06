import { ExternalLink } from 'lucide-react';
import type { Reference } from '@/types/blog';

interface ReferencesListProps {
  references: Reference[] | null;
}

const typeBadgeClass: Record<Reference['type'], string> = {
  academic: 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary-dark)]',
  government: 'bg-[var(--brand-primary-soft)] text-[var(--bg-base)]',
  industry: 'bg-[var(--line-warm)] text-[var(--text-warm-dark)]',
};

const typeLabel: Record<Reference['type'], string> = {
  academic: '학술',
  government: '정부',
  industry: '산업',
};

export function ReferencesList({ references }: ReferencesListProps) {
  if (!references || references.length === 0) return null;

  return (
    <section className="mt-10 border-t border-[var(--line-1)] pt-8">
      <h2 className="mb-4 text-h3 font-semibold text-[var(--text-heading-strong)]">
        참고 자료
      </h2>
      <ol className="space-y-3">
        {references.map((ref, i) => (
          <li key={i} className="flex items-start gap-3 text-small text-[var(--text-muted)]">
            <span className="mt-0.5 shrink-0 font-medium text-[var(--text-body)]">{i + 1}.</span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--text-body)] hover:text-[var(--brand-primary-dark)] hover:underline transition-colors"
                >
                  {ref.name}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                </a>
                <span
                  className={[
                    'inline-block rounded-full px-2 py-0.5 text-eyebrow font-medium',
                    typeBadgeClass[ref.type],
                  ].join(' ')}
                >
                  {typeLabel[ref.type]}
                </span>
              </div>
              {ref.description && (
                <p className="text-[var(--text-muted)]">{ref.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
