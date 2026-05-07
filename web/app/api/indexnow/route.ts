import { NextResponse } from 'next/server';
import { SITE_CONFIG } from '@/constants/site';

const HOST = new URL(SITE_CONFIG.url).host;

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

  const payload = {
    host: HOST,
    key,
    keyLocation: `${SITE_CONFIG.url}/api/indexnow`,
    urlList: body.urls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      forwardedUrls: body.urls.length,
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
