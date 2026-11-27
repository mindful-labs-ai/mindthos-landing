import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  DBT_CASE_CONCEPTUALIZATION_WEBINAR,
  WEBINAR_OFFERS,
} from '@/constants/webinar';
import { WebinarDetail } from './WebinarDetail';

/* 신청 마감 시각 이후 ISR 재생성 시 [신청 마감] 표기가 반영되도록 */
export const revalidate = 60;

export function generateMetadata(): Metadata {
  return generatePageMetadata({
    title: `${DBT_CASE_CONCEPTUALIZATION_WEBINAR.registrationClosed ? '[신청 마감] ' : ''}${'DBT로 사례개념화하기 웨비나 — 12월 22일 (화)'}`,
    description:
      '12월 22일 화요일 저녁 7시, Google Meet 온라인 라이브. 김윤수 교수의 DBT 사례개념화 강의와 마음토스 신규 기능 소개·DBT 사례개념화 시연을 90분에 담았습니다. 일반 참가비 2만원.',
    path: WEBINAR_OFFERS.dbt.path,
  });
}

export default function DbtCaseConceptualizationWebinarPage() {
  return <WebinarDetail offer={WEBINAR_OFFERS.dbt} />;
}
