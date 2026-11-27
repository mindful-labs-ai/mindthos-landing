import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  DBT_CASE_CONCEPTUALIZATION_WEBINAR,
  WEBINAR_OFFERS,
} from '@/constants/webinar';
import { WebinarDetail } from '../WebinarDetail';

/* 마음토스 회원 전용 할인 링크 — 프로그램 페이지·sitemap 에 노출하지 않고 링크로만 공유한다. */
/* 신청 마감 시각 이후 ISR 재생성 시 [신청 마감] 표기가 반영되도록 */
export const revalidate = 60;

export function generateMetadata(): Metadata {
  return generatePageMetadata({
    title: `${DBT_CASE_CONCEPTUALIZATION_WEBINAR.registrationClosed ? '[신청 마감] ' : ''}${'[마음토스 회원 전용] DBT로 사례개념화하기 웨비나 — 12월 22일 (화)'}`,
    description:
      '마음토스 회원 참가비 10,000원. 12월 22일 화요일 저녁 7시, Google Meet 온라인 라이브. 김윤수 교수의 DBT 사례개념화 강의와 마음토스 신규 기능 소개·DBT 사례개념화 시연.',
    path: WEBINAR_OFFERS['dbt-mindthos'].path,
    noindex: true,
  });
}

export default function DbtMindthosMemberWebinarPage() {
  return <WebinarDetail offer={WEBINAR_OFFERS['dbt-mindthos']} />;
}
