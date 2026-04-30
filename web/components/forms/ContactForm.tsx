'use client';

import { useActionState, useEffect, useId, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactInquiry, type ActionState } from '@/app/(site)/contact/actions';

type InquiryType = 'free-trial' | 'institution-inquiry';

const initialState: ActionState = { status: 'idle' };

interface ContactFormProps {
  defaultType?: InquiryType;
  sourceUrl?: string;
}

export function ContactForm({
  defaultType = 'free-trial',
  sourceUrl,
}: ContactFormProps) {
  const [state, formAction] = useActionState(
    submitContactInquiry,
    initialState
  );
  const [type, setType] = useState<InquiryType>(defaultType);
  const formId = useId();

  useEffect(() => {
    if (state.status === 'success') {
      const form = document.getElementById(formId);
      if (form instanceof HTMLFormElement) form.reset();
    }
  }, [state.status, formId]);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[var(--brand-primary)] bg-[var(--brand-primary-pale)] p-8 text-center"
      >
        <CheckCircle2
          className="mx-auto h-10 w-10 text-[var(--brand-primary-dark)]"
          aria-hidden
        />
        <h2 className="mt-4 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
          문의가 접수되었습니다
        </h2>
        <p className="mt-2 text-[var(--text-body)]">{state.message}</p>
      </div>
    );
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors ?? {} : {};

  return (
    <form
      id={formId}
      action={formAction}
      className="space-y-6"
      noValidate
      aria-describedby={state.status === 'error' ? `${formId}-summary` : undefined}
    >
      <input type="hidden" name="sourceUrl" value={sourceUrl ?? ''} />
      <input type="hidden" name="inquiryType" value={type} />

      <fieldset>
        <legend className="sr-only">문의 유형</legend>
        <div
          role="tablist"
          aria-label="문의 유형 선택"
          className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--line-1)] bg-[var(--bg-elevated)] p-1"
        >
          {(
            [
              ['free-trial', '무료로 시작'],
              ['institution-inquiry', '기관 도입 상담'],
            ] as const
          ).map(([value, label]) => {
            const active = type === value;
            return (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setType(value)}
                className={
                  active
                    ? 'rounded-md bg-[var(--bg-base)] px-4 py-2.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-heading-strong)] shadow-sm'
                    : 'rounded-md px-4 py-2.5 text-[length:var(--t-cta)] font-medium text-[var(--text-body)] transition-colors hover:text-[var(--text-primary)]'
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field
        label="이름"
        name="name"
        required
        autoComplete="name"
        placeholder="홍길동"
        error={fieldErrors.name}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="counselor@example.com"
          error={fieldErrors.email}
          required={type === 'institution-inquiry'}
        />
        <Field
          label="연락처"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          error={fieldErrors.phone}
        />
      </div>

      {type === 'free-trial' ? (
        <Field
          label="회기 빈도 (선택)"
          name="preferredDate"
          placeholder="예: 주 5–10회 / 월 30회 이상"
          error={fieldErrors.preferredDate}
          hint="회기량을 알려주시면 적합한 플랜을 안내드립니다"
        />
      ) : (
        <Field
          label="기관명 / 도입 규모"
          name="preferredDate"
          required
          placeholder="예: ○○상담센터 · 상담사 12명"
          error={fieldErrors.preferredDate}
          hint="기관명과 예상 사용 인원을 함께 적어주세요"
        />
      )}

      <Field
        as="textarea"
        label={
          type === 'free-trial'
            ? '문의 내용 (선택)'
            : '도입 시점 / 검토 항목'
        }
        name="message"
        rows={5}
        placeholder={
          type === 'free-trial'
            ? '궁금한 점이나 사용 환경을 적어주시면 더 정확하게 안내드립니다.'
            : '도입 희망 시점, 보안 검토 항목, 기관 환경 등을 자유롭게 적어주세요.'
        }
        error={fieldErrors.message}
      />

      {state.status === 'error' ? (
        <div
          id={`${formId}-summary`}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[var(--alert)] bg-[var(--alert)]/10 px-4 py-3 text-[length:var(--t-small)] text-[var(--text-primary)]"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--alert)]"
            aria-hidden
          />
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <SubmitButton
          label={type === 'free-trial' ? '무료로 시작하기' : '기관 도입 문의'}
        />
        <p className="text-[length:var(--t-meta)] text-[var(--text-muted)]">
          제출 시 개인정보 처리방침에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '전송 중…' : label}
      {!pending ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
    </button>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  rows?: number;
  as?: 'input' | 'textarea';
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  autoComplete,
  error,
  hint,
  rows = 4,
  as = 'input',
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const baseClass =
    'w-full rounded-lg border bg-[var(--bg-base)] px-4 py-3 text-[length:var(--t-body)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]';
  const borderClass = error
    ? 'border-[var(--alert)]'
    : 'border-[var(--line-1)] focus:border-[var(--brand-primary)]';

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[length:var(--t-small)] font-medium text-[var(--text-primary)]"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[var(--brand-primary-dark)]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${baseClass} ${borderClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${baseClass} ${borderClass}`}
        />
      )}
      {hint && !error ? (
        <p
          id={hintId}
          className="mt-1.5 text-[length:var(--t-meta)] text-[var(--text-muted)]"
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-[length:var(--t-meta)] text-[var(--alert)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
