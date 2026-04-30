'use client';

import { useActionState, useEffect, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';
import { subscribeNewsletter, type ActionState } from '@/app/(site)/contact/actions';

const initialState: ActionState = { status: 'idle' };

interface NewsletterFormProps {
  variant?: 'light' | 'dark';
  sourceUrl?: string;
}

export function NewsletterForm({
  variant = 'dark',
  sourceUrl,
}: NewsletterFormProps) {
  const [state, formAction] = useActionState(
    subscribeNewsletter,
    initialState
  );
  const inputId = useId();

  useEffect(() => {
    if (state.status === 'success') {
      const el = document.getElementById(inputId);
      if (el instanceof HTMLInputElement) el.value = '';
    }
  }, [state.status, inputId]);

  const isDark = variant === 'dark';
  const labelColor = isDark
    ? 'text-[var(--text-on-dark-muted)]'
    : 'text-[var(--text-muted)]';
  const inputBg = isDark
    ? 'bg-white/10 border-white/15 text-[var(--text-on-dark)] placeholder:text-[var(--text-on-dark-muted)] focus:border-white/40'
    : 'bg-[var(--bg-base)] border-[var(--line-1)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)]';
  const errorColor = isDark ? 'text-[#ffb8a3]' : 'text-[var(--alert)]';
  const successColor = isDark
    ? 'text-[var(--brand-primary-soft)]'
    : 'text-[var(--brand-primary-dark)]';

  if (state.status === 'success') {
    return (
      <p
        role="status"
        className={`inline-flex items-center gap-2 text-[length:var(--t-small)] ${successColor}`}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="sourceUrl" value={sourceUrl ?? ''} />
      <label htmlFor={inputId} className={`block text-[length:var(--t-meta)] ${labelColor}`}>
        새 콘텐츠가 발행되면 알려드릴게요
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="email@example.com"
          aria-invalid={state.status === 'error'}
          className={`flex-1 rounded-lg border px-4 py-2.5 text-[length:var(--t-body-tight)] outline-none transition-colors focus:ring-2 focus:ring-[var(--brand-primary)] ${inputBg}`}
        />
        <SubmitButton isDark={isDark} />
      </div>
      {state.status === 'error' ? (
        <p role="alert" className={`text-[length:var(--t-meta)] ${errorColor}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton({ isDark }: { isDark: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        isDark
          ? 'rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60'
          : 'rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {pending ? '구독 중…' : '구독하기'}
    </button>
  );
}
