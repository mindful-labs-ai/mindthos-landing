/**
 * Verifier 결과 통합 + review-feedback.json v2 빌드.
 * 참조: web/docs/aeo-geo-research/ai-review-workflow.md
 */

import type { VerifierVerdict, ReviewFeedbackV2, VerifierStage } from './types.js';

/**
 * 통과 임계 — 운영 1회차 (2026-05-29) 에서 100% revise 였던 데이터를 기반으로 완화.
 *  - 30분/글 무한 revise 루프 회피
 *  - mustFix 가 많더라도 score 가 높으면 발행 후 ai_review 에 기록 (운영자 사후 확인)
 */
export const PASS_THRESHOLDS = {
  /** 모든 stage 의 score 가 이 값 이상이어야 함 */
  minScore: 7,
  /** 통합 mustFix 가 이 개수 이하면 pass 가능 */
  maxMustFixForPass: 2,
} as const;

/** revisionGuide 에 포함되는 상위 mustFix 개수 — Claude 가 한 라운드에 처리 가능한 양 */
const REVISION_GUIDE_TOP_N = 3;

/**
 * stage 우선순위 — revisionGuide 정렬 + 통과 판단 시 critical stage 우선.
 * 작은 숫자 = 더 critical.
 */
const STAGE_PRIORITY: Record<VerifierStage, number> = {
  citation_check: 0, // 결정적 — 강한 통계 주장 출처 (B3)
  fact_check: 1, // master doc 와의 사실 대조 — 가장 중요
  counselor_content: 2, // 자격·정책·윤리 정확성
  aeo_structure: 3, // AEO 구조 — 발행 후 사후 개선 가능
};

interface PrefixedItem {
  stage: VerifierStage;
  text: string;
}

/**
 * 모든 verifier 결과를 받아 통합 결정을 내린다.
 *
 * 결정 규칙:
 *  - mustBlock 1건 이상 (어떤 stage 든) → queue (즉시 격리)
 *  - 모든 stage score ≥ minScore AND mustFix 총 ≤ maxMustFixForPass → pass
 *      (나머지 mustFix 는 ai_review.notes 에 보존되어 사후 개선)
 *  - 그 외 → revise (Claude 가 revisionGuide 의 상위 N개 수정)
 */
export function buildReviewFeedback(
  verdicts: VerifierVerdict[],
  thresholdScore: number = PASS_THRESHOLDS.minScore,
): ReviewFeedbackV2 {
  const stages: ReviewFeedbackV2['stages'] = {};
  const allMustFix: PrefixedItem[] = [];
  const allMustBlock: PrefixedItem[] = [];

  for (const v of verdicts) {
    stages[v.stage] = v;
    for (const item of v.mustFix) {
      allMustFix.push({ stage: v.stage, text: `[${v.stage}] ${item}` });
    }
    for (const item of v.mustBlock) {
      allMustBlock.push({ stage: v.stage, text: `[${v.stage}] ${item}` });
    }
  }

  // critical stage 부터 정렬
  const sortByPriority = (a: PrefixedItem, b: PrefixedItem) =>
    (STAGE_PRIORITY[a.stage] ?? 99) - (STAGE_PRIORITY[b.stage] ?? 99);
  allMustFix.sort(sortByPriority);
  allMustBlock.sort(sortByPriority);

  let overallDecision: ReviewFeedbackV2['overallDecision'];
  let queueReason: string | null = null;

  if (allMustBlock.length > 0) {
    overallDecision = 'queue';
    queueReason = `mustBlock ${allMustBlock.length}건 — Claude 수정으로 해결 불가. 운영자가 prompt/master 검토 필요.`;
  } else {
    const allHighScore = verdicts.every((v) => v.score >= thresholdScore);
    const fewEnoughMustFix = allMustFix.length <= PASS_THRESHOLDS.maxMustFixForPass;
    if (allHighScore && fewEnoughMustFix) {
      // 통과 — mustFix 가 있어도 모두 ai_review 에 기록되어 사후 추적됨
      overallDecision = 'pass';
    } else {
      overallDecision = 'revise';
    }
  }

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

/**
 * revisionGuide 는 상위 N개 mustFix 만 포함 — Claude 가 한 라운드에 처리 가능한 양.
 * 나머지는 "후속 개선 항목" 으로 명시되어 ai_review 에 기록된다.
 */
function buildRevisionGuide(mustFix: PrefixedItem[], mustBlock: PrefixedItem[]): string {
  if (mustFix.length === 0 && mustBlock.length === 0) {
    return '(수정 필요 항목 없음)';
  }

  const lines: string[] = [];

  if (mustBlock.length > 0) {
    lines.push('## 발행 차단 사유 (해결 후에도 운영자 확인 필요)');
    for (let i = 0; i < mustBlock.length; i++) {
      lines.push(`${i + 1}. ${mustBlock[i].text}`);
    }
    lines.push('');
  }

  if (mustFix.length > 0) {
    const top = mustFix.slice(0, REVISION_GUIDE_TOP_N);
    const rest = mustFix.slice(REVISION_GUIDE_TOP_N);

    lines.push(
      `## 수정 필수 항목 (상위 ${top.length}건 — Claude 가 이번 라운드에 처리)`,
    );
    for (let i = 0; i < top.length; i++) {
      lines.push(`${i + 1}. ${top[i].text}`);
    }

    if (rest.length > 0) {
      lines.push('');
      lines.push(
        `## 후속 개선 항목 (${rest.length}건 — 이번 라운드에서 건드리지 말 것; ai_review 에 기록)`,
      );
      for (let i = 0; i < rest.length; i++) {
        lines.push(`- ${rest[i].text}`);
      }
    }
  }

  return lines.join('\n');
}
