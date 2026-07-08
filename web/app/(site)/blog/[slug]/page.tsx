import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import {
  getPostBySlug,
  getCounselingProgramById,
  getGlobalTranslations,
} from '@/lib/supabase/queries';
import { generatePostMetadata } from '@/lib/seo/metadata';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generatePersonSchema,
  generateMedicalWebPageSchema,
  isMentalHealthCategory,
  inferMedicalConditions,
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
import { BlogVideoPlayer } from '@/components/blog/BlogVideoPlayer';
import { BlogPageTracker } from '@/components/blog/BlogPageTracker';
import { SITE_CONFIG, DEFAULT_AUTHOR } from '@/constants/site';
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

function BlogVideo({ post }: { post: Post }) {
  if (!post.video_url) return null;

  if (post.video_provider === 'youtube') {
    const ytId = extractYouTubeId(post.video_url);
    if (ytId) {
      return (
        <div className="mt-12 relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
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
    <BlogVideoPlayer
      src={post.video_url}
      poster={post.thumbnail_url ?? undefined}
    />
  );
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    // 발행글 전체를 빌드 타임에 정적 생성한다.
    // perPage 제한을 두면 나머지 글이 첫 요청 시 콜드 SSR(3s+)로 렌더되어
    // Googlebot 크롤 스로틀링 → "발견됨/크롤링됨 - 색인 안 됨" 대량 발생.
    // sitemap.ts 와 동일한 경량 select('slug') 쿼리 사용.
    const { createStaticClient } = await import('@/lib/supabase/static');
    const supabase = createStaticClient();
    const { data: posts } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published');
    return (posts ?? []).map((post) => ({ slug: post.slug }));
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
  // hreflang reciprocity: 이 글의 글로벌 번역본이 있으면 양방향 alternate 를 emit.
  // (번역 발행 시 별도 동기화 없이, KR 글이 렌더될 때 읽기 1번으로 자동 반영)
  const translations = await getGlobalTranslations(post.id);
  let alternateLanguages: Record<string, string> | undefined;
  if (translations.length > 0) {
    const langs: Record<string, string> = {
      ko: `${SITE_CONFIG.url}/blog/${post.slug}`,
    };
    for (const t of translations) {
      langs[t.locale] = `${SITE_CONFIG.globalUrl}/${t.locale}/blog/${t.slug}`;
    }
    langs['x-default'] = langs.en ?? langs.ko;
    alternateLanguages = langs;
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
    author: { name: post.author?.name ?? DEFAULT_AUTHOR.name },
    keywords: post.keywords,
    alternateLanguages,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = await processMarkdown(post.content);
  const toc = extractToc(post.content);

  /* 저자 — author_id 가 null 이거나 join 이 비어도 DEFAULT_AUTHOR 로 fallback.
   * byline·Person/Article/MedicalWebPage 스키마 모두 이 값을 사용 → 항상 표기. */
  const author = {
    name: post.author?.name ?? DEFAULT_AUTHOR.name,
    title: post.author?.title ?? DEFAULT_AUTHOR.title,
    slug: post.author?.slug ?? DEFAULT_AUTHOR.slug,
    bio: post.author?.bio ?? DEFAULT_AUTHOR.bio,
    profileImageUrl: post.author?.profile_image_url ?? DEFAULT_AUTHOR.profileImageUrl,
    specialties: post.author?.specialties ?? DEFAULT_AUTHOR.specialties,
  };

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
    author: { name: author.name, slug: author.slug },
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

  /* B1 — 정신건강/임상 카테고리 글에 MedicalWebPage 동시 주입 (YMYL 인용 신호).
   * DB 컬럼 없이 카테고리·저자·updated_at·키워드로 파생. (action-plan.md §B1) */
  if (isMentalHealthCategory(post.category?.slug)) {
    const conditions = inferMedicalConditions(
      `${post.title} ${(post.keywords ?? []).join(' ')}`,
    );
    schemas.push(
      generateMedicalWebPageSchema({
        title: post.title,
        url: articleUrl,
        excerpt: post.excerpt,
        conditions,
        reviewer: { name: author.name, jobTitle: author.title },
        lastReviewed: post.updated_at,
      }),
    );
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
  schemas.push(
    generatePersonSchema({
      name: author.name,
      jobTitle: author.title,
      description: author.bio,
      image: author.profileImageUrl,
      specialties: author.specialties,
      url: author.slug ? `${SITE_CONFIG.url}/blog/author/${author.slug}` : null,
    }),
  );

  const readingTime =
    post.reading_time ?? Math.ceil((post.content?.length ?? 0) / 500);
  const references = (post.references ?? null) as Reference[] | null;

  return (
    <>
      <SchemaMarkup schema={schemas} />

      <BlogPageTracker
        slug={post.slug}
        category={post.category?.slug ?? null}
        author={author.name}
        publishedAt={post.published_at ?? null}
      />

      <article
        data-blog-slug={post.slug}
        data-blog-category={post.category?.slug ?? ''}
        className="mx-auto max-w-container-wide px-gutter md:px-gutter-wide py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
      >
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
            <span className="font-medium text-[var(--text-secondary)]">
              {author.name}
              {/* 이름에 직함이 이미 포함되면 중복 표기 생략 (generic 라벨 대응) */}
              {author.title && !author.name.includes(author.title)
                ? ` · ${author.title}`
                : ''}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={post.published_at ?? undefined}>
              {formatDateKo(post.published_at)}
            </time>
            <span aria-hidden>·</span>
            <span>약 {readingTime}분</span>
          </div>
        </header>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_240px]">
          <div className="min-w-0">
            {post.thumbnail_url ? (
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
            ) : null}

            <div className={post.thumbnail_url ? 'mt-8' : ''}>
              <SummaryBox summary={post.summary} />
            </div>

            <div className="prose mt-10">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>

            <BlogVideo post={post} />

            <InlineCTA ctaType={post.cta_type} program={program} />

            {references && references.length > 0 ? (
              <ReferencesList references={references} />
            ) : null}

            <FAQSection schema_markup={post.schema_markup} />

            {/* B2 — AI 작성·검수 disclosure. 액션 플랜 §B2 / ai-review-workflow.md */}
            <p className="mt-12 border-t border-[var(--line-1)] pt-6 text-small italic text-[var(--text-muted)]">
              본 글은 마음토스 임상 심리 가이드라인 기반 시스템으로 작성·검수되었습니다.
              학회 가이드라인, 정신건강복지법, 임상 표준 절차를 master document 로
              두고 다중 AI 검수를 거칩니다.
            </p>
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
