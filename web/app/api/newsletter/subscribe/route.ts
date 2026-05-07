import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;
const MAX_NAME_LEN = 80;
const MAX_URL_LEN = 2048;

interface SubscribeBody {
  email?: unknown;
  name?: unknown;
  sourceUrl?: unknown;
}

export async function POST(req: Request) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'INVALID_JSON' },
      { status: 400 },
    );
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
  const email = rawEmail.toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_EMAIL' },
      { status: 400 },
    );
  }

  const name =
    typeof body.name === 'string' && body.name.trim().length > 0
      ? body.name.trim().slice(0, MAX_NAME_LEN)
      : null;
  const sourceUrl =
    typeof body.sourceUrl === 'string' && body.sourceUrl.trim().length > 0
      ? body.sourceUrl.trim().slice(0, MAX_URL_LEN)
      : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, name, source_url: sourceUrl });

  if (error) {
    // 23505 = unique_violation → 이미 구독 중인 이메일은 성공으로 취급 (idempotent)
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    console.error('[newsletter/subscribe] insert failed', {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      { ok: false, error: 'DB_ERROR' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, alreadySubscribed: false });
}
