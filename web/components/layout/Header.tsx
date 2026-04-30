'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PRIMARY_NAV } from '@/constants/nav';
import { SITE_CONFIG } from '@/constants/site';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line-1)] bg-white/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center justify-between px-[var(--gutter)]">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[var(--text-heading-strong)]"
        >
          {SITE_CONFIG.name}
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="주 메뉴">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[length:var(--t-small)] font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary-dark)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="https://app.mindthos.com"
            className="hidden rounded-lg border border-[var(--line-1)] px-4 py-2 text-[length:var(--t-small)] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--brand-primary-dark)] hover:text-[var(--brand-primary-dark)] md:inline-flex"
          >
            로그인
          </Link>
          <button
            type="button"
            className="p-2 md:hidden"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'border-t border-[var(--line-1)] bg-[var(--bg-base)] md:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        <nav className="flex flex-col gap-1 px-[var(--gutter)] py-4">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 text-[length:var(--t-small)] font-semibold text-[var(--text-primary)]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="https://app.mindthos.com"
            className="mt-3 rounded-lg border border-[var(--line-1)] px-4 py-2 text-center text-[length:var(--t-small)] font-medium text-[var(--text-primary)]"
            onClick={() => setMobileOpen(false)}
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
