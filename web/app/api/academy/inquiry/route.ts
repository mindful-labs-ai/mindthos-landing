import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CREDIT_STATUSES = ['completed', 'in-progress', 'not-yet', 'unsure'] as const;
type CreditStatus = (typeof CREDIT_STATUSES)[number];

const MAX_NAME_LEN = 80;
const MAX_PHONE_LEN = 32;
const MAX_URL_LEN = 2048;
const MAX_UTM_LEN = 200;
const MAX_UA_LEN = 512;

const PHONE_RE = /^[0-9+\-\s()]{8,}$/;

interface InquiryBody {
  creditStatus?: unknown;
  name?: unknown;
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

export async function POST(req: Request) {
  let body: InquiryBody;
  try {
    body = (await req.json()) as InquiryBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'INVALID_JSON' },
      { status: 400 },
    );
  }

  const creditStatusRaw =
    typeof body.creditStatus === 'string' ? body.creditStatus.trim() : '';
  if (!CREDIT_STATUSES.includes(creditStatusRaw as CreditStatus)) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_CREDIT_STATUS' },
      { status: 400 },
    );
  }
  const creditStatus = creditStatusRaw as CreditStatus;

  const name = trimmedString(body.name, MAX_NAME_LEN);
  if (!name) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_NAME' },
      { status: 400 },
    );
  }

  const phone = trimmedString(body.phone, MAX_PHONE_LEN);
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_PHONE' },
      { status: 400 },
    );
  }

  const sourceUrl = trimmedString(body.sourceUrl, MAX_URL_LEN);
  const utmSource = trimmedString(body.utmSource, MAX_UTM_LEN);
  const utmMedium = trimmedString(body.utmMedium, MAX_UTM_LEN);
  const utmCampaign = trimmedString(body.utmCampaign, MAX_UTM_LEN);
  const userAgent = trimmedString(req.headers.get('user-agent'), MAX_UA_LEN);

  const supabase = await createClient();
  const { error } = await supabase.from('academy_inquiries').insert({
    credit_status: creditStatus,
    name,
    phone,
    source_url: sourceUrl,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    user_agent: userAgent,
  });

  if (error) {
    console.error('[academy/inquiry] insert failed', {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { ok: false, error: 'DB_ERROR' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
