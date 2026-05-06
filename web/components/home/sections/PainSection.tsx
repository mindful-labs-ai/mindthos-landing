'use client';

import Image from 'next/image';

/* NOTE: Fade-up animation for `.pain-scenes .pain-scene` is owned by HifiLanding.tsx
   because the fade-up effect spans both §02 (.trust-team / .trust-protect-item) and §03
   (this section) targets in a single shared IntersectionObserver group. */
export function PainSection() {
  return (
<section className="wf-section tone-light">
  <div className="container">
    <div className="pain-head pain-head--lean">
      <h2 className="t-h2">기록은 남았지만,<br/>해석은 여전히 흩어져 있어요</h2>
    </div>

    <div className="pain-scenes">

      
      <article className="pain-scene">
        <div className="pain-scene-stage pain-stage-converge paingfx-canvas paingfx-01" aria-label="흩어진 자료가 한 사람의 사례로 연결되는 모습">
          <Image className="paingfx-01-img" src="/scene-01-converge.png" alt="" aria-hidden="true" width={1448} height={1086} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="pain-scene-text" data-skip-legacy>
          <h3 className="pain-scene-title">흩어진 자료를 한 사람의 이야기로 묶어야 할 때</h3>
          <blockquote className="pain-quote">
            <p>“검사 결과랑 면담 기록이 따로 놀 때,<br/>그걸 한 사람의 이야기로 묶는 게 제일 막막해요.”</p>
            <cite>상담 현장 인터뷰</cite>
          </blockquote>
        </div>
      </article>

      
      <article className="pain-scene reverse">
        <div className="pain-scene-stage pain-stage-fanout paingfx-canvas paingfx-02" aria-label="상담 후 작성할 문서가 산더미처럼 쌓이는 모습">
          <Image className="paingfx-02-img" src="/scene-02-stack.png" alt="" aria-hidden="true" width={1448} height={1086} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="pain-scene-text">
          <h3 className="pain-scene-title">같은 내용을<br/>또 써야 할 때</h3>
          <blockquote className="pain-quote">
            <p>“같은 회기를 양식마다 다시 정리하느라,<br/>퇴근 시간이 자꾸 늦어집니다.”</p>
            <cite>기관 상담사 인터뷰</cite>
          </blockquote>
        </div>
      </article>

      
      <article className="pain-scene">
        <div className="pain-scene-stage pain-stage-bridge paingfx-canvas paingfx-03" aria-label="기록은 남아 있지만 다음 회기로 이어갈 실마리가 꼬이는 모습">
          <Image className="paingfx-03-img" src="/scene-03-tangle.png" alt="" aria-hidden="true" width={1448} height={1086} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="pain-scene-text">
          <h3 className="pain-scene-title">다음 회기에서 어디부터 이어갈지 막막할 때</h3>
          <blockquote className="pain-quote">
            <p>“기록은 남았는데,<br/>다음 회기에서 어디부터 이어가야 할지 다시 찾아봐요.”</p>
            <cite>실제 상담사 인터뷰</cite>
          </blockquote>
        </div>
      </article>

      </div>

    <p className="pain-motion">scene별 자료가 아직 연결 전 상태로 흩어져 있고, 중앙의 통합·점검·연결은 상담사의 손에 남아 있음</p>
  </div>
  
  
</section>
  );
}
