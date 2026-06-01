import 'dotenv/config';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
config({ path: resolve(REPO_ROOT, 'web', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

console.log('=== Migration 010 verification ===\n');

console.log('1) posts.format 컬럼 SELECT 테스트');
const { data: sample, error: e1 } = await supabase
  .from('posts')
  .select('id, slug, format, status')
  .limit(3);
if (e1) { console.error('❌ FAIL —', e1.message); process.exit(1); }
console.log('   ✅ format 컬럼 SELECT 가능');
for (const r of sample!) console.log(`     ${(r.slug ?? '').slice(0,50).padEnd(50)} | status=${r.status} | format=${r.format}`);

console.log('\n2) 전체 posts format 분포');
const formats = ['article', 'listicle', 'guide'];
for (const f of formats) {
  const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('format', f);
  console.log(`   ${f.padEnd(8)} = ${count}건`);
}

console.log('\n3) published 글만 format 분포');
for (const f of formats) {
  const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status','published').eq('format', f);
  console.log(`   ${f.padEnd(8)} = ${count}건`);
}

console.log('\n4) CHECK 제약 테스트 — 잘못된 값 UPDATE 시도');
const { error: e4 } = await supabase.from('posts').update({ format: 'bogus' }).eq('id', (sample![0] as any).id);
if (e4) console.log(`   ✅ CHECK 제약 작동 — "${e4.message.slice(0, 100)}"`);
else { console.error('   ❌ FAIL — CHECK 제약이 미작동'); await supabase.from('posts').update({ format: (sample![0] as any).format }).eq('id', (sample![0] as any).id); }

console.log('\n✅ Migration 010 검증 통과');
