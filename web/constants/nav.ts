/**
 * 마음토스 GNB / Footer 네비게이션 (사이트맵 v2 · 2026-04-30 확정).
 * 단일 진실 원본: ../mindthos-landing-design/02-plan/current/site-map-v2.md
 *
 * v1 → v2 변경
 * - GNB 5 평면 메뉴 (children 없음)
 * - 가격 / 보안 / 제품 / 기관용 / 리소스 메뉴 제거
 * - 가격은 랜딩 §09 anchor `#pricing` 으로 이동
 */

export interface NavItem {
  href: string;
  label: string;
  /** true → 외부 링크. <a target="_blank" rel="noopener noreferrer"> 로 렌더링. */
  external?: boolean;
}

/**
 * 사용 가이드는 외부 Notion 문서로 운영 (사내 자료 → 노션 한 곳에서 관리).
 * 단일 진실 원본: 본 상수.
 */
export const NOTION_GUIDE_URL =
  'https://rare-puppy-06f.notion.site/v2-2cfdd162832d801bae95f67269c062c7';

/**
 * 문의 채널은 카카오톡 오픈채팅으로 운영.
 * 내부 임의 contact 페이지는 제거됨 (2026-05-04). 모든 "문의" 진입점은 본 URL 사용.
 * 단일 진실 원본: 본 상수.
 */
export const KAKAO_INQUIRY_URL = 'https://open.kakao.com/me/Mindthos';

/**
 * 아카데미(`/academy`) 전용 카카오톡 오픈채팅 링크.
 * 일반 문의 채널과 별도로 운영되는 아카데미 상담 전용 채널.
 */
export const KAKAO_ACADEMY_INQUIRY_URL = 'https://open.kakao.com/o/sgSKbDqi';

export const PRIMARY_NAV: NavItem[] = [
  /* "서비스 소개"는 별도 페이지 없이 랜딩(`/`)으로 연결 (2026-05-04). 임의 /about-service 페이지 제거됨 */
  { href: '/', label: '서비스 소개' },
  { href: NOTION_GUIDE_URL, label: '사용 가이드', external: true },
  { href: '/blog', label: '블로그' },
  { href: '/education', label: '교육 프로그램' },
  { href: KAKAO_INQUIRY_URL, label: '문의', external: true },
];

export const FOOTER_NAV = {
  /** Footer ② 마음토스 — GNB 와 동일 5 항목 */
  service: PRIMARY_NAV,
  /** Footer ③ 회사 컬럼 — 회사 정보 / 채널 */
  company: [
    { href: '/', label: '회사 소개' },
    { href: KAKAO_INQUIRY_URL, label: '문의 채널', external: true },
  ] as NavItem[],
  /** Footer ④ 약관 컬럼 — 실제 앱 약관 페이지로 외부 링크 (2026-05-04). 내부 /terms /privacy 라우트 제거됨 */
  legal: [
    {
      href: 'https://app.mindthos.com/terms?type=service',
      label: '서비스 이용약관',
      external: true,
    },
    {
      href: 'https://app.mindthos.com/terms?type=privacy',
      label: '개인정보처리방침',
      external: true,
    },
  ] as NavItem[],
} as const;
