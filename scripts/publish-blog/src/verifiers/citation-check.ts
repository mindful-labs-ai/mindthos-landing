/**
 * B3 — 결정적(deterministic) inline 출처 게이트.
 * 참조: web/docs/aeo-geo-research/action-plan.md §B3
 *       web/docs/aeo-geo-research/11-ymyl-health-mental-health-aeo.md
 *
 * Gemini 기반 AEO verifier(aeo-structure.ts)도 inlineCitationsMissing 를 보지만
 * (1) NANOBANANA_API_KEY 없으면 미작동 (2) 비결정적 이라는 한계가 있다.
 * 이 게이트는 AI 없이 본문 마크다운만 정규식으로 스캔해 통계·수치 주장에
 * inline 링크([근거명](URL))가 붙어있는지 항상 검사한다.
 *
 * "Unlinked claims don't count" — 출처 링크 없는 수치 주장은 AI 인용 풀에서 탈락.
 *
 * 설계 원칙 (false-positive 최소화 + 일일 파이프라인 안정성):
 *   - 수치 통계 주장(유병률 %, N명, N배 등)에 문단 내 링크 없음 → STRONG (clinical=mustFix)
 *   - 연구·조사 키워드만 있고 링크 없음           → WEAK (notes only, 차단 안 함)
 *   - 임상/정신건강 카테고리만 STRONG 을 mustFix(=revise)로 승격, 그 외는 notes
 */

import type { VerifierInput, VerifierVerdict } from './types.js';

/** 임상/YMYL 카테고리 — STRONG 미인용을 mustFix(revise)로 승격하는 대상 */
const CLINICAL_CATEGORIES = new Set([
  'case-conceptualization',
  'counseling-skills',
  'training',
  'self-care',
]);

/** 통계·수치 주장 신호 (강). 퍼센트 또는 단위 붙은 수치. */
const NUMERIC_CLAIM =
  /(\d+(?:\.\d+)?\s*%)|(\d+(?:\.\d+)?\s*(?:배|명|건|회|점|위|개월|주일|시간|년차|년간|개))/;

/** 연구·조사·기관 인용 신호 (약). 수치 없이도 출처가 기대되는 표현. */
const RESEARCH_CLAIM =
  /(유병률|발생률|메타[\s-]?분석|실태조사|코호트|무작위[\s-]?대조|설문조사|통계청|질병관리청|KDCA|보건복지부|WHO|DSM-?5|ICD-?1[01]|효과크기|상관관계|유의미하게|선행연구|연구에 따르면|조사 결과)/;

/** inline 마크다운 링크 (외부 URL). 각주/참고 링크. */
const INLINE_LINK = /\[[^\]]+\]\(https?:\/\/[^)]+\)/;

/** 본문 발췌 — 길면 줄임 */
function snippet(text: string, max = 90): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

/**
 * 마크다운 본문을 문단(빈 줄 구분) 단위로 나눠 통계·연구 주장의 inline 출처 유무를 검사.
 * 헤딩(#)·표(|)·인용(>)·코드블록(```) 라인은 제외.
 */
export function verifyCitations(input: VerifierInput): VerifierVerdict {
  const content = input.content || '';
  const isClinical = CLINICAL_CATEGORIES.has(input.category || '');

  const strong: string[] = []; // 수치 통계 주장 + 링크 없음
  const weak: string[] = []; // 연구 키워드 주장 + 링크 없음

  // 코드블록 제거 후 문단 분리
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  const paragraphs = withoutCode.split(/\n{2,}/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    // 헤딩 / 표 / 인용 / 리스트 마커만 있는 줄은 스킵 대상이지만,
    // 리스트 항목(- , 1. )은 본문 주장일 수 있으므로 포함한다.
    const firstChar = trimmed[0];
    if (firstChar === '#' || firstChar === '|' || firstChar === '>') continue;

    const hasLink = INLINE_LINK.test(trimmed);
    if (hasLink) continue; // 문단 내 어디든 출처 링크가 있으면 인용된 것으로 간주

    // 문장 단위로 주장 판정 (한국어 종결 + 마침표/줄바꿈 기준 근사)
    const sentences = trimmed.split(/(?<=[.!?。])\s+|\n/);
    for (const s of sentences) {
      const sent = s.trim();
      if (sent.length < 8) continue;
      if (NUMERIC_CLAIM.test(sent)) {
        strong.push(snippet(sent));
      } else if (RESEARCH_CLAIM.test(sent)) {
        weak.push(snippet(sent));
      }
    }
  }

  const STRONG_CAP = 8;
  const WEAK_CAP = 6;
  const strongCapped = strong.slice(0, STRONG_CAP);
  const weakCapped = weak.slice(0, WEAK_CAP);

  const mustFix: string[] = [];
  const notes: string[] = [];

  if (strongCapped.length > 0) {
    const detail =
      `수치·통계 주장 ${strong.length}건에 inline 출처 링크 누락 → ` +
      `각 주장에 [근거명](URL) 형태 inline 링크 부착, 출처를 못 찾으면 단정 수치 표현을 완화. ` +
      `예: ${strongCapped.slice(0, 3).join(' / ')}` +
      (strong.length > 3 ? ` 외 ${strong.length - 3}건` : '');
    if (isClinical) {
      mustFix.push(detail);
    } else {
      notes.push(`(비임상 카테고리 — 권고) ${detail}`);
    }
  }

  if (weakCapped.length > 0) {
    notes.push(
      `연구·조사 인용 표현 ${weak.length}건에 출처 링크 없음 (권고): ` +
        weakCapped.slice(0, 3).join(' / ') +
        (weak.length > 3 ? ` 외 ${weak.length - 3}건` : ''),
    );
  }

  // 점수: STRONG 미인용 1건당 -2, 최저 3. 없으면 9(=pass 기여).
  const score = strongCapped.length === 0 ? 9 : Math.max(3, 9 - strongCapped.length * 2);

  return {
    stage: 'citation_check',
    score,
    mustFix,
    mustBlock: [], // 인용 누락은 Claude 수정으로 해결 가능 — 차단 사유 아님
    notes,
    details: {
      isClinical,
      strongUncited: strongCapped,
      weakUncited: weakCapped,
      strongTotal: strong.length,
      weakTotal: weak.length,
    },
    model: 'deterministic/regex',
    ranAt: new Date().toISOString(),
  };
}
