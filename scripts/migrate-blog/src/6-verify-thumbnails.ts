import 'dotenv/config';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TransformedPost } from './4-transform.js';
import { log } from './lib/log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', '.data', 'posts.json');
const REPORT = resolve(__dirname, '..', '.data', 'thumbnails-missing.txt');

async function head(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  log.step('Supabase Storage thumbnail 200 검증');

  // 이전 실행의 stale 리포트가 있으면 제거 — 멱등성 확보.
  rmSync(REPORT, { force: true });

  const posts: TransformedPost[] = JSON.parse(readFileSync(SRC, 'utf-8'));
  const checks = posts
    .filter((p) => p.thumbnail_url)
    .map((p) => ({ slug: p.slug, url: p.thumbnail_url! }));

  log.info(`${checks.length} thumbnails 확인 시작`);

  const missing: Array<{ slug: string; url: string; status: number }> = [];
  // 동시성 8
  const POOL = 8;
  let i = 0;
  await Promise.all(
    Array.from({ length: POOL }, async () => {
      while (i < checks.length) {
        const idx = i++;
        const c = checks[idx];
        const status = await head(c.url);
        if (status !== 200) missing.push({ ...c, status });
        if (idx % 50 === 0) log.info(`...${idx}/${checks.length}`);
      }
    })
  );

  if (missing.length === 0) {
    log.ok(`모든 thumbnail 200 응답 (${checks.length}/${checks.length}).`);
    return;
  }

  log.warn(`${missing.length} 누락 — 사용자가 Supabase Storage 에 업로드 필요`);
  const lines = missing.map((m) => `${m.status}  ${m.slug}  ${m.url}`).join('\n');
  writeFileSync(REPORT, lines + '\n');
  console.log(`\n리포트: ${REPORT}`);
  for (const m of missing.slice(0, 10)) {
    console.log(`  [${m.status}] ${m.slug}  ${m.url}`);
  }
  if (missing.length > 10) console.log(`  ... +${missing.length - 10} more`);
  process.exit(1);
}

main().catch((err) => {
  log.error(String(err?.message ?? err));
  process.exit(1);
});
