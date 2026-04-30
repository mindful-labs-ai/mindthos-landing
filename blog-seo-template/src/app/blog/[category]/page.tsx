import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getPublishedPosts, getCategories } from '@/lib/supabase/queries';
import { getCategoryBySlug, CATEGORIES } from '@/constants/categories';
import { PAGINATION, SITE_CONFIG } from '@/constants/site';
import type { Post, Category } from '@/types/blog';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { PostCard } from '@/components/blog/PostCard';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { Pagination } from '@/components/blog/Pagination';
import { BlogSidebar } from '@/components/blog/BlogSidebar';

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: '카테고리를 찾을 수 없습니다' };

  return generatePageMetadata({
    title: `${cat.name} | 블로그`,
    description: cat.description || `${cat.name}에 관한 전문 콘텐츠 - ${SITE_CONFIG.name}`,
    path: `/blog/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category: slug } = await params;
  const { page: pageParam } = await searchParams;

  const cat = getCategoryBySlug(slug);
  if (!cat) return notFound();

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));

  const [{ posts: rawPosts, total }, rawCategories] = await Promise.all([
    getPublishedPosts({
      page: currentPage,
      perPage: PAGINATION.postsPerPage,
      categorySlug: slug,
    }),
    getCategories(),
  ]);
  const posts = rawPosts as unknown as Post[];
  const categories = rawCategories as unknown as Category[];

  const totalPages = Math.ceil(total / PAGINATION.postsPerPage);

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} | ${SITE_CONFIG.name} 블로그`,
    url: `${SITE_CONFIG.url}/blog/${slug}`,
    description: cat.description || `${cat.name}에 관한 전문 콘텐츠`,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <>
      <SchemaMarkup schema={categorySchema} />
      <main className="mx-auto max-w-[1280px] px-4 py-10">
        <Breadcrumb
          items={[
            { label: '블로그', href: '/blog' },
            { label: cat.name },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2f3331]">{cat.name}</h1>
          {cat.description && (
            <p className="text-[#5c605d] mt-2">{cat.description}</p>
          )}
        </div>

        <div className="mb-6">
          <CategoryFilter categories={categories} activeSlug={slug} />
        </div>

        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            {posts.length === 0 ? (
              <p className="text-[#5c605d] py-12 text-center">
                이 카테고리에 아직 게시된 글이 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/blog/${slug}`}
            />
          </div>

          <BlogSidebar />
        </div>
      </main>
    </>
  );
}
