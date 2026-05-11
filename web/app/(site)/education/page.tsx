import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
} from '@/lib/seo/schema';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';
import { KAKAO_INQUIRY_URL } from '@/constants/nav';
import './education.css';

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
      src: '/education-genogram.webp',
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
    href: '/academy',
    cta: '인턴십 자세히 보기',
    image: {
      src: '/education-internship.webp',
      alt: '인턴십 1:1 수퍼비전 장면',
    },
  },
];

export default function EducationPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '교육 프로그램', url: `${SITE_CONFIG.url}/education` },
  ]);

  const courseSchemas = PROGRAMS.map((p) =>
    generateCourseSchema({
      name: p.title,
      description: p.lead,
      url: p.href.startsWith('http') ? p.href : `${SITE_CONFIG.url}${p.href}`,
      educationalLevel: '전문가',
      audienceType: '심리상담사',
    }),
  );

  return (
    <>
      <SchemaMarkup schema={[breadcrumbSchema, ...courseSchemas]} />

      {/* HERO — globals.css 공통 .page-hero 컴포넌트 (블로그 등 서브 페이지 공유) */}
      <section className="page-hero" aria-label="마음토스 교육 프로그램 — 페이지 헤더">
        <div className="container">
          <div className="page-hero-content">
            <span className="section-pill">상담사를 위한 세미나</span>
            <h1 className="page-hero-h1">마음토스의 교육 프로그램</h1>
            <p className="page-hero-sub">
              상담 현장의 역량 강화를 돕는 심화 워크숍과 자격 취득 인턴십 프로그램을 운영합니다.
              모집 일정은 프로그램별 안내 페이지를 확인해 주세요.
            </p>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="wf-section">
        <div className="container">
          <header className="edu-section-head">
            <h2 className="t-h2">운영 중인 프로그램</h2>
            <p className="t-sub">
              상담 현장에서 바로 적용 가능한 실무 중심 커리큘럼과, 자격 취득까지 함께 준비하는 인턴십을 제공합니다.
            </p>
          </header>

          <ul className="edu-programs">
            {PROGRAMS.map((p, idx) => (
              <li key={p.title} className="edu-card">
                <div className="edu-card-media">
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    sizes="(min-width: 880px) 50vw, 100vw"
                    className="object-cover"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                  />
                </div>
                <div className="edu-card-body">
                  <span className="t-tag edu-card-status">{p.status}</span>
                  <h3 className="edu-card-title">{p.title}</h3>
                  <p className="edu-card-lead">{p.lead}</p>

                  <ul className="edu-card-meta">
                    {p.details.map((d, i) => (
                      <li key={d.label}>
                        {i === 0 ? (
                          <Clock className="edu-card-meta-icon" aria-hidden />
                        ) : (
                          <Users className="edu-card-meta-icon" aria-hidden />
                        )}
                        <span className="edu-card-meta-label">{d.label}</span>
                        <span className="edu-card-meta-sep" aria-hidden>·</span>
                        <span>{d.value}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="edu-card-cta">
                    {p.external ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn primary"
                      >
                        {p.cta}
                        <ArrowRight className="arr" width={16} height={16} aria-hidden />
                      </a>
                    ) : (
                      <Link href={p.href} className="btn primary">
                        {p.cta}
                        <ArrowRight className="arr" width={16} height={16} aria-hidden />
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER NOTE — 카카오 문의 링크 */}
      <section className="edu-footer-note" aria-label="프로그램 문의">
        <div className="container">
          <p className="edu-footer-note-text">
            프로그램 문의는{' '}
            <a
              href={KAKAO_INQUIRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="edu-footer-note-link"
              data-cta-intent="general_inquiry"
              data-cta-location="education_footer"
              data-cta-label="카카오톡 오픈채팅"
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
