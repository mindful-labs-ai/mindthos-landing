'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TocItem } from '@/lib/markdown/toc';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [tocStyle, setTocStyle] = useState<React.CSSProperties>({});

  // Intersection Observer for active heading
  useEffect(() => {
    if (items.length === 0) return;

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

  // Scroll-based sticky behavior
  const handleScroll = useCallback(() => {
    if (!tocRef.current) return;

    const tocEl = tocRef.current;
    const parent = tocEl.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const headerHeight = 96; // sticky header + margin
    const tocHeight = tocEl.offsetHeight;

    // Parent top is above the header threshold
    if (parentRect.top < headerHeight) {
      // Check if we've scrolled past the parent bottom
      const parentBottom = parentRect.bottom;
      if (parentBottom - headerHeight < tocHeight) {
        // Parent is ending — position TOC at the bottom of parent
        setIsSticky(false);
        setTocStyle({
          position: 'absolute',
          bottom: '0',
          top: 'auto',
          width: tocEl.offsetWidth + 'px',
        });
      } else {
        // Sticky — fixed to viewport
        setIsSticky(true);
        setTocStyle({
          position: 'fixed',
          top: headerHeight + 'px',
          width: parent.offsetWidth + 'px',
        });
      }
    } else {
      // Above the fold — normal flow
      setIsSticky(false);
      setTocStyle({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only on desktop
    const mq = window.matchMedia('(min-width: 1024px)');
    if (!mq.matches) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    const mqListener = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        setIsSticky(false);
        setTocStyle({});
      }
    };
    mq.addEventListener('change', mqListener);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      mq.removeEventListener('change', mqListener);
    };
  }, [handleScroll]);

  if (items.length === 0) return null;

  const tocList = (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li
          key={item.id}
          style={{ paddingLeft: item.level === 3 ? '1rem' : '0' }}
        >
          <a
            href={`#${item.id}`}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'block rounded px-2 py-1 leading-snug transition-colors hover:text-[#2d6a4f]',
              activeId === item.id
                ? 'font-semibold text-[#2d6a4f]'
                : 'text-[#5c605d]'
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop TOC with JS-based sticky */}
      <div className="hidden lg:block" style={{ position: 'relative' }}>
        <div ref={tocRef} style={tocStyle}>
          <nav
            className="rounded-xl border border-[#e0ddd8] bg-[#faf9f7] p-5"
            aria-label="목차"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#5c605d]">
              목차
            </p>
            {tocList}
          </nav>
        </div>
      </div>

      {/* Mobile collapsible accordion */}
      <div className="lg:hidden my-6 rounded-xl border border-[#e0ddd8] bg-[#faf9f7]">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-[#2f3331]"
          aria-expanded={mobileOpen}
          aria-controls="toc-mobile-list"
        >
          <span>목차</span>
          <span className="text-[#5c605d]">{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {mobileOpen && (
          <div id="toc-mobile-list" className="border-t border-[#e0ddd8] px-5 py-3">
            {tocList}
          </div>
        )}
      </div>
    </>
  );
}
