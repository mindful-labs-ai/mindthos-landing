'use client';

import { useState, type SyntheticEvent } from 'react';

type Status = 'idle' | 'pending' | 'success' | 'error';

interface SubscribeResponse {
  ok: boolean;
  alreadySubscribed?: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSignupCard() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  const isPending = status === 'pending';
  const isSuccess = status === 'success';

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || isSuccess) return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('pending');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          sourceUrl:
            typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SubscribeResponse;

      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(
          data.error === 'INVALID_EMAIL'
            ? '올바른 이메일 주소를 입력해주세요.'
            : '잠시 후 다시 시도해주세요.',
        );
        return;
      }

      setStatus('success');
      setMessage(
        data.alreadySubscribed
          ? '이미 구독 중인 이메일입니다.'
          : '구독해주셔서 감사합니다.',
      );
    } catch {
      setStatus('error');
      setMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  return (
    <div className="rounded-xl bg-[var(--bg-warm)] border border-[var(--line-warm)] p-6">
      <h3 className="font-semibold text-[var(--text-heading-strong)] text-body-size mb-1">
        뉴스레터
      </h3>
      <p className="text-small text-[var(--text-muted)] mb-3">
        마음토스 최신 콘텐츠를 이메일로 받아보세요
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          이메일 주소
        </label>
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="email@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setMessage('');
            }
          }}
          disabled={isPending || isSuccess}
          aria-invalid={status === 'error'}
          aria-describedby="newsletter-status"
          className="w-full rounded-lg border border-[var(--line-1)] bg-[var(--bg-base)] px-3 py-2 text-small text-[var(--text-body)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-small font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-dark)] hover:text-[var(--bg-base)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? '제출 중…' : isSuccess ? '구독 완료' : '구독하기'}
        </button>
      </form>

      <p
        id="newsletter-status"
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-[1.25rem] text-xs ${
          status === 'error'
            ? 'text-[var(--accent-danger,#c0392b)]'
            : 'text-[var(--brand-primary-dark)]'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
