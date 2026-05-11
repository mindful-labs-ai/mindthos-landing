'use client';

import { useEffect } from 'react';

export function FaqSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §10 FAQ accordion === */
    {
      const list = document.querySelector('[data-faq-list]');
      if (list) {
        const items = list.querySelectorAll<HTMLElement>('[data-faq-item]');
        if (items.length) {
          const close = (item: HTMLElement): void => {
            item.classList.remove('open');
            const trig = item.querySelector('[data-faq-trigger]');
            if (trig) trig.setAttribute('aria-expanded', 'false');
            const t = item.querySelector('.toggle');
            if (t) t.textContent = '+';
          };
          const open = (item: HTMLElement): void => {
            items.forEach(other => { if (other !== item) close(other); });
            item.classList.add('open');
            const trig = item.querySelector('[data-faq-trigger]');
            if (trig) trig.setAttribute('aria-expanded', 'true');
            const t = item.querySelector('.toggle');
            if (t) t.textContent = '−';
          };
          items.forEach(item => {
            const trig = item.querySelector('[data-faq-trigger]');
            if (!trig) return;
            const handler = (): void => {
              if (item.classList.contains('open')) close(item);
              else open(item);
            };
            trig.addEventListener('click', handler);
            cleanups.push(() => trig.removeEventListener('click', handler));
          });
        }
      }
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
<section className="wf-section alt">
  <div className="container">
    <div className="wf-marker">
      <span className="num">10</span>
      <span className="name">자주 묻는 질문 (도입 전 마지막 정리)</span>
      <span className="purpose">크레딧 / 보안 / 상담사 검토 / 기관 도입 등 도입 전 마지막 불안 해소</span>
    </div>

    <div className="faq-head">
      <h2 className="t-h2">자주 묻는 질문</h2>
    </div>

    
    <div className="faq-list" data-faq-list>
      <article className="faq-item open" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="true" aria-controls="faq-a-1">
          <h3 className="q-text">내담자 데이터가 AI 학습에 사용되나요?</h3>
          <span className="toggle" aria-hidden="true">−</span>
        </button>
        <div className="faq-answer" id="faq-a-1" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">아니요. 마음토스는 내담자 데이터를 AI 학습에 사용하지 않는 원칙을 기준으로 설계됩니다. 상담 기록은 결과 생성을 위해 처리되며, 모델 재학습 데이터로 쓰이지 않습니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-2">
          <h3 className="q-text">상담 기록은 어떻게 보관되나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-2" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">상담 기록은 저장 전부터 암호화되어 보관됩니다. 접근 권한은 필요한 범위로 제한되며, 민감한 정보는 사용자가 원할 때 직접 비식별화를 적용할 수 있습니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-3">
          <h3 className="q-text">기록을 삭제할 수 있나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-3" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">네. 상담사는 필요에 따라 기록 삭제를 요청하거나 직접 관리할 수 있도록 준비 중입니다. 기관 도입 시에는 보관 기간과 삭제 정책, 권한 관리 기준을 함께 협의할 수 있습니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-4">
          <h3 className="q-text">무료로 시작하면 크레딧이 제공되나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-4" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">무료 시작 시 기본 크레딧 제공 여부와 수량은 운영 정책 확정 후 안내됩니다. 현재는 샘플 체험과 일부 기능을 통해 결과 흐름을 먼저 확인할 수 있도록 준비 중입니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-5">
          <h3 className="q-text">크레딧은 어떻게 차감되나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-5" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">크레딧은 작업 종류와 기록 길이에 따라 다르게 사용됩니다. 예를 들어 축어록, 상담노트, 사례개념화, 심리검사 해석처럼 처리 범위가 다른 작업은 사용량이 달라질 수 있습니다.</p>
            <p className="a-text">월 구독 플랜의 크레딧은 매월 새로 제공되며, 해당 월 안에서 사용하는 방식입니다. 사용하지 않은 크레딧은 다음 달로 이월되지 않고, 다음 결제 주기에 다시 갱신됩니다.</p>
            <p className="a-text">정확한 차감 기준은 운영 정책 확정 후 안내됩니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-6">
          <h3 className="q-text">결제 변경이나 해지는 쉬운가요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-6" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">플랜 변경과 해지는 사용자가 직접 관리할 수 있도록 준비 중입니다. 기관 플랜은 계약 조건에 따라 별도 협의가 필요할 수 있습니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-7">
          <h3 className="q-text">상담노트 양식은 어떤 것들이 있나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-7" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">기본 상담노트뿐 아니라 SOAP, 사례개념화, 기관 양식, 슈퍼비전 준비 등 상담 업무에 맞춘 템플릿을 제공하는 방향으로 준비하고 있습니다. 추후 기관별 양식도 확장할 수 있습니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-8">
          <h3 className="q-text">축어록 없이도 사용할 수 있나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-8" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">네. 녹음이나 축어록이 없어도 상담사 메모, 면담 기록, 검사 결과 등을 바탕으로 일부 기능을 사용할 수 있습니다. 단, 입력 자료가 많고 구체적일수록 결과 초안이 더 풍부해질 수 있습니다.</p>
          </div>
        </div>
      </article>
    </div>

    
    <div className="faq-foot">
      <p className="faq-foot-text">원하는 답을 찾지 못했다면,<br/>도입 상담에서 상황에 맞게 안내해드릴게요.</p>
      <a
        className="faq-foot-cta"
        href="/contact?type=institution-inquiry"
        data-cta-intent="institution_inquiry"
        data-cta-location="faq"
        data-cta-label="기관 도입 상담하기"
      >기관 도입 상담하기</a>
    </div>

    
    
  </div>
</section>
  );
}
