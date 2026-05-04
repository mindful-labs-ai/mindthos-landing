'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PRIMARY_NAV } from '@/constants/nav';
import { cn } from '@/lib/utils';

const APP_URL = 'https://app.mindthos.com';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled ? 'true' : 'false'}
      className={cn(
        'sticky top-0 z-40 w-full border-b border-[var(--line-1)]',
        'bg-white/[0.94] backdrop-blur-md backdrop-saturate-150',
        'data-[scrolled=true]:bg-white/[0.82] data-[scrolled=true]:backdrop-blur-lg',
        'transition-[background-color,backdrop-filter] duration-150'
      )}
    >
      <div className="mx-auto flex h-14 max-w-[var(--max-width-container)] items-center gap-9 px-6 md:h-[56px]">
        <Link href="/" aria-label="마음토스 홈" className="inline-flex h-8 items-center">
          <img
            src="/logo-mindthos.webp"
            alt="마음토스"
            width={420}
            height={108}
            className="h-7 w-auto md:h-8"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="주 메뉴">
          {PRIMARY_NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14.5px] font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary-dark)]"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-[14.5px] font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--brand-primary-dark)]"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={APP_URL}
            className={cn(
              'hidden h-9 items-center rounded-lg px-3.5 text-[13.5px] font-semibold',
              'text-[var(--text-primary)] transition-colors',
              'hover:bg-[var(--brand-primary-pale)] hover:text-[var(--brand-primary-dark)]',
              'md:inline-flex'
            )}
          >
            로그인
          </Link>
          <Link
            href={APP_URL}
            className={cn(
              'hidden h-9 items-center rounded-lg px-4 text-[13.5px] font-semibold',
              'bg-[var(--brand-primary)] text-white',
              'transition-colors hover:bg-[var(--brand-primary-soft)]',
              'md:inline-flex'
            )}
          >
            무료로 시작하기
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'border-t border-[var(--line-1)] bg-white md:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {PRIMARY_NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-[14.5px] font-semibold text-[var(--text-primary)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-[14.5px] font-semibold text-[var(--text-primary)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href={APP_URL}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-lg border border-[var(--line-1)] px-4 text-[13.5px] font-semibold text-[var(--text-primary)]"
            onClick={() => setMobileOpen(false)}
          >
            로그인
          </Link>
          <Link
            href={APP_URL}
            className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 text-[13.5px] font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            무료로 시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
