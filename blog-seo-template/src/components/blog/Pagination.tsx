import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    return `${basePath}?page=${page}`;
  }

  // Build page numbers with ellipsis
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

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1 mt-10">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#afb3af] text-[#5c605d] hover:bg-[#f3f4f0] transition-colors"
          aria-label="이전 페이지"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#f3f4f0] text-[#afb3af] cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="flex items-center justify-center w-9 h-9 text-[#777c78] text-sm">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(page)}
            className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-[#afb3af] text-[#5c605d] hover:bg-[#f3f4f0]'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#afb3af] text-[#5c605d] hover:bg-[#f3f4f0] transition-colors"
          aria-label="다음 페이지"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#f3f4f0] text-[#afb3af] cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
