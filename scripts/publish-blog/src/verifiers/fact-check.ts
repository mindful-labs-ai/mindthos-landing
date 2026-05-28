/**
 * Stage 3 — Fact-check verifier.
 * 참조: web/docs/aeo-geo-research/ai-review-workflow.md §Stage 3
 *
 * 2-step pipeline:
 *   1) Topic Inference (Gemini Flash) — 본문이 다루는 master doc slug 추론
 *   2) Claim Extract + Compare (Gemini Pro) — 매칭된 master 와 본문 사실 대조
 *
 * 매칭된 master 가 없으면 fact-check 스킵 (pass 처리, mustFix=[]).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { callGeminiJson } from './gemini-client.js';
import {
  loadAllMasterDocs,
  renderMasterDocList,
  renderMasterDocsForPrompt,
} from './master-doc-loader.js';
import type { VerifierInput, VerifierVerdict } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const PROMPTS_DIR = resolve(REPO_ROOT, '.claude', 'skills', 'blog-enrich', 'prompts');
const TOPIC_PROMPT_PATH = resolve(PROMPTS_DIR, 'verify-fact-topics.md');
const COMPARE_PROMPT_PATH = resolve(PROMPTS_DIR, 'verify-fact-compare.md');

const TOPIC_RELEVANCE_THRESHOLD = 0.5;
const MAX_TOPICS_LOADED = 3;

interface TopicInferenceResult {
  topics: Array<{ slug: string; relevance: number; reason?: string }>;
}

interface FactClaim {
  excerpt: string;
  status:
    | 'consistent'
    | 'contradicts'
    | 'ambiguous'
    | 'missing_in_master'
    | 'violates_anti_claim';
  matched_master_section?: string;
  fix?: string | null;
}

interface FactCompareResult {
  claims: FactClaim[];
  mustFix: string[];
  mustBlock: string[];
  notes: string[];
  overallScore: number;
}

function previewBody(body: string, chars = 1500): string {
  return body.length > chars ? body.slice(0, chars) + '\n\n[... 이하 생략 ...]' : body;
}

async function inferTopics(input: VerifierInput): Promise<TopicInferenceResult> {
  const template = readFileSync(TOPIC_PROMPT_PATH, 'utf-8');
  const masterList = renderMasterDocList();

  const prompt = template
    .replace('MASTER_DOC_LIST_PLACEHOLDER', masterList)
    .replace('TITLE_PLACEHOLDER', input.title)
    .replace('KEYWORDS_PLACEHOLDER', (input.keywords ?? []).join(', '))
    .replace('SUMMARY_PLACEHOLDER', input.summary || '(summary 없음)')
    .replace('CONTENT_PREVIEW_PLACEHOLDER', previewBody(input.content));

  const { parsed } = await callGeminiJson<TopicInferenceResult>({
    prompt,
    tier: 'flash',
    temperature: 0.1,
  });

  // 알 수 없는 slug 방어
  const known = new Set(loadAllMasterDocs().map((d) => d.meta.slug));
  const topics = (parsed.topics ?? [])
    .filter((t) => known.has(t.slug) && t.relevance >= TOPIC_RELEVANCE_THRESHOLD)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MAX_TOPICS_LOADED);

  return { topics };
}

async function compareWithMasters(
  input: VerifierInput,
  slugs: string[],
): Promise<{ result: FactCompareResult; model: string }> {
  const template = readFileSync(COMPARE_PROMPT_PATH, 'utf-8');
  const masterDocs = renderMasterDocsForPrompt(slugs);

  const prompt = template
    .replace('TITLE_PLACEHOLDER', input.title)
    .replace('SUMMARY_PLACEHOLDER', input.summary || '(summary 없음)')
    .replace('CONTENT_BODY_PLACEHOLDER', input.content)
    .replace('MASTER_DOCS_PLACEHOLDER', masterDocs);

  // master 본문이 동봉되어 토큰 비교적 큼 (~25K chars).
  // 처음엔 Pro tier 로 설계했으나 gemini-3-pro-preview 가 deprecated 되어 404.
  // Flash 도 1M context 지원이라 master 25K 정도는 충분히 처리. 가격·안정성·속도 모두 우위.
  const { parsed, model } = await callGeminiJson<FactCompareResult>({
    prompt,
    tier: 'flash',
    temperature: 0.1,
  });

  return { result: parsed, model };
}

export async function verifyFactCheck(input: VerifierInput): Promise<VerifierVerdict> {
  const ranAt = new Date().toISOString();

  // 1단계 — 토픽 추론
  let topicResult: TopicInferenceResult;
  try {
    topicResult = await inferTopics(input);
  } catch (err) {
    console.warn(
      `⚠️ fact-check 토픽 추론 실패: ${err instanceof Error ? err.message : String(err)}`,
    );
    return {
      stage: 'fact_check',
      score: 7, // 검수 자체 실패 — 발행 차단할 만한 신호는 아니라 중립 점수
      mustFix: [],
      mustBlock: [],
      notes: ['fact-check 토픽 추론 실패 — 발행은 진행, 운영자 점검 필요'],
      details: { error: err instanceof Error ? err.message : String(err) },
      model: 'gemini-3-flash-preview',
      ranAt,
    };
  }

  const matchedSlugs = topicResult.topics.map((t) => t.slug);

  // 매칭된 master 없음 → fact-check 스킵
  if (matchedSlugs.length === 0) {
    return {
      stage: 'fact_check',
      score: 10,
      mustFix: [],
      mustBlock: [],
      notes: ['관련 master doc 없음 — fact-check 스킵'],
      details: { topics: [], reason: 'no_master_match' },
      model: 'gemini-3-flash-preview',
      ranAt,
    };
  }

  // 2단계 — master 와 대조
  let compare: FactCompareResult;
  let model: string;
  try {
    const out = await compareWithMasters(input, matchedSlugs);
    compare = out.result;
    model = out.model;
  } catch (err) {
    console.warn(
      `⚠️ fact-check 대조 실패: ${err instanceof Error ? err.message : String(err)}`,
    );
    return {
      stage: 'fact_check',
      score: 7,
      mustFix: [],
      mustBlock: [],
      notes: [
        `fact-check 대조 단계 실패 (topics=${matchedSlugs.join(', ')}) — 발행은 진행, 운영자 점검 필요`,
      ],
      details: {
        topics: topicResult.topics,
        error: err instanceof Error ? err.message : String(err),
      },
      model: 'gemini-3-pro-preview',
      ranAt,
    };
  }

  const score = typeof compare.overallScore === 'number' ? compare.overallScore : 7;
  const mustFix = Array.isArray(compare.mustFix) ? compare.mustFix : [];
  const mustBlock = Array.isArray(compare.mustBlock) ? compare.mustBlock : [];
  const notes = Array.isArray(compare.notes) ? compare.notes : [];

  // violates_anti_claim 이 있는데 mustBlock 비어있다면 안전망으로 자동 채움
  for (const c of compare.claims ?? []) {
    if (c.status === 'violates_anti_claim') {
      const tag = `[violates_anti_claim] ${c.excerpt}`;
      if (!mustBlock.some((b) => b.includes(c.excerpt))) {
        mustBlock.push(tag);
      }
    }
  }

  return {
    stage: 'fact_check',
    score,
    mustFix,
    mustBlock,
    notes,
    details: {
      topics: topicResult.topics,
      masters_consulted: matchedSlugs,
      claims: compare.claims ?? [],
    },
    model,
    ranAt,
  };
}

/**
 * publish.ts 가 posts.fact_check_topics 컬럼 채울 때 사용.
 * fact_check stage 의 details.masters_consulted 에서 slug 배열 추출.
 */
export function extractMastersConsulted(verdict: VerifierVerdict): string[] {
  if (verdict.stage !== 'fact_check') return [];
  const masters = (verdict.details as any)?.masters_consulted;
  return Array.isArray(masters) ? masters : [];
}
