'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '내담자의 상담 기록이 AI 학습에 사용되나요?',
    a: '아닙니다. 마음토스에 업로드된 모든 상담 기록은 AI 모델 학습에 사용되지 않습니다. 학습 분리는 AI 제공사와의 계약·시스템 설계 단계에서부터 명시되어 있으며, 메모리 격리와 감사 로그로 검증됩니다.',
  },
  {
    q: '상담 기록은 어떻게 보호되나요?',
    a: '전송 순간부터 HTTPS·TLS로 암호화되며, 저장 시에도 AES-256으로 암호화됩니다. 개인정보는 비식별 처리된 뒤에만 AI 처리 단계로 진입하고, 본인 계정에서만 결과 확인이 가능합니다. 모든 접근은 로그로 남습니다.',
  },
  {
    q: '진단·확정 판단을 마음토스가 대신하나요?',
    a: '아닙니다. 마음토스의 결과는 상담사의 검토를 위한 초안입니다. 진단이나 확정 판단을 대체하지 않으며, 임상적 판단의 최종 책임은 상담사에게 있습니다.',
  },
  {
    q: '어떤 상담 양식을 지원하나요?',
    a: 'SOAP, DAP, BIRP 같은 표준 양식 외에 기관별 커스텀 양식도 설정할 수 있습니다. 같은 회기 자료를 내담자용·슈퍼비전용·기관용 양식으로 분기 출력합니다.',
  },
  {
    q: '심리검사 해석은 어떤 검사를 지원하나요?',
    a: 'MMPI, SCT, HTP, PAI 등 면담에서 자주 활용되는 심리검사 자료와 면담 기록을 함께 참고해 통합 해석 초안을 제안합니다. 새로운 검사 추가는 기관 도입 단계에서 협의 가능합니다.',
  },
  {
    q: '결제는 어떻게 진행되나요?',
    a: '월간 구독 결제로 진행되며, 무료 플랜은 신용카드 정보 없이 가입할 수 있습니다. 기관 도입은 별도 견적·계약을 통해 진행합니다.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="border-b border-[var(--line-2)] bg-[var(--bg-elevated)] py-[var(--section-py-tablet)] md:py-[var(--section-py-desktop)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)]">
        <div className="mx-auto max-w-[var(--max-width-narrow)] text-center">
          <p className="eyebrow mb-3">자주 묻는 질문</p>
          <h2>
            안심하고 시작할 수 있도록
            <br />
            가장 많이 받은 질문에 먼저 답합니다.
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-[var(--max-width-narrow)] space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={item.q}
                className={`rounded-xl border transition-colors ${
                  isOpen
                    ? 'border-[var(--brand-primary-dark)]/30 bg-[var(--brand-primary-pale)]'
                    : 'border-[var(--line-1)] bg-[var(--bg-base)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[length:var(--t-body)] font-semibold text-[var(--text-heading-strong)] sm:px-6"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div className="border-t border-[var(--line-2)] px-5 pb-5 pt-3 text-[var(--text-body)] sm:px-6">
                    {item.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
