import Link from 'next/link';
import {
  ArrowRight,
  FileAudio,
  FileText,
  GitBranch,
  HelpCircle,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata({
  title: '사용 가이드',
  description:
    '마음토스 첫 사용자를 위한 단계별 가이드. 가입 → 회기 업로드 → 노트 생성 → 사례개념화 → 보안 설정.',
  path: '/guide',
});

interface GuideTopic {
  slug: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  steps: string[];
}

const TOPICS: GuideTopic[] = [
  {
    slug: 'getting-started',
    icon: <Sparkles className="h-5 w-5" aria-hidden />,
    title: '시작하기',
    body: '가입부터 첫 회기 업로드까지 5분 안에 끝내실 수 있습니다.',
    steps: [
      '이메일·소속을 입력하고 무료로 가입합니다',
      '내담자 동의서 템플릿을 다운로드해 회기 시작 전 안내합니다',
      '회기 녹음 또는 텍스트 원본을 준비합니다',
    ],
  },
  {
    slug: 'transcribe',
    icon: <FileAudio className="h-5 w-5" aria-hidden />,
    title: '축어록 만들기',
    body: '60분 회기를 5분 안에 정리합니다. 화자 분리·비식별 처리는 자동입니다.',
    steps: [
      '회기 녹음 파일을 업로드합니다 (.m4a / .wav / .mp3)',
      '비식별 강도와 화자 라벨을 설정합니다',
      '결과 텍스트에서 인용 출처가 그대로 유지됩니다',
    ],
  },
  {
    slug: 'progress-note',
    icon: <FileText className="h-5 w-5" aria-hidden />,
    title: '상담노트 생성',
    body: '축어록 결과를 SOAP/DAP 형식 노트로 자동 정리합니다.',
    steps: [
      '양식 (SOAP / DAP / 자유형) 을 선택하거나 자동 분기로 둡니다',
      '위험 신호 표시와 회기 간 연속성 참조를 확인합니다',
      '필요 시 직접 보정한 뒤 저장 / 내보내기를 선택합니다',
    ],
  },
  {
    slug: 'conceptualization-genogram',
    icon: <GitBranch className="h-5 w-5" aria-hidden />,
    title: '사례개념화 / 가계도',
    body: '이론 프레임에 따라 작업 가설과 가계도 초안을 함께 받습니다.',
    steps: [
      '이론 프레임 (CBT / 정신역동 / 해결중심 / 통합) 을 선택합니다',
      '핵심 신념·세대 패턴을 검토하고, 슈퍼비전 양식으로 출력합니다',
      '가계도는 PNG / PDF 로 내보내 회의 자료로 활용합니다',
    ],
  },
  {
    slug: 'security',
    icon: <ListChecks className="h-5 w-5" aria-hidden />,
    title: '보안 설정',
    body: '학습 미사용·암호화·비식별은 디폴트입니다. 추가로 조절할 수 있는 항목을 안내합니다.',
    steps: [
      '회기 보관 기간을 1일 / 7일 / 30일 / 영구 중에서 선택합니다',
      '비식별 강도와 마스킹 범위를 회기 단위로 조절합니다',
      '기관 사용자라면 SSO·로깅·관리자 권한을 추가로 설정합니다',
    ],
  },
];

export default function GuidePage() {
  return (
    <>
      <section className="border-b border-[var(--line-1)] bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <p className="eyebrow">사용 가이드</p>
          <h1 className="mt-3 max-w-3xl">
            처음 사용하는 상담사를 위한 단계별 안내
          </h1>
          <p className="mt-5 max-w-prose text-[length:var(--t-lead)] text-[var(--text-body)]">
            가입 → 회기 업로드 → 노트 생성 → 사례개념화 / 가계도 → 보안 설정
            순서로 정리했습니다. 각 단계는 5–10 분이면 끝납니다.
          </p>
          <div className="mt-8">
            <Link
              href="/contact?type=free-trial"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-soft)]"
            >
              무료로 시작하기 <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]">
          <ul className="space-y-12">
            {TOPICS.map((topic, idx) => (
              <li
                key={topic.slug}
                id={topic.slug}
                className="grid gap-6 md:grid-cols-[200px_1fr]"
              >
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary-pale)] text-[var(--brand-primary-dark)]">
                    {topic.icon}
                  </span>
                  <p className="mt-3 text-[length:var(--t-eyebrow)] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Step {String(idx + 1).padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <h2 className="text-[length:var(--t-h2-mobile)] md:text-[length:var(--t-h2)]">
                    {topic.title}
                  </h2>
                  <p className="mt-3 max-w-prose text-[var(--text-body)]">
                    {topic.body}
                  </p>
                  <ol className="mt-6 space-y-3">
                    {topic.steps.map((step, i) => (
                      <li
                        key={step}
                        className="flex items-start gap-3 rounded-xl border border-[var(--line-1)] bg-[var(--bg-elevated)] p-4"
                      >
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[length:var(--t-meta)] font-semibold text-[var(--text-primary)]">
                          {i + 1}
                        </span>
                        <span className="text-[var(--text-primary)]">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--bg-warm)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-[var(--section-py-tablet)] text-center md:py-[var(--section-py-desktop)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-base)] text-[var(--brand-primary-dark)]">
            <HelpCircle className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="mt-4">막히는 부분이 있나요?</h2>
          <p className="mx-auto mt-4 max-w-prose text-[var(--text-body)]">
            가이드만으로 풀리지 않는 케이스는 문의 채널로 연락주세요. 영업일
            기준 1일 이내 회신드립니다.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-[var(--brand-primary-dark)] bg-transparent px-6 py-3.5 text-[length:var(--t-cta)] font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--brand-primary-pale)]"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
