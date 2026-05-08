import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CREDIT_STATUSES = ['completed', 'in-progress', 'not-yet', 'unsure'] as const;
type CreditStatus = (typeof CREDIT_STATUSES)[number];

const CREDIT_LABEL: Record<CreditStatus, string> = {
  completed: '학점 이수 완료',
  'in-progress': '학점 이수 진행 중',
  'not-yet': '학점 이수 전',
  unsure: '모르겠음 / 상담 필요',
};

const MAX_NAME_LEN = 80;
const MAX_PHONE_LEN = 32;
const MAX_URL_LEN = 2048;
const MAX_UTM_LEN = 200;
const MAX_UA_LEN = 512;

const PHONE_RE = /^[0-9+\-\s()]{8,}$/;

async function notifySlack(payload: {
  name: string;
  phone: string;
  creditStatus: CreditStatus;
  createdAt: string;
}): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const text = [
    '아카데미 고객 문의가 접수되었습니다.',
    '',
    `이름 : ${payload.name}`,
    `연락처 : ${payload.phone}`,
    `학점 이수 여부 : ${CREDIT_LABEL[payload.creditStatus]}`,
    `접수 날짜 : ${payload.createdAt}`,
  ].join('\n');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.error('[academy/inquiry] slack webhook non-200', {
        status: res.status,
      });
    }
  } catch (err) {
    console.error('[academy/inquiry] slack webhook failed', err);
  }
}

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
  /* anon 역할은 SELECT 정책이 없어 .select() 가 비어 있음 — created_at 은 클라이언트 측에서 생성. */
  const createdAt = new Date().toISOString();
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

  /* Slack 알림은 fire-and-forget — 실패해도 사용자 응답은 성공 처리. */
  void notifySlack({ name, phone, creditStatus, createdAt });

  return NextResponse.json({ ok: true });
}
