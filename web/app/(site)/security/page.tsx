import Image from 'next/image';
import { FinalCtaSection } from '@/components/home/sections/FinalCtaSection';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';
import './security.css';

export const metadata = generatePageMetadata({
  title: '상담 기록은 어떻게 보호되나요?',
  description:
    '마음토스의 데이터 보호 설계 — AI 학습 사용 금지, 저장 전 암호화, 접근 권한 분리, 비식별화, 삭제 요청 처리. 상담 기록을 보호가 필요한 민감 기록으로 다룹니다.',
  path: '/security',
});

const TRUST_TAGS = ['학습 금지', '저장 전 암호화', '접근 권한 분리', '비식별화'];

const PROTECTED_DATA = [
  '상담 회기 녹음 파일',
  '축어록 (Transcript)',
  '상담노트 / 진행노트',
  '사례개념화 문서',
  '가계도 (Genogram) 도식과 해석',
  '심리검사 해석 자료',
  '내담자 관련 상담사 메모',
];

const NO_AI_BULLETS = [
  '입력된 상담 기록은 해당 상담사의 기록 정리 결과를 만드는 데에만 사용됩니다.',
  '외부 모델 제공자에게도 학습 미사용 옵션을 적용해 호출합니다. 세부 계약 조건은 운영 정책 문서에서 확인 가능합니다.',
  '운영 로그·통계는 개별 내담자를 식별할 수 없는 형태로만 활용됩니다.',
];

const ENCRYPT_STEPS = [
  { step: '01', title: '읽을 수 있는 기록', body: '상담사가 직접 작성하거나 업로드한 원본 형태의 기록.' },
  { step: '02', title: '암호화 처리', body: '저장되기 전, 사람이 그대로 읽을 수 없는 형태로 변환됩니다.' },
  { step: '03', title: '안전한 저장', body: '암호화된 상태 그대로 저장되며, 키 관리 정책으로 분리됩니다.' },
];

const ACCESS_RULES: Array<{ title: string; desc: string }> = [
  {
    title: '본인 기록은 본인만',
    desc: '기본적으로 본인이 작성한 기록만 본인이 열람할 수 있도록 설계합니다.',
  },
  {
    title: '역할 단위 권한 분리',
    desc: '기관 도입 시 조직·역할 단위로 접근 권한을 분리해 운영합니다.',
  },
  {
    title: '내부 접근 최소화',
    desc: '운영팀 접근은 장애 대응·법적 의무 이행 등 명확한 사유에 한해 최소 범위로만 진행됩니다.',
  },
  {
    title: '접근 기록 감사화',
    desc: '주요 접근 기록은 추후 감사 가능한 형태로 남기는 것을 운영 원칙으로 설계합니다.',
  },
];

const DELETION_BULLETS = [
  '사용자는 계정 내에서 본인이 만든 기록을 직접 삭제할 수 있도록 설계합니다.',
  '별도 삭제 요청은 운영팀 채널을 통해 접수하고, 처리 결과는 회신합니다.',
  '법령상 보관 의무가 있는 경우만 별도 보관하고, 의무 종료 시 파기합니다.',
  '구체적인 보관 기간·파기 절차는 개인정보처리방침에 따라 운영합니다. (정책 확정 후 공개)',
];

const FAQ = [
  {
    q: '내담자 정보가 AI 학습에 쓰이나요?',
    a: '아니요. 마음토스에 입력된 상담 기록과 내담자 정보는 모델 학습 데이터로 사용되지 않습니다. 입력된 데이터는 해당 상담사의 기록 정리 결과를 만드는 데에만 사용됩니다. (기록 정리에 사용되는 외부 모델 제공자에도 학습 미사용을 적용하는 옵션을 사용 — 세부 계약 조건은 운영 정책 문서에서 확인 가능)',
  },
  {
    q: '상담 녹음 파일은 어떻게 저장되나요?',
    a: '서버에 저장될 때 데이터는 암호화된 상태로 저장됩니다. 전송 구간(브라우저 ↔ 서버) 역시 암호화된 통신을 사용합니다. 정확한 암호화 알고리즘과 키 관리 정책은 운영 보안 문서에 정리하고 있으며, 기관 도입 시 별도 안내드립니다.',
  },
  {
    q: '누가 상담 기록에 접근할 수 있나요?',
    a: '기본적으로는 해당 기록을 만든 상담사(계정 본인)만 접근할 수 있습니다. 기관 단위 도입의 경우 조직/역할 단위로 접근 권한을 분리해 운영합니다. 마음토스 운영팀의 내부 접근은 장애 대응·법적 의무 이행 등 명확한 사유에 한해 최소화된 범위에서만 진행됩니다.',
  },
  {
    q: '내담자 또는 상담사가 삭제 요청할 수 있나요?',
    a: '네. 사용자는 본인 계정 내 기록을 직접 삭제할 수 있고, 별도 삭제 요청도 받습니다. 처리 절차와 보관 기간은 개인정보처리방침에 따라 운영하며, 정확한 보관 기간 표기는 정책 확정 후 공개합니다.',
  },
];

