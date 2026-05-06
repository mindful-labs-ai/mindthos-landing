import 'dotenv/config';
import { config } from 'dotenv';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// scripts/migrate-blog/.env 보다 우선해 web/.env.local 도 로드 (BASEROW_TOKEN 등 공유).
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
config({ path: resolve(REPO_ROOT, 'web', '.env.local') });

import { fetchAllRows, fetchFirstNRows } from './lib/baserow.js';
import { log } from './lib/log.js';

const OUT = resolve(__dirname, '..', '.data', 'baserow-all.json');

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const v = process.argv.find((a) => a.startsWith(prefix));
  return v?.slice(prefix.length);
}

async function main() {
  const limitRaw = arg('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  log.step(
    limit
      ? `Baserow 처음 ${limit} row fetch`
      : 'Baserow Mindthos Blog 전체 row fetch'
  );

  const rows = limit ? await fetchFirstNRows(limit) : await fetchAllRows();
  log.ok(`${rows.length} rows fetched`);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(rows, null, 2));
  log.ok(`saved → ${OUT}`);
}

main().catch((err) => {
  log.error(String(err?.message ?? err));
  process.exit(1);
});
