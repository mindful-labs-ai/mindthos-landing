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
<section className="wf-section alt" data-funnel-section="faq">
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
            <p className="a-text">네. 상담사가 내담자·회기 기록을 직접 삭제할 수 있습니다. 기관 도입 시에는 보관 기간과 삭제 정책, 권한 관리 기준을 함께 협의합니다.</p>
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
            <p className="a-text">신규 가입하시면 첫 1주일을 무료로 써 보실 수 있습니다. 무료 기간에 제공되는 크레딧과 범위는 가입 화면에서 안내합니다.</p>
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
            <p className="a-text">플랜 변경과 해지는 설정의 구독 관리에서 직접 할 수 있습니다. 앱에서 구독하셨다면 App Store·Google Play 구독 관리에서 해지합니다. 기관 플랜은 계약 조건에 따라 협의합니다.</p>
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
            <p className="a-text">기본 상담노트, SOAP, 가족센터, 사례개념화, 기관 제출용, 수퍼비전 준비 등 20가지가 넘는 양식을 제공합니다. 자주 쓰는 내 양식을 저장해 두고 채팅에서 이름으로 불러 쓸 수도 있습니다.</p>
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

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-9">
          <h3 className="q-text">AI 채팅에 입력한 내용도 학습에 쓰이나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-9" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">아니요. 채팅에 적은 내용과 채팅이 참고한 상담 기록 모두 AI 학습에 사용되지 않습니다. 다른 기록과 같은 보호 원칙(저장 전 암호화·학습 금지)을 따릅니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-10">
          <h3 className="q-text">채팅이 제 기록이나 일정을 마음대로 바꾸나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-10" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">아니요. 일정처럼 바뀌는 작업은 결과를 카드로 먼저 보여 드리고, 이름이 같은 내담자가 있으면 추측하지 않고 먼저 되묻습니다.</p>
          </div>
        </div>
      </article>

      <article className="faq-item" data-faq-item>
        <button type="button" className="faq-q" data-faq-trigger aria-expanded="false" aria-controls="faq-a-11">
          <h3 className="q-text">휴대폰에서도 쓸 수 있나요?</h3>
          <span className="toggle" aria-hidden="true">+</span>
        </button>
        <div className="faq-answer" id="faq-a-11" role="region">
          <div className="faq-answer-inner">
            <p className="a-text">네. iOS·Android 앱에서 녹음을 올리고, 축어록·상담노트를 확인하고, 채팅을 쓸 수 있습니다. 웹과 같은 계정으로 이어집니다.</p>
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
