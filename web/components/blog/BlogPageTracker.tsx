'use client';

import { useEffect } from 'react';

interface BlogPageTrackerProps {
  slug: string;
  category?: string | null;
  author?: string | null;
  publishedAt?: string | null;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 블로그 글 진입 추적 — `blog_view` 이벤트.
 *
 * 사이트 전역 GA4 page_view 는 이미 자동 발사되지만, 블로그 글별 funnel 분석을 위해
 * slug / category / author 를 커스텀 디멘션으로 묶은 명시 이벤트를 1회 발사한다.
 * CtaTracker 의 cta_click 과 동일 디멘션을 사용해 GA4 explorations 에서
 * 글별 view → cta_click → signup_click funnel 을 한 글의 단위로 추적 가능.
 *
 * 커스텀 디멘션 등록 필요 (GA4 admin):
 *   - blog_slug, blog_category, blog_author, blog_published_at (event-scoped)
 */
export function BlogPageTracker({
  slug,
  category,
  author,
  publishedAt,
}: BlogPageTrackerProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', 'blog_view', {
      blog_slug: slug,
      ...(category ? { blog_category: category } : {}),
      ...(author ? { blog_author: author } : {}),
      ...(publishedAt ? { blog_published_at: publishedAt } : {}),
    });
  }, [slug, category, author, publishedAt]);

  return null;
}
