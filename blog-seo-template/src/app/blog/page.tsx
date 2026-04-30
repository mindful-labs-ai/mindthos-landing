import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getPublishedPosts, getCategories, searchPosts } from '@/lib/supabase/queries';
import { PAGINATION, SITE_CONFIG } from '@/constants/site';
import type { Post, Category } from '@/types/blog';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { PostCard } from '@/components/blog/PostCard';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { Pagination } from '@/components/blog/Pagination';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogSearch } from '@/components/blog/BlogSearch';

export const revalidate = 3600;

type MetaSearchParams = Promise<{ search?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: MetaSearchParams }): Promise<Metadata> {
  const { search } = await searchParams;
  const base = generatePageMetadata({
    title: search?.trim() ? `'${search.trim()}' 검색 결과` : '블로그',
    description: '앤아더라이프 심리상담연구소 블로그 - 마음건강, 심리상담, 자기성장에 관한 전문 콘텐츠',
    path: '/blog',
  });
  if (search?.trim()) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

type SearchParams = Promise<{ page?: string; category?: string; search?: string }>;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, search: searchQuery } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));

  let posts: Post[];
  let total: number;
  let categories: Category[] = [];

  if (searchQuery?.trim()) {
    const [searchResults, rawCategories] = await Promise.all([
      searchPosts(searchQuery.trim()),
      getCategories(),
    ]);
    posts = searchResults as unknown as Post[];
    total = searchResults.length;
    categories = rawCategories as unknown as Category[];
  } else {
    const [{ posts: rawPosts, total: rawTotal }, rawCategories] = await Promise.all([
      getPublishedPosts({ page: currentPage, perPage: PAGINATION.postsPerPage }),
      getCategories(),
    ]);
    posts = rawPosts as unknown as Post[];
    total = rawTotal;
    categories = rawCategories as unknown as Category[];
  }

  const totalPages = searchQuery?.trim()
    ? 1
    : Math.ceil(total / PAGINATION.postsPerPage);

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_CONFIG.name} 블로그`,
    url: `${SITE_CONFIG.url}/blog`,
    description: '마음건강, 심리상담, 자기성장에 관한 전문 콘텐츠',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <>
      <SchemaMarkup schema={blogListSchema} />
      <main className="mx-auto max-w-[1280px] px-4 py-10">
        <Breadcrumb items={[{ label: '블로그' }]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2f3331]">
            {searchQuery?.trim() ? `'${searchQuery.trim()}' 검색 결과` : '블로그'}
          </h1>
          <p className="text-[#5c605d] mt-2">
            {searchQuery?.trim()
              ? `${total}개의 검색 결과`
              : '마음건강, 심리상담, 자기성장에 관한 전문 콘텐츠'}
          </p>
        </div>

        <div className="mb-6">
          <BlogSearch />
        </div>

        {!searchQuery?.trim() && (
          <div className="mb-6">
            <CategoryFilter categories={categories} />
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Post grid */}
          <div className="flex-1 min-w-0">
            {posts.length === 0 ? (
              <p className="text-[#5c605d] py-12 text-center">
                {searchQuery?.trim() ? '검색 결과가 없습니다.' : '아직 게시된 글이 없습니다.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
            {!searchQuery?.trim() && (
              <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
            )}
          </div>

          <BlogSidebar />
        </div>
      </main>
    </>
  );
}
