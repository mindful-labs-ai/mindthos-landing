/**
 * 마음토스 리소스(블로그) 카테고리.
 *
 * 4개 placeholder 로 시작:
 *   - general-blog: 일반 블로그 (상담 인사이트 등)
 *   - tech-blog:    기술/보안 블로그
 *   - guides:       상담사 가이드 / 사용 매뉴얼
 *   - case-studies: 도입 사례 (기관·개인)
 *
 * 향후 콘텐츠 전략 확정 시 supabase/migrations/ 의 시드와 함께 보강하세요.
 */

export type TargetAudience = 'counselor' | 'institution' | 'general';
export type CTAType = 'free-trial' | 'institution-inquiry' | 'newsletter';

export interface CategoryConfig {
  slug: string;
  name: string;
  description: string;
  targetAudience: TargetAudience;
  defaultCtaType: CTAType;
  sortOrder: number;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'general-blog',
    name: '일반 블로그',
    description: '상담 현장의 인사이트와 마음토스 활용 사례',
    targetAudience: 'counselor',
    defaultCtaType: 'free-trial',
    sortOrder: 1,
  },
  {
    slug: 'tech-blog',
    name: '기술 블로그',
    description: '마음토스의 보안, AI 기술, 인프라 이야기',
    targetAudience: 'general',
    defaultCtaType: 'free-trial',
    sortOrder: 2,
  },
  {
    slug: 'guides',
    name: '상담사 가이드',
    description: '마음토스 사용 가이드와 상담사 워크플로우 자료',
    targetAudience: 'counselor',
    defaultCtaType: 'free-trial',
    sortOrder: 3,
  },
  {
    slug: 'case-studies',
    name: '도입 사례',
    description: '기관/개인 상담사의 마음토스 도입 사례',
    targetAudience: 'institution',
    defaultCtaType: 'institution-inquiry',
    sortOrder: 4,
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
