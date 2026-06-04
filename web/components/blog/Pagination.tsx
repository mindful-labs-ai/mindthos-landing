import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
  /**
   * true 면 필터 없는 기본 목록 → 경로형 페이지네이션 사용.
   * 1페이지는 basePath(`/blog`), 2페이지 이상은 `${basePath}/page/N`.
   * (각 페이지가 self-canonical 색인 가능한 크롤 경로가 되어 롱테일 글 발견에 기여)
   */
  pathBased?: boolean;
}

const btnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 44,
  minWidth: 44,
  padding: '0 10px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1,
  transition: 'background-color 160ms, color 160ms',
};

const ellipsisStyle: CSSProperties = {
  ...btnStyle,
  minWidth: 24,
  padding: '0 4px',
  color: 'var(--text-muted)',
};

const activeStyle: CSSProperties = {
  ...btnStyle,
  background: 'var(--brand-primary)',
  color: 'var(--text-primary)',
};

const inactiveStyle: CSSProperties = {
  ...btnStyle,
  color: 'var(--text-body)',
};

const disabledStyle: CSSProperties = {
  ...btnStyle,
  color: 'var(--line-1)',
  cursor: 'not-allowed',
};

export function Pagination({ currentPage, totalPages, basePath, searchParams = {}, pathBased = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageHref(page: number): string {
    if (pathBased) {
      return page <= 1 ? basePath : `${basePath}/page/${page}`;
    }
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

  return (
    <nav
      aria-label="페이지 이동"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 40 }}
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          style={inactiveStyle}
          className="hover:bg-[var(--bg-warm)]"
          aria-label="이전 페이지"
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </Link>
      ) : (
        <span style={disabledStyle} aria-disabled="true" aria-label="이전 페이지">
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </span>
      )}

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} style={ellipsisStyle}>
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(page)}
            style={page === currentPage ? activeStyle : inactiveStyle}
            className={page === currentPage ? '' : 'hover:bg-[var(--bg-warm)]'}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          style={inactiveStyle}
          className="hover:bg-[var(--bg-warm)]"
          aria-label="다음 페이지"
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </Link>
      ) : (
        <span style={disabledStyle} aria-disabled="true" aria-label="다음 페이지">
          <ChevronRight style={{ width: 16, height: 16 }} />
        </span>
      )}
    </nav>
  );
}
