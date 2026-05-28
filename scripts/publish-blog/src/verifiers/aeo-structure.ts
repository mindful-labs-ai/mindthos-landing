/**
 * Stage 2 — AEO/구조 검증 verifier.
 * 참조: web/docs/aeo-geo-research/ai-review-workflow.md §Stage 2
 *       .claude/skills/blog-enrich/prompts/verify-aeo.md
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
  'verify-aeo.md',
);

interface AeoRawVerdict {
  summaryDirectAnswer: number;
  passageSelfContainment: number;
  inlineCitationsMissing: string[];
  firstThirdDensity: number;
  intentFormatMatch: 'good' | 'mismatch';
  recommendedFormat?: 'article' | 'listicle' | 'guide' | null;
  headingHierarchy: 'good' | 'issues';
  mustFix: string[];
  overallScore: number;
}

/** 본문에서 첫 30% 발췌. AI 인용 발췌가 가장 자주 일어나는 위치. */
function extractFirstThird(content: string): string {
  const totalChars = content.length;
  const cutoff = Math.floor(totalChars * 0.3);
  return content.slice(0, cutoff);
}

export async function verifyAeoStructure(input: VerifierInput): Promise<VerifierVerdict> {
  const template = readFileSync(PROMPT_PATH, 'utf-8');
  const firstThird = extractFirstThird(input.content);
  const refsText =
    input.references && input.references.length > 0
      ? input.references.map((r) => `- ${r.name} (${r.url})`).join('\n')
      : '(references 없음)';

  const prompt = template
    .replace('TITLE_PLACEHOLDER', input.title)
    .replace('SUMMARY_PLACEHOLDER', input.summary || '(summary 없음)')
    .replace('CONTENT_FIRST_THIRD_PLACEHOLDER', firstThird)
    .replace('CONTENT_BODY_PLACEHOLDER', input.content)
    .replace('KEYWORDS_PLACEHOLDER', (input.keywords || []).join(', '))
    .replace('REFERENCES_PLACEHOLDER', refsText);

  const { parsed, model } = await callGeminiJson<AeoRawVerdict>({
    prompt,
    tier: 'flash',
    temperature: 0.2,
  });

  const score = typeof parsed.overallScore === 'number' ? parsed.overallScore : 0;
  const mustFix = Array.isArray(parsed.mustFix) ? parsed.mustFix : [];

  // intentFormatMatch 가 mismatch 면 mustFix 에 자동 추가
  if (parsed.intentFormatMatch === 'mismatch' && parsed.recommendedFormat) {
    mustFix.push(
      `포맷 인텐트 mismatch — 권장 포맷: ${parsed.recommendedFormat}. 본문을 그 포맷으로 재구성.`,
    );
  }

  // inlineCitationsMissing 도 mustFix 로 자동 승격 (학술 주장에 출처 없음 = AI 인용 자격 결격)
  const missingCitations = Array.isArray(parsed.inlineCitationsMissing)
    ? parsed.inlineCitationsMissing
    : [];
  if (missingCitations.length > 0) {
    mustFix.push(
      `inline 출처 누락 ${missingCitations.length}건: ${missingCitations.slice(0, 3).join(' / ')}` +
        (missingCitations.length > 3 ? ` 외 ${missingCitations.length - 3}건` : '') +
        ' → 각 주장에 [근거명](URL) 형태 inline 링크 부착',
    );
  }

  return {
    stage: 'aeo_structure',
    score,
    mustFix,
    mustBlock: [], // AEO 는 차단 사유 없음 — 모든 issue 는 수정 가능
    notes: [],
    details: parsed as unknown as Record<string, unknown>,
    model,
    ranAt: new Date().toISOString(),
  };
}
