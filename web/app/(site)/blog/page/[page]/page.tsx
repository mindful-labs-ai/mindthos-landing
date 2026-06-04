import { notFound, redirect } from 'next/navigation';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { BlogIndexView } from '@/components/blog/BlogIndexView';
import { BLOG_PAGE_SIZE } from '@/constants/blog';
import { getPostsTotalForCategory } from '@/lib/supabase/queries';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface BlogPagePaginatedProps {
  params: Promise<{ page: string }>;
}

function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

export async function generateStaticParams(): Promise<{ page: string }[]> {
  const total = await getPostsTotalForCategory();
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  // 1페이지는 /blog 가 담당 → 2페이지부터 정적 생성.
  const params: { page: string }[] = [];
  for (let p = 2; p <= totalPages; p++) params.push({ page: String(p) });
  return params;
}

export async function generateMetadata({
  params,
}: BlogPagePaginatedProps): Promise<Metadata> {
  const { page } = await params;
  const n = parsePage(page);
  return generatePageMetadata({
    title: n && n > 1 ? `블로그 (${n}페이지)` : '블로그',
    description:
      '상담사 인사이트 · 기술 · 보안 · 도입 사례 · 제품 업데이트가 한 곳에. 마음토스 블로그.',
    // self-canonical — 각 페이지가 독립 색인/크롤 경로가 되도록.
    path: n && n > 1 ? `/blog/page/${n}` : '/blog',
  });
}

export default async function BlogPaginatedPage({
  params,
}: BlogPagePaginatedProps) {
  const { page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  // 1페이지는 정식 URL(/blog)로 통합.
  if (n === 1) redirect('/blog');

  const total = await getPostsTotalForCategory();
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  if (n > totalPages) notFound();

  return <BlogIndexView page={n} />;
}
