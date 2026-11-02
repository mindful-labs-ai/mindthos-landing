import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  CBT_CASE_CONCEPTUALIZATION_WEBINAR,
  WEBINAR_OFFERS,
} from '@/constants/webinar';
import { WebinarDetail } from './WebinarDetail';

export const metadata: Metadata = generatePageMetadata({
  title: `${CBT_CASE_CONCEPTUALIZATION_WEBINAR.registrationClosed ? '[신청 마감] ' : ''}${'CBT로 사례개념화하기 웨비나 — 11월 17일 (화)'}`,
  description:
    '11월 17일 화요일 저녁 7시, Google Meet 온라인 라이브. 김윤수 교수의 CBT 사례개념화 강의와 새로워진 마음토스의 신규 기능·사례개념화 시연을 90분에 담았습니다. 일반 참가비 2만원.',
  path: WEBINAR_OFFERS.cbt.path,
});

export default function CbtCaseConceptualizationWebinarPage() {
  return <WebinarDetail offer={WEBINAR_OFFERS.cbt} />;
}
