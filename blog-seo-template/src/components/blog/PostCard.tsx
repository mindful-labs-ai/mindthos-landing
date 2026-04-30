import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/types/blog';

interface PostCardProps {
  post: Post;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  // 서버 환경(Vercel은 UTC) 영향을 받지 않도록 항상 Asia/Seoul로 표기
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(dateStr));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}.${get('month')}.${get('day')}`;
}

export function PostCard({ post }: PostCardProps) {
  const categorySlug = post.category?.slug ?? 'blog';
  const href = `/blog/${categorySlug}/${post.slug}`;
  const readingTime = post.reading_time ?? Math.ceil((post.content?.length ?? 0) / 500);

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-[#f3f4f0] overflow-hidden">
        {post.thumbnail_url ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4e6da] to-[#a8ccb5]" />
        )}
        {/* Category badge overlaid on thumbnail */}
        {post.category && (
          <span className="absolute top-3 left-3 inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#b1f0ce] text-[#1d5c42]">
            {post.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h2 className="font-semibold text-[#2f3331] text-base leading-snug line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center gap-2 text-xs text-[#777c78] mt-auto pt-2 border-t border-[#f3f4f0]">
          {post.author?.name && (
            <span className="font-medium text-[#5c605d]">{post.author.name}</span>
          )}
          {post.author?.name && <span>·</span>}
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>약 {readingTime}분</span>
        </div>
      </div>
    </Link>
  );
}
