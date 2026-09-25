import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { WEBINAR_OFFERS } from '@/constants/webinar';
import { WebinarDetail } from '../WebinarDetail';

/* 담앤담 회원 전용 할인 링크 — 프로그램 페이지·sitemap 에 노출하지 않고 링크로만 공유한다. */
export const metadata: Metadata = generatePageMetadata({
  title: '[담앤담 회원 전용] 초심 상담사를 위한 사례개념화 웨비나 — 10월 6일 (화)',
  description:
    '담앤담 회원 전용 특별가 10,000원. 10월 6일 화요일 저녁 7시, Google Meet 온라인 라이브. 이헌주 교수(양학회 1급)의 사례개념화 강연과 마음토스 AI 실무 세션.',
  path: WEBINAR_OFFERS.damdam.path,
  noindex: true,
});

export default function DamdamMemberWebinarPage() {
  return <WebinarDetail offer={WEBINAR_OFFERS.damdam} />;
}
