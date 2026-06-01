/**
 * refine-existing.ts — 영상 발행 70편을 마음토스 표준 스타일로 다듬어 재발행
 *
 * enrich-existing.ts 와 다른 점: 본문 자체를 다듬어 다시 쓰고, summary/FAQ/references/meta
 * 모두 새로 생성한다. 본문 사실·통계·인용은 절대 변경하지 않는다는 가드레일을 prompt 에 명시.
 *
 * 안전장치:
 *   - 모든 원본 row 를 .data/refine-backup-{timestamp}.json 에 백업 (DB UPDATE 전 항상)
 *   - 단일 LLM 호출 — 섹션 마커(===CONTENT=== 등) 출력으로 JSON 파싱 실패 회피
 *   - 파싱 실패한 글은 DB 변경 없이 스킵
 *
 * 사용법:
 *   npx tsx scripts/publish-blog/src/refine-existing.ts --slug <slug>           # 단건
 *   npx tsx ... --limit 5 --dry-run                                             # smoke test
 *   npx tsx ... --concurrent                                                    # (불필요 — 단일 호출)
 *   npx tsx ... --model claude-opus-4-7                                         # 더 좋은 모델
 *
 * 기본 모델: claude-sonnet-4-6
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { callClaude } from './lib/claude-cli.js';
import { log } from './lib/log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const ENV_PATH = resolve(REPO_ROOT, 'web', '.env.local');
config({ path: ENV_PATH });

const PROMPT_PATH = resolve(
  REPO_ROOT,
  '.claude',
  'skills',
  'blog-enrich',
  'prompts',
  'refine.md',
);
const BACKUP_DIR = resolve(__dirname, '..', '.data');

interface PostRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  summary: string | null;
  schema_markup: any | null;
  meta_title: string | null;
  meta_description: string | null;
  references: any | null;
  reading_time: number | null;
  keywords: string[] | null;
  video_url: string | null;
}

interface RefinedPackage {
  content: string;
  summary: string;
  faq: Array<{ question: string; answer: string }>;
  references: Array<{
    name: string;
    url: string;
    type: 'academic' | 'government' | 'industry';
    description?: string;
  }>;
  meta: {
    meta_title: string;
    meta_description: string;
    excerpt: string;
    keywords: string[];
  };
}

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = process.argv.find((a) => a.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1];
  }
  return undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(`❌ Supabase 환경변수 누락 (${ENV_PATH})`);
    process.exit(1);
  }
  return createClient(url, key);
}

/** 마커로 구분된 LLM 응답을 5개 섹션으로 분해. */
function parseRefinedOutput(raw: string): RefinedPackage | null {
  const text = raw.trim();
  const sections = ['CONTENT', 'SUMMARY', 'FAQ', 'REFERENCES', 'META'] as const;
  const out: Partial<Record<(typeof sections)[number], string>> = {};

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const startMarker = `===${sec}===`;
    const startIdx = text.indexOf(startMarker);
    if (startIdx < 0) {
      log.warn(`  parse: ${sec} 마커 없음`);
      return null;
    }
    const contentStart = startIdx + startMarker.length;
    // 다음 마커 찾기
    let nextIdx = text.length;
    for (let j = i + 1; j < sections.length; j++) {
      const next = text.indexOf(`===${sections[j]}===`, contentStart);
      if (next >= 0 && next < nextIdx) nextIdx = next;
    }
    out[sec] = text.slice(contentStart, nextIdx).trim();
  }

  try {
    const faq = JSON.parse(out.FAQ ?? '[]');
    const references = JSON.parse(out.REFERENCES ?? '[]');
    const meta = JSON.parse(out.META ?? '{}');
    if (!out.CONTENT || !out.SUMMARY) {
      log.warn('  parse: CONTENT 또는 SUMMARY 빔');
      return null;
    }
    return {
      content: out.CONTENT,
      summary: out.SUMMARY,
      faq: Array.isArray(faq) ? faq : [],
      references: Array.isArray(references) ? references : [],
      meta: {
        meta_title: meta?.meta_title ?? '',
        meta_description: meta?.meta_description ?? '',
        excerpt: meta?.excerpt ?? '',
        keywords: Array.isArray(meta?.keywords) ? meta.keywords : [],
      },
    };
  } catch (e: any) {
    log.warn(`  parse: JSON 섹션 실패 — ${e.message}`);
    return null;
  }
}

/** 스타일 레퍼런스 글 2편을 가져와 prompt 임베드용 발췌 문자열 생성. */
async function buildReferenceExcerpts(supabase: any): Promise<string> {
  const refSlugs = [
    'counseling-questions-verbatim-power',
    'counselor-role-healthy-divorce',
  ];
  const { data } = await supabase
    .from('posts')
    .select('slug, title, content, summary')
    .in('slug', refSlugs);

  if (!data || data.length === 0) {
    return '(레퍼런스 글 없음 — 일반적인 마음토스 톤으로 다듬어 주세요)';
  }

  const blocks: string[] = [];
  for (const p of data) {
    const opening = (p.content || '').slice(0, 1500);
    const summary = p.summary || '(요약 없음)';
    blocks.push(
      `### 레퍼런스 — ${p.title}\n\n[summary 박스]\n${summary}\n\n[본문 도입]\n${opening}\n`,
    );
  }
  return blocks.join('\n---\n\n');
}

