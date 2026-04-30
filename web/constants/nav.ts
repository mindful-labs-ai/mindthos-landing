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
}

export const PRIMARY_NAV: NavItem[] = [
  { href: '/about-service', label: '서비스 소개' },
  { href: '/guide', label: '사용 가이드' },
  { href: '/blog', label: '블로그' },
  { href: '/education', label: '교육 프로그램' },
  { href: '/contact', label: '문의' },
];

export const FOOTER_NAV = {
  /** Footer ② 마음토스 — GNB 와 동일 5 항목 */
  service: PRIMARY_NAV,
  /** Footer ③ 회사 컬럼 — 회사 정보 / 채널 */
  company: [
    { href: '/about-service#company', label: '회사 소개' },
    { href: '/contact', label: '문의 채널' },
  ] as NavItem[],
  /** Footer ④ 약관 컬럼 */
  legal: [
    { href: '/terms', label: '서비스 이용약관' },
    { href: '/privacy', label: '개인정보처리방침' },
  ] as NavItem[],
} as const;
