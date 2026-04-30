'use server';

import { createClient } from '@/lib/supabase/server';
import {
  contactInquirySchema,
  type ContactInquiryInput,
} from '@/lib/validations/contact';
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from '@/lib/validations/newsletter';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

export async function submitContactInquiry(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw: ContactInquiryInput = {
    name: String(formData.get('name') ?? '').trim(),
    phone: stringOrUndef(formData.get('phone')),
    email: stringOrUndef(formData.get('email')),
    inquiryType: stringOrUndef(formData.get('inquiryType')),
    preferredDate: stringOrUndef(formData.get('preferredDate')),
    message: stringOrUndef(formData.get('message')),
    sourceUrl: stringOrUndef(formData.get('sourceUrl')),
    utmSource: stringOrUndef(formData.get('utmSource')),
    utmMedium: stringOrUndef(formData.get('utmMedium')),
    utmCampaign: stringOrUndef(formData.get('utmCampaign')),
  };

  const parsed = contactInquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값을 확인해주세요.',
      fieldErrors: flattenIssues(parsed.error.issues),
    };
  }

  if (!parsed.data.phone && !parsed.data.email) {
    return {
      status: 'error',
      message: '연락처 또는 이메일 중 최소 하나는 입력해주세요.',
      fieldErrors: { phone: '연락처 또는 이메일이 필요합니다' },
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('contact_inquiries').insert({
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      inquiry_type: parsed.data.inquiryType ?? 'general',
      preferred_date: parsed.data.preferredDate ?? null,
      message: parsed.data.message ?? null,
      source_url: parsed.data.sourceUrl ?? null,
      utm_source: parsed.data.utmSource ?? null,
      utm_medium: parsed.data.utmMedium ?? null,
      utm_campaign: parsed.data.utmCampaign ?? null,
    });

    if (error) {
      console.error('[contact] insert failed', error);
      return {
        status: 'error',
        message:
          '문의 저장에 실패했습니다. 잠시 후 다시 시도하시거나 직접 메일로 연락주세요.',
      };
    }

    return {
      status: 'success',
      message:
        '문의가 접수되었습니다. 영업일 기준 1일 이내에 회신드리겠습니다.',
    };
  } catch (e) {
    console.error('[contact] unexpected error', e);
    return {
      status: 'error',
      message: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw: NewsletterSubscribeInput = {
    email: String(formData.get('email') ?? '').trim(),
    name: stringOrUndef(formData.get('name')),
    sourceUrl: stringOrUndef(formData.get('sourceUrl')),
  };

  const parsed = newsletterSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'error',
      message: '이메일을 확인해주세요.',
      fieldErrors: flattenIssues(parsed.error.issues),
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      {
        email: parsed.data.email,
        name: parsed.data.name ?? null,
        source_url: parsed.data.sourceUrl ?? null,
        is_active: true,
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('[newsletter] insert failed', error);
      return {
        status: 'error',
        message: '구독 등록에 실패했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    return {
      status: 'success',
      message: '구독이 완료되었습니다. 새 콘텐츠 발행 시 알려드리겠습니다.',
    };
  } catch (e) {
    console.error('[newsletter] unexpected error', e);
    return {
      status: 'error',
      message: '예상치 못한 오류가 발생했습니다.',
    };
  }
}

function stringOrUndef(v: FormDataEntryValue | null): string | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function flattenIssues(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in out)) out[key] = issue.message;
  }
  return out;
}
