import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR,
  WEBINAR_OFFERS,
  isWebinarVariant,
} from '@/constants/webinar';
import '../../webinar.css';

export const metadata: Metadata = generatePageMetadata({
  title: '웨비나 결제 실패 — 마음토스',
  description: '초심 상담사를 위한 사례개념화 웨비나 결제 실패 안내 페이지입니다.',
  path: `${WEBINAR.path}/payment/fail`,
  noindex: true,
});

interface FailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    /* 판매 오퍼 변형 — 다시 신청하기 링크가 같은 오퍼 페이지를 가리키게 한다 */
    v?: string;
  }>;
}

export default async function WebinarPaymentFailPage({ searchParams }: FailPageProps) {
  const { code, message, v } = await searchParams;
  const offer = isWebinarVariant(v) ? WEBINAR_OFFERS[v] : WEBINAR_OFFERS.default;

  return (
    <section className="wf-section webinar-result" aria-label="결제 실패">
      <div className="container">
        <div className="webinar-result-card" role="alert">
          <AlertCircle className="webinar-result-icon webinar-result-icon--error" width={40} height={40} aria-hidden />
          <h1 className="webinar-result-title">결제가 완료되지 않았어요</h1>
          <p className="webinar-result-body">
            {message || '결제 과정에서 문제가 발생했어요. 다시 시도해 주세요.'}
          </p>
          {code ? <p className="webinar-result-meta">오류 코드 {code}</p> : null}
          <div className="webinar-result-actions">
            <Link href={`${offer.path}#apply`} className="btn primary">
              다시 신청하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
