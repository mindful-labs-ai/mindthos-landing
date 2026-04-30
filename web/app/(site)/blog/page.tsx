import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getPublishedPosts, getCategories } from '@/lib/supabase/queries';

export const revalidate = 3600;

export const metadata = generatePageMetadata({
  title: '블로그',
  description:
    '상담사 인사이트 · 기술 · 보안 · 도입 사례 · 제품 업데이트가 한 곳에. 마음토스 블로그.',
  path: '/blog',
});

export default async function BlogIndexPage() {
  const [{ posts, total }, categories] = await Promise.all([
    getPublishedPosts({ perPage: 24 }),
    getCategories(),
  ]);

  return (
    <section className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
      <p className="eyebrow">블로그</p>
      <h1 className="mt-3">상담 현장의 인사이트와 마음토스 이야기</h1>
      <p className="mt-5 max-w-prose text-[length:var(--t-lead)] text-[var(--text-body)]">
        상담사 인사이트 · 기술 / 보안 · 도입 사례 · 제품 업데이트가 한 곳에서
        업데이트됩니다.
      </p>

      {categories.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/blog?category=${c.slug}`}
                className="inline-flex rounded-full border border-[var(--line-1)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[length:var(--t-small)] text-[var(--text-body)] transition-colors hover:border-[var(--brand-primary-dark)] hover:text-[var(--text-primary)]"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-10 text-center">
          <BookOpen
            className="mx-auto h-8 w-8 text-[var(--brand-primary-dark)]"
            aria-hidden
          />
          <h2 className="mt-4 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
            첫 글을 준비 중입니다
          </h2>
          <p className="mt-3 max-w-prose text-[var(--text-body)]">
            상담 현장에서 마음토스가 어떻게 쓰이고 있는지, 어떤 고민이 오가는지
            정리해 곧 공개합니다. 새 글이 발행되면 알려드릴까요?
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-3 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
          >
            발행 알림 받기 <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6 transition-colors hover:border-[var(--brand-primary-dark)]"
            >
              <Link href={`/blog/${post.slug}`}>
                {post.category ? (
                  <p className="text-[length:var(--t-eyebrow)] font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)]">
                    {post.category.name}
                  </p>
                ) : null}
                <h2 className="mt-2 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-3 text-[var(--text-body)]">{post.excerpt}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {total > posts.length ? (
        <p className="mt-12 text-center text-[length:var(--t-small)] text-[var(--text-muted)]">
          전체 {total} 편 중 {posts.length} 편 표시 — 페이지네이션은 다음 단계에서 추가 예정
        </p>
      ) : null}
    </section>
  );
}
