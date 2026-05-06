'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface BlogSearchProps {
  defaultValue?: string;
}

export function BlogSearch({ defaultValue = '' }: BlogSearchProps) {
  const router = useRouter();
  // Local input state; reset on URL change via parent `key` prop or page rerender.
  // We do NOT sync from useSearchParams in an effect (linter flags setState-in-effect).
  // The defaultValue prop is the source of truth on mount; user edits override it.
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/blog?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/blog');
    }
  }

  function handleClear() {
    setQuery('');
    router.push('/blog');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative"
      role="search"
      aria-label="블로그 검색"
    >
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        name="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="블로그 검색..."
        aria-label="검색어 입력"
        className="w-full rounded-lg border border-[var(--line-1)] bg-[var(--bg-base)] px-4 py-2.5 pl-10 pr-10 text-[length:var(--t-small)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary-dark)] focus:ring-1 focus:ring-[var(--brand-primary-dark)] transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="검색어 지우기"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
