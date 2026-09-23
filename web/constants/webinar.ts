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
  /** KRW. 서버(/api/webinar/confirm)가 결제 금액 검증에 사용 — 변경 시 배포 필수 */
  price: 10000,
  /** 토스페이먼츠 결제위젯 variantKey (결제 어드민에서 설정한 커스텀 결제 UI) */
  widgetVariantKey: 'mindwebi',
  /** KST 기준 일시 */
  dateLabel: '2026년 10월 6일 (화) 19:00–20:30',
  startsAt: '2026-10-06T19:00:00+09:00',
  endsAt: '2026-10-06T20:30:00+09:00',
  platformLabel: '구글 밋(Google Meet) 온라인 라이브',
  timeline: [
    { time: '19:00–19:05', part: '오프닝', content: '웨비나 소개', host: '마음토스' },
    { time: '19:05–19:55', part: '1부', content: '초청 강연 — 초심 상담사를 위한 사례개념화', host: '이헌주 교수' },
    { time: '19:55–20:00', part: '1부 Q&A', content: '질의응답', host: '이헌주 교수' },
    { time: '20:00–20:25', part: '2부', content: '마음토스 세션 — AI와 함께하는 사례개념화 실무', host: '마음토스 팀' },
    { time: '20:25–20:30', part: '2부 Q&A', content: '질의응답', host: '마음토스 팀' },
  ] satisfies WebinarTimelineRow[],
} as const;
