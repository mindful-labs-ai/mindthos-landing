import { Lock, Shield, Clock } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata = generatePageMetadata({
  title: '문의 / 무료로 시작하기',
  description:
    '무료 시작 또는 기관 도입 상담 문의. 영업일 기준 1일 이내에 회신드립니다.',
  path: '/contact',
});

type InquiryType = 'free-trial' | 'institution-inquiry';

interface ContactPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { type } = await searchParams;
  const defaultType: InquiryType =
    type === 'institution-inquiry' ? 'institution-inquiry' : 'free-trial';

  return (
    <section className="mx-auto max-w-[var(--container-narrow)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
      <p className="eyebrow mb-3">문의</p>
      <h1>무료로 시작하기 / 기관 도입 상담</h1>
      <p className="mt-4 max-w-prose text-[var(--text-body)]">
        남겨주신 연락처로 영업일 기준 1일 이내에 회신드립니다. 도입 검토 자료가
        필요하시면 메시지에 함께 적어주세요.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TrustChip
          icon={<Lock className="h-4 w-4" aria-hidden />}
          label="학습 미사용"
        />
        <TrustChip
          icon={<Shield className="h-4 w-4" aria-hidden />}
          label="저장 전 암호화"
        />
        <TrustChip
          icon={<Clock className="h-4 w-4" aria-hidden />}
          label="영업일 1일 이내 회신"
        />
      </ul>

      <div className="mt-10 rounded-2xl border border-[var(--line-1)] bg-[var(--bg-base)] p-6 md:p-8">
        <ContactForm defaultType={defaultType} />
      </div>
    </section>
  );
}

function TrustChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-full border border-[var(--line-1)] bg-[var(--bg-elevated)] px-3 py-2 text-[length:var(--t-small)] text-[var(--text-body)]">
      <span className="text-[var(--brand-primary-dark)]">{icon}</span>
      {label}
    </li>
  );
}
