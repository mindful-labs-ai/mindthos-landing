import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  CBT_CASE_CONCEPTUALIZATION_WEBINAR,
  WEBINAR_OFFERS,
} from '@/constants/webinar';
import { WebinarDetail } from '../WebinarDetail';

/* 마음토스 회원 전용 할인 링크 — 프로그램 페이지·sitemap 에 노출하지 않고 링크로만 공유한다. */
export const metadata: Metadata = generatePageMetadata({
  title: `${CBT_CASE_CONCEPTUALIZATION_WEBINAR.registrationClosed ? '[신청 마감] ' : ''}${'[마음토스 회원 전용] CBT로 사례개념화하기 웨비나 — 11월 17일 (화)'}`,
  description:
    '마음토스 회원 참가비 10,000원. 11월 17일 화요일 저녁 7시, Google Meet 온라인 라이브. 김윤수 교수의 CBT 사례개념화 강의와 새로워진 마음토스의 신규 기능·사례개념화 시연.',
  path: WEBINAR_OFFERS['cbt-mindthos'].path,
  noindex: true,
});

export default function CbtMindthosMemberWebinarPage() {
  return <WebinarDetail offer={WEBINAR_OFFERS['cbt-mindthos']} />;
}
