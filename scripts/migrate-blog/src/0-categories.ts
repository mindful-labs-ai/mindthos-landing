import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BaserowRow } from './lib/baserow.js';
import { normalizeSlug } from './lib/normalize.js';
import { log } from './lib/log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', '.data', 'baserow-all.json');
const OUT = resolve(__dirname, '..', '.data', 'categories-mapping.json');

function main() {
  log.step('Baserow Category 분포 분석');

  let rows: BaserowRow[];
  try {
    rows = JSON.parse(readFileSync(SRC, 'utf-8'));
  } catch {
    log.error(`${SRC} 가 없습니다. 먼저 npm run fetch:baserow 실행하세요.`);
    process.exit(1);
  }

  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = (r.Category || '').trim();
    if (!c) continue;
    counts.set(c, (counts.get(c) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  console.log('\n  카테고리 (한글)        | 건수 | 자동 생성 슬러그');
  console.log('  --------------------- | ---- | -----------------');
  const mapping: Array<{ name: string; slug: string; count: number }> = [];
  for (const [name, count] of sorted) {
    const slug = normalizeSlug(toAscii(name)) || `category-${mapping.length + 1}`;
    console.log(`  ${name.padEnd(20)} | ${String(count).padStart(4)} | ${slug}`);
    mapping.push({ name, slug, count });
  }

  writeFileSync(OUT, JSON.stringify(mapping, null, 2));
  log.ok(`\n매핑 초안 저장 → ${OUT}`);
  log.warn('한글 카테고리는 자동으로 영문 슬러그가 안 나옵니다. 수동으로 OUT 파일을 수정하세요.');
}

/** 한글이 들어간 이름은 슬러그 생성이 어려우므로 빈 문자열 반환 (사용자 수정 유도). */
function toAscii(s: string): string {
  return /^[\x00-\x7F-]*$/.test(s) ? s : '';
}

main();
