import Link from 'next/link';
import { ArrowRight, Lock, Shield, KeyRound, Database, Eye, Trash2, Building2 } from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata({
  title: '상담 기록은 어떻게 보호되나요?',
  description:
    '마음토스의 데이터 보호 설계 — AI 학습 사용 금지, 저장 전 암호화, 접근 권한 분리, 비식별화, 삭제 요청 처리. 상담 기록을 보호가 필요한 민감 기록으로 다룹니다.',
  path: '/security',
});

const PROTECTED_DATA = [
  '상담 회기 녹음 파일',
  '축어록(Transcript)',
  '상담노트 / 진행노트',
  '사례개념화 문서',
  '가계도(Genogram) 도식과 해석',
  '심리검사 해석 자료',
  '내담자 관련 상담사 메모',
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
  {
    q: '기관 도입 시 보안 검토가 가능한가요?',
    a: '가능합니다. 기관 단위 도입을 검토하시는 경우 보안 검토 자료(데이터 흐름·접근 통제·암호화 적용 범위 등)를 함께 안내드립니다. 자세한 내용은 기관 도입 상담 페이지를 통해 문의해 주세요.',
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--line-1)] bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 md:py-28">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-dark)]">
            Trust &amp; Security
          </p>
          <h1 className="mt-4 text-[34px] font-bold leading-tight tracking-tight text-[var(--text-heading-strong)] md:text-[44px]">
            상담 기록은 어떻게 보호되나요?
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--text-body)]">
            마음토스는 상담 데이터를 일반 문서가 아니라, 보호가 필요한 민감 기록으로 다룹니다.
            아래 페이지는 마음토스가 데이터를 어떻게 보호하도록 설계되었는지 정리한 운영 기준 문서입니다.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2 text-[12.5px] font-medium text-[var(--brand-primary-dark)]">
            {['학습 금지', '저장 전 암호화', '접근 권한 분리', '비식별화'].map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[var(--brand-primary-tint)] bg-[var(--brand-primary-pale)] px-3 py-1"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* §1 보호하는 데이터 */}
      <SectionShell eyebrow="1. 마음토스가 보호하는 데이터" heading="상담 업무에서 다루는 모든 민감 기록을 동일한 기준으로 보호합니다.">
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          상담사가 마음토스에 업로드하거나 작성하는 자료 중 내담자와 회기를 식별할 수 있는 정보는 모두
          민감 기록으로 보고 같은 보안 정책을 적용합니다.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PROTECTED_DATA.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 rounded-lg border border-[var(--line-1)] bg-white px-4 py-3 text-[14px] text-[var(--text-primary)]"
            >
              <Database className="h-4 w-4 text-[var(--brand-primary-dark)]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* §2 AI 학습 미사용 */}
      <SectionShell
        eyebrow="2. AI 학습에 사용하지 않습니다"
        heading="기록 정리에는 사용되지만, 모델 학습에는 사용되지 않습니다."
        icon={<Shield className="h-5 w-5" aria-hidden />}
        alt
      >
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          일반 AI 도구는 사용자가 입력한 내용을 모델 개선에 활용할 수 있는 구조가 기본값일 때가 많습니다.
          마음토스는 그 반대로 설계되어 있습니다. 입력하신 상담 기록과 내담자 정보는 마음토스의 모델
          학습이나 외부 모델의 추가 학습에 사용되지 않습니다.
        </p>
        <ul className="mt-6 space-y-3 text-[14.5px] text-[var(--text-body)]">
          <Bullet>입력된 상담 기록은 해당 상담사의 기록 정리 결과를 만드는 데만 사용</Bullet>
          <Bullet>외부 모델 제공자에는 학습 미사용 옵션을 적용해 호출 (세부 계약 조건은 운영 정책 문서에서 확인 필요)</Bullet>
          <Bullet>운영 로그·통계는 개별 내담자 식별이 불가능한 형태로만 활용</Bullet>
        </ul>
      </SectionShell>

      {/* §3 저장 전 암호화 */}
      <SectionShell
        eyebrow="3. 저장 전부터 암호화합니다"
        heading="기록은 “읽을 수 있는 상태” 그대로 저장되지 않습니다."
        icon={<Lock className="h-5 w-5" aria-hidden />}
      >
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          상담사가 작성·업로드한 데이터는 전송 단계와 저장 단계 모두 암호화된 상태로 다뤄집니다.
          데이터는 “읽을 수 있는 기록 → 암호화된 데이터 → 안전한 저장” 흐름을 거칩니다.
        </p>
        <ol className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { step: '01', title: '읽을 수 있는 기록', body: '상담사가 직접 작성하거나 업로드한 원본 형태' },
            { step: '02', title: '암호화 처리', body: '저장되기 전, 사람이 그대로 읽을 수 없는 형태로 변환' },
            { step: '03', title: '안전한 저장', body: '암호화된 상태 그대로 저장 — 키 관리 정책으로 분리' },
          ].map((s) => (
            <li
              key={s.step}
              className="rounded-2xl border border-[var(--line-1)] bg-white p-5"
            >
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[var(--brand-primary-dark)]">
                STEP {s.step}
              </p>
              <p className="mt-2 text-[16px] font-bold text-[var(--text-heading-strong)]">
                {s.title}
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-body)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-lg border border-[var(--line-1)] bg-[var(--bg-warm)] px-4 py-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          정확한 암호화 알고리즘·키 관리·로테이션 정책은 운영 보안 문서로 정리하고 있으며,
          기관 도입 검토 시 별도로 안내드립니다.
        </p>
      </SectionShell>

      {/* §4 접근 권한 분리 */}
      <SectionShell
        eyebrow="4. 접근 권한을 분리합니다"
        heading="모든 사람이 모든 기록을 볼 수 있는 구조가 아닙니다."
        icon={<KeyRound className="h-5 w-5" aria-hidden />}
        alt
      >
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          기록의 민감도를 고려해, 접근 가능한 사람을 계정 / 조직 / 역할 단위로 분리합니다.
          내부 접근도 사유와 범위를 최소화하는 방향으로 운영합니다.
        </p>
        <ul className="mt-6 space-y-3 text-[14.5px] text-[var(--text-body)]">
          <Bullet>기본적으로 본인이 작성한 기록만 본인이 열람</Bullet>
          <Bullet>기관 도입 시 조직 / 역할 단위 권한 분리 운영</Bullet>
          <Bullet>운영팀 내부 접근은 장애 대응·법적 의무 이행 등 명확한 사유에 한해 최소화된 범위로 진행</Bullet>
          <Bullet>주요 접근 기록은 감사 가능한 형태로 남기는 것을 운영 원칙으로 설계</Bullet>
        </ul>
      </SectionShell>

      {/* §5 비식별화 */}
      <SectionShell
        eyebrow="5. 민감정보를 비식별화합니다"
        heading="이름·연락처·기관명 같은 식별 정보는 그대로 두지 않습니다."
        icon={<Eye className="h-5 w-5" aria-hidden />}
      >
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          축어록과 노트 안의 직접 식별 정보(이름·전화번호·기관명·주소 등)는 비식별화 처리 흐름을
          통과한 뒤 분석에 사용됩니다. 아래는 가상 예시입니다.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ExampleCard label="원문 (가상 예시)" tone="warm">
            <p>“김지수님이 다음 주 화요일에 방문하기로 했고, 회사인 한빛출판사에 일이 너무 많아 힘들다고 하셨어요. 010-1234-5678로 연락 가능합니다.”</p>
          </ExampleCard>
          <ExampleCard label="비식별화 처리" tone="brand">
            <p>“[내담자]님이 다음 주 화요일에 방문하기로 했고, [근무처]에 일이 너무 많아 힘들다고 하셨어요. [연락처]로 연락 가능합니다.”</p>
          </ExampleCard>
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          위 예시는 비식별화 흐름을 보여주기 위한 가상 사례입니다. 실제 식별 정보 처리 범위는 정책에 따라
          확장될 수 있으며, 정확한 적용 범위는 운영 정책 기준으로 정리 예정입니다.
        </p>
      </SectionShell>

      {/* §6 삭제 요청 / 데이터 관리 */}
      <SectionShell
        eyebrow="6. 삭제 요청과 데이터 관리"
        heading="필요한 시점에 삭제하고, 보관 기간은 명확하게 정의합니다."
        icon={<Trash2 className="h-5 w-5" aria-hidden />}
        alt
      >
        <ul className="space-y-3 text-[14.5px] text-[var(--text-body)]">
          <Bullet>사용자는 계정 내에서 본인이 만든 기록을 직접 삭제할 수 있도록 설계</Bullet>
          <Bullet>별도 삭제 요청은 운영팀 채널을 통해 접수 — 처리 결과는 회신</Bullet>
          <Bullet>법령상 보관 의무가 있는 경우만 별도 보관, 의무 종료 시 파기</Bullet>
          <Bullet>구체적인 보관 기간·파기 절차는 개인정보처리방침에 따라 운영 (정책 확정 후 공개)</Bullet>
        </ul>
        <p className="mt-5 rounded-lg border border-[var(--line-1)] bg-white px-4 py-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          본 페이지는 운영 기준 초안이며, 일부 항목(보관 기간, 외부 감사, 인증 취득 여부)은 확정 후 별도 공지합니다.
        </p>
      </SectionShell>

      {/* §7 기관 도입 시 보안 검토 */}
      <SectionShell
        eyebrow="7. 기관 도입 시 보안 검토"
        heading="기관 담당자가 확인할 수 있도록 보안 검토 자료를 함께 드립니다."
        icon={<Building2 className="h-5 w-5" aria-hidden />}
      >
        <p className="text-[15px] leading-relaxed text-[var(--text-body)]">
          센터·기관 단위로 도입을 검토할 때 보안 검토에 필요한 항목을 정리해 함께 안내드립니다.
          정확한 항목은 기관의 요청에 맞춰 조정합니다.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[
            '데이터 흐름 다이어그램(입력 → 처리 → 저장)',
            '암호화 적용 범위 및 키 관리 개요',
            '접근 권한 / 역할 분리 모델',
            '비식별화 처리 범위와 한계',
            '삭제 요청 처리 절차',
            '계약 조건 / 위탁 처리 자료',
          ].map((item) => (
            <li
              key={item}
              className="rounded-lg border border-[var(--line-1)] bg-white px-4 py-3 text-[14px] text-[var(--text-primary)]"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Link
            href="/contact?type=institution-inquiry"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--brand-primary-dark)]"
          >
            기관 도입 상담 시 보안 검토 자료 받기
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </SectionShell>

      {/* FAQ */}
      <section className="border-t border-[var(--line-1)] bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[1120px] px-6 py-20 md:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-dark)]">
            FAQ
          </p>
          <h2 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[var(--text-heading-strong)] md:text-[32px]">
            자주 묻는 보안 질문
          </h2>
          <ul className="mt-10 divide-y divide-[var(--line-1)] border-y border-[var(--line-1)]">
            {FAQ.map((item) => (
              <li key={item.q} className="py-7">
                <h3 className="text-[18px] font-bold text-[var(--text-heading-strong)]">
                  Q. {item.q}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--text-body)]">
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA — 랜딩 .final-cta-section와 동일한 시각 톤 */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f8faf7 0%, #eef2ee 100%)',
          padding: '100px 0 92px',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '820px',
            height: '820px',
            background: 'radial-gradient(circle, rgba(22, 138, 53, 0.13), transparent 60%)',
            zIndex: 0,
          }}
        />
        <div className="relative z-[1] mx-auto max-w-[1280px] px-6">
          <h2
            className="mx-auto max-w-[720px] text-center font-extrabold"
            style={{
              fontSize: 'clamp(32px, 3.6vw, 46px)',
              letterSpacing: '-0.034em',
              lineHeight: 1.3,
              color: '#0f172a',
              wordBreak: 'keep-all',
            }}
          >
            상담 기록 정리,<br />이제 더 가볍게
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://app.mindthos.com"
              className="group inline-flex items-center justify-center gap-2 transition-[transform,background] duration-200"
              style={{
                height: '60px',
                padding: '0 36px',
                fontSize: '16.5px',
                fontWeight: 700,
                letterSpacing: '-0.005em',
                borderRadius: '12px',
                background: '#168A35',
                color: '#ffffff',
              }}
            >
              무료로 시작하기
              <span
                aria-hidden
                className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]"
              >
                →
              </span>
            </a>
            <Link
              href="/contact?type=institution-inquiry"
              className="inline-flex items-center justify-center transition-colors"
              style={{
                color: '#168A35',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.005em',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(22, 138, 53, 0.55)',
                textDecorationThickness: '1.5px',
                textUnderlineOffset: '5px',
              }}
            >
              기관 도입 상담
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionShell({
  eyebrow,
  heading,
  children,
  alt = false,
  icon,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
  alt?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <section
      className={
        alt
          ? 'border-t border-[var(--line-1)] bg-[var(--bg-elevated)]'
          : 'border-t border-[var(--line-1)] bg-[var(--bg-base)]'
      }
    >
      <div className="mx-auto max-w-[1120px] px-6 py-16 md:py-20">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-primary-pale)] text-[var(--brand-primary-dark)]">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-dark)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-tight text-[var(--text-heading-strong)] md:text-[28px]">
              {heading}
            </h2>
          </div>
        </div>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand-primary-dark)]"
      />
      <span>{children}</span>
    </li>
  );
}

function ExampleCard({
  label,
  tone,
  children,
}: {
  label: string;
  tone: 'warm' | 'brand';
  children: React.ReactNode;
}) {
  const styles =
    tone === 'brand'
      ? 'border-[var(--brand-primary-tint)] bg-[var(--brand-primary-pale)]'
      : 'border-[var(--line-1)] bg-white';
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <p
        className={
          tone === 'brand'
            ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-dark)]'
            : 'mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]'
        }
      >
        {label}
      </p>
      <div className="text-[14.5px] leading-relaxed text-[var(--text-primary)]">
        {children}
      </div>
    </div>
  );
}
