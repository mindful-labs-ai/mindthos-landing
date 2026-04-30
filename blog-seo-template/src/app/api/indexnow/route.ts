import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'andotherlife-indexnow-key';

export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(request: NextRequest) {
  const { urls } = await request.json();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://andotherlife.com';

  if (!urls || !Array.isArray(urls)) {
    return NextResponse.json({ error: 'urls array required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: INDEXNOW_KEY,
        urlList: urls,
      }),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
    });
  } catch {
    return NextResponse.json({ error: 'IndexNow submission failed' }, { status: 500 });
  }
}