export default function SecurityPage() {
  const faqSchema = generateFAQSchema(
    FAQ.map((item) => ({ question: item.q, answer: item.a })),
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '보안', url: `${SITE_CONFIG.url}/security` },
  ]);

  return (
    <>
      <SchemaMarkup schema={[faqSchema, breadcrumbSchema]} />

      {/* HERO — 풀-블리드 배경 이미지 + scrim 오버레이 (메인 홈 hero 패턴) */}
      <section className="security-hero" aria-label="상담 기록 보호 — 보안 페이지 헤더">
        <div className="security-hero-bg" aria-hidden="true">
          <Image
            src="/security/hero-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="security-hero-bg-img"
          />
        </div>
        <div className="security-hero-scrim" aria-hidden="true" />
        <div className="security-hero-overlay" aria-hidden="true" />
        <div className="security-hero-bottom-fade" aria-hidden="true" />

        <div className="container security-hero-content-wrap">
          <div className="security-hero-content">
            <span className="section-pill">Trust &amp; Security</span>
            <h1 className="security-hero-h1">
              상담 기록은
              <br />
              마음토스보다 먼저,
              <br />
              <span className="security-hero-h1-accent">안전하게 다뤄집니다.</span>
            </h1>
            <p className="security-hero-sub">
              마음토스는 상담 데이터를 일반 문서가 아니라 보호가 필요한 민감 기록으로 다룹니다.
              이 페이지는 마음토스가 데이터를 어떻게 보호하도록 설계되었는지 정리한 운영 기준 문서입니다.
            </p>
            <ul className="security-hero-tags" role="list">
              {TRUST_TAGS.map((tag) => (
                <li key={tag} className="t-tag">{tag}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* §1 보호 범위 */}
      <SecuritySection
        eyebrow="01 · 보호 범위"
        heading="상담 업무에서 다루는 모든 민감 기록을, 동일한 기준으로 보호합니다."
        sub="상담사가 마음토스에 업로드하거나 작성하는 자료 중 내담자와 회기를 식별할 수 있는 정보는 모두 민감 기록으로 보고 같은 보안 정책을 적용합니다."
        alt
      >
        <div className="security-grid--sidebyside">
          <div className="security-data-grid">
            {PROTECTED_DATA.map((item) => (
              <div key={item} className="security-data-cell">
                {item}
              </div>
            ))}
          </div>
          <SecurityImage
            src="/security/protected-data.png"
            alt="보호 대상 상담 기록 — 녹음·축어록·노트·사례개념화·가계도·검사 자료 카드 그리드"
            width={1536}
            height={1024}
          />
        </div>
      </SecuritySection>

      {/* §2 학습 미사용 */}
      <SecuritySection
        eyebrow="02 · 학습 미사용"
        heading="기록 정리에는 사용되지만, 모델 학습에는 사용되지 않습니다."
        sub="일반 AI 도구는 사용자 입력을 모델 개선에 활용할 수 있는 구조가 기본값일 때가 많습니다. 마음토스는 그 반대로 설계되어 있습니다."
      >
        <div className="security-grid--sidebyside">
          <ul className="security-bullets" role="list">
            {NO_AI_BULLETS.map((item) => (
              <li key={item} className="security-bullet">
                <span className="security-bullet-dot" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <SecurityImage
            src="/security/no-ai-training.png"
            alt="상담 기록이 AI 학습 데이터로 흘러가지 않도록 차단되는 흐름 다이어그램"
            width={1536}
            height={1024}
          />
        </div>
      </SecuritySection>

      {/* §3 암호화 */}
      <SecuritySection
        eyebrow="03 · 암호화"
        heading="기록은 “읽을 수 있는 상태” 그대로 저장되지 않습니다."
        sub="상담사가 작성·업로드한 데이터는 전송 단계와 저장 단계 모두 암호화된 상태로 다뤄집니다."
        alt
      >
        <ol className="security-steps" role="list">
          {ENCRYPT_STEPS.map((s) => (
            <li key={s.step} className="security-step">
              <span className="security-step-num">STEP {s.step}</span>
              <h3 className="security-step-title">{s.title}</h3>
              <p className="security-step-body">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="security-note">
          정확한 암호화 알고리즘·키 관리·로테이션 정책은 운영 보안 문서로 정리하고 있으며,
          기관 도입 검토 시 별도로 안내드립니다.
        </p>
      </SecuritySection>

      {/* §4 권한 분리 */}
      <SecuritySection
        eyebrow="04 · 권한 분리"
        heading="모든 사람이 모든 기록을 볼 수 있는 구조가 아닙니다."
        sub="기록의 민감도를 고려해, 접근 가능한 사람을 계정·조직·역할 단위로 분리합니다. 내부 접근도 사유와 범위를 최소화하는 방향으로 운영합니다."
      >
        <div className="security-grid--sidebyside">
          <ul className="security-rules" role="list">
            {ACCESS_RULES.map((r) => (
              <li key={r.title} className="security-rule">
                <h3 className="security-rule-title">{r.title}</h3>
                <p className="security-rule-desc">{r.desc}</p>
              </li>
            ))}
          </ul>
          <SecurityImage
            src="/security/access-roles.png"
            alt="역할 기반 접근 모델 — 권한별로 접근 깊이가 달라지는 동심원 보호 구조"
            width={1536}
            height={1024}
          />
        </div>
      </SecuritySection>

      {/* §5 비식별화 */}
      <SecuritySection
        eyebrow="05 · 비식별화"
        heading="이름·연락처·기관명 같은 식별 정보는 그대로 두지 않습니다."
        sub="축어록과 노트 안의 직접 식별 정보(이름·전화번호·기관명·주소 등)는 비식별화 처리 흐름을 통과한 뒤 분석에 사용됩니다. 아래는 가상 예시입니다."
        alt
      >
        <div className="security-compare">
          <article className="security-compare-card security-compare-card--before">
            <header>원문 (가상 예시)</header>
            <p>
              “<strong>김지수</strong>님이 다음 주 화요일에 방문하기로 했고, 회사인{' '}
              <strong>한빛출판사</strong>에 일이 너무 많아 힘들다고 하셨어요.{' '}
              <strong>010-1234-5678</strong>로 연락 가능합니다.”
            </p>
          </article>
          <span className="security-compare-arrow" aria-hidden>
            →
          </span>
          <article className="security-compare-card security-compare-card--after">
            <header>비식별화 처리</header>
            <p>
              “<strong>[내담자]</strong>님이 다음 주 화요일에 방문하기로 했고,{' '}
              <strong>[근무처]</strong>에 일이 너무 많아 힘들다고 하셨어요.{' '}
              <strong>[연락처]</strong>로 연락 가능합니다.”
            </p>
          </article>
        </div>
        <p className="security-note">
          위 예시는 비식별화 흐름을 보여주기 위한 가상 사례입니다. 실제 식별 정보 처리 범위는 정책에 따라
          확장될 수 있으며, 정확한 적용 범위는 운영 정책 기준으로 정리 예정입니다.
        </p>
      </SecuritySection>

      {/* §6 삭제 권한 */}
      <SecuritySection
        eyebrow="06 · 삭제 권한"
        heading="필요한 시점에 삭제하고, 보관 기간은 명확하게 정의합니다."
      >
        <ul className="security-bullets security-bullets--2col" role="list">
          {DELETION_BULLETS.map((item) => (
            <li key={item} className="security-bullet">
              <span className="security-bullet-dot" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="security-note">
          본 페이지는 운영 기준 초안이며, 일부 항목(보관 기간·외부 감사·인증 취득 여부)은 확정 후 별도 공지합니다.
        </p>
      </SecuritySection>

      {/* FAQ */}
      <section className="wf-section alt">
        <div className="container">
          <header className="security-faq-head">
            <span className="section-pill">FAQ</span>
            <h2 className="t-h2">자주 묻는 보안 질문</h2>
          </header>
          <ul className="security-faq-list" role="list">
            {FAQ.map((item) => (
              <li key={item.q} className="security-faq-item">
                <h3 className="security-faq-q">Q. {item.q}</h3>
                <p className="security-faq-a">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA — 메인과 동일 */}
      <FinalCtaSection />
    </>
  );
}

function SecuritySection({
  eyebrow,
  heading,
  sub,
  children,
  alt = false,
}: {
  eyebrow: string;
  heading: string;
  sub?: string;
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <section className={alt ? 'wf-section alt' : 'wf-section'}>
      <div className="container">
        <header className="security-section-head">
          <span className="section-pill">{eyebrow}</span>
          <h2 className="t-h2">{heading}</h2>
          {sub ? <p className="t-sub">{sub}</p> : null}
        </header>
        <div>{children}</div>
      </div>
    </section>
  );
}

function SecurityImage({
  src,
  alt,
  width,
  height,
  aspect = '4 / 3',
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspect?: string;
  priority?: boolean;
}) {
  return (
    <div
      className="security-image"
      style={{ ['--ph-aspect' as string]: aspect }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(max-width: 880px) 100vw, 50vw"
        className="security-image-img"
      />
    </div>
  );
}
