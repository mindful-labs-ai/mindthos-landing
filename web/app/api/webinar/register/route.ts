import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { CASE_CONCEPTUALIZATION_WEBINAR } from '@/constants/webinar';

const MAX_NAME_LEN = 80;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 32;
const MAX_URL_LEN = 2048;
const MAX_UTM_LEN = 200;
const MAX_UA_LEN = 512;

const PHONE_RE = /^[0-9+\-\s()]{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  sourceUrl?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
}

function trimmedString(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

/**
 * 웨비나 신청 접수 — 결제창을 띄우기 전에 pending 행을 만들고 orderId 를 돌려준다.
 * 결제 승인(status='paid')은 /api/webinar/confirm 에서 처리.
 */
export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const name = trimmedString(body.name, MAX_NAME_LEN);
  if (!name) {
    return NextResponse.json({ ok: false, error: 'INVALID_NAME' }, { status: 400 });
  }

  const email = trimmedString(body.email, MAX_EMAIL_LEN);
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
  }

  const phone = trimmedString(body.phone, MAX_PHONE_LEN);
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ ok: false, error: 'INVALID_PHONE' }, { status: 400 });
  }

  const sourceUrl = trimmedString(body.sourceUrl, MAX_URL_LEN);
  const utmSource = trimmedString(body.utmSource, MAX_UTM_LEN);
  const utmMedium = trimmedString(body.utmMedium, MAX_UTM_LEN);
  const utmCampaign = trimmedString(body.utmCampaign, MAX_UTM_LEN);
  const userAgent = trimmedString(req.headers.get('user-agent'), MAX_UA_LEN);

  /* 토스 orderId 규칙: 영문 대소문자·숫자·-·_ 로 6~64자 */
  const orderId = `webinar-cc-${randomUUID()}`;

  const supabase = await createClient();
  const { error } = await supabase.from('webinar_registrations').insert({
    webinar_slug: CASE_CONCEPTUALIZATION_WEBINAR.slug,
    order_id: orderId,
    name,
    email,
    phone,
    amount: CASE_CONCEPTUALIZATION_WEBINAR.price,
    source_url: sourceUrl,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    user_agent: userAgent,
  });

  if (error) {
    console.error('[webinar/register] insert failed', {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderId,
    amount: CASE_CONCEPTUALIZATION_WEBINAR.price,
    orderName: CASE_CONCEPTUALIZATION_WEBINAR.orderName,
  });
}
