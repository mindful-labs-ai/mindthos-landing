import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/constants/site';

const HOST = new URL(SITE_CONFIG.url).host;
const HOST_BARE = HOST.replace(/^www\./, '');
const ACCEPTED_HOSTS = new Set([HOST_BARE, `www.${HOST_BARE}`]);

export async function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: 'INDEXNOW_KEY is not configured' },
      { status: 500 },
    );
  }
  return new NextResponse(key, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

interface IndexNowBody {
  urls?: string[];
}

export async function POST(req: Request) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: 'INDEXNOW_KEY is not configured' },
      { status: 500 },
    );
  }

  let body: IndexNowBody;
  try {
    body = (await req.json()) as IndexNowBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (!body.urls?.length) {
    return NextResponse.json(
      { ok: false, error: 'No urls provided' },
      { status: 400 },
    );
  }

  /* www / non-www 변형을 모두 받되 canonical host(HOST = SITE_CONFIG 의 호스트)로 정규화한다.
     IndexNow 는 payload.host 와 keyLocation 의 호스트, urlList 의 호스트가 모두
     일치해야 — 일치하지 않으면 422(Unprocessable Entity)로 거부한다. */
  const normalizedUrls = body.urls
    .map((u) => {
      try {
        const url = new URL(u);
        if (!ACCEPTED_HOSTS.has(url.host)) return null;
        url.host = HOST;
        return url.toString();
      } catch {
        return null;
      }
    })
    .filter((u): u is string => u !== null);

  if (!normalizedUrls.length) {
    return NextResponse.json(
      { ok: false, error: `No urls matched host ${HOST_BARE}` },
      { status: 400 },
    );
  }

  const payload = {
    host: HOST,
    key,
    keyLocation: `${SITE_CONFIG.url}/${key}.txt`,
    urlList: normalizedUrls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({
      ok: res.ok || res.status === 202,
      status: res.status,
      forwardedUrls: normalizedUrls.length,
      skippedUrls: body.urls.length - normalizedUrls.length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'IndexNow forwarding failed',
      },
      { status: 502 },
    );
  }
}
