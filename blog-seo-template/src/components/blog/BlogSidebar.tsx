import Link from 'next/link';
import { getPopularPosts, getCategories } from '@/lib/supabase/queries';
import { NewsletterForm } from '@/components/forms/NewsletterForm';

export async function BlogSidebar() {
  const [popularPosts, categories] = await Promise.all([
    getPopularPosts(5),
    getCategories(),
  ]);

  return (
    <aside className="hidden lg:flex flex-col gap-8 w-72 flex-shrink-0">
      {/* Popular posts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#2f3331] text-base mb-4">인기 글</h3>
        <ol className="flex flex-col gap-3">
          {popularPosts.length === 0 ? (
            <li className="text-sm text-[#afb3af]">아직 게시글이 없습니다.</li>
          ) : (
            popularPosts.map((post: any, i: number) => (
              <li key={post.id} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f3f4f0] text-xs font-medium text-[#5c605d] flex items-center justify-center">
                  {i + 1}
                </span>
                <Link
                  href={`/blog/${post.category?.slug ?? 'uncategorized'}/${post.slug}`}
                  className="flex-1 min-w-0 text-sm text-[#2f3331] hover:text-[#2d6a4f] transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))
          )}
        </ol>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#2f3331] text-base mb-4">카테고리</h3>
        <ul className="flex flex-col gap-1">
          {categories.map((cat: any) => (
            <li key={cat.slug}>
              <Link
                href={`/blog/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#5c605d] hover:bg-[#f3f4f0] hover:text-[#2d6a4f] transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-[#afb3af]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter CTA */}
      <div className="rounded-xl p-6 bg-[#e7e2da]">
        <h3 className="font-semibold text-[#2f3331] text-base mb-1">뉴스레터 구독</h3>
        <p className="text-sm text-[#5c605d] mb-4">
          마음건강 콘텐츠를 이메일로 받아보세요
        </p>
        <NewsletterForm />
      </div>
    </aside>
  );
}
