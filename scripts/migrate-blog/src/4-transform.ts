import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BaserowRow } from './lib/baserow.js';
import {
  buildReferences,
  splitKeywords,
  normalizeSlug,
  truncate,
  readingTimeMinutes,
} from './lib/normalize.js';
import { htmlToMarkdown, resolveImageSrc } from './lib/html-to-md.js';
import { STORAGE_PUBLIC_PREFIX } from './lib/supabase.js';
import { log } from './lib/log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_BASEROW = resolve(__dirname, '..', '.data', 'baserow-all.json');
const SRC_DATES = resolve(__dirname, '..', '.data', 'webflow-dates.json');
const SRC_CATEGORIES = resolve(__dirname, '..', '.data', 'categories-mapping.json');
const OUT = resolve(__dirname, '..', '.data', 'posts.json');

interface CategoryMappingEntry {
  name: string;
  slug: string;
  count: number;
}

export interface TransformedPost {
  // posts insert 형식
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  summary: string | null;
  keywords: string[];
  category_slug: string; // upsert 단계에서 id 로 변환
  thumbnail_url: string | null;
  author_slug: string; // 'mindthos'
  status: 'published';
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  schema_markup: Record<string, unknown> | null;
  references: Array<{ name: string; url: string; type: string }>;
  cta_type: string;
  reading_time: number;
  is_featured: boolean;
  published_at: string;
  updated_at: string;
  // 추적용
  _baserow_id: number;
  _baserow_category: string;
}

interface TransformReport {
  total: number;
  ok: number;
  skipped: Array<{ id: number; slug: string | null; reason: string }>;
}

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const v = process.argv.find((a) => a.startsWith(prefix));
  return v?.slice(prefix.length);
}

function main() {
  const slugFilter = arg('slug');

  log.step(
    slugFilter
      ? `1개 글 변환 (--slug=${slugFilter})`
      : 'Baserow → Supabase posts 일괄 변환'
  );

  const rows: BaserowRow[] = JSON.parse(readFileSync(SRC_BASEROW, 'utf-8'));

  let dateMap: Record<string, string> = {};
  try {
    dateMap = JSON.parse(readFileSync(SRC_DATES, 'utf-8'));
  } catch {
    log.warn(
      'webflow-dates.json 이 없습니다 — published_at 은 Baserow Last Modified Time 폴백.'
    );
  }

  let catMap: CategoryMappingEntry[] = [];
  try {
    catMap = JSON.parse(readFileSync(SRC_CATEGORIES, 'utf-8'));
  } catch {
    log.warn('categories-mapping.json 이 없습니다 — 사용자 검토가 필요합니다.');
  }
  const catNameToSlug = new Map(catMap.map((c) => [c.name, c.slug]));

  const out: TransformedPost[] = [];
  const report: TransformReport = { total: 0, ok: 0, skipped: [] };

  for (const row of rows) {
    report.total += 1;

    const rawSlug = row.slug?.trim();
    if (!rawSlug) {
      report.skipped.push({ id: row.ID, slug: null, reason: 'no slug' });
      continue;
    }
    const slug = normalizeSlug(rawSlug);
    if (slugFilter && slug !== slugFilter) continue;

    const html = row['body-result-first']?.trim();
    if (!html) {
      report.skipped.push({ id: row.ID, slug, reason: 'empty body-result-first' });
      continue;
    }

    const title = (row.Name || '').trim();
    if (!title) {
      report.skipped.push({ id: row.ID, slug, reason: 'no title' });
      continue;
    }

    let content: string;
    try {
      content = htmlToMarkdown(html);
    } catch (err) {
      report.skipped.push({
        id: row.ID,
        slug,
        reason: `html→md failed: ${(err as Error).message}`,
      });
      continue;
    }

    const baserowCat = (row.Category || '').trim();
    const categorySlug = catNameToSlug.get(baserowCat);
    if (!categorySlug) {
      report.skipped.push({
        id: row.ID,
        slug,
        reason: `category mapping 없음: "${baserowCat}"`,
      });
      continue;
    }

    const thumbUrl = row.thumbnail
      ? resolveImageSrc(row.thumbnail.replace(/^\/+/, ''))
      : null;

    const excerpt = truncate(row['short-discription']?.trim() || null, 155);
    const metaDescription = excerpt;
    const metaTitle = truncate(title, 60);
    const keywords = splitKeywords(row.keyword);
    const references = buildReferences(row);

    const publishedAt =
      dateMap[slug] ||
      dateMap[rawSlug] ||
      row['Last Modified Time'] ||
      new Date().toISOString();
    const updatedAt = row['Last Modified Time'] || publishedAt;

    out.push({
      title,
      slug,
      excerpt,
      content,
      summary: null, // Phase 4 enrich 단계에서 채움 (선택)
      keywords,
      category_slug: categorySlug,
      thumbnail_url: thumbUrl,
      author_slug: 'mindthos',
      status: 'published',
      meta_title: metaTitle,
      meta_description: metaDescription,
      og_image_url: thumbUrl, // OG 별도 미보유 → thumbnail 폴백
      schema_markup: null,
      references,
      cta_type: 'free-trial',
      reading_time: readingTimeMinutes(content),
      is_featured: false,
      published_at: publishedAt,
      updated_at: updatedAt,
      _baserow_id: row.ID,
      _baserow_category: baserowCat,
    });
    report.ok += 1;
  }

  writeFileSync(OUT, JSON.stringify(out, null, 2));
  log.ok(`변환 완료: ${report.ok}/${report.total} → ${OUT}`);
  if (report.skipped.length) {
    log.warn(`skipped ${report.skipped.length} rows:`);
    for (const s of report.skipped.slice(0, 20)) {
      console.log(`  - id=${s.id} slug=${s.slug ?? '(none)'} :: ${s.reason}`);
    }
    if (report.skipped.length > 20) {
      console.log(`  ... +${report.skipped.length - 20} more`);
    }
  }

  console.log(`\nStorage prefix: ${STORAGE_PUBLIC_PREFIX}`);
}

main();
