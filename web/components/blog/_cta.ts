export interface CTAProgram {
  title: string;
  slug: string;
  cta_heading: string | null;
  cta_button_text: string | null;
}

export interface CTAConfig {
  kicker?: string;
  heading: string;
  buttonText: string;
  href: string;
  external: boolean;
}

export function resolveCTA(
  ctaType: string,
  program?: CTAProgram | null,
): CTAConfig {
  if (program) {
    return {
      kicker: program.title,
      heading: program.cta_heading ?? '자세히 알아보기',
      buttonText: program.cta_button_text ?? '무료로 시작하기',
      href: '/about-service#features',
      external: false,
    };
  }
  if (ctaType === 'institution-inquiry') {
    return {
      heading: '기관 도입 문의하기',
      buttonText: '카카오톡 오픈채팅 열기',
      href: 'https://open.kakao.com/me/Mindthos',
      external: true,
    };
  }
  return {
    heading: '상담사를 위한 가장 안전한 AI 에이전트, 마음토스',
    buttonText: '무료로 시작하기',
    href: 'https://app.mindthos.com/?utm_source=blog&utm_medium=channel-post&utm_campaign=mindthos',
    external: true,
  };
}
