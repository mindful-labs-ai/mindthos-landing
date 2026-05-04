import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PrimaryCTAProps {
  href?: string;
  children?: React.ReactNode;
  variant?: 'fill' | 'outline' | 'on-dark';
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<PrimaryCTAProps['variant']>, string> = {
  fill: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)]',
  outline:
    'border-[1.5px] border-[var(--brand-primary-dark)] bg-transparent text-[var(--brand-primary-dark)] hover:bg-[var(--brand-primary-pale)]',
  'on-dark':
    'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-soft)]',
};

export function PrimaryCTA({
  href = 'https://app.mindthos.com',
  children = '무료로 시작하기',
  variant = 'fill',
  className,
}: PrimaryCTAProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-lg px-5 text-[14px] font-semibold transition-colors',
        VARIANT_CLASS[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
