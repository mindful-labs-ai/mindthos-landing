import Link from 'next/link';
import { KAKAO_INQUIRY_URL, NOTION_GUIDE_URL } from '@/constants/nav';
import { MindthosLogo } from './MindthosLogo';

export function Footer() {
  return (
    <footer
      className="border-t border-[var(--line)] bg-[var(--bg)] pt-20 pb-9 text-[var(--ink-2)] md:pt-20"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        {/* footer-top: 좌측 브랜드 / 우측 3-컬럼 링크 */}
        <div className="grid grid-cols-1 gap-12 border-b border-[var(--line)] pb-14 md:grid-cols-[minmax(300px,1fr)_2fr] md:gap-20 md:pb-14">
          {/* 브랜드 컬럼 */}
          <div className="flex flex-col gap-8">
            <Link href="/" aria-label="마음토스 홈" className="inline-flex min-h-[44px] items-center">
              <MindthosLogo aria-hidden="true" className="block h-[38px] w-auto" />
            </Link>

            <dl className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <dt className="text-[14px] font-bold tracking-[0.01em] text-[var(--brand-text-on-light)]">
                  SNS
                </dt>
                <dd className="flex flex-wrap items-center gap-[10px] text-[15.5px] font-medium leading-[1.6] text-[var(--ink)]">
                  <a
                    href="https://www.instagram.com/mind.thos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center text-[var(--ink)] transition-colors hover:text-[var(--brand-hover)]"
                  >
                    Instagram
                  </a>
                  <span aria-hidden="true" className="text-[13px] text-[var(--ink-4)]">
                    |
                  </span>
                  <a
                    href="https://www.threads.com/@mind.thos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center text-[var(--ink)] transition-colors hover:text-[var(--brand-hover)]"
                  >
                    Threads
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-2">
                <dt className="text-[14px] font-bold tracking-[0.01em] text-[var(--brand-text-on-light)]">
                  이메일
                </dt>
                <dd className="text-[15.5px] font-medium leading-[1.6] text-[var(--ink)]">
                  <a
                    href="mailto:business@mindfullabs.ai"
                    className="inline-flex min-h-[44px] items-center text-[var(--ink)]"
                  >
                    business@mindfullabs.ai
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-2">
                <dt className="text-[14px] font-bold tracking-[0.01em] text-[var(--brand-text-on-light)]">
                  주소
                </dt>
                <dd
                  className="text-[15.5px] font-medium leading-[1.7] text-[var(--ink)]"
                  style={{ wordBreak: 'keep-all' }}
                >
                  서울특별시 종로구 종로 6,
                  <br />
                  5/6층 S.빌리지 (서린동, 광화문우체국)
                </dd>
              </div>
            </dl>
          </div>

          {/* 링크 3-컬럼 */}
          <div className="grid grid-cols-1 content-start gap-8 sm:grid-cols-3 md:gap-12">
            <FooterColumn heading="회사 소개">
              <li>
                <a href="https://www.mindfullabs.ai" target="_blank" rel="noopener noreferrer">
                  마인드풀랩스
                </a>
              </li>
            </FooterColumn>

            <FooterColumn heading="마음토스">
              <li><Link href="/">서비스 소개</Link></li>
              <li><a href={NOTION_GUIDE_URL} target="_blank" rel="noopener noreferrer">사용 가이드</a></li>
              <li><a href={KAKAO_INQUIRY_URL} target="_blank" rel="noopener noreferrer">문의</a></li>
              <li><Link href="/blog">블로그</Link></li>
              <li><Link href="/blog/archive">블로그 전체 글</Link></li>
              <li><Link href="/education">교육 프로그램</Link></li>
            </FooterColumn>

            <FooterColumn heading="약관">
              <li>
                <a
                  href="https://app.mindthos.com/terms?type=service"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  서비스 이용약관
                </a>
              </li>
              <li>
                <a
                  href="https://app.mindthos.com/terms?type=privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  개인정보처리방침
                </a>
              </li>
            </FooterColumn>
          </div>
        </div>

        {/* footer-bottom: 가운데 정렬 회사정보 */}
        <div className="flex flex-col items-center gap-2.5 pt-9 text-center">
          <p className="text-[13.5px] font-medium tracking-[0.005em] text-[var(--ink-2)]">
            Copyright © Mindful Labs Inc. | All Rights Reserved
          </p>
          <p
            className="max-w-[760px] text-[13px] leading-[1.7] tracking-[0.005em] text-[var(--ink-3)]"
            style={{ wordBreak: 'keep-all' }}
          >
            사업자등록번호 786-88-03152 | 통신판매신고번호 제2025-서울마포-0943호 |
            <br />
            마인드풀랩스 주식회사(Mindful Labs Inc.) | 대표: 강호남
            <br />
            서울특별시 종로구 종로 6, 5/6층 S.빌리지 (서린동, 광화문우체국)
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* heading-order: 본문 마지막 h2(섹션) 다음에 h5는 레벨 스킵 → h3로 정정 (Lighthouse 2026-05-08).
          색은 var(--brand-hover) 3.05:1 ✗ → --brand-text-on-light 5.96:1 ✓ */}
      <h3 className="mb-[18px] text-[17px] font-bold leading-[1.4] tracking-[-0.005em] text-[var(--brand-text-on-light)]">
        {heading}
      </h3>
      <ul className="flex list-none flex-col gap-1 p-0 text-[15.5px] font-medium leading-[1.55] text-[var(--ink)] [&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:min-w-[44px] [&_a]:items-center [&_a]:transition-colors [&_a:hover]:text-[var(--brand-hover)]">
        {children}
      </ul>
    </div>
  );
}
