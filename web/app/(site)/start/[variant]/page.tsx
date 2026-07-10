import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VariantLanding } from '@/components/home/VariantLanding';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { getVariant, VARIANT_KEYS } from '@/constants/landing-variants';

/**
 * 유입 경로별 맞춤 랜딩 라우트 (T3 기획 §3-2).
 *
 * `/start/genogram` 등 광고 소재 URL 과 1:1. variant 별 독립 정적 생성 + ISR.
 * 전부 noindex(§7) — organic 검색 인덱싱 집합(홈+제품+블로그)은 불변.
 * UTM 은 진입 시 쿼리로 얹히고 기존 UtmForwarder 가 app 가입까지 보존.
 */

export const revalidate = 3600;
/** 사전 정의된 variant 만 유효 — 그 외 경로는 404. */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ variant: string }> {
  return VARIANT_KEYS.map((variant) => ({ variant }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}): Promise<Metadata> {
  const { variant } = await params;
  const cfg = getVariant(variant);
  if (!cfg) {
    return generatePageMetadata({
      title: '마음토스',
      description: '상담사를 위한 안전한 AI 파트너, 마음토스.',
      path: '/',
      noindex: true,
    });
  }
  return generatePageMetadata({
    title: cfg.metaTitle,
    description: cfg.metaDescription,
    path: `/start/${variant}`,
    noindex: cfg.noindex,
  });
}

export default async function VariantLandingPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const cfg = getVariant(variant);
  if (!cfg) notFound();
  return <VariantLanding cfg={cfg} />;
}
