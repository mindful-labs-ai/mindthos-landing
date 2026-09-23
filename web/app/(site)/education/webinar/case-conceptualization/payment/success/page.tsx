import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR } from '@/constants/webinar';
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
  }>;
}

export default async function WebinarPaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const { paymentKey = '', orderId = '', amount = '' } = await searchParams;

  return (
    <section className="wf-section webinar-result" aria-label="결제 결과">
      <div className="container">
        <PaymentConfirm paymentKey={paymentKey} orderId={orderId} amount={amount} />
      </div>
    </section>
  );
}
