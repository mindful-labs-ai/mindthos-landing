'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * UTM Forwarder
 *
 * 광고 캠페인 트래픽을 마음토스 앱 가입 단계까지 끊김 없이 전달하기 위한 컴포넌트.
 * 동작:
 *   1. 페이지 URL 의 `utm_*` 파라미터를 수집해 sessionStorage 에 영속화 — 첫 랜딩 UTM 이
 *      동일 세션 내 모든 후속 페이지에서 유지됨.
 *   2. 페이지 내 `app.mindthos.com` 을 포함하는 모든 `<a>` 의 href 에 수집된 UTM 을 주입
 *      (기존 query string 은 보존, UTM 키는 덮어씀).
 *   3. App Router 클라이언트 라우팅 후 새 페이지가 렌더되면 재실행 (`pathname` 의존).
 *   4. MutationObserver 로 이후 동적으로 추가되는 링크에도 적용.
 *
 * 기존 webflow body script 의 1회성 동작 (DOMContentLoaded) 을 SPA 환경에 맞춰 확장.
 */
const STORAGE_KEY = 'mt-utm-params';
const APP_HOST = 'app.mindthos.com';

function readUtmsFromUrl(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      if (key.startsWith('utm_')) out[key] = value;
    });
  } catch {
    // ignore — URL 파싱 실패 시 빈 객체
  }
  return out;
}

function loadStoredUtms(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore — 손상된 캐시는 무시
  }
  return {};
}

function persistUtms(utms: Record<string, string>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
  } catch {
    // ignore — quota / privacy 모드 등
  }
}

function applyUtmsToLinks(utms: Record<string, string>): void {
  if (Object.keys(utms).length === 0) return;
  const links = document.querySelectorAll<HTMLAnchorElement>('a');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.includes(APP_HOST)) return;
    try {
      const targetUrl = new URL(
        href.startsWith('http') ? href : window.location.origin + href,
      );
      let mutated = false;
      Object.entries(utms).forEach(([key, value]) => {
        if (targetUrl.searchParams.get(key) !== value) {
          targetUrl.searchParams.set(key, value);
          mutated = true;
        }
      });
      if (mutated) link.setAttribute('href', targetUrl.toString());
    } catch {
      // malformed href — skip
    }
  });
}

export function UtmForwarder() {
  const pathname = usePathname();

  useEffect(() => {
    /* 1. 현재 URL UTM + 캐시 머지 — URL 쪽이 우선 (새 캠페인 도착 시 갱신) */
    const merged: Record<string, string> = {
      ...loadStoredUtms(),
      ...readUtmsFromUrl(),
    };
    if (Object.keys(merged).length === 0) return;
    persistUtms(merged);

    /* 2. 즉시 1회 적용 */
    applyUtmsToLinks(merged);

    /* 3. SPA 후속 렌더 / 동적 컴포넌트 대응 — rAF 로 mutation burst coalesce */
    let raf: number | null = null;
    const observer = new MutationObserver(() => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        applyUtmsToLinks(merged);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
