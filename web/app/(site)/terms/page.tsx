import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata({
  title: '서비스 이용약관',
  description: '마음토스 서비스 이용약관',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-[var(--container-prose)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
      <p className="eyebrow">법적 문서</p>
      <h1 className="mt-3">서비스 이용약관</h1>
      <p className="mt-4 text-[length:var(--t-small)] text-[var(--text-muted)]">
        본 약관은 외부 법무 검토 진행 중입니다. 검토 완료 후 게시일·시행일과 함께
        본문이 갱신됩니다.
      </p>

      <div className="prose mt-10">
        <h2>제 1 조 (목적)</h2>
        <p>
          본 약관은 마인드풀랩스 주식회사(이하 &ldquo;회사&rdquo;)가 제공하는
          &ldquo;마음토스&rdquo; 서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건과
          절차, 회사와 회원의 권리 · 의무 · 책임 사항 등을 규정함을 목적으로
          합니다.
        </p>

        <h2>제 2 조 (정의)</h2>
        <p>
          &ldquo;회원&rdquo;이란 본 약관에 동의하고 회사가 정한 절차에 따라
          서비스 이용 자격을 부여받은 자를 말합니다.
        </p>

        <h2>제 3 조 (약관의 효력 및 변경)</h2>
        <p>
          본 약관은 서비스를 이용하는 회원에게 그 효력이 발생합니다. 회사는
          관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경
          시 시행일 7 일 전부터 공지합니다.
        </p>

        <h2>제 4 조 (서비스의 제공)</h2>
        <p>
          회사는 상담사가 회기 기록을 안전하게 정리할 수 있도록 축어록 ·
          상담노트 · 사례개념화 · 가계도 등 AI 기반 보조 도구를 제공합니다.
          서비스는 결정 보조 도구이며, 최종 판단은 상담사에게 있습니다.
        </p>

        <h2>제 5 조 (정보 보안 및 학습 미사용)</h2>
        <p>
          회원이 업로드한 회기 자료는 학습에 사용되지 않으며, 저장 전부터
          암호화됩니다. 자세한 사항은 개인정보처리방침을 참조해 주십시오.
        </p>

        <h2>제 6 조 (회원의 의무)</h2>
        <p>
          회원은 내담자의 사전 동의 없이 식별 가능한 회기 자료를 업로드해서는
          안 되며, 서비스 이용 시 관련 법령 및 상담 윤리를 준수해야 합니다.
        </p>

        <hr />

        <p className="text-[length:var(--t-small)] text-[var(--text-muted)]">
          본 페이지는 출시 전 placeholder 본문입니다. 게시일 · 시행일 ·
          최종본은 법무 검토 후 갱신됩니다.
        </p>
      </div>
    </article>
  );
}
