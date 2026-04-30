import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { SITE_CONFIG, PAGINATION } from '@/constants/site';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { PostCard } from '@/components/blog/PostCard';
import { Pagination } from '@/components/blog/Pagination';
import { getPostsByTag } from '@/lib/supabase/queries';
import type { Post } from '@/types/blog';

export const revalidate = 3600;

type Params = Promise<{ tag: string }>;
type SearchParams = Promise<{ page?: string }>;

// thin content 판단 기준: 태그에 글이 N개 미만이면 noindex
const TAG_INDEX_MIN_POSTS = 3;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { tag } = await params;
  const { tagName, total } = await getPostsByTag(tag);
  const displayName = tagName ?? decodeURIComponent(tag);
  const base = generatePageMetadata({
    title: `태그: ${displayName} | 블로그`,
    description: `${displayName} 태그에 관한 전문 콘텐츠 - ${SITE_CONFIG.name}`,
    path: `/blog/tag/${tag}`,
  });
  // 태그 자체가 없거나 thin content이면 색인 제외 (follow는 유지)
  if (tagName === null || total < TAG_INDEX_MIN_POSTS) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));

  const { posts: rawPosts, total, tagName } = await getPostsByTag(tag, {
    page: currentPage,
    perPage: PAGINATION.postsPerPage,
  });

  const posts = rawPosts as unknown as Post[];
  const totalPages = Math.ceil(total / PAGINATION.postsPerPage);

  if (tagName === null) {
    return (
      <main className="mx-auto max-w-[1280px] px-4 py-10">
        <Breadcrumb
          items={[
            { label: '블로그', href: '/blog' },
            { label: '태그' },
          ]}
        />
        <div className="rounded-xl border border-[#afb3af] bg-white p-10 text-center text-[#5c605d]">
          <p className="text-base">태그를 찾을 수 없습니다.</p>
          <a
            href="/blog"
            className="inline-block mt-4 text-sm text-primary underline-offset-4 hover:underline"
          >
            전체 블로그 보기 →
          </a>
        </div>
      </main>
    );
  }

  const tagSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `태그: ${tagName} | ${SITE_CONFIG.name} 블로그`,
    url: `${SITE_CONFIG.url}/blog/tag/${tag}`,
    description: `${tagName} 태그에 관한 전문 콘텐츠`,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <>
      <SchemaMarkup schema={tagSchema} />
      <main className="mx-auto max-w-[1280px] px-4 py-10">
        <Breadcrumb
          items={[
            { label: '홈', href: '/' },
            { label: '블로그', href: '/blog' },
            { label: `태그: ${tagName}` },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2f3331]">
            태그: <span className="text-primary">{tagName}</span>
          </h1>
          <p className="text-[#5c605d] mt-2">
            {tagName} 태그가 붙은 글 모음입니다. ({total}개)
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-[#afb3af] bg-white p-10 text-center text-[#5c605d]">
            <p className="text-base">해당 태그의 게시글이 없습니다.</p>
            <a
              href="/blog"
              className="inline-block mt-4 text-sm text-primary underline-offset-4 hover:underline"
            >
              전체 블로그 보기 →
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/blog/tag/${tag}`} />
          </>
        )}
      </main>
    </>
  );
}
