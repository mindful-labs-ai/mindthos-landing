'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/markdown/toc';

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  const tocList = (
    <ul className="space-y-1 text-[length:var(--t-small)]">
      {items.map((item) => (
        <li
          key={item.id}
          style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}
        >
          <a
            href={`#${item.id}`}
            className={[
              'block rounded px-2 py-1 leading-snug transition-colors',
              activeId === item.id
                ? 'font-semibold text-[var(--brand-primary-dark)]'
                : 'text-[var(--text-muted)] hover:text-[var(--brand-primary-dark)]',
            ].join(' ')}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop TOC — sticky */}
      <nav
        className="hidden md:block md:sticky md:top-24 rounded-xl border border-[var(--line-1)] bg-[var(--bg-warm)] p-5"
        aria-label="목차"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          목차
        </p>
        {tocList}
      </nav>

      {/* Mobile collapsible */}
      <details className="md:hidden my-6 rounded-xl border border-[var(--line-1)] bg-[var(--bg-warm)]">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-[length:var(--t-small)] font-semibold text-[var(--text-heading-strong)] list-none [&::-webkit-details-marker]:hidden">
          <span>목차</span>
          <span className="text-[var(--text-muted)]" aria-hidden="true">▼</span>
        </summary>
        <div className="border-t border-[var(--line-1)] px-5 py-3">
          {tocList}
        </div>
      </details>
    </>
  );
}
