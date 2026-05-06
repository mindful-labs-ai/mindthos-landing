import { revalidatePath, updateTag } from 'next/cache';
import { NextResponse } from 'next/server';

interface RevalidateBody {
  secret?: string;
  path?: string;
  tag?: string;
  paths?: string[];
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'REVALIDATION_SECRET is not configured' },
      { status: 500 },
    );
  }

  let body: RevalidateBody;
  try {
    body = (await req.json()) as RevalidateBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (body.secret !== expected) {
    return NextResponse.json(
      { ok: false, error: 'Invalid secret' },
      { status: 401 },
    );
  }

  const revalidated: string[] = [];

  if (body.tag) {
    updateTag(body.tag);
    revalidated.push(`tag:${body.tag}`);
  }

  if (body.path) {
    revalidatePath(body.path, 'page');
    revalidated.push(body.path);
  }

  if (body.paths?.length) {
    for (const p of body.paths) {
      revalidatePath(p, 'page');
      revalidated.push(p);
    }
  }

  if (revalidated.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No path/tag provided' },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    revalidated,
    revalidatedAt: new Date().toISOString(),
  });
}
