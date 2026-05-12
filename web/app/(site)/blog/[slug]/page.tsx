import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import {
  getPostBySlug,
  getCounselingProgramById,
  getPublishedPosts,
} from '@/lib/supabase/queries';
import { generatePostMetadata } from '@/lib/seo/metadata';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generatePersonSchema,
} from '@/lib/seo/schema';
import { processMarkdown } from '@/lib/markdown/processor';
import { extractToc } from '@/lib/markdown/toc';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SummaryBox } from '@/components/blog/SummaryBox';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { FAQSection, extractFAQs } from '@/components/blog/FAQSection';
import { ReferencesList } from '@/components/blog/ReferencesList';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { InlineCTA } from '@/components/blog/InlineCTA';
import { BottomCTA } from '@/components/blog/BottomCTA';
import { SITE_CONFIG } from '@/constants/site';
import type { Post, Reference } from '@/types/blog';
import { formatDateKo } from '@/lib/utils';

export const revalidate = 3600;
export const dynamicParams = true;

function extractYouTubeId(url: string): string {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return m?.[1] ?? '';
}

function BlogHero({ post }: { post: Post }) {
  if (post.video_url && post.video_position === 'hero') {
    if (post.video_provider === 'youtube') {
      const ytId = extractYouTubeId(post.video_url);
      if (ytId) {
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
              title={post.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        );
      }
    }

    return (
      <video
        controls
        preload="metadata"
        poster={post.thumbnail_url ?? undefined}
        playsInline
        className="aspect-video w-full rounded-2xl bg-black"
      >
        <source src={post.video_url} type="video/mp4" />
      </video>
    );
  }

  if (post.thumbnail_url) {
    return (
      <div className="overflow-hidden rounded-2xl bg-[var(--bg-elevated)]">
        <Image
          src={post.thumbnail_url}
          alt={post.title}
          width={1200}
          height={630}
          priority
          fetchPriority="high"
          sizes="(max-width: 1120px) 100vw, 880px"
          className="h-auto w-full object-cover"
        />
      </div>
    );
  }
  return null;
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { posts } = await getPublishedPosts({ perPage: 100 });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {
      title: '글을 찾을 수 없습니다',
      description: '요청하신 글이 없거나 비공개 상태입니다.',
      alternates: { canonical: `${SITE_CONFIG.url}/blog/${slug}` },
      robots: { index: false, follow: true },
    };
  }
  return generatePostMetadata({
    title: post.title,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    excerpt: post.excerpt,
    slug: post.slug,
    category: post.category
      ? { slug: post.category.slug, name: post.category.name }
      : null,
    thumbnail_url: post.thumbnail_url,
    og_image_url: post.og_image_url,
    published_at: post.published_at,
    updated_at: post.updated_at,
    author: post.author ? { name: post.author.name } : null,
    keywords: post.keywords,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = await processMarkdown(post.content);
  const toc = extractToc(post.content);

  let program = post.counseling_program_id
    ? await getCounselingProgramById(post.counseling_program_id)
    : null;
  if (!program && post.category?.default_program_id) {
    program = await getCounselingProgramById(post.category.default_program_id);
  }

  const articleUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const articleSchema = generateArticleSchema({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    published_at: post.published_at,
    updated_at: post.updated_at,
    thumbnail_url: post.thumbnail_url,
    author: post.author
      ? { name: post.author.name, slug: post.author.slug ?? null }
      : null,
    url: articleUrl,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '블로그', url: `${SITE_CONFIG.url}/blog` },
    ...(post.category
      ? [
          {
            name: post.category.name,
            url: `${SITE_CONFIG.url}/blog?category=${post.category.slug}`,
          },
        ]
      : []),
    { name: post.title, url: articleUrl },
  ]);

  /* FAQ 스키마는 본 페이지에서 단일 진입점으로 주입 (FAQSection 컴포넌트는 UI 만 담당). */
  const faqs = extractFAQs(
    (post.schema_markup ?? null) as Record<string, unknown> | null,
  );
  const schemas: Record<string, unknown>[] = [articleSchema, breadcrumbSchema];
  if (faqs.length > 0) {
    schemas.push(generateFAQSchema(faqs));
  }
  if (post.video_url) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: post.title,
      description: post.excerpt ?? post.summary ?? post.title,
      ...(post.thumbnail_url ? { thumbnailUrl: post.thumbnail_url } : {}),
      contentUrl: post.video_url,
      uploadDate: post.published_at ?? post.created_at,
    });
  }
  if (post.author?.name) {
    schemas.push(
      generatePersonSchema({
        name: post.author.name,
        jobTitle: post.author.title,
        description: post.author.bio,
        image: post.author.profile_image_url,
        specialties: post.author.specialties,
        url: post.author.slug
          ? `${SITE_CONFIG.url}/blog/author/${post.author.slug}`
          : null,
      }),
    );
  }

  const readingTime =
    post.reading_time ?? Math.ceil((post.content?.length ?? 0) / 500);
  const references = (post.references ?? null) as Reference[] | null;

  return (
    <>
      <SchemaMarkup schema={schemas} />

      <article className="mx-auto max-w-container-wide px-gutter md:px-gutter-wide py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-small text-[var(--text-muted)] transition-colors hover:text-[var(--brand-primary-dark)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> 블로그 목록
        </Link>

        <header className="mt-6 max-w-narrow">
          {post.category ? (
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center text-eyebrow font-semibold uppercase tracking-wider text-[var(--brand-primary-dark)] hover:underline"
            >
              {post.category.name}
            </Link>
          ) : null}
          <h1 className="mt-3">{post.title}</h1>
          {post.excerpt ? (
            <p className="mt-5 text-lead text-[var(--text-body)]">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-[var(--text-muted)]">
            {post.author?.name ? (
              <span className="font-medium text-[var(--text-secondary)]">
                {post.author.name}
                {post.author.title ? ` · ${post.author.title}` : ''}
              </span>
            ) : null}
            {post.author?.name ? <span aria-hidden>·</span> : null}
            <time dateTime={post.published_at ?? undefined}>
              {formatDateKo(post.published_at)}
            </time>
            <span aria-hidden>·</span>
            <span>약 {readingTime}분</span>
          </div>
        </header>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            <BlogHero post={post} />

            <div
              className={
                post.thumbnail_url || post.video_url ? 'mt-8' : ''
              }
            >
              <SummaryBox summary={post.summary} />
            </div>

            <div className="prose mt-10">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>

            <InlineCTA ctaType={post.cta_type} program={program} />

            {references && references.length > 0 ? (
              <ReferencesList references={references} />
            ) : null}

            <FAQSection schema_markup={post.schema_markup} />
          </div>

          <aside className="hidden md:block">
            <TableOfContents items={toc} />
          </aside>
        </div>

        <BottomCTA ctaType={post.cta_type} program={program} />

        <RelatedPosts currentPost={post} limit={3} />
      </article>
    </>
  );
}
