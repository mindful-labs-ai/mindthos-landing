import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/types/blog';
import { formatDateKo } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const href = `/blog/${post.slug}`;
  const readingTime = post.reading_time ?? Math.ceil((post.content?.length ?? 0) / 500);

  return (
    <Link
      href={href}
      className="group flex flex-col bg-[var(--bg-base)] rounded-xl border border-[var(--line-1)] hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-[var(--bg-elevated)] overflow-hidden">
        {post.thumbnail_url ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            width={1200}
            height={630}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary-pale)] to-[var(--brand-primary-tint)]" />
        )}
        {post.category && (
          <span className="absolute top-3 left-3 inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--brand-primary-pale)] text-[var(--brand-primary-dark)]">
            {post.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h2 className="font-semibold text-[var(--text-heading-strong)] text-[length:var(--t-body)] leading-snug line-clamp-2 group-hover:text-[var(--brand-primary-dark)] transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-[length:var(--t-small)] text-[var(--text-muted)] line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center gap-2 text-[length:var(--t-small)] text-[var(--text-muted)] mt-auto pt-2 border-t border-[var(--line-2)]">
          {post.author?.name && (
            <span className="font-medium text-[var(--text-secondary)]">{post.author.name}</span>
          )}
          {post.author?.name && <span aria-hidden="true">·</span>}
          <time dateTime={post.published_at ?? undefined}>{formatDateKo(post.published_at)}</time>
          <span aria-hidden="true">·</span>
          <span>약 {readingTime}분</span>
        </div>
      </div>
    </Link>
  );
}
