import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getPostBySlug } from '@/lib/supabase/queries';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return generatePageMetadata({
      title: '글을 찾을 수 없습니다',
      description: '요청하신 글이 없거나 비공개 상태입니다.',
      path: `/blog/${slug}`,
    });
  }
  return generatePageMetadata({
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt ?? post.title,
    path: `/blog/${post.slug}`,
    image: post.og_image_url ?? undefined,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-[var(--container-prose)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-[length:var(--t-small)] text-[var(--text-muted)] transition-colors hover:text-[var(--brand-primary-dark)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 블로그 목록
      </Link>

      {post.category ? (
        <p className="mt-6 text-[length:var(--t-eyebrow)] font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)]">
          {post.category.name}
        </p>
      ) : null}
      <h1 className="mt-3">{post.title}</h1>
      {post.published_at ? (
        <p className="mt-4 text-[length:var(--t-small)] text-[var(--text-muted)]">
          {new Date(post.published_at).toLocaleDateString('ko-KR')}
          {post.author ? ` · ${post.author.name}` : ''}
        </p>
      ) : null}

      <div
        className="prose mt-10"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
