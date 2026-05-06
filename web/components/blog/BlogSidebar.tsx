import Link from 'next/link';
import type { Category, Post } from '@/types/blog';

interface BlogSidebarProps {
  categories: Category[];
  popularPosts?: Post[];
}

export async function BlogSidebar({ categories, popularPosts = [] }: BlogSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-8 w-72 flex-shrink-0">
      {/* Popular posts */}
      <div className="rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6">
        <h3 className="font-semibold text-[var(--text-heading-strong)] text-body-size mb-4">
          인기 글
        </h3>
        <ol className="flex flex-col gap-3">
          {popularPosts.length === 0 ? (
            <li className="text-small text-[var(--text-muted)]">
              아직 게시글이 없습니다.
            </li>
          ) : (
            popularPosts.slice(0, 5).map((post, i) => (
              <li key={post.id} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-muted)] flex items-center justify-center">
                  {i + 1}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex-1 min-w-0 text-small text-[var(--text-body)] hover:text-[var(--brand-primary-dark)] transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))
          )}
        </ol>
      </div>

      {/* Categories */}
      <div className="rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6">
        <h3 className="font-semibold text-[var(--text-heading-strong)] text-body-size mb-4">
          카테고리
        </h3>
        <ul className="flex flex-col gap-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/blog?category=${cat.slug}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-small text-[var(--text-body)] hover:bg-[var(--bg-warm)] hover:text-[var(--brand-primary-dark)] transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-[var(--text-muted)]" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter placeholder */}
      <div className="rounded-xl bg-[var(--bg-warm)] border border-[var(--line-warm)] p-6">
        <h3 className="font-semibold text-[var(--text-heading-strong)] text-body-size mb-1">
          뉴스레터
        </h3>
        <p className="text-small text-[var(--text-muted)] mb-3">
          마음토스 최신 콘텐츠를 이메일로 받아보세요
        </p>
        <p className="inline-block rounded-full bg-[var(--brand-primary-pale)] px-3 py-1 text-xs font-medium text-[var(--brand-primary-dark)]">
          곧 오픈
        </p>
      </div>
    </aside>
  );
}
