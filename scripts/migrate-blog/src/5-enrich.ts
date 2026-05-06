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
  const skipSummary = hasFlag('skip-summary');
  const skipFaq = hasFlag('skip-faq');
  const force = hasFlag('force');

  const posts: TransformedPost[] = JSON.parse(readFileSync(POSTS, 'utf-8'));
  const targets = slugFilter
    ? posts.filter((p) => p.slug === slugFilter)
    : posts;

  if (targets.length === 0) {
    log.error(slugFilter ? `slug "${slugFilter}" 없음` : 'posts.json 비어있음');
    process.exit(1);
  }

  const summaryPrompt = readFileSync(resolve(PROMPT_DIR, 'summary.md'), 'utf-8');
  const faqPrompt = readFileSync(resolve(PROMPT_DIR, 'faq.md'), 'utf-8');

  let totalCost = 0;
  let summaryDone = 0;
  let faqDone = 0;

  for (const post of targets) {
    log.step(`enrich ${post.slug}`);

    if (!skipSummary && (force || !post.summary || post.summary.trim().length === 0)) {
      try {
        const r = await callClaude({ prompt: summaryPrompt, body: post.content });
        totalCost += r.costUsd ?? 0;
        const parsed = extractJson<{ summary: string | null }>(r.text);
        if (parsed && typeof parsed.summary === 'string') {
          post.summary = parsed.summary;
          summaryDone += 1;
          log.ok(
            `summary ${post.summary.length}자 ($${(r.costUsd ?? 0).toFixed(4)}, ${r.durationMs}ms)`
          );
        } else {
          log.warn('summary 응답이 의도된 형식 아님');
        }
      } catch (e) {
        log.warn(`summary 호출 실패: ${(e as Error).message}`);
      }
    } else {
      log.info('summary 이미 있음 — skip');
    }

    if (!skipFaq && (force || !post.schema_markup)) {
      try {
        const r = await callClaude({ prompt: faqPrompt, body: post.content });
        totalCost += r.costUsd ?? 0;
        const parsed = extractJson<FaqPage | null>(r.text);
        if (parsed && parsed['@type'] === 'FAQPage' && Array.isArray(parsed.mainEntity)) {
          post.schema_markup = parsed as Record<string, unknown>;
          faqDone += 1;
          log.ok(
            `FAQ ${parsed.mainEntity.length}개 ($${(r.costUsd ?? 0).toFixed(4)}, ${r.durationMs}ms)`
          );
        } else if (parsed === null) {
          log.info('FAQ 추출 결과 없음');
        } else {
          log.warn('FAQ 응답이 FAQPage 형식 아님');
        }
      } catch (e) {
        log.warn(`FAQ 호출 실패: ${(e as Error).message}`);
      }
    } else {
      log.info('schema_markup 이미 있음 — skip');
    }
  }

  writeFileSync(POSTS, JSON.stringify(posts, null, 2));
  log.ok(
    `enrich 완료 — summary ${summaryDone}건, FAQ ${faqDone}건, 총 비용 $${totalCost.toFixed(4)}`
  );
}

main().catch((err) => {
  log.error(String(err?.message ?? err));
  process.exit(1);
});
