import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSolapiSms } from '@/lib/solapi';
import { CASE_CONCEPTUALIZATION_WEBINAR } from '@/constants/webinar';

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

/** 결제 알림 채널 — #n_notherlife_education_결제알림. 봇(pf_marketer_bot)이 채널 멤버여야 발송된다. */
const SLACK_PAYMENT_CHANNEL_ID = 'C0B6H5BRC8K';

interface ConfirmBody {
  paymentKey?: unknown;
  orderId?: unknown;
  amount?: unknown;
}

async function notifySlack(payload: {
  name: string;
  phone: string;
  email: string;
  orderId: string;
  amount: number;
}): Promise<void> {
  const text = [
    '웨비나 신청 결제가 완료되었습니다.',
    '',
    `웨비나 : ${CASE_CONCEPTUALIZATION_WEBINAR.orderName}`,
    `이름 : ${payload.name}`,
    `연락처 : ${payload.phone}`,
    `이메일 : ${payload.email}`,
    `결제 금액 : ${payload.amount.toLocaleString('ko-KR')}원`,
    `주문번호 : ${payload.orderId}`,
  ].join('\n');

  try {
    /* 채널 지정 발송은 봇 토큰(chat.postMessage)이 정공법 — 앱형 incoming webhook 은
       채널이 웹훅에 고정돼 payload 의 channel 필드를 무시한다.
       토큰 미설정 시에만 기본 웹훅(고객리드 채널)으로 폴백. */
    const botToken = process.env.SLACK_BOT_TOKEN;
    if (botToken) {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ channel: SLACK_PAYMENT_CHANNEL_ID, text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!data.ok) {
        /* not_in_channel = 봇이 채널에 초대되지 않음 → /invite @pf_marketer_bot 필요 */
        console.error('[webinar/confirm] slack postMessage failed', {
          error: data.error,
        });
      }
      return;
    }

    const url = process.env.SLACK_WEBHOOK_URL;
    if (!url) return;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.error('[webinar/confirm] slack webhook non-200', { status: res.status });
    }
  } catch (err) {
    console.error('[webinar/confirm] slack notify failed', err);
  }
}

/**
 * 신청 확정 문자 (SOLAPI LMS). 실패해도 결제 승인 응답에는 영향 없음(fire-and-forget).
 * 🔒 수신번호/본문은 로그에 남기지 않는다.
 */
async function notifySmsToRegistrant(phone: string): Promise<void> {
  const w = CASE_CONCEPTUALIZATION_WEBINAR;
  const text = [
    '[마음토스] 웨비나 신청이 완료되었습니다.',
    '',
    `· ${w.title}`,
    `· ${w.dateLabel}`,
    `· ${w.platformLabel}`,
    '',
    '구글 밋 참여 링크는 웨비나 전에 문자와 이메일로 보내드립니다.',
  ].join('\n');

  const result = await sendSolapiSms({ to: phone, text, subject: '마음토스 웨비나' });
  if (!result.ok) {
    console.error('[webinar/confirm] sms notify failed', { code: result.code });
  }
}

/**
 * 토스페이먼츠 결제 승인 — successUrl 리다이렉트 후 클라이언트가 호출한다.
 * 1) pending 행 조회 → 금액 위·변조 검증 (DB 금액 = 요청 금액 = 서버 상수)
 * 2) 토스 승인 API 호출 (시크릿 키)
 * 3) status='paid' 갱신 (service_role) + Slack 알림
 */
export async function POST(req: Request) {
  let body: ConfirmBody;
  try {
    body = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const paymentKey = typeof body.paymentKey === 'string' ? body.paymentKey.trim() : '';
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: 'INVALID_PARAMS' }, { status: 400 });
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    console.error('[webinar/confirm] TOSS_SECRET_KEY is not configured');
    return NextResponse.json({ ok: false, error: 'NOT_CONFIGURED' }, { status: 500 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error('[webinar/confirm] admin client init failed', err);
    return NextResponse.json({ ok: false, error: 'NOT_CONFIGURED' }, { status: 500 });
  }

  const { data: registration, error: selectError } = await supabase
    .from('webinar_registrations')
    .select('id, name, email, phone, amount, status')
    .eq('order_id', orderId)
    .maybeSingle();

  if (selectError) {
    console.error('[webinar/confirm] select failed', selectError.message);
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }
  if (!registration) {
    return NextResponse.json({ ok: false, error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }

  /* 이미 승인된 주문 — 새로고침 등 중복 호출은 성공으로 응답 (멱등) */
  if (registration.status === 'paid') {
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  }

  /* 금액 위·변조 검증: 클라이언트가 보낸 금액이 아니라 서버 기록과 상수를 기준으로 승인 */
  if (
    amount !== registration.amount ||
    amount !== CASE_CONCEPTUALIZATION_WEBINAR.price
  ) {
    console.error('[webinar/confirm] amount mismatch', {
      orderId,
      requested: amount,
      stored: registration.amount,
    });
    return NextResponse.json({ ok: false, error: 'AMOUNT_MISMATCH' }, { status: 400 });
  }

  const confirmRes = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const confirmData = (await confirmRes.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
    approvedAt?: string;
  };

  if (!confirmRes.ok) {
    console.error('[webinar/confirm] toss confirm failed', {
      orderId,
      status: confirmRes.status,
      code: confirmData.code,
    });
    await supabase
      .from('webinar_registrations')
      .update({
        status: 'failed',
        fail_reason: `${confirmData.code ?? 'UNKNOWN'}: ${confirmData.message ?? ''}`.slice(0, 500),
      })
      .eq('id', registration.id);
    return NextResponse.json(
      {
        ok: false,
        error: 'CONFIRM_FAILED',
        message: confirmData.message ?? null,
      },
      { status: 502 },
    );
  }

  const { error: updateError } = await supabase
    .from('webinar_registrations')
    .update({
      status: 'paid',
      payment_key: paymentKey,
      paid_at: confirmData.approvedAt ?? new Date().toISOString(),
      fail_reason: null,
    })
    .eq('id', registration.id);

  if (updateError) {
    /* 결제는 승인됐는데 기록 갱신만 실패 — 토스 콘솔로 대사 가능하도록 로그를 남긴다. */
    console.error('[webinar/confirm] paid but update failed', {
      orderId,
      paymentKey,
      message: updateError.message,
    });
  }

  /* Vercel 서버리스는 응답 반환 즉시 실행을 동결하므로 fire-and-forget(void)은 유실된다.
     알림 실패가 응답을 깨지는 않지만(각자 내부에서 오류를 삼킴), 완료까지는 반드시 await. */
  await Promise.allSettled([
    notifySlack({
      name: registration.name,
      phone: registration.phone,
      email: registration.email,
      orderId,
      amount,
    }),
    notifySmsToRegistrant(registration.phone),
  ]);

  return NextResponse.json({ ok: true });
}
