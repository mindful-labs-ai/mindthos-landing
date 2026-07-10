import type { FeatureTabKey } from '@/components/home/sections/FeatureTabsSection';

/**
 * 유입 경로별 맞춤 랜딩 variant 사전 (T3 기획 §3-1).
 *
 * 각 variant 는 광고 소재 URL `mindthos.com/start/<key>` 와 1:1. 개인화는
 *   ① hero 맞춤 카피  ② hero 다음 브릿지 섹션  ③ FeatureTabs 우선 탭
 * 3곳에만 집중되고, 그 아래 모든 섹션은 홈과 동일 순서·내용으로 렌더된다.
 *
 * 이 파일은 순수 데이터(.ts). 줄바꿈은 문자열 배열(줄 단위)로 표현하고,
 * 렌더 컴포넌트가 <br/> 로 이어붙인다.
 */

/** headline 을 소구로 교체해도 유지하는 브랜드 포지셔닝 kicker (CLAUDE.md 변경 금지). */
export const DEFAULT_EYEBROW = '상담사를 위한 안전한 AI 에이전트 · 마음토스';

const APP_BASE = 'https://app.mindthos.com';

/** 코호트 힌트 — 값 사전은 T1 `cohort.ts` 와 공유. utm 은 UtmForwarder 가 병합 보존. */
export type CohortHint = 'genogram' | 'psy_test';

/**
 * 가입 CTA href. cohort 힌트가 있으면 `?cohort=` 로 실어 보낸다.
 * 광고 utm 은 UtmForwarder 가 클릭 시 이 href 에 병합(§3-6) — 여기선 cohort 만 심는다.
 */
export function ctaHref(cohortHint?: CohortHint | null): string {
  return cohortHint ? `${APP_BASE}/?cohort=${cohortHint}` : APP_BASE;
}

