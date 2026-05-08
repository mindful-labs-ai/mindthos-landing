'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface AcademyInquiryFormProps {
  kakaoUrl: string;
}

const CREDIT_OPTIONS = [
  { value: 'completed', label: '학점 이수 완료' },
  { value: 'in-progress', label: '학점 이수 진행 중' },
  { value: 'not-yet', label: '학점 이수 전' },
  { value: 'unsure', label: '모르겠음 / 상담 필요' },
];

const UTM_STORAGE_KEY = 'mt-utm-params';

type Status = 'idle' | 'submitting' | 'success' | 'error';

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

export function AcademyInquiryForm({ kakaoUrl }: AcademyInquiryFormProps) {
  const [credit, setCredit] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [toast, setToast] = useState<ToastState>({ status: 'idle', message: '' });

  const isSubmitting = toast.status === 'submitting';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setToast({ status: 'submitting', message: '문의를 접수하고 있어요…' });

    const utms = readStoredUtms();
    const sourceUrl =
      typeof window !== 'undefined' ? window.location.href : undefined;

    try {
      const res = await fetch('/api/academy/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditStatus: credit,
          name,
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
      };

      if (!res.ok || !data.ok) {
        const code = data.error || 'UNKNOWN';
        const map: Record<string, string> = {
          INVALID_CREDIT_STATUS: '학점 이수 여부를 선택해 주세요.',
          INVALID_NAME: '이름을 입력해 주세요.',
          INVALID_PHONE: '연락처 형식을 다시 확인해 주세요.',
          INVALID_JSON: '요청 형식이 올바르지 않아요. 잠시 후 다시 시도해 주세요.',
          DB_ERROR: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
        };
        setToast({
          status: 'error',
          message: map[code] || '문의 접수에 실패했어요. 잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      setToast({
        status: 'success',
        message: '문의가 접수되었어요. 영업일 기준 1~2일 안에 1:1로 연락드릴게요.',
      });
      setCredit('');
      setName('');
      setPhone('');
    } catch {
      setToast({
        status: 'error',
        message: '네트워크 오류로 전송하지 못했어요. 카카오톡 빠른 상담을 이용해 주세요.',
      });
    }
  };

  return (
    <form className="academy-form" onSubmit={handleSubmit} noValidate>
      <div className="academy-form-row">
        <label className="academy-form-field">
          <span className="academy-form-label">학점 이수 여부</span>
          <select
            className="academy-form-input"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">선택해 주세요</option>
            {CREDIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="academy-form-field">
          <span className="academy-form-label">이름</span>
          <input
            type="text"
            className="academy-form-input"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </label>
        <label className="academy-form-field">
          <span className="academy-form-label">연락처</span>
          <input
            type="tel"
            className="academy-form-input"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            disabled={isSubmitting}
          />
        </label>
        <button
          type="submit"
          className="btn primary academy-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '전송 중…' : '수련 문의하기'}
          {!isSubmitting && (
            <ArrowRight className="arr" width={18} height={18} aria-hidden />
          )}
        </button>
      </div>
      {toast.status !== 'idle' && (
        <p
          className={`academy-form-toast academy-form-toast--${toast.status}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
          {toast.status === 'success' && (
            <>
              {' '}
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="academy-form-toast-link"
              >
                지금 바로 카카오톡으로 빠른 상담하기 →
              </a>
            </>
          )}
        </p>
      )}
    </form>
  );
}
