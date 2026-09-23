'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-react';
import { CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR } from '@/constants/webinar';

interface PaymentConfirmProps {
  paymentKey: string;
  orderId: string;
  amount: string;
}

type ConfirmStatus = 'confirming' | 'success' | 'error';

export function PaymentConfirm({ paymentKey, orderId, amount }: PaymentConfirmProps) {
  const paramsValid = Boolean(paymentKey && orderId && amount);
  const [status, setStatus] = useState<ConfirmStatus>(
    paramsValid ? 'confirming' : 'error',
  );
  const [message, setMessage] = useState(
    paramsValid ? '' : '결제 정보가 올바르지 않아요. 처음부터 다시 시도해 주세요.',
  );
  const requested = useRef(false);

  useEffect(() => {
    if (!paramsValid) return;
    /* React StrictMode 이중 실행 방지 — 승인 요청은 한 번만 보낸다 (서버도 멱등 처리). */
    if (requested.current) return;
    requested.current = true;

    (async () => {
      try {
        const res = await fetch('/api/webinar/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          message?: string | null;
        };

        if (!res.ok || !data.ok) {
          setStatus('error');
          setMessage(
            data.message ||
              '결제 승인에 실패했어요. 결제가 완료되지 않았으니 다시 시도해 주세요.',
          );
          return;
        }

        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'webinar_payment_completed', {
            webinar_slug: WEBINAR.slug,
            value: Number(amount),
            currency: 'KRW',
          });
        }
        setStatus('success');
      } catch {
        setStatus('error');
        setMessage('네트워크 오류로 결제 승인을 확인하지 못했어요. 카카오톡 채널로 문의해 주세요.');
      }
    })();
  }, [paramsValid, paymentKey, orderId, amount]);

  if (status === 'confirming') {
    return (
      <div className="webinar-result-card" role="status" aria-live="polite">
        <LoaderCircle className="webinar-result-icon webinar-result-icon--spin" width={40} height={40} aria-hidden />
        <h1 className="webinar-result-title">결제를 확인하고 있어요…</h1>
        <p className="webinar-result-body">잠시만 기다려 주세요. 화면을 닫지 마세요.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="webinar-result-card" role="alert">
        <AlertCircle className="webinar-result-icon webinar-result-icon--error" width={40} height={40} aria-hidden />
        <h1 className="webinar-result-title">결제를 완료하지 못했어요</h1>
        <p className="webinar-result-body">{message}</p>
        <div className="webinar-result-actions">
          <Link href={`${WEBINAR.path}#apply`} className="btn primary">
            다시 신청하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="webinar-result-card" role="status">
      <CheckCircle2 className="webinar-result-icon" width={40} height={40} aria-hidden />
      <h1 className="webinar-result-title">웨비나 신청이 완료되었어요!</h1>
      <p className="webinar-result-body">
        {WEBINAR.dateLabel}에 만나요. 구글 밋 참여 링크는 웨비나 전에
        신청 시 입력하신 이메일과 문자로 보내드립니다.
      </p>
      <div className="webinar-result-actions">
        <Link href={WEBINAR.path} className="btn ghost">
          웨비나 안내 페이지로
        </Link>
      </div>
    </div>
  );
}
