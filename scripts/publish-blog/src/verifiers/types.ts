/**
 * AI 다중 검수 verifier 공유 타입.
 * 참조: web/docs/aeo-geo-research/ai-review-workflow.md
 */

export type VerifierStage = 'aeo_structure' | 'counselor_content' | 'fact_check';

export interface VerifierVerdict {
  stage: VerifierStage;
  /** 0-10 종합 점수. 낮을수록 revise 권고 */
  score: number;
  /** 수정 가능한 issue — exit 3 fact-fix 루프에서 Claude 가 수정 */
  mustFix: string[];
  /** 발행 차단 — Claude 수정으로 해결 불가능, auto_review_queue 격리 */
  mustBlock: string[];
  /** ambiguous / 정보 — 발행 차단 안 함, ai_review JSONB 에만 기록 */
  notes: string[];
  /** 항목별 상세 결과 (각 verifier 별 schema 다름) */
  details: Record<string, unknown>;
  /** 사용된 모델 */
  model: string;
  /** ISO 타임스탬프 */
  ranAt: string;
}

/** 모든 verifier 통합 결과 — review-feedback.json v2 구조 */
export interface ReviewFeedbackV2 {
  version: 2;
  ranAt: string;
  stages: Partial<Record<VerifierStage, VerifierVerdict>>;
  /** 최종 결정: pass = 발행 OK, revise = Claude 수정 후 재발행, queue = 즉시 격리 */
  overallDecision: 'pass' | 'revise' | 'queue';
  /** Claude 가 수정 시 참고할 통합 가이드 — mustFix 항목을 한 prompt 로 합쳐둠 */
  revisionGuide: string;
  /** queue 사유 (있을 때만) */
  queueReason: string | null;
}

/** verifier 호출 입력 */
export interface VerifierInput {
  title: string;
  slug: string;
  /** 본문 마크다운 */
  content: string;
  /** "이 글의 핵심" summary 박스 텍스트 */
  summary: string;
  /** 발췌·메타 */
  excerpt: string;
  keywords: string[];
  /** category slug (검수 룰 가중치 조정용) */
  category?: string;
  /** references 배열 (inline citation 매칭에 사용) */
  references?: Array<{ name: string; url: string; type?: string }>;
}
