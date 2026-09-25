/**
 * 웨비나 단일 진실 원본 — 페이지 표기 · 토스페이먼츠 결제 금액 · 서버 결제 검증이 모두 이 값을 참조한다.
 * 기획 문서: https://claude.ai/code/artifact/f79e776a-9654-45a7-b9b0-3f2fbe9677c7
 */

export interface WebinarTimelineRow {
  time: string;
  part: string;
  content: string;
  host: string;
}

export const CASE_CONCEPTUALIZATION_WEBINAR = {
  slug: 'case-conceptualization',
  path: '/education/webinar/case-conceptualization',
  title: '초심 상담사를 위한 사례개념화',
  orderName: '초심 상담사를 위한 사례개념화 웨비나',
  /** KRW 정가. 회원 전용 할인가는 아래 WEBINAR_OFFERS 참조 */
  price: 20000,
  /** 토스페이먼츠 결제위젯 variantKey (결제 어드민에서 설정한 커스텀 결제 UI) */
  widgetVariantKey: 'mindwebi',
  /** KST 기준 일시 */
  dateLabel: '2026년 10월 6일 (화) 19:00–20:30',
  startsAt: '2026-10-06T19:00:00+09:00',
  endsAt: '2026-10-06T20:30:00+09:00',
  platformLabel: 'Google Meet 온라인 라이브',
  timeline: [
    { time: '19:00–19:05', part: '오프닝', content: '웨비나 소개', host: '마음토스' },
    { time: '19:05–19:55', part: '1부', content: '초청 강연 — 초심 상담사를 위한 사례개념화', host: '이헌주 교수' },
    { time: '19:55–20:00', part: '1부 Q&A', content: '질의응답', host: '이헌주 교수' },
    { time: '20:00–20:25', part: '2부', content: '마음토스 세션 — AI와 함께하는 사례개념화 실무', host: '마음토스 팀' },
    { time: '20:25–20:30', part: '2부 Q&A', content: '질의응답', host: '마음토스 팀' },
  ] satisfies WebinarTimelineRow[],
} as const;

export type WebinarVariant = 'default' | 'mindthos' | 'damdam';

export interface WebinarOffer {
  variant: WebinarVariant;
  /** DB webinar_registrations.webinar_slug 에 저장되는 값 — 변형별 신청 집계 구분용 */
  slug: string;
  /** 상세 페이지 경로. 회원 전용 변형은 sitemap·프로그램 페이지에 노출하지 않는다(링크 공유 전용). */
  path: string;
  /** KRW. 서버(/api/webinar/confirm)가 결제 금액 검증에 사용 — 변경 시 배포 필수 */
  price: number;
  /** 회원 전용 표기 (기본 오퍼는 null) */
  memberLabel: string | null;
}

/** 판매 오퍼 — 기본(공개) + 회원 전용 할인 링크 2종 */
export const WEBINAR_OFFERS: Record<WebinarVariant, WebinarOffer> = {
  default: {
    variant: 'default',
    slug: CASE_CONCEPTUALIZATION_WEBINAR.slug,
    path: CASE_CONCEPTUALIZATION_WEBINAR.path,
    price: CASE_CONCEPTUALIZATION_WEBINAR.price,
    memberLabel: null,
  },
  mindthos: {
    variant: 'mindthos',
    slug: 'case-conceptualization-mindthos',
    path: `${CASE_CONCEPTUALIZATION_WEBINAR.path}/mindthos`,
    price: 10000,
    memberLabel: '마음토스 회원 전용',
  },
  damdam: {
    variant: 'damdam',
    slug: 'case-conceptualization-damdam',
    path: `${CASE_CONCEPTUALIZATION_WEBINAR.path}/damdam`,
    price: 10000,
    memberLabel: '담앤담 회원 전용',
  },
};

export function isWebinarVariant(v: unknown): v is WebinarVariant {
  return v === 'default' || v === 'mindthos' || v === 'damdam';
}

export function webinarOfferBySlug(slug: string): WebinarOffer | null {
  return (
    Object.values(WEBINAR_OFFERS).find((offer) => offer.slug === slug) ?? null
  );
}
