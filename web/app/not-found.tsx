import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-narrow px-gutter py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 mb-4">페이지를 찾을 수 없어요</h1>
      <p className="mb-8 text-[var(--text-body)]">
        요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.
      </p>
      <Link
        href="/"
        className="inline-flex rounded-lg bg-[var(--brand-primary)] px-6 py-3 font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
