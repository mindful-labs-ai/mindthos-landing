import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { KAKAO_INQUIRY_URL } from '@/constants/nav';

export const metadata = generatePageMetadata({
  title: '교육 프로그램',
  description:
    '상담사를 위한 마음토스의 교육 프로그램. Next Genogram 심화 워크숍과 전문 상담가 2급 자격 취득 인턴십 안내.',
  path: '/education',
});

interface Program {
  title: string;
  lead: string;
  details: { label: string; value: string }[];
  status: string;
  href: string;
  cta: string;
  external?: boolean;
  image: { src: string; alt: string };
}

const PROGRAMS: Program[] = [
  {
    title: 'Next Genogram 4시간 심화 워크숍',
    lead: 'AI와 함께 역량을 강화하는 심화 세미나 — 사례 개념화와 가계도 해석을 중심으로 다룹니다.',
    details: [
      { label: '진행 형식', value: '4시간 오프라인' },
      { label: '대상', value: '심리상담사' },
    ],
    status: '마감 시 별도 공지',
    href: 'https://nextgenogram.mindthos.com',
    cta: '워크숍 자세히 보기',
    external: true,
    image: {
      src: '/education-genogram.jpg',
      alt: '가계도 이론 강의 장면',
    },
  },
  {
    title: '전문 상담가 2급 자격 취득 인턴십',
    lead: '자격 취득 요건 100% 보장. 30년 경력 수퍼바이저의 1:1 케어를 제공합니다.',
    details: [
      { label: '진행 형식', value: '인턴십 + 1:1 수퍼비전' },
      { label: '대상', value: '자격 취득 준비 상담사' },
    ],
    status: '마감 시 별도 공지',
    /* /academy 내부 라우트 미존재 → 카카오톡 오픈채팅으로 문의 받음 (Next Link prefetch 404 방지) */
    href: KAKAO_INQUIRY_URL,
    cta: '인턴십 자세히 보기',
    external: true,
    image: {
      src: '/education-internship.jpg',
      alt: '인턴십 1:1 수퍼비전 장면',
    },
  },
];

export default function EducationPage() {
  return (
    <>
      <section className="border-b border-[var(--line-1)] bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--max-width-container)] px-6 py-20 md:py-28">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-dark)]">
            상담사를 위한 세미나
          </p>
          <h1 className="mt-4 text-[34px] font-bold leading-tight tracking-tight text-[var(--text-heading-strong)] md:text-[44px]">
            마음토스의 교육 프로그램
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--text-body)]">
            상담 현장의 역량 강화를 돕는 심화 워크숍과 자격 취득 인턴십 프로그램을 운영합니다.
            모집 일정은 프로그램별 안내 페이지를 확인해 주세요.
          </p>
        </div>
      </section>

      <section className="bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[var(--max-width-container)] px-6 py-14 md:py-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-dark)]">
                현재 진행 프로그램
              </p>
              <h2 className="mt-3 text-[24px] font-bold leading-tight tracking-tight text-[var(--text-heading-strong)] md:text-[28px]">
                마음토스에서 운영하는 두 가지 프로그램
              </h2>
            </div>
          </div>

          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {PROGRAMS.map((p, idx) => (
              <li
                key={p.title}
                className="flex flex-col overflow-hidden rounded-2xl border border-[var(--line-1)] bg-[var(--bg-elevated)]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--bg-warm)]">
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                  />
                </div>
                <div className="flex flex-col p-5 md:p-6">
                <span className="self-start rounded-full border border-[var(--brand-primary-tint)] bg-[var(--brand-primary-pale)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[var(--brand-primary-dark)]">
                  {p.status}
                </span>
                <h3 className="mt-3 text-[18px] font-bold leading-snug text-[var(--text-heading-strong)] md:text-[20px]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-body)]">
                  {p.lead}
                </p>

                <dl className="mt-4 space-y-1.5 text-[13px] text-[var(--text-secondary)]">
                  {p.details.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-2">
                      {i === 0 ? (
                        <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
                      ) : (
                        <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
                      )}
                      <dt className="sr-only">{d.label}</dt>
                      <dd>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {d.label}
                        </span>{' '}
                        · {d.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  {p.external ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--brand-primary-dark)]"
                    >
                      {p.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={p.href}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--brand-primary-dark)]"
                    >
                      {p.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--line-1)] bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--max-width-container)] px-6 py-16 text-center md:py-20">
          <p className="text-[14.5px] text-[var(--text-body)]">
            프로그램 문의는{' '}
            <a
              href={KAKAO_INQUIRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--brand-primary-dark)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
            >
              카카오톡 오픈채팅
            </a>
            으로 보내주세요.
          </p>
        </div>
      </section>
    </>
  );
}
