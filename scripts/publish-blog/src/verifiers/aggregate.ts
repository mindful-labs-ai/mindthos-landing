/**
 * Verifier 결과 통합 + review-feedback.json v2 빌드.
 * 참조: web/docs/aeo-geo-research/ai-review-workflow.md
 */

import type { VerifierVerdict, ReviewFeedbackV2 } from './types.js';

/**
 * 모든 verifier 결과를 받아 통합 결정을 내린다.
 *
 * 결정 규칙:
 *  - mustBlock 1건 이상 (어떤 stage 든) → queue (즉시 격리)
 *  - mustFix 1건 이상 (어떤 stage 든) → revise (Claude 수정)
 *  - 둘 다 없고 모든 stage 의 score ≥ 7 → pass
 *  - 그 외 (score 낮음만) → revise
 */
export function buildReviewFeedback(
  verdicts: VerifierVerdict[],
  thresholdScore = 7,
): ReviewFeedbackV2 {
  const stages: ReviewFeedbackV2['stages'] = {};
  const allMustFix: string[] = [];
  const allMustBlock: string[] = [];

  for (const v of verdicts) {
    stages[v.stage] = v;
    for (const item of v.mustFix) {
      allMustFix.push(`[${v.stage}] ${item}`);
    }
    for (const item of v.mustBlock) {
      allMustBlock.push(`[${v.stage}] ${item}`);
    }
  }

  let overallDecision: ReviewFeedbackV2['overallDecision'];
  let queueReason: string | null = null;

  if (allMustBlock.length > 0) {
    overallDecision = 'queue';
    queueReason = `mustBlock ${allMustBlock.length}건 — Claude 수정으로 해결 불가. 운영자가 prompt/master 검토 필요.`;
  } else if (allMustFix.length > 0) {
    overallDecision = 'revise';
  } else {
    const allHigh = verdicts.every((v) => v.score >= thresholdScore);
    overallDecision = allHigh ? 'pass' : 'revise';
  }

  // Claude 수정 prompt 가 그대로 사용할 통합 가이드
  const revisionGuide = buildRevisionGuide(allMustFix, allMustBlock);

  return {
    version: 2,
    ranAt: new Date().toISOString(),
    stages,
    overallDecision,
    revisionGuide,
    queueReason,
  };
}

function buildRevisionGuide(mustFix: string[], mustBlock: string[]): string {
  if (mustFix.length === 0 && mustBlock.length === 0) {
    return '(수정 필요 항목 없음)';
  }

  const lines: string[] = [];
  if (mustBlock.length > 0) {
    lines.push('## 발행 차단 사유 (해결 후에도 운영자 확인 필요)');
    for (let i = 0; i < mustBlock.length; i++) {
      lines.push(`${i + 1}. ${mustBlock[i]}`);
    }
    lines.push('');
  }
  if (mustFix.length > 0) {
    lines.push('## 수정 필수 항목 (Claude 가 본문/메타 수정)');
    for (let i = 0; i < mustFix.length; i++) {
      lines.push(`${i + 1}. ${mustFix[i]}`);
    }
  }
  return lines.join('\n');
}
