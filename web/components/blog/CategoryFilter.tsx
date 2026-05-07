import Link from 'next/link';
import type { Category } from '@/types/blog';

interface CategoryFilterProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  const pillBase =
    'flex-shrink-0 inline-flex items-center px-4 min-h-[44px] rounded-full text-small font-medium transition-colors whitespace-nowrap';
  const pillActive = `${pillBase} bg-[var(--brand-primary)] text-[var(--text-primary)]`;
  const pillInactive = `${pillBase} bg-[var(--bg-elevated)] border border-[var(--line-1)] text-[var(--text-body)] hover:bg-[var(--bg-warm)]`;

  return (
    <nav aria-label="블로그 카테고리" className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link href="/blog" className={!activeSlug ? pillActive : pillInactive}>
        전체
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/blog?category=${cat.slug}`}
          className={activeSlug === cat.slug ? pillActive : pillInactive}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
