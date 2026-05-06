'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PRIMARY_NAV } from '@/constants/nav';

const APP_URL = 'https://app.mindthos.com';

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Esc closes mobile menu; first link receives focus when opened.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    firstLinkRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <header className="gnb" data-scrolled={scrolled ? 'true' : 'false'}>
      <div className="container gnb-inner">
        <Link className="gnb-logo" href="/" aria-label="마음토스 홈">
          <img src="/logo-mindthos.webp" alt="마음토스" width={420} height={108} />
        </Link>

        <nav className="gnb-nav" aria-label="주 메뉴">
          {PRIMARY_NAV.map((item) => {
            const active = !item.external && isActive(pathname, item.href);
            const ariaCurrent = active ? 'page' : undefined;
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ariaCurrent}
                className={active ? 'active' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="gnb-right">
          <a className="btn sm ghost" href={APP_URL}>
            로그인
          </a>
          <a className="btn sm primary" href={APP_URL}>
            무료로 시작하기
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="gnb-mobile-toggle"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
            aria-controls="gnb-mobile-panel"
            style={{
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 0,
              background: 'transparent',
              borderRadius: 8,
              color: 'var(--text-primary)',
            }}
          >
            {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="gnb-mobile-panel"
          className="gnb-mobile-panel"
          style={{
            borderTop: '1px solid var(--line-1)',
            background: '#fff',
          }}
        >
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '12px 24px 16px',
            }}
            aria-label="모바일 메뉴"
          >
            {PRIMARY_NAV.map((item, idx) => {
              const active = !item.external && isActive(pathname, item.href);
              const linkStyle: React.CSSProperties = {
                display: 'block',
                padding: '10px 8px',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
              };
              const refProp = idx === 0 ? { ref: firstLinkRef } : {};
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                  onClick={() => setMobileOpen(false)}
                  {...refProp}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  style={linkStyle}
                  onClick={() => setMobileOpen(false)}
                  {...refProp}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