export interface BridgePreview {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface BridgeConfig {
  /** 소구 한 줄 (줄 단위 배열) */
  title: string[];
  /** 이 소구 유입자의 문제 2~3 */
  pains: string[];
  /** 마음토스가 그 기능으로 해결 2~3 */
  solutions: string[];
  /** '이런 적 있으셨죠' 카드 이미지. 없으면 플레이스홀더 공간만 표시. */
  painImage?: BridgePreview | null;
  /** '마음토스라면' 카드 이미지(약속-체험 일치). 없으면 플레이스홀더. */
  solutionImage?: BridgePreview | null;
}

export interface LandingVariant {
  key: string;
  hero: {
    headline: string[];
    sub: string[];
    ctaLabel: string;
  };
  bridge: BridgeConfig;
  /** FeatureTabs 초기 활성 + 회전 시작 탭 */
  priorityTab: FeatureTabKey;
  /** 가입 링크 cohort 힌트 (T1 계약). 없으면 utm/Q 응답으로 분기. */
  cohortHint?: CohortHint | null;
  metaTitle: string;
  metaDescription: string;
  /** 소재 랜딩은 검색 인덱싱 제외 (§7). */
  noindex: boolean;
}

const GENOGRAM: LandingVariant = {
  key: 'genogram',
  hero: {
    headline: ['복잡한 가족 관계,', '가계도로 한눈에 정리'],
    sub: [
      '축어록·상담 기록만 올리면, 3세대 가계도와',
      '관계 역동을 마음토스가 초안으로 그려냅니다.',
    ],
    ctaLabel: '무료로 가계도 만들어보기',
  },
  bridge: {
    title: ['가족 관계가 얽힐수록,', '정리가 막막하죠'],
    pains: [
      '검사·면담 기록이 따로 놀아요',
      '3세대 관계를 손으로 그리기 벅차요',
      '관계 역동을 놓치기 쉬워요',
    ],
    solutions: [
      '상담 기록만 올리면 가계도 초안이 자동 완성',
      'Genogram 최신 4판 기준으로 관계선·정서 역동까지 정확하게',
      '드래그 몇 번이면 끝 — 누구나 쉽게 편집',
      '내담자별로 자동 저장, 웹에서 언제든 바로 이어서 작업',
    ],
    painImage: {
      src: '/genogram-manual-ppt.webp',
      alt: 'PPT 도형으로 직접 그린 어수선한 가계도 — 손이 많이 가는 수작업 예시',
      width: 1536,
      height: 1024,
    },
    solutionImage: {
      src: '/genogram-mindthos-app.webp',
      alt: '마음토스가 상담 기록으로 자동 생성한 3세대 가계도 예시',
      width: 1154,
      height: 720,
    },
  },
  priorityTab: 'geno',
  cohortHint: 'genogram',
  metaTitle: '가계도 자동 생성 — 상담 기록으로 3세대 가계도까지 | 마음토스',
  metaDescription:
    '축어록·상담 기록만 올리면 3세대 가계도와 관계 역동을 자동 초안으로. 상담사를 위한 안전한 AI 에이전트 마음토스에서 무료로 시작하세요.',
  noindex: true,
};

const TRANSCRIBE: LandingVariant = {
  key: 'transcribe',
  hero: {
    headline: ['녹음만 올리면,', '축어록·상담노트까지 자동으로'],
    sub: [
      '회기 녹음을 안전하게 축어록으로 풀고,',
      '그대로 상담노트 초안까지 이어집니다.',
    ],
    ctaLabel: '무료로 축어록 체험하기',
  },
  bridge: {
    title: ['녹음 정리에,', '밤을 새우고 계신가요'],
    pains: [
      '녹음 받아쓰기에 시간을 다 써요',
      '같은 회기를 양식마다 다시 써요',
      '화자 구분이 번거로워요',
    ],
    solutions: [
      '상담 환경에 맞춘 편리한 축어록 편집·관리',
      '내담자 정보 비식별화까지, 보안 기능 기본 탑재',
      '20종 이상의 상담노트·사례개념화 양식 제공',
      '일괄 업로드로 반복 작업 필요 없이 한번에',
    ],
    painImage: {
      src: '/transcribe-manual-hwp.webp',
      alt: '한글 문서에 축어록을 직접 받아쓰는 스크린샷 — 손이 많이 가는 수작업 예시',
      width: 1536,
      height: 1024,
    },
    solutionImage: {
      src: '/transcribe-mindthos-app.webp',
      alt: '마음토스가 녹음에서 자동 생성한 축어록과 상담 노트 예시',
      width: 1600,
      height: 1000,
    },
  },
  priorityTab: 'trx',
  cohortHint: null,
  metaTitle: '축어록 자동 생성 — 녹음에서 상담노트까지 | 마음토스',
  metaDescription:
    '회기 녹음을 안전하게 축어록으로 풀고 상담노트 초안까지 자동으로. 상담사를 위한 안전한 AI 에이전트 마음토스에서 무료로 시작하세요.',
  noindex: true,
};

const PSY_TEST: LandingVariant = {
  key: 'psy-test',
  hero: {
    headline: ['흩어진 검사 결과,', '하나의 사례 해석으로 통합'],
    sub: [
      '여러 심리검사 결과를 한 내담자의 이야기로',
      '묶어 해석 가설까지 이어줍니다.',
    ],
    ctaLabel: '무료로 검사 해석 체험',
  },
  bridge: {
    title: ['검사 결과가 숫자로만,', '흩어져 있나요'],
    pains: [
      '검사 결과가 숫자로만 흩어져요',
      '여러 검사를 한 사람으로 못 묶어요',
      '해석을 문장으로 쓰는 데 오래 걸려요',
    ],
    solutions: [
      '여러 검사 결과를 하나의 사례로 통합 해석',
      '축어록·상담 기록과 결합해 맥락까지 반영한 해석',
      '해석 보고서 초안을 바로 생성',
      'AI 재학습에 쓰지 않아 검사 데이터도 안전하게',
    ],
    painImage: {
      src: '/psy-test-manual-report.webp',
      alt: '검사 결과지와 해석 매뉴얼을 펼쳐 놓고 보고서를 직접 작성하는 복잡한 수작업 예시',
      width: 1536,
      height: 1024,
    },
    solutionImage: {
      src: '/psy-test-mindthos-app.webp',
      alt: '마음토스가 검사 결과를 통합 해석해 보여주는 심리검사 해석 예시',
      width: 1600,
      height: 1000,
    },
  },
  priorityTab: 'psy',
  cohortHint: 'psy_test',
  metaTitle: '심리검사 해석 — 흩어진 검사를 하나의 사례로 | 마음토스',
  metaDescription:
    '여러 심리검사 결과를 한 내담자의 이야기로 통합 해석하고 사례개념화 가설까지. 상담사를 위한 안전한 AI 에이전트 마음토스에서 무료로 시작하세요.',
  noindex: true,
};

const CONCEPTUALIZATION: LandingVariant = {
  key: 'conceptualization',
  hero: {
    headline: ['상담 기록을,', '근거 있는 사례개념화로'],
    sub: [
      '축어록·상담노트를 올리면, 이론에 근거한',
      '사례개념화 가설을 마음토스가 정리해 드립니다.',
    ],
    ctaLabel: '무료로 사례개념화 체험',
  },
  bridge: {
    title: ['사례개념화, 어디서부터', '풀어야 할지 막막하죠'],
    pains: [
      '무엇을 근거로 가설을 세울지 막막해요',
      '이론과 사례를 연결하기 어려워요',
      '매번 백지에서 다시 시작해요',
    ],
    solutions: [
      '상담 기록을 근거로 사례개념화 초안 자동 생성',
      '주 호소·촉발요인·유지요인을 구조화해 정리',
      '이론(CBT·정신역동 등)에 맞춘 해석 가설 제시',
      '여러 회기를 통합 분석한 AI 슈퍼비전 제공',
    ],
    painImage: {
      src: '/conceptualization-manual-desk.webp',
      alt: '이론서를 뒤적이며 사례개념화 가설을 손으로 짜내는 어려운 수작업 예시',
      width: 1536,
      height: 1024,
    },
    solutionImage: {
      src: '/conceptualization-mindthos-app.webp',
      alt: '마음토스가 상담 기록에서 이론을 감지해 사례개념화를 정리한 예시',
      width: 1600,
      height: 1000,
    },
  },
  priorityTab: 'cnc',
  cohortHint: null,
  metaTitle: '사례개념화 — 상담 기록을 근거 있는 해석 가설로 | 마음토스',
  metaDescription:
    '축어록·상담노트를 올리면 주 호소·촉발·유지요인을 구조화하고 이론에 근거한 사례개념화 가설까지. 상담사를 위한 안전한 AI 에이전트 마음토스에서 무료로 시작하세요.',
  noindex: true,
};

export const LANDING_VARIANTS: Record<string, LandingVariant> = {
  genogram: GENOGRAM,
  transcribe: TRANSCRIBE,
  'psy-test': PSY_TEST,
  conceptualization: CONCEPTUALIZATION,
};

export const VARIANT_KEYS: string[] = Object.keys(LANDING_VARIANTS);

export function getVariant(key: string): LandingVariant | null {
  return LANDING_VARIANTS[key] ?? null;
}
