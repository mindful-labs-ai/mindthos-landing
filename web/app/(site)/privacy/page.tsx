import { generatePageMetadata } from '@/lib/seo/metadata';
import { BUSINESS_INFO } from '@/constants/site';

export const metadata = generatePageMetadata({
  title: '개인정보처리방침',
  description: '마음토스 개인정보처리방침',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[var(--container-prose)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
      <p className="eyebrow">법적 문서</p>
      <h1 className="mt-3">개인정보처리방침</h1>
      <p className="mt-4 text-[length:var(--t-small)] text-[var(--text-muted)]">
        본 방침은 외부 법무 검토 진행 중입니다. 시행일과 함께 최종본으로
        갱신됩니다.
      </p>

      <div className="prose mt-10">
        <h2>1. 처리하는 개인정보의 항목</h2>
        <p>
          마인드풀랩스 주식회사(이하 &ldquo;회사&rdquo;)는 회원 가입 ·
          서비스 이용 · 문의 응대 등을 위해 다음과 같은 개인정보를 처리합니다.
        </p>
        <ul>
          <li>
            <strong>필수</strong> — 이름, 이메일, 소속(상담 기관 또는 개인 식별
            정보 외 기관명)
          </li>
          <li>
            <strong>선택</strong> — 연락처, 직위, 기관 도입 검토 사항
          </li>
          <li>
            <strong>자동 수집</strong> — IP, 접속 로그, 쿠키, 기기 정보 등
            서비스 이용 과정에서 자동 생성되는 정보
          </li>
        </ul>

        <h2>2. 개인정보의 수집 및 이용 목적</h2>
        <ul>
          <li>회원 식별 및 본인 확인</li>
          <li>서비스 제공 및 운영, 결제 · 정산</li>
          <li>고객 문의 응대 및 안내</li>
          <li>서비스 개선을 위한 통계 · 분석 (개인 식별 정보 제외)</li>
        </ul>

        <h2>3. 개인정보의 보유 및 이용 기간</h2>
        <p>
          개인정보는 수집 · 이용 목적이 달성된 후 지체 없이 파기합니다. 단,
          관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
        </p>

        <h2>4. 회기 자료 보관 및 학습 미사용 정책</h2>
        <p>
          회원이 업로드한 회기 녹음 · 텍스트 등 회기 자료는 어떤 모델 학습에도
          사용되지 않으며, 저장 전부터 암호화됩니다. 회원이 설정한 보관 정책에
          따라 자동 삭제됩니다.
        </p>

        <h2>5. 개인정보의 제 3 자 제공</h2>
        <p>
          회사는 회원의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만
          관계 법령에 의해 요구되는 경우는 예외로 합니다.
        </p>

        <h2>6. 회원의 권리</h2>
        <p>
          회원은 언제든지 자신의 개인정보를 조회 · 수정 · 삭제 · 처리정지를
          요청할 수 있습니다. 요청은 아래 개인정보 보호책임자에게 연락하시면
          지체 없이 처리됩니다.
        </p>

        <h2>7. 개인정보 보호책임자</h2>
        <p>
          {BUSINESS_INFO.privacyOfficer.name ? (
            <>이름: {BUSINESS_INFO.privacyOfficer.name}<br /></>
          ) : null}
          이메일:{' '}
          <a href={`mailto:${BUSINESS_INFO.privacyOfficer.email}`}>
            {BUSINESS_INFO.privacyOfficer.email}
          </a>
        </p>

        <hr />

        <p className="text-[length:var(--t-small)] text-[var(--text-muted)]">
          본 페이지는 출시 전 placeholder 본문입니다. 시행일 · 변경 이력은 법무
          검토 후 갱신됩니다.
        </p>
      </div>
    </article>
  );
}
