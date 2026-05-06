import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageHref(page: number): string {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  }

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  const pages = getPages();

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded-full text-small font-medium transition-colors';
  const btnActive = `${btnBase} bg-[var(--brand-primary)] text-[var(--text-primary)]`;
  const btnInactive = `${btnBase} border border-[var(--line-1)] text-[var(--text-muted)] hover:bg-[var(--bg-warm)]`;
  const btnDisabled = `${btnBase} border border-[var(--line-2)] text-[var(--line-1)] cursor-not-allowed`;

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1 mt-10">
      {currentPage > 1 ? (
        <Link href={pageHref(currentPage - 1)} className={btnInactive} aria-label="이전 페이지">
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className={btnDisabled} aria-disabled="true" aria-label="이전 페이지">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="flex items-center justify-center w-9 h-9 text-[var(--text-muted)] text-small">
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(page)}
            className={page === currentPage ? btnActive : btnInactive}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={pageHref(currentPage + 1)} className={btnInactive} aria-label="다음 페이지">
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className={btnDisabled} aria-disabled="true" aria-label="다음 페이지">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
