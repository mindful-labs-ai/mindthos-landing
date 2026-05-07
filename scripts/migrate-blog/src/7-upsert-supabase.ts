import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServiceClient } from './lib/supabase.js';
import type { TransformedPost } from './4-transform.js';
import { log } from './lib/log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', '.data', 'posts.json');

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const v = process.argv.find((a) => a.startsWith(prefix));
  return v?.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const slugFilter = arg('slug');
  const dryRun = hasFlag('dry-run');

  log.step(
    `${dryRun ? '[DRY RUN] ' : ''}Supabase upsert${slugFilter ? ` (--slug=${slugFilter})` : ''}`
  );

  const all: TransformedPost[] = JSON.parse(readFileSync(SRC, 'utf-8'));
  const targets = slugFilter ? all.filter((p) => p.slug === slugFilter) : all;

  if (targets.length === 0) {
    log.error(
      slugFilter
        ? `slug "${slugFilter}" 가 posts.json 에 없습니다.`
        : 'posts.json 이 비어있습니다.'
    );
    process.exit(1);
  }

  const supabase = createServiceClient();

  // 1. category_slug → category_id 매핑
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, slug');
  if (catErr) throw catErr;
  const catMap = new Map((cats || []).map((c) => [c.slug, c.id]));

  // 2. author_slug → author_id 매핑
  const { data: authors, error: authErr } = await supabase
    .from('authors')
    .select('id, slug');
  if (authErr) throw authErr;
  const authorMap = new Map((authors || []).map((a) => [a.slug, a.id]));

  // 3. 검증
  const missing: string[] = [];
  for (const p of targets) {
    if (!catMap.has(p.category_slug))
      missing.push(`  category "${p.category_slug}" 미존재 (slug=${p.slug})`);
    if (!authorMap.has(p.author_slug))
      missing.push(`  author "${p.author_slug}" 미존재 (slug=${p.slug})`);
  }
  if (missing.length) {
    log.error('상위 매핑 누락 — 003/004 마이그레이션을 먼저 적용했는지 확인:');
    missing.slice(0, 20).forEach((m) => console.log(m));
    process.exit(1);
  }

  // 4. upsert payload 만들기
  const payloads = targets.map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    summary: p.summary,
    keywords: p.keywords,
    category_id: catMap.get(p.category_slug)!,
    thumbnail_url: p.thumbnail_url,
    author_id: authorMap.get(p.author_slug)!,
    status: 'published',
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    og_image_url: p.og_image_url,
    schema_markup: p.schema_markup,
    references: p.references,
    cta_type: p.cta_type,
    reading_time: p.reading_time,
    is_featured: p.is_featured,
    published_at: p.published_at,
    updated_at: p.updated_at,
  }));

  if (dryRun) {
    log.info(`${payloads.length} posts 가 upsert 됩니다 (DRY RUN, DB 변경 없음).`);
    for (const p of payloads.slice(0, 5)) {
      console.log(
        `  - ${p.slug} (cat=${p.category_id.slice(0, 8)}, ${p.content.length}자, published_at=${p.published_at})`
      );
    }
    if (payloads.length > 5) console.log(`  ... +${payloads.length - 5} more`);
    return;
  }

  // 5. 배치 upsert (50건씩)
  const BATCH = 50;
  let done = 0;
  for (let i = 0; i < payloads.length; i += BATCH) {
    const batch = payloads.slice(i, i + BATCH);
    const { error } = await supabase
      .from('posts')
      .upsert(batch, { onConflict: 'slug' });
    if (error) {
      log.error(`배치 ${i}-${i + batch.length} 실패: ${error.message}`);
      console.error(error);
      process.exit(1);
    }
    done += batch.length;
    log.info(`upserted ${done}/${payloads.length}`);
  }

  log.ok(`완료: ${done} posts upserted`);
  log.info(
    '캐시 갱신 — POST /api/revalidate 와 /api/indexnow 호출은 별도 운영 작업.'
  );
}

main().catch((err) => {
  log.error(String(err?.message ?? err));
  process.exit(1);
});
