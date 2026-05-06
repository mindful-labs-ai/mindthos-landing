import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  getPublishedPosts,
  getCategories,
  getPopularPosts,
  searchPosts,
} from '@/lib/supabase/queries';
import { PostCard } from '@/components/blog/PostCard';
import { Pagination } from '@/components/blog/Pagination';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';
import type { Metadata } from 'next';

export const revalidate = 3600;

const PAGE_SIZE = 12;

interface BlogIndexPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: BlogIndexPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const isSearch = Boolean(sp.search);
  const base = generatePageMetadata({
    title: isSearch ? `검색 결과 — ${sp.search}` : '블로그',
    description:
      '상담사 인사이트 · 기술 · 보안 · 도입 사례 · 제품 업데이트가 한 곳에. 마음토스 블로그.',
    path: '/blog',
    noindex: isSearch,
  });
  return base;
}

function buildBlogSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteUrl}/blog/#blog`,
    url: `${siteUrl}/blog`,
    name: `${SITE_CONFIG.name} 블로그`,
    description: SITE_CONFIG.description,
    publisher: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
    },
    inLanguage: SITE_CONFIG.language,
  };
}

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const categorySlug = sp.category;
  const searchQuery = sp.search?.trim();

  const [{ posts, total }, categories, popularPosts] = await Promise.all([
    searchQuery
      ? searchPosts(searchQuery, { page, perPage: PAGE_SIZE })
      : getPublishedPosts({ page, perPage: PAGE_SIZE, categorySlug }),
    getCategories(),
    getPopularPosts(5),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const preservedSearchParams: Record<string, string> = {};
  if (categorySlug) preservedSearchParams.category = categorySlug;
  if (searchQuery) preservedSearchParams.search = searchQuery;

  const activeCategoryName =
    categorySlug && categories.find((c) => c.slug === categorySlug)?.name;

  return (
    <>
      <SchemaMarkup schema={buildBlogSchema(SITE_CONFIG.url)} />
      <section className="mx-auto max-w-container-wide px-gutter-wide py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
        <p className="eyebrow">블로그</p>
        <h1 className="mt-3">
          {searchQuery
            ? `“${searchQuery}” 검색 결과`
            : activeCategoryName
              ? activeCategoryName
              : '상담 현장의 인사이트와 마음토스 이야기'}
        </h1>
        <p className="mt-5 max-w-prose text-lead text-[var(--text-body)]">
          {searchQuery
            ? `${total}개의 글이 검색되었습니다.`
            : '상담사 인사이트 · 기술 / 보안 · 도입 사례 · 제품 업데이트가 한 곳에서 업데이트됩니다.'}
        </p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CategoryFilter categories={categories} activeSlug={categorySlug} />
          <BlogSearch
            key={searchQuery ?? ''}
            defaultValue={searchQuery ?? ''}
          />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
          <div>
            {posts.length === 0 ? (
              <EmptyState searchQuery={searchQuery} />
            ) : (
              <>
                <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <PostCard post={post} />
                    </li>
                  ))}
                </ul>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  basePath="/blog"
                  searchParams={preservedSearchParams}
                />
              </>
            )}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BlogSidebar
              categories={categories}
              popularPosts={popularPosts}
            />
          </aside>
        </div>
      </section>
    </>
  );
}

function EmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-10 text-center">
      <BookOpen
        className="mx-auto h-8 w-8 text-[var(--brand-primary-dark)]"
        aria-hidden
      />
      <h2 className="mt-4 text-h3 font-semibold text-[var(--text-heading-strong)]">
        {searchQuery ? '검색 결과가 없습니다' : '첫 글을 준비 중입니다'}
      </h2>
      <p className="mt-3 max-w-prose mx-auto text-[var(--text-body)]">
        {searchQuery
          ? '다른 키워드로 검색해보시거나 카테고리에서 찾아보세요.'
          : '상담 현장에서 마음토스가 어떻게 쓰이고 있는지, 어떤 고민이 오가는지 정리해 곧 공개합니다.'}
      </p>
      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-3 text-cta font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
      >
        전체 글 보기 <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
