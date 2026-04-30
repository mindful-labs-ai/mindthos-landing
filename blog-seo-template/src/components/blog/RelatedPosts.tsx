import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

interface RelatedPostsProps {
  categoryId: string;
  currentPostId: string;
}

export async function RelatedPosts({ categoryId, currentPostId }: RelatedPostsProps) {
  const supabase = await createClient();
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, thumbnail_url, published_at, reading_time, category:categories(name, slug)')
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(3);

  if (!rawPosts || rawPosts.length === 0) return null;

  type RelatedPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    published_at: string | null;
    reading_time: number | null;
    category: { name: string; slug: string } | { name: string; slug: string }[] | null;
  };
  const posts = rawPosts as unknown as RelatedPost[];

  return (
    <section className="mt-12 border-t border-[#e0ddd8] pt-8">
      <h2 className="mb-6 text-xl font-bold text-[#2f3331]">관련 글</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const category = Array.isArray(post.category) ? post.category[0] : post.category;
          const href = category?.slug ? `/blog/${category.slug}/${post.slug}` : `/blog/${post.slug}`;
          const publishedDate = post.published_at
            ? new Date(post.published_at).toLocaleDateString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : null;

          return (
            <article key={post.id} className="group rounded-xl border border-[#e0ddd8] bg-white overflow-hidden hover:shadow-md transition-shadow">
              {post.thumbnail_url && (
                <Link href={href} className="block aspect-video overflow-hidden bg-[#f5f2ed]">
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
                  <span className="mb-2 inline-block rounded-full bg-[#e7e2da] px-2.5 py-0.5 text-xs font-medium text-[#2d6a4f]">
                    {category.name}
                  </span>
                )}
                <h3 className="mb-2 text-sm font-semibold leading-snug text-[#2f3331] group-hover:text-[#2d6a4f] transition-colors">
                  <Link href={href}>{post.title}</Link>
                </h3>
                {post.excerpt && (
                  <p className="mb-3 line-clamp-2 text-xs text-[#5c605d]">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-[#5c605d]">
                  {publishedDate && <span>{publishedDate}</span>}
                  {post.reading_time && (
                    <>
                      <span>·</span>
                      <span>{post.reading_time}분 읽기</span>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
