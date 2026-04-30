import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PrimaryCTAProps {
  href?: string;
  children?: React.ReactNode;
  variant?: 'fill' | 'outline' | 'on-dark';
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<PrimaryCTAProps['variant']>, string> = {
  fill: 'bg-[var(--brand-primary)] text-[var(--text-primary)] hover:bg-[var(--brand-primary-soft)]',
  outline:
    'border-[1.5px] border-[var(--brand-primary-dark)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--brand-primary-pale)]',
  'on-dark':
    'bg-[var(--brand-primary-soft)] text-[var(--text-primary)] hover:bg-[var(--brand-primary)]',
};

export function PrimaryCTA({
  href = '/contact?type=free-trial',
  children = '무료로 시작하기',
  variant = 'fill',
  className,
}: PrimaryCTAProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-6 py-3 text-[length:var(--t-cta)] font-semibold transition-colors',
        VARIANT_CLASS[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
