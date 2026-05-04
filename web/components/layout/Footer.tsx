import Link from 'next/link';
import { KAKAO_INQUIRY_URL, NOTION_GUIDE_URL } from '@/constants/nav';

export function Footer() {
  return (
    <footer
      className="border-t pt-20 pb-9 md:pt-20"
      style={{
        background: '#ffffff',
        borderTopColor: '#e2e8f0',
        color: '#334155',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        {/* footer-top: 좌측 브랜드 / 우측 3-컬럼 링크 */}
        <div className="grid grid-cols-1 gap-12 border-b pb-14 md:grid-cols-[minmax(300px,1fr)_2fr] md:gap-20 md:pb-14"
             style={{ borderBottomColor: '#e2e8f0' }}>
          {/* 브랜드 컬럼 */}
          <div className="flex flex-col gap-8">
            <Link href="/" aria-label="마음토스 홈" className="inline-flex items-center">
              <img
                src="/logo-mindthos.webp"
                alt="마음토스"
                width={420}
                height={108}
                className="block h-[38px] w-auto"
              />
            </Link>

            <dl className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <dt className="text-[14px] font-bold tracking-[0.01em]" style={{ color: '#168A35' }}>
                  SNS
                </dt>
                <dd
                  className="flex flex-wrap items-center gap-[10px] text-[15.5px] font-medium leading-[1.6]"
                  style={{ color: '#0f172a' }}
                >
                  <a
                    href="https://www.instagram.com/mindthos.official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#168A35]"
                    style={{ color: '#0f172a' }}
                  >
                    Instagram
                  </a>
                  <span aria-hidden="true" className="text-[13px]" style={{ color: '#94a3b8' }}>
                    |
                  </span>
                  <a
                    href="https://www.threads.net/@mindthos.official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#168A35]"
                    style={{ color: '#0f172a' }}
                  >
                    Threads
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-2">
                <dt className="text-[14px] font-bold tracking-[0.01em]" style={{ color: '#168A35' }}>
                  이메일
                </dt>
                <dd className="text-[15.5px] font-medium leading-[1.6]" style={{ color: '#0f172a' }}>
                  <a href="mailto:business@mindfullabs.ai" style={{ color: '#0f172a' }}>
                    business@mindfullabs.ai
                  </a>
                </dd>
              </div>

              <div className="flex flex-col gap-2">
                <dt className="text-[14px] font-bold tracking-[0.01em]" style={{ color: '#168A35' }}>
                  주소
                </dt>
                <dd className="text-[15.5px] font-medium leading-[1.7]" style={{ color: '#0f172a', wordBreak: 'keep-all' }}>
                  서울특별시 성동구 뚝섬로13길 38,
                  <br />
                  4층 (성수동)
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
          <p
            className="text-[13.5px] font-medium tracking-[0.005em]"
            style={{ color: '#334155' }}
          >
            Copyright © Mindful Labs Inc. | All Rights Reserved
          </p>
          <p
            className="max-w-[760px] text-[13px] leading-[1.7] tracking-[0.005em]"
            style={{ color: '#64748b', wordBreak: 'keep-all' }}
          >
            사업자등록번호 786-88-03152 | 통신판매신고번호 제2025-서울마포-0943호 |
            <br />
            마인드풀랩스 주식회사(Mindful Labs Inc.) | 대표: 강호남
            <br />
            서울특별시 성동구 뚝섬로13길 38, 4층 (성수동)
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
      <h5
        className="mb-[18px] text-[17px] font-bold leading-[1.4] tracking-[-0.005em]"
        style={{ color: '#168A35' }}
      >
        {heading}
      </h5>
      <ul
        className="flex list-none flex-col gap-3.5 p-0 text-[15.5px] font-medium leading-[1.55] [&_a]:transition-colors [&_a:hover]:text-[#168A35]"
        style={{ color: '#0f172a' }}
      >
        {children}
      </ul>
    </div>
  );
}
