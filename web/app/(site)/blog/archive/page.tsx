import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getAllPostsForArchive, type ArchivePost } from '@/lib/supabase/queries';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';
import type { Metadata } from 'next';

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return generatePageMetadata({
    title: '전체 글 — 블로그 아카이브',
    description:
      '마음토스 블로그의 모든 글을 카테고리별로 한 곳에서. 상담사 인사이트 · 기술 · 보안 · 도입 사례 전체 목록.',
    path: '/blog/archive',
  });
}

const UNCATEGORIZED = { name: '기타', slug: '_etc' };

function groupByCategory(posts: ArchivePost[]) {
  const groups = new Map<string, { name: string; slug: string; posts: ArchivePost[] }>();
  for (const post of posts) {
    const cat = post.category ?? UNCATEGORIZED;
    const existing = groups.get(cat.slug);
    if (existing) existing.posts.push(post);
    else groups.set(cat.slug, { name: cat.name, slug: cat.slug, posts: [post] });
  }
  return [...groups.values()];
}

export default async function BlogArchivePage() {
  const posts = await getAllPostsForArchive();
  const groups = groupByCategory(posts);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '블로그', item: `${SITE_CONFIG.url}/blog` },
      { '@type': 'ListItem', position: 2, name: '전체 글', item: `${SITE_CONFIG.url}/blog/archive` },
    ],
  };

  return (
    <>
      <SchemaMarkup schema={breadcrumb} />

      <section className="page-hero" aria-label="블로그 아카이브 — 페이지 헤더">
        <div className="container">
          <div className="page-hero-content">
            <span className="section-pill">블로그 아카이브</span>
            <h1 className="page-hero-h1">전체 글 목록</h1>
            <p className="page-hero-sub">
              마음토스 블로그의 모든 글 {posts.length}개를 카테고리별로 모았습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="wf-section">
        <div className="container">
          <nav aria-label="블로그 전체 글" className="flex flex-col gap-12">
            {groups.map((group) => (
              <div key={group.slug}>
                <h2 className="mb-5 text-h3 font-semibold text-[var(--text-heading-strong)]">
                  {group.name}
                  <span className="ml-2 text-base font-normal text-[var(--text-muted)]">
                    {group.posts.length}
                  </span>
                </h2>
                <ul className="grid list-none gap-x-8 gap-y-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {group.posts.map((post) => (
                    <li key={post.slug} className="leading-relaxed">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-[var(--text-body)] underline-offset-4 transition-colors hover:text-[var(--brand-primary-dark)] hover:underline"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <p className="mt-16 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-cta font-semibold text-[var(--brand-primary-dark)] hover:underline"
            >
              ← 블로그로 돌아가기
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
