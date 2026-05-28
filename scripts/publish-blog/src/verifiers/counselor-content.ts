/**
 * Stage 4 — 상담 전문성·정합성 검증 verifier.
 * 참조: web/docs/aeo-geo-research/ai-review-workflow.md §Stage 4
 *       .claude/skills/blog-enrich/prompts/verify-counselor-content.md
 *
 * 환자 대상 의료 정보가 아닌 상담사 대상 B2B SaaS 콘텐츠 검증.
 * 의료광고법 평가는 ❌, 자격·정책·윤리·위기 대응 정확성·최신성 평가.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { callGeminiJson } from './gemini-client.js';
import type { VerifierInput, VerifierVerdict } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const PROMPT_PATH = resolve(
  REPO_ROOT,
  '.claude',
  'skills',
  'blog-enrich',
  'prompts',
  'verify-counselor-content.md',
);

interface CounselorRawVerdict {
  scopeOfPractice: Array<{ excerpt: string; issue: string; fix: string }>;
  counselingEthics: Array<{ excerpt: string; issue: string; fix: string }>;
  crisisResponseGap: Array<{ excerpt: string; issue: string; fix: string }>;
  regulationCurrency: Array<{ excerpt: string; issue: string; fix: string }>;
  credentialAccuracy: Array<{ excerpt: string; issue: string; fix: string }>;
  professionalLanguage: Array<{ excerpt: string; issue: string; fix: string }>;
  outdatedStatistics: Array<{ excerpt: string; issue: string; fix: string }>;
  unsafeAdvice: Array<{ excerpt: string; issue: string; fix: string }>;
  mustFix: string[];
  mustBlock: string[];
  overallScore: number;
}

export async function verifyCounselorContent(
  input: VerifierInput,
): Promise<VerifierVerdict> {
  const template = readFileSync(PROMPT_PATH, 'utf-8');
  const refsText =
    input.references && input.references.length > 0
      ? input.references
          .map((r) => `- ${r.name} (${r.url})${r.type ? ` [${r.type}]` : ''}`)
          .join('\n')
      : '(references 없음)';

  const prompt = template
    .replace('TITLE_PLACEHOLDER', input.title)
    .replace('CATEGORY_PLACEHOLDER', input.category || '(unspecified)')
    .replace('SUMMARY_PLACEHOLDER', input.summary || '(summary 없음)')
    .replace('CONTENT_BODY_PLACEHOLDER', input.content)
    .replace('REFERENCES_PLACEHOLDER', refsText);

  const { parsed, model } = await callGeminiJson<CounselorRawVerdict>({
    prompt,
    tier: 'flash',
    temperature: 0.2,
  });

  const score = typeof parsed.overallScore === 'number' ? parsed.overallScore : 0;
  const mustFix = Array.isArray(parsed.mustFix) ? parsed.mustFix : [];
  const mustBlock = Array.isArray(parsed.mustBlock) ? parsed.mustBlock : [];

  // unsafeAdvice 가 있는데 mustBlock 이 비어있다면 자동 채움 (안전망)
  const unsafe = Array.isArray(parsed.unsafeAdvice) ? parsed.unsafeAdvice : [];
  if (unsafe.length > 0 && mustBlock.length === 0) {
    for (const u of unsafe) {
      mustBlock.push(`[unsafeAdvice] ${u.issue}`);
    }
  }

  // outdatedStatistics 5년 초과는 notes 로
  const notes: string[] = [];
  const outdated = Array.isArray(parsed.outdatedStatistics)
    ? parsed.outdatedStatistics
    : [];
  for (const o of outdated) {
    // 출처 불명은 verifier 가 이미 mustFix 에 넣었다고 가정 — 여기는 informational only
    notes.push(`[outdatedStatistics] ${o.issue}`);
  }

  return {
    stage: 'counselor_content',
    score,
    mustFix,
    mustBlock,
    notes,
    details: parsed as unknown as Record<string, unknown>,
    model,
    ranAt: new Date().toISOString(),
  };
}
