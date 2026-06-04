import { redirect } from 'next/navigation';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { BlogIndexView } from '@/components/blog/BlogIndexView';
import type { Metadata } from 'next';

export const revalidate = 3600;

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
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  // 검색 결과, 그리고 쿼리형 필터 페이지네이션(카테고리 2페이지+)은 noindex —
  // 이들은 path:'/blog' 로 canonical 되므로 색인되면 /blog 와 중복 신호가 된다.
  const noindex = isSearch || (Boolean(sp.category) && page > 1);
  return generatePageMetadata({
    title: isSearch ? `검색 결과 — ${sp.search}` : '블로그',
    description:
      '상담사 인사이트 · 기술 · 보안 · 도입 사례 · 제품 업데이트가 한 곳에. 마음토스 블로그.',
    path: '/blog',
    noindex,
  });
}

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const categorySlug = sp.category;
  const searchQuery = sp.search?.trim();

  // 필터 없는 기본 목록의 깊은 페이지는 경로형(/blog/page/N)으로 영구 통합 →
  // 구 ?page=N 색인 URL 의 링크 에쿼티를 경로형 페이지로 모은다.
  if (page > 1 && !categorySlug && !searchQuery) {
    redirect(`/blog/page/${page}`);
  }

  return (
    <BlogIndexView
      page={page}
      categorySlug={categorySlug}
      searchQuery={searchQuery}
    />
  );
}
