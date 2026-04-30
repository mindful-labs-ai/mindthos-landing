export type TargetAudience = 'client' | 'professional';
export type CTAType = 'consultation' | 'education' | 'newsletter';

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
    slug: 'mental-health',
    name: '마음건강',
    description: '일상에서 마음건강을 지키는 방법과 심리적 어려움에 대한 이해',
    targetAudience: 'client',
    defaultCtaType: 'consultation',
    sortOrder: 1,
  },
  {
    slug: 'counseling-stories',
    name: '심리상담 이야기',
    description: '심리상담 과정과 경험에 대한 이야기',
    targetAudience: 'client',
    defaultCtaType: 'consultation',
    sortOrder: 2,
  },
  {
    slug: 'relationships-communication',
    name: '관계/소통',
    description: '건강한 관계를 위한 소통법과 갈등 해결 방법',
    targetAudience: 'client',
    defaultCtaType: 'consultation',
    sortOrder: 3,
  },
  {
    slug: 'children-youth',
    name: '아동·청소년',
    description: '아동과 청소년의 심리 발달과 정신건강',
    targetAudience: 'client',
    defaultCtaType: 'consultation',
    sortOrder: 4,
  },
  {
    slug: 'self-growth',
    name: '자기성장',
    description: '자존감, 마음챙김, 자기계발을 위한 심리학적 접근',
    targetAudience: 'client',
    defaultCtaType: 'newsletter',
    sortOrder: 5,
  },
  {
    slug: 'expert-column',
    name: '상담사 전문가 칼럼',
    description: '심리상담 전문가의 깊이 있는 분석과 칼럼',
    targetAudience: 'professional',
    defaultCtaType: 'education',
    sortOrder: 6,
  },
  {
    slug: 'education-certification',
    name: '교육·자격 정보',
    description: '심리상담사 자격증, 보수교육, 전문 교육 과정 정보',
    targetAudience: 'professional',
    defaultCtaType: 'education',
    sortOrder: 7,
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
