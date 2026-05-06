import Image from 'next/image';
import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/static';
import type { Post } from '@/types/blog';
import { formatDateKo } from '@/lib/utils';

interface RelatedPostsProps {
  currentPost: Post;
  limit?: number;
}

type RelatedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  category: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export async function RelatedPosts({ currentPost, limit = 3 }: RelatedPostsProps) {
  const supabase = createStaticClient();

  // Primary: keyword-based
  let posts: RelatedPost[] | null = null;

  if (currentPost.keywords && currentPost.keywords.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select('id,title,slug,excerpt,thumbnail_url,published_at,category:categories(name,slug)')
      .neq('id', currentPost.id)
      .eq('status', 'published')
      .contains('keywords', currentPost.keywords.slice(0, 3))
      .limit(limit);

    if (data && data.length > 0) {
      posts = data as RelatedPost[];
    }
  }

  // Fallback: same category
  if (!posts || posts.length === 0) {
    const { data } = await supabase
      .from('posts')
      .select('id,title,slug,excerpt,thumbnail_url,published_at,category:categories(name,slug)')
      .neq('id', currentPost.id)
      .eq('status', 'published')
      .eq('category_id', currentPost.category_id)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (data && data.length > 0) {
      posts = data as RelatedPost[];
    }
  }

  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-[var(--line-1)] pt-8">
      <h2 className="mb-6 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
        관련 글
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => {
          const category = Array.isArray(post.category) ? post.category[0] : post.category;
          const href = `/blog/${post.slug}`;

          return (
            <article
              key={post.id}
              className="group rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.thumbnail_url && (
                <Link href={href} className="block aspect-video overflow-hidden bg-[var(--bg-elevated)]">
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title}
                    width={400}
                    height={225}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
              )}
              <div className="p-4">
                {category?.name && (
                  <span className="mb-2 inline-block rounded-full bg-[var(--brand-primary-pale)] px-2.5 py-0.5 text-xs font-medium text-[var(--brand-primary-dark)]">
                    {category.name}
                  </span>
                )}
                <h3 className="mb-2 text-[length:var(--t-small)] font-semibold leading-snug text-[var(--text-heading-strong)] group-hover:text-[var(--brand-primary-dark)] transition-colors">
                  <Link href={href}>{post.title}</Link>
                </h3>
                {post.excerpt && (
                  <p className="mb-3 line-clamp-2 text-xs text-[var(--text-muted)]">{post.excerpt}</p>
                )}
                {post.published_at && (
                  <time
                    dateTime={post.published_at}
                    className="text-xs text-[var(--text-muted)]"
                  >
                    {formatDateKo(post.published_at)}
                  </time>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
