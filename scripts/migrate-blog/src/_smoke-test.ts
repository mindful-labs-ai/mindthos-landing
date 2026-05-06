/**
 * Smoke test — 캐시된 baserow JSON 의 1번 row 를 변환해 markdown 결과를 출력.
 * .env 없이 동작해야 하므로 STORAGE_PUBLIC_PREFIX 만 환경 변수에서 읽는다.
 *
 * 사용:
 *   1) 외부에서 BASEROW row 1개를 .data/sample-row.json 으로 저장
 *   2) NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co npx tsx src/_smoke-test.ts
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToMarkdown } from './lib/html-to-md.js';
import { buildReferences, splitKeywords, normalizeSlug } from './lib/normalize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = resolve(__dirname, '..', '.data', 'sample-row.json');

const row = JSON.parse(readFileSync(PATH, 'utf-8'));
const html = row['body-result-first'] as string;

console.log('━━━ INPUT ━━━');
console.log('id:', row.ID);
console.log('Name:', row.Name);
console.log('slug (raw → normalized):', row.slug, '→', normalizeSlug(row.slug));
console.log('thumbnail:', row.thumbnail);
console.log('Category:', row.Category);
console.log('keyword:', row.keyword);
console.log('outlinks:', [1, 2, 3].map((i) => row[`outlink-${i}`]).filter(Boolean));
console.log('HTML length:', html.length);

console.log('\n━━━ MARKDOWN OUTPUT ━━━');
const md = htmlToMarkdown(html);
console.log(md);

console.log('\n━━━ DERIVED ━━━');
console.log('keywords:', splitKeywords(row.keyword));
console.log('references:', JSON.stringify(buildReferences(row), null, 2));
console.log('\nMD length:', md.length);
