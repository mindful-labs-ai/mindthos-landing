import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { WEBINAR_OFFERS } from '@/constants/webinar';
import { WebinarDetail } from './WebinarDetail';

export const metadata: Metadata = generatePageMetadata({
  title: '초심 상담사를 위한 사례개념화 웨비나 — 10월 6일 (화) | 마음토스',
  description:
    '10월 6일 화요일 저녁 7시, 구글 밋 온라인 라이브. 이헌주 교수(양학회 1급)의 사례개념화 강연과 마음토스 AI 실무 세션을 90분에 담았습니다. 초심 상담사·수련생 대상, 참가비 1만원.',
  path: WEBINAR_OFFERS.default.path,
});

export default function CaseConceptualizationWebinarPage() {
  return <WebinarDetail offer={WEBINAR_OFFERS.default} />;
}
