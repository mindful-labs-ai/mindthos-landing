/**
 * enrich-existing.ts — DB 에 이미 published 인 글의 누락 메타 보강
 *
 * 본문은 한 글자도 수정하지 않고 다음 컬럼만 채운다:
 *   - summary (200-400자 "이 글의 핵심" 박스)
 *   - schema_markup (FAQPage JSON-LD)
 *   - meta_title / meta_description / excerpt (SEO)
 *   - reading_time (content.length / 500)
 *   - references (선택, --add-references 플래그 — LLM 위험성 인지)
 *
 * 프롬프트는 .claude/skills/blog-enrich/prompts/{summary,faq,meta,references}.md 재사용.
 *
 * 사용법:
 *   npx tsx scripts/publish-blog/src/enrich-existing.ts                    # 영상 글 전체
 *   npx tsx ... --slug <slug>                                              # 단건
 *   npx tsx ... --limit 10                                                 # 처음 10건만
 *   npx tsx ... --filter video                                             # video_url 있는 글만 (default)
 *   npx tsx ... --filter all                                               # video 무관 전체 published
 *   npx tsx ... --dry-run                                                  # DB UPDATE 안 함, 결과만 출력
 *   npx tsx ... --add-references                                           # references 도 LLM 생성 (위험)
 *   npx tsx ... --skip-summary --skip-faq --skip-meta                      # 개별 단계 스킵
 *   npx tsx ... --model claude-haiku-4-5-20251001                          # 더 싼 모델
 *
 * 필요:
 *   - claude CLI 설치 + 로그인
 *   - web/.env.local 의 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { callClaude, extractJson } from './lib/claude-cli.js';
import { log } from './lib/log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const ENV_PATH = resolve(REPO_ROOT, 'web', '.env.local');
config({ path: ENV_PATH });

const PROMPT_DIR = resolve(REPO_ROOT, '.claude', 'skills', 'blog-enrich', 'prompts');

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
  video_url: string | null;
}

interface FaqPage {
  '@context'?: string;
  '@type'?: string;
  mainEntity?: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

interface MetaResult {
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
}

interface ReferencesResult {
  references: Array<{
    name: string;
    url: string;
    type: 'academic' | 'government' | 'industry';
    description?: string;
  }>;
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

async function generateSummary(
  prompt: string,
  body: string,
  model: string,
): Promise<string | null> {
  const { text } = await callClaude({ prompt, body, model });
  const json = extractJson<{ summary: string | null }>(text);
  return json?.summary ?? null;
}

async function generateFaq(
  prompt: string,
  body: string,
  model: string,
): Promise<FaqPage | null> {
  const { text } = await callClaude({ prompt, body, model });
  const json = extractJson<FaqPage | null>(text);
  if (!json || !json.mainEntity || json.mainEntity.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: json.mainEntity,
  };
}

async function generateMeta(
  prompt: string,
  body: string,
  existing: { meta_title: string | null; meta_description: string | null; excerpt: string | null },
  model: string,
): Promise<MetaResult> {
  const filledPrompt = prompt.replace(
    'EXISTING_PLACEHOLDER',
    JSON.stringify(existing, null, 2),
  );
  const { text } = await callClaude({ prompt: filledPrompt, body, model });
  const json = extractJson<MetaResult>(text);
  return {
    meta_title: json?.meta_title ?? null,
    meta_description: json?.meta_description ?? null,
    excerpt: json?.excerpt ?? null,
  };
}

async function generateReferences(
  prompt: string,
  body: string,
  model: string,
): Promise<ReferencesResult['references']> {
  const { text } = await callClaude({ prompt, body, model });
  const json = extractJson<ReferencesResult>(text);
  if (!json || !Array.isArray(json.references)) return [];
  return json.references.filter(
    (r) => r && r.name && r.url && body.includes(r.url),
  );
}

async function main() {
  const slugFilter = arg('slug');
  const limitRaw = arg('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;
  const filter = (arg('filter') || 'video') as 'video' | 'all';
  const dryRun = hasFlag('dry-run');
  const skipSummary = hasFlag('skip-summary');
  const skipFaq = hasFlag('skip-faq');
  const skipMeta = hasFlag('skip-meta');
  const skipReadingTime = hasFlag('skip-reading-time');
  const addReferences = hasFlag('add-references');
  const model = arg('model') || 'claude-sonnet-4-6';
  const force = hasFlag('force');
  const concurrent = hasFlag('concurrent');

  log.info(
    `enrich-existing — filter=${filter} limit=${limit ?? 'all'} dryRun=${dryRun} model=${model}` +
      (addReferences ? ' +references' : ''),
  );

  const supabase = createSupabase();

  // 대상 글 조회
  let query = supabase
    .from('posts')
    .select(
      'id, slug, title, content, excerpt, summary, schema_markup, meta_title, meta_description, references, reading_time, video_url',
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

  // 이미 다 채워진 글은 force 없이 스킵
  if (!force) {
    targets = targets.filter((p) => {
      const needsSummary = !skipSummary && (!p.summary || !p.summary.trim());
      const needsFaq = !skipFaq && !p.schema_markup;
      const needsMeta =
        !skipMeta && (!p.meta_title || !p.meta_description || !p.excerpt);
      const needsReadingTime = !skipReadingTime && !p.reading_time;
      const needsRefs =
        addReferences && (!Array.isArray(p.references) || p.references.length === 0);
      return needsSummary || needsFaq || needsMeta || needsReadingTime || needsRefs;
    });
  }

  if (limit) targets = targets.slice(0, limit);

  log.info(`대상 ${targets.length}건`);
  if (targets.length === 0) {
    log.ok('처리할 글 없음.');
    return;
  }

  const summaryPrompt = readFileSync(resolve(PROMPT_DIR, 'summary.md'), 'utf-8');
  const faqPrompt = readFileSync(resolve(PROMPT_DIR, 'faq.md'), 'utf-8');
  const metaPrompt = readFileSync(resolve(PROMPT_DIR, 'meta.md'), 'utf-8');
  const referencesPrompt = readFileSync(
    resolve(PROMPT_DIR, 'references.md'),
    'utf-8',
  );

  let summaryDone = 0;
  let faqDone = 0;
  let metaDone = 0;
  let refsDone = 0;
  let timeDone = 0;
  let processed = 0;

  for (const post of targets) {
    processed++;
    log.info(`\n[${processed}/${targets.length}] ${post.slug}`);

    const update: Record<string, any> = {};

    // reading_time — LLM 불필요, 즉시 계산
    if (!skipReadingTime && !post.reading_time) {
      const minutes = Math.max(1, Math.ceil((post.content?.length ?? 0) / 500));
      update.reading_time = minutes;
      timeDone++;
      log.ok(`  reading_time: ${minutes}분`);
    }

    const runSummary = async () => {
      if (skipSummary || (post.summary && post.summary.trim())) return;
      try {
        const summary = await generateSummary(summaryPrompt, post.content, model);
        if (summary && summary.length >= 100 && summary.length <= 600) {
          update.summary = summary;
          summaryDone++;
          log.ok(`  summary: ${summary.length}자`);
        } else {
          log.warn(`  summary: 생성 결과 부적절 (길이 ${summary?.length ?? 0})`);
        }
      } catch (e: any) {
        log.warn(`  summary 실패: ${e.message}`);
      }
    };

    const runFaq = async () => {
      if (skipFaq || post.schema_markup) return;
      try {
        const faq = await generateFaq(faqPrompt, post.content, model);
        if (faq && faq.mainEntity && faq.mainEntity.length >= 2) {
          update.schema_markup = faq;
          faqDone++;
          log.ok(`  faq: ${faq.mainEntity.length}개 질문`);
        } else {
          log.warn('  faq: 적절한 질문 없음 — 스킵');
        }
      } catch (e: any) {
        log.warn(`  faq 실패: ${e.message}`);
      }
    };

    const runMeta = async () => {
      if (
        skipMeta ||
        (post.meta_title && post.meta_description && post.excerpt)
      ) {
        return;
      }
      try {
        const meta = await generateMeta(
          metaPrompt,
          post.content,
          {
            meta_title: post.meta_title,
            meta_description: post.meta_description,
            excerpt: post.excerpt,
          },
          model,
        );
        if (!post.meta_title && meta.meta_title) update.meta_title = meta.meta_title;
        if (!post.meta_description && meta.meta_description) {
          update.meta_description = meta.meta_description;
        }
        if (!post.excerpt && meta.excerpt) update.excerpt = meta.excerpt;
        const filled = ['meta_title', 'meta_description', 'excerpt'].filter(
          (k) => update[k],
        );
        if (filled.length > 0) {
          metaDone++;
          log.ok(`  meta: ${filled.join(', ')}`);
        }
      } catch (e: any) {
        log.warn(`  meta 실패: ${e.message}`);
      }
    };

    if (concurrent) {
      await Promise.all([runSummary(), runFaq(), runMeta()]);
    } else {
      await runSummary();
      await runFaq();
      await runMeta();
    }

    // references (옵트인)
    if (
      addReferences &&
      (!Array.isArray(post.references) || post.references.length === 0)
    ) {
      try {
        const refs = await generateReferences(referencesPrompt, post.content, model);
        if (refs.length > 0) {
          update.references = refs;
          refsDone++;
          log.ok(`  references: ${refs.length}개 (본문 URL 검증 통과)`);
        } else {
          log.warn('  references: 본문에 명시적 인용 없음 — 빈 채로 유지');
        }
      } catch (e: any) {
        log.warn(`  references 실패: ${e.message}`);
      }
    }

    if (Object.keys(update).length === 0) {
      log.warn('  (변경 없음)');
      continue;
    }

    if (dryRun) {
      log.info(`  [dry-run] 업데이트 예정: ${Object.keys(update).join(', ')}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update(update)
      .eq('id', post.id);
    if (updateError) {
      log.warn(`  DB UPDATE 실패: ${updateError.message}`);
    } else {
      log.ok(`  DB UPDATE 완료 (${Object.keys(update).join(', ')})`);
    }
  }

  log.info('\n=== enrich-existing 결과 ===');
  log.info(`  처리 ${processed}건`);
  log.info(`  reading_time: ${timeDone}`);
  log.info(`  summary: ${summaryDone}`);
  log.info(`  faq: ${faqDone}`);
  log.info(`  meta: ${metaDone}`);
  if (addReferences) log.info(`  references: ${refsDone}`);
}

main().catch((err) => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
