import Link from 'next/link';
import type { Category } from '@/types/blog';

interface CategoryFilterProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryFilter({ categories, activeSlug }: CategoryFilterProps) {
  return (
    <nav aria-label="블로그 카테고리" className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* 전체 tab */}
      <Link
        href="/blog"
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
          !activeSlug
            ? 'bg-primary text-white'
            : 'border border-[#777c78] text-foreground hover:bg-[#f3f4f0]'
        }`}
      >
        전체
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/blog/${cat.slug}`}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeSlug === cat.slug
              ? 'bg-primary text-white'
              : 'border border-[#777c78] text-foreground hover:bg-[#f3f4f0]'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