async function refineOne(
  post: PostRow,
  promptTemplate: string,
  refExcerpts: string,
  model: string,
): Promise<RefinedPackage | null> {
  const filled = promptTemplate
    .replace('REFERENCE_EXCERPTS_PLACEHOLDER', refExcerpts)
    .replace('TITLE_PLACEHOLDER', `TITLE: ${post.title}`)
    .replace('ORIGINAL_BODY_PLACEHOLDER', post.content);

  const { text } = await callClaude({ prompt: filled, body: '', model });
  return parseRefinedOutput(text);
}

async function main() {
  const slugFilter = arg('slug');
  const limitRaw = arg('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;
  const filter = (arg('filter') || 'video') as 'video' | 'all';
  const dryRun = hasFlag('dry-run');
  const model = arg('model') || 'claude-sonnet-4-6';
  const noBackup = hasFlag('no-backup');

  log.info(
    `refine-existing — filter=${filter} limit=${limit ?? 'all'} slug=${slugFilter ?? 'any'} dryRun=${dryRun} model=${model}`,
  );

  const supabase = createSupabase();
  const promptTemplate = readFileSync(PROMPT_PATH, 'utf-8');
  const refExcerpts = await buildReferenceExcerpts(supabase);
  log.info(`스타일 레퍼런스 발췌 ${refExcerpts.length}자`);

  let query = supabase
    .from('posts')
    .select(
      'id, slug, title, content, excerpt, summary, schema_markup, meta_title, meta_description, references, reading_time, keywords, video_url',
    )
    .eq('status', 'published');

  if (filter === 'video') query = query.not('video_url', 'is', null);
  if (slugFilter) query = query.eq('slug', slugFilter);

  const { data, error } = await query.order('published_at', { ascending: false });
  if (error) {
    console.error('❌ 글 조회 실패:', error.message);
    process.exit(1);
  }

  let targets = (data ?? []) as PostRow[];
  if (limit) targets = targets.slice(0, limit);

  log.info(`대상 ${targets.length}건`);
  if (targets.length === 0) {
    log.ok('처리할 글 없음.');
    return;
  }

  // 백업 — DB UPDATE 전 항상
  if (!noBackup && !dryRun) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = resolve(BACKUP_DIR, `refine-backup-${ts}.json`);
    writeFileSync(
      backupPath,
      JSON.stringify(
        {
          created_at: new Date().toISOString(),
          target_count: targets.length,
          model,
          filter,
          slug_filter: slugFilter ?? null,
          posts: targets,
        },
        null,
        2,
      ),
      'utf-8',
    );
    log.ok(`백업 완료: ${backupPath}`);
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const post of targets) {
    processed++;
    log.info(`\n[${processed}/${targets.length}] ${post.slug} (${post.content.length}자)`);

    let pkg: RefinedPackage | null = null;
    try {
      pkg = await refineOne(post, promptTemplate, refExcerpts, model);
    } catch (e: any) {
      log.warn(`  LLM 실패: ${e.message}`);
      failed++;
      continue;
    }

    if (!pkg) {
      log.warn('  파싱 실패 — 스킵');
      failed++;
      continue;
    }

    log.ok(
      `  generated: content ${pkg.content.length}자 / summary ${pkg.summary.length}자 / faq ${pkg.faq.length} / refs ${pkg.references.length}`,
    );

    const faqSchema = pkg.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: pkg.faq.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

    const readingTime = Math.max(1, Math.ceil(pkg.content.length / 500));

    const update: Record<string, any> = {
      content: pkg.content,
      summary: pkg.summary,
      excerpt: pkg.meta.excerpt || post.excerpt,
      meta_title: pkg.meta.meta_title || post.meta_title,
      meta_description: pkg.meta.meta_description || post.meta_description,
      keywords: pkg.meta.keywords.length > 0 ? pkg.meta.keywords : post.keywords,
      schema_markup: faqSchema,
      references: pkg.references,
      reading_time: readingTime,
    };

    if (dryRun) {
      log.info(
        `  [dry-run] 업데이트 예정: ${Object.keys(update).join(', ')}`,
      );
      // 첫 글만 본문 미리보기 출력
      if (processed === 1) {
        console.log('\n--- CONTENT preview (앞 800자) ---');
        console.log(pkg.content.slice(0, 800));
        console.log('--- /preview ---\n');
      }
      succeeded++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update(update)
      .eq('id', post.id);
    if (updateError) {
      log.warn(`  DB UPDATE 실패: ${updateError.message}`);
      failed++;
    } else {
      log.ok(`  DB UPDATE 완료`);
      succeeded++;
    }
  }

  log.info('\n=== refine-existing 결과 ===');
  log.info(`  처리 ${processed}건 / 성공 ${succeeded} / 실패 ${failed}`);
  if (!dryRun && succeeded > 0) {
    log.info('  → 사이트 반영을 위해 revalidate API 호출 또는 Vercel 재배포 필요');
  }
}

main().catch((err) => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
