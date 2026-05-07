import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { callClaude, extractJson } from './lib/claude-cli.js';
import { log } from './lib/log.js';
import type { TransformedPost } from './4-transform.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS = resolve(__dirname, '..', '.data', 'posts.json');
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const PROMPT_DIR = resolve(REPO_ROOT, '.claude', 'skills', 'blog-enrich', 'prompts');

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const v = process.argv.find((a) => a.startsWith(prefix));
  return v?.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
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

async function main() {
  const slugFilter = arg('slug');
  const categoryFilter = arg('category');
  const limitRaw = arg('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;
  const skipSummary = hasFlag('skip-summary');
  const skipFaq = hasFlag('skip-faq');
  const force = hasFlag('force');
  const concurrent = hasFlag('concurrent');

  const posts: TransformedPost[] = JSON.parse(readFileSync(POSTS, 'utf-8'));
  let targets = posts.filter((p) => {
    if (slugFilter) return p.slug === slugFilter;
    if (categoryFilter) return p.category_slug === categoryFilter;
    return true;
  });

  // resume 친화 — 이미 enriched 인 글은 우선순위 낮춤 (force 없을 때)
  if (!force) {
    const remaining = targets.filter(
      (p) =>
        (!skipSummary && (!p.summary || !p.summary.trim().length)) ||
        (!skipFaq && !p.schema_markup)
    );
    log.info(
      `대상 ${targets.length}건 중 미처리 ${remaining.length}건 (skip ${targets.length - remaining.length})`
    );
    targets = remaining;
  }
  if (limit) targets = targets.slice(0, limit);

  if (targets.length === 0) {
    log.ok('처리할 글 없음 (모두 enrich 완료).');
    return;
  }

  const summaryPrompt = readFileSync(resolve(PROMPT_DIR, 'summary.md'), 'utf-8');
  const faqPrompt = readFileSync(resolve(PROMPT_DIR, 'faq.md'), 'utf-8');

  let totalCost = 0;
  let summaryDone = 0;
  let faqDone = 0;
  let processed = 0;

  // posts.json 의 slug→index 맵 (전체 array). 각 글 처리 후 즉시 저장 위해.
  const indexBySlug = new Map(posts.map((p, i) => [p.slug, i]));

  async function runSummary(post: TransformedPost) {
    if (skipSummary || (!force && post.summary && post.summary.trim().length > 0)) return;
    try {
      const r = await callClaude({ prompt: summaryPrompt, body: post.content });
      totalCost += r.costUsd ?? 0;
      const parsed = extractJson<{ summary: string | null }>(r.text);
      if (parsed && typeof parsed.summary === 'string') {
        post.summary = parsed.summary;
        summaryDone += 1;
        log.ok(`  ${post.slug} summary ${post.summary.length}자 (${r.durationMs}ms)`);
      } else {
        log.warn(`  ${post.slug} summary 응답 형식 이상`);
      }
    } catch (e) {
      log.warn(`  ${post.slug} summary 실패: ${(e as Error).message}`);
    }
  }

  async function runFaq(post: TransformedPost) {
    if (skipFaq || (!force && post.schema_markup)) return;
    try {
      const r = await callClaude({ prompt: faqPrompt, body: post.content });
      totalCost += r.costUsd ?? 0;
      const parsed = extractJson<FaqPage | null>(r.text);
      if (parsed && parsed['@type'] === 'FAQPage' && Array.isArray(parsed.mainEntity)) {
        post.schema_markup = parsed as Record<string, unknown>;
        faqDone += 1;
        log.ok(`  ${post.slug} FAQ ${parsed.mainEntity.length}개 (${r.durationMs}ms)`);
      } else if (parsed === null) {
        log.info(`  ${post.slug} FAQ 추출 없음`);
      } else {
        log.warn(`  ${post.slug} FAQ 응답 형식 이상`);
      }
    } catch (e) {
      log.warn(`  ${post.slug} FAQ 실패: ${(e as Error).message}`);
    }
  }

  log.step(`enrich 시작 — ${targets.length}건`);

  for (const target of targets) {
    const idx = indexBySlug.get(target.slug)!;
    const post = posts[idx];

    if (concurrent) {
      await Promise.all([runSummary(post), runFaq(post)]);
    } else {
      await runSummary(post);
      await runFaq(post);
    }

    processed += 1;
    // 글 1건마다 posts.json 즉시 저장 — 중간 중단 시 진행 보존
    writeFileSync(POSTS, JSON.stringify(posts, null, 2));
    if (processed % 5 === 0) {
      log.info(
        `진행 ${processed}/${targets.length} (summary ${summaryDone}, FAQ ${faqDone})`
      );
    }
  }

  log.ok(
    `enrich 완료 — summary ${summaryDone}건, FAQ ${faqDone}건, 총 비용(API 환산) $${totalCost.toFixed(4)}`
  );
}

main().catch((err) => {
  log.error(String(err?.message ?? err));
  process.exit(1);
});
