import { createStaticClient } from '@/lib/supabase/static';
import type { Post } from '@/types/blog';
import { PostCard } from './PostCard';

interface RelatedPostsProps {
  currentPost: Post;
  limit?: number;
}

export async function RelatedPosts({ currentPost, limit = 3 }: RelatedPostsProps) {
  const supabase = createStaticClient();

  /* PostCard 컴포넌트와 같은 디자인을 쓰기 위해 select 필드를 list 페이지와 일치시킴.
     필요 필드: id, title, slug, excerpt, thumbnail_url, published_at, content,
     reading_time, category(name, slug), author(name). */
  const SELECT =
    'id,title,slug,excerpt,thumbnail_url,published_at,content,reading_time,' +
    'category:categories(name,slug),author:authors(name)';

  // Primary: keyword-based
  let posts: Post[] | null = null;

  if (currentPost.keywords && currentPost.keywords.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select(SELECT)
      .neq('id', currentPost.id)
      .eq('status', 'published')
      .contains('keywords', currentPost.keywords.slice(0, 3))
      .limit(limit);

    if (data && data.length > 0) {
      posts = data as unknown as Post[];
    }
  }

  // Fallback: same category
  if (!posts || posts.length === 0) {
    const { data } = await supabase
      .from('posts')
      .select(SELECT)
      .neq('id', currentPost.id)
      .eq('status', 'published')
      .eq('category_id', currentPost.category_id)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (data && data.length > 0) {
      posts = data as unknown as Post[];
    }
  }

  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-12 border-t border-[var(--line-1)] pt-8">
      <h2 className="mb-6 text-h3 font-semibold text-[var(--text-heading-strong)]">
        관련 글
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
