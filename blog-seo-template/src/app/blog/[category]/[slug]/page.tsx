import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/supabase/queries';
import { extractToc } from '@/lib/markdown/toc';
import { generatePostMetadata } from '@/lib/seo/metadata';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_CONFIG } from '@/constants/site';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PostContent } from '@/components/blog/PostContent';
import { SummaryBox } from '@/components/blog/SummaryBox';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { FAQSection } from '@/components/blog/FAQSection';
import { ReferencesList } from '@/components/blog/ReferencesList';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { InlineCTA } from '@/components/cta/InlineCTA';
import { BottomCTA } from '@/components/cta/BottomCTA';

export const revalidate = 3600;

type Params = Promise<{ category: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPostBySlug(slug);
  if (!postData) return { title: 'Not Found' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = postData as any;
  return generatePostMetadata({
    title: post.title,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    excerpt: post.excerpt,
    slug: post.slug,
    thumbnail_url: post.thumbnail_url,
    og_image_url: post.og_image_url,
    published_at: post.published_at,
    updated_at: post.updated_at,
    keywords: Array.isArray(post.keywords) ? (post.keywords as string[]) : [],
    category: post.category ?? null,
    author: post.author ?? null,
  });
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const postData = await getPostBySlug(slug);
  if (!postData) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = postData as any;

  const toc = extractToc(post.content);
  const ctaType = post.cta_type || post.category?.default_cta_type || 'consultation';

  // Resolve counseling program for CTA (is_cta_enabled 필터 적용)
  let program = null;
  if (post.counseling_program_id) {
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data } = await supabase
      .from('counseling_programs')
      .select('id, title, slug, subtitle, cta_heading, cta_button_text')
      .eq('id', post.counseling_program_id)
      .eq('is_cta_enabled', true)
      .single();
    program = data;
  }
  if (!program && post.category?.default_program_id) {
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data } = await supabase
      .from('counseling_programs')
      .select('id, title, slug, subtitle, cta_heading, cta_button_text')
      .eq('id', post.category.default_program_id)
      .eq('is_cta_enabled', true)
      .single();
    program = data;
  }

  const categoryName = post.category?.name ?? '블로그';
  const categorySlug = post.category?.slug ?? 'blog';
  const postUrl = `${SITE_CONFIG.url}/blog/${categorySlug}/${post.slug}`;

  const articleSchema = generateArticleSchema({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    published_at: post.published_at,
    updated_at: post.updated_at,
    thumbnail_url: post.thumbnail_url,
    author: post.author ? { name: post.author.name, slug: post.author.slug } : null,
    url: postUrl,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '블로그', url: `${SITE_CONFIG.url}/blog` },
    { name: categoryName, url: `${SITE_CONFIG.url}/blog/${categorySlug}` },
    { name: post.title, url: postUrl },
  ]);

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <SchemaMarkup schema={[articleSchema, breadcrumbSchema]} />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: '블로그', href: '/blog' },
            { label: categoryName, href: `/blog/${categorySlug}` },
            { label: post.title },
          ]}
        />

        {/* Post header */}
        <header className="mb-8">
          {post.category && (
            <span className="mb-3 inline-block rounded-full bg-[#e7e2da] px-3 py-1 text-xs font-semibold text-[#2d6a4f]">
              {categoryName}
            </span>
          )}
          <h1 className="mb-4 text-3xl font-bold leading-tight text-[#2f3331] sm:text-4xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5c605d]">
            {post.author && (
              <span className="font-medium text-[#2f3331]">{post.author.name}</span>
            )}
            {publishedDate && <span>{publishedDate}</span>}
            {post.reading_time && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.reading_time}분 읽기</span>
              </>
            )}
          </div>
        </header>

        {/* Featured image */}
        {post.thumbnail_url && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              width={1200}
              height={630}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="w-full object-cover"
              priority
              fetchPriority="high"
            />
          </div>
        )}

        {/* Summary box */}
        <SummaryBox summary={post.summary} />

        {/* Two-column layout: content + TOC */}
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-12">
          {/* Left: main content */}
          <div className="min-w-0">
            <PostContent content={post.content} />
            <InlineCTA ctaType={ctaType} program={program} />
          </div>

          {/* Right: Table of Contents (desktop sticky, mobile collapsible) */}
          {toc.length > 0 && (
            <TableOfContents items={toc} />
          )}
        </div>

        {/* FAQ */}
        <FAQSection schemaMarkup={post.schema_markup} />

        {/* References */}
        <ReferencesList references={post.references} />

        {/* Bottom CTA banner */}
        <BottomCTA ctaType={ctaType} program={program} />

        {/* Related posts */}
        <RelatedPosts categoryId={post.category_id} currentPostId={post.id} />
      </main>
    </>
  );
}
