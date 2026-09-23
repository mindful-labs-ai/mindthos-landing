import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR,
  WEBINAR_OFFERS,
  isWebinarVariant,
} from '@/constants/webinar';
import { PaymentConfirm } from './PaymentConfirm';
import '../../webinar.css';

export const metadata: Metadata = generatePageMetadata({
  title: '웨비나 신청 완료 — 마음토스',
  description: '초심 상담사를 위한 사례개념화 웨비나 결제 확인 페이지입니다.',
  path: `${WEBINAR.path}/payment/success`,
  noindex: true,
});

interface SuccessPageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
    /* 판매 오퍼 변형 — 돌아가기 링크가 같은 오퍼 페이지를 가리키게 한다 */
    v?: string;
  }>;
}

export default async function WebinarPaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const { paymentKey = '', orderId = '', amount = '', v } = await searchParams;
  const offer = isWebinarVariant(v) ? WEBINAR_OFFERS[v] : WEBINAR_OFFERS.default;

  return (
    <section className="wf-section webinar-result" aria-label="결제 결과">
      <div className="container">
        <PaymentConfirm
          paymentKey={paymentKey}
          orderId={orderId}
          amount={amount}
          backPath={offer.path}
        />
      </div>
    </section>
  );
}
