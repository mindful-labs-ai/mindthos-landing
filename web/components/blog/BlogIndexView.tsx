import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
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
import { BLOG_PAGE_SIZE } from '@/constants/blog';

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

interface BlogIndexViewProps {
  page: number;
  categorySlug?: string;
  searchQuery?: string;
}

/**
 * 블로그 목록 뷰 — `/blog`(1페이지)와 `/blog/page/[page]`(2페이지~) 가 공유.
 *
 * 기본 목록(카테고리/검색 필터 없음)은 페이지네이션을 `/blog/page/N` **경로**로 렌더해
 * 각 페이지가 self-canonical 색인 가능한 크롤 경로가 되도록 한다. 이로써 깊은 페이지에만
 * 등장하던 롱테일 글이 내부 링크로 발견 가능해진다. 카테고리/검색은 필터 뷰이므로 쿼리 유지.
 */
export async function BlogIndexView({
  page,
  categorySlug,
  searchQuery,
}: BlogIndexViewProps) {
  const [{ posts, total }, categories, popularPosts] = await Promise.all([
    searchQuery
      ? searchPosts(searchQuery, { page, perPage: BLOG_PAGE_SIZE })
      : getPublishedPosts({ page, perPage: BLOG_PAGE_SIZE, categorySlug }),
    getCategories(),
    getPopularPosts(5),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  const preservedSearchParams: Record<string, string> = {};
  if (categorySlug) preservedSearchParams.category = categorySlug;
  if (searchQuery) preservedSearchParams.search = searchQuery;

  // 필터가 없는 기본 목록만 경로형 페이지네이션 사용.
  const pathBased = !categorySlug && !searchQuery;

  const activeCategoryName =
    categorySlug && categories.find((c) => c.slug === categorySlug)?.name;

  return (
    <>
      <SchemaMarkup schema={buildBlogSchema(SITE_CONFIG.url)} />

      {/* HERO — globals.css 공통 .page-hero (서브 페이지 공유 / education 과 동일) */}
      <section className="page-hero" aria-label="마음토스 블로그 — 페이지 헤더">
        <div className="container">
          <div className="page-hero-content">
            <span className="section-pill">마음토스 블로그</span>
            <h1 className="page-hero-h1">
              {searchQuery
                ? `“${searchQuery}” 검색 결과`
                : activeCategoryName
                  ? activeCategoryName
                  : '상담 현장의 인사이트와 마음토스 이야기'}
            </h1>
            <p className="page-hero-sub">
              {searchQuery
                ? `${total}개의 글이 검색되었습니다.`
                : '상담사 인사이트 · 기술 / 보안 · 도입 사례 · 제품 업데이트가 한 곳에서 업데이트됩니다.'}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT — wf-section 톤 (홈/시큐리티 와 동일 패턴) */}
      <section className="wf-section">
        <div className="container">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                    pathBased={pathBased}
                  />
                  {pathBased && (
                    <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                      <Link
                        href="/blog/archive"
                        className="underline underline-offset-4 hover:text-[var(--brand-primary-dark)]"
                      >
                        전체 글 목록 보기 →
                      </Link>
                    </p>
                  )}
                </>
              )}
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <BlogSidebar categories={categories} popularPosts={popularPosts} />
            </aside>
          </div>
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
