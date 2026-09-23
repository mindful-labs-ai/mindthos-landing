import { createHmac, randomBytes } from 'crypto';

/**
 * SOLAPI 문자(SMS/LMS) 단건 발송 클라이언트 — mindthos-server 의
 * `src/module/solapi/solapi.service.ts` 패턴을 랜딩용으로 축소 이식.
 * 서버 전용(API Route): 시크릿을 다루므로 클라이언트 번들에 import 금지.
 *
 * 인증: HMAC-SHA256(apiSecret 로 date+salt 서명).
 * 🔒 PII: 수신번호/본문을 로그에 남기지 않는다 (실패 시 statusCode 만).
 */

const SEND_URL = 'https://api.solapi.com/messages/v4/send';
const SUCCESS_STATUS_CODE = '2000';
const TIMEOUT_MS = 15000;

/** SMS 최대 바이트(초과 시 LMS 전환). SOLAPI 는 EUC-KR 기준 — 한글/비ASCII 2바이트. */
const SMS_MAX_BYTES = 90;

export interface SolapiSmsResult {
  ok: boolean;
  code?: string;
}

function byteLength(text: string): number {
  let bytes = 0;
  for (const ch of text) {
    bytes += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return bytes;
}

function buildAuthHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const salt = randomBytes(32).toString('hex');
  const signature = createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

/**
 * 문자 1건 발송. 90바이트 초과 본문은 자동으로 LMS(제목 포함)로 발송한다.
 * 예외를 던지지 않고 결과 객체를 반환 — 호출부(fire-and-forget)가 로그만 남긴다.
 * creds 미설정 시 네트워크 호출 없이 실패로 반환.
 */
export async function sendSolapiSms(params: {
  to: string;
  text: string;
  /** LMS 전환 시 제목 (기본: 마음토스) */
  subject?: string;
}): Promise<SolapiSmsResult> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER;
  if (!apiKey || !apiSecret || !sender) {
    console.warn('[solapi] credentials not configured');
    return { ok: false, code: 'NO_CREDENTIALS' };
  }

  const isLms = byteLength(params.text) > SMS_MAX_BYTES;
  const payload = {
    message: {
      to: params.to.replace(/[^0-9]/g, ''),
      from: sender.replace(/[^0-9]/g, ''),
      type: isLms ? 'LMS' : 'SMS',
      text: params.text,
      ...(isLms ? { subject: params.subject ?? '마음토스' } : {}),
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: buildAuthHeader(apiKey, apiSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    console.warn(aborted ? '[solapi] request timeout' : '[solapi] transport error');
    return { ok: false, code: aborted ? 'TIMEOUT' : 'TRANSPORT_ERROR' };
  } finally {
    clearTimeout(timer);
  }

  let statusCode = '';
  try {
    const body = (await response.json()) as {
      statusCode?: unknown;
      errorCode?: unknown;
    };
    statusCode = String(body.errorCode ?? body.statusCode ?? '');
  } catch {
    console.warn(`[solapi] response not JSON http=${response.status}`);
    return { ok: false, code: `HTTP_${response.status}` };
  }

  if (response.status < 400 && statusCode === SUCCESS_STATUS_CODE) {
    return { ok: true };
  }
  console.warn(
    `[solapi] send failed http=${response.status} code=${statusCode || 'UNKNOWN'}`,
  );
  return { ok: false, code: statusCode || `HTTP_${response.status}` };
}
