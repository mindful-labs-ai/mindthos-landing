'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, X, LoaderCircle } from 'lucide-react';
import {
  loadTossPayments,
  ANONYMOUS,
  type TossPaymentsWidgets,
} from '@tosspayments/tosspayments-sdk';
import {
  CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR,
  type WebinarOffer,
} from '@/constants/webinar';

const UTM_STORAGE_KEY = 'mt-utm-params';

type Status = 'idle' | 'submitting' | 'error';

interface ToastState {
  status: Status;
  message: string;
}

function readStoredUtms(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_NAME: '이름을 입력해 주세요.',
  INVALID_EMAIL: '이메일 형식을 다시 확인해 주세요.',
  INVALID_PHONE: '연락처 형식을 다시 확인해 주세요.',
  INVALID_JSON: '요청 형식이 올바르지 않아요. 잠시 후 다시 시도해 주세요.',
  DB_ERROR: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
};

interface Cleanupable {
  destroy: () => Promise<void>;
}

interface WebinarApplyFormProps {
  offer: WebinarOffer;
}

export function WebinarApplyForm({ offer }: WebinarApplyFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [toast, setToast] = useState<ToastState>({ status: 'idle', message: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [modalError, setModalError] = useState('');

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const renderedWidgetsRef = useRef<Cleanupable[]>([]);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const isSubmitting = toast.status === 'submitting';
  const priceLabel = `${offer.price.toLocaleString('ko-KR')}원`;

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setWidgetReady(false);
    setAgreed(false);
    setPaying(false);
    setModalError('');
    /* 렌더된 위젯을 정리해야 다음에 다시 열 때 AlreadyRendered 오류가 나지 않는다. */
    const rendered = renderedWidgetsRef.current;
    renderedWidgetsRef.current = [];
    widgetsRef.current = null;
    void Promise.allSettled(rendered.map((w) => w.destroy()));
  }, []);

  /* 모달 열림 동안 배경 스크롤 잠금 + ESC 닫기 */
  useEffect(() => {
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [modalOpen, closeModal]);

  /* 모달이 열리면 결제위젯(결제수단 + 약관)을 렌더링한다. clientKey 존재는 submit 단계에서 보장. */
  useEffect(() => {
    if (!modalOpen || !orderId) return;
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) return;

    let cancelled = false;
    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        if (cancelled) return;
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: 'KRW', value: offer.price });
        const [paymentMethodWidget, agreementWidget] = await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#toss-payment-method',
            variantKey: WEBINAR.widgetVariantKey,
          }),
          widgets.renderAgreement({ selector: '#toss-agreement' }),
        ]);
        if (cancelled) {
          void Promise.allSettled([
            paymentMethodWidget.destroy(),
            agreementWidget.destroy(),
          ]);
          return;
        }
        renderedWidgetsRef.current = [paymentMethodWidget, agreementWidget];

        /* 필수 약관 동의 여부에 따라 결제 버튼 활성화 */
        setAgreed(true);
        agreementWidget.on('agreementStatusChange', (status) => {
          setAgreed(status.agreedRequiredTerms);
        });
        setWidgetReady(true);
      } catch (err) {
        console.error('[webinar] widget render failed', err);
        if (!cancelled) {
          setModalError('결제 화면을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [modalOpen, orderId, offer.price]);

  /* 1단계: 신청 정보 접수 → orderId 발급 → 결제 모달 오픈 */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      setToast({
        status: 'error',
        message: '결제 설정이 아직 완료되지 않았어요. 카카오톡 채널로 문의해 주세요.',
      });
      return;
    }

    setToast({ status: 'submitting', message: '신청 정보를 접수하고 있어요…' });

    const utms = readStoredUtms();
    const sourceUrl =
      typeof window !== 'undefined' ? window.location.href : undefined;

    try {
      const res = await fetch('/api/webinar/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: offer.variant,
          name,
          email,
          phone,
          sourceUrl,
          utmSource: utms.utm_source,
          utmMedium: utms.utm_medium,
          utmCampaign: utms.utm_campaign,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        orderId?: string;
      };

      if (!res.ok || !data.ok || !data.orderId) {
        const code = data.error || 'UNKNOWN';
        setToast({
          status: 'error',
          message:
            ERROR_MESSAGES[code] ||
            '신청 접수에 실패했어요. 잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'webinar_apply_submitted', {
          webinar_slug: offer.slug,
          form_location: 'webinar_apply_form',
        });
      }

      setToast({ status: 'idle', message: '' });
      setOrderId(data.orderId);
      setModalOpen(true);
    } catch {
      setToast({
        status: 'error',
        message: '네트워크 오류로 접수하지 못했어요. 잠시 후 다시 시도해 주세요.',
      });
    }
  };

  /* 2단계: 모달의 결제하기 버튼 → 위젯 결제 요청 (성공 시 successUrl 로 리다이렉트) */
  const handlePay = async () => {
    const widgets = widgetsRef.current;
    if (!widgets || !orderId || paying) return;

    setPaying(true);
    setModalError('');
    try {
      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId,
        orderName: WEBINAR.orderName,
        /* 변형(v)을 넘겨 결과 페이지의 '다시 신청하기' 링크가 같은 오퍼로 돌아오게 한다.
           토스는 자체 파라미터(paymentKey 등)를 & 로 이어 붙인다. */
        successUrl: `${origin}${WEBINAR.path}/payment/success?v=${offer.variant}`,
        failUrl: `${origin}${WEBINAR.path}/payment/fail?v=${offer.variant}`,
        customerName: name,
        customerEmail: email,
        customerMobilePhone: phone.replace(/[^0-9]/g, ''),
      });
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'USER_CANCEL' || code === 'PAY_PROCESS_CANCELED') {
        setModalError('결제가 취소되었어요. 준비되시면 다시 결제해 주세요.');
      } else {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : '';
        setModalError(
          message || '결제에 실패했어요. 잠시 후 다시 시도해 주세요.',
        );
      }
      setPaying(false);
    }
  };

  return (
    <>
      <form className="webinar-form webinar-apply-form" onSubmit={handleSubmit} noValidate>
        <div className="webinar-form-row">
          <label className="webinar-form-field">
            <span className="webinar-form-label">이름</span>
            <input
              type="text"
              className="webinar-form-input"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={isSubmitting}
            />
          </label>
          <label className="webinar-form-field">
            <span className="webinar-form-label">이메일 (Google Meet 링크 발송)</span>
            <input
              type="email"
              className="webinar-form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              disabled={isSubmitting}
            />
          </label>
          <label className="webinar-form-field">
            <span className="webinar-form-label">연락처</span>
            <input
              type="tel"
              className="webinar-form-input"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              inputMode="tel"
              disabled={isSubmitting}
            />
          </label>
          <button
            type="submit"
            className="btn primary webinar-form-submit"
            disabled={isSubmitting}
            data-cta-intent="webinar_payment"
            data-cta-location="webinar_apply_form"
            data-cta-label="결제하기"
          >
            {isSubmitting ? '접수 중…' : '결제하기'}
            {!isSubmitting && (
              <ArrowRight className="arr" width={18} height={18} aria-hidden />
            )}
          </button>
        </div>
        {toast.status !== 'idle' && (
          <p
            className={`webinar-form-toast webinar-form-toast--${toast.status}`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </p>
        )}
        <p className="webinar-apply-note">
          결제 완료 시 신청이 확정되며, Google Meet 참여 링크는 웨비나 전에 입력하신
          이메일과 문자로 보내드립니다. 결제·환불 문의는 카카오톡 채널을 이용해 주세요.
        </p>
      </form>

      {modalOpen && (
        <div
          className="webinar-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            ref={dialogRef}
            className="webinar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="웨비나 결제"
            tabIndex={-1}
          >
            <div className="webinar-modal-head">
              <div>
                <h3 className="webinar-modal-title">{WEBINAR.orderName}</h3>
                <p className="webinar-modal-amount">{priceLabel}</p>
              </div>
              <button
                type="button"
                className="webinar-modal-close"
                onClick={closeModal}
                aria-label="결제 닫기"
              >
                <X width={20} height={20} aria-hidden />
              </button>
            </div>

            <div className="webinar-modal-body">
              {!widgetReady && !modalError && (
                <p className="webinar-modal-loading" role="status">
                  <LoaderCircle
                    className="webinar-result-icon--spin"
                    width={20}
                    height={20}
                    aria-hidden
                  />
                  결제 화면을 불러오는 중이에요…
                </p>
              )}
              <div id="toss-payment-method" />
              <div id="toss-agreement" />
              {modalError && (
                <p className="webinar-form-toast webinar-form-toast--error" role="alert">
                  {modalError}
                </p>
              )}
            </div>

            <div className="webinar-modal-foot">
              <button
                type="button"
                className="btn primary lg webinar-modal-pay"
                onClick={handlePay}
                disabled={!widgetReady || !agreed || paying}
                data-cta-intent="webinar_payment"
                data-cta-location="webinar_payment_modal"
                data-cta-label={`${priceLabel} 결제하기`}
              >
                {paying ? '결제 진행 중…' : `${priceLabel} 결제하기`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
