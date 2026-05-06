'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export function VsCompareSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §07 vs-compare in-view === */
    {
      const section = document.querySelector('.vs-compare');
      if (section) {
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || !('IntersectionObserver' in window)) {
          section.classList.add('vs-in-view');
        } else {
          const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting && e.intersectionRatio >= 0.15) {
                section.classList.add('vs-in-view');
                io.unobserve(section);
              }
            });
          }, { threshold: [0, 0.15, 0.4] });
          io.observe(section);
          cleanups.push(() => io.disconnect());
        }
      }
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
<section className="wf-section">
  <div className="container">
    <div className="wf-marker">
      <span className="num">07</span>
      <span className="name">범용 AI vs 마음토스 (좌우 비교)</span>
      <span className="purpose">5개 비교쌍 · 마음토스 영역은 단일 신뢰 패널로 강조</span>
    </div>

    <div className="vs-head">
      <h2 className="t-h2">마음토스가<br/>다른 AI와 다른 이유</h2>
    </div>

    <div className="vs-compare" aria-label="범용 AI와 마음토스 비교">
      
      <section className="vs-side vs-side-generic" aria-label="범용 AI 비교 항목">
        <header className="vs-side-head">
          <div className="vs-side-title">
            <span className="vs-side-name">범용 AI</span>
            <span className="vs-side-tag-brands" aria-hidden="true">
              <Image src="/logo-gemini.png" alt="" className="vs-brand-img vs-brand-gemini" width={470} height={135} />
              <Image src="/logo-gpt.png" alt="" className="vs-brand-img vs-brand-gpt" width={535} height={180} />
            </span>
          </div>
          <p className="vs-side-sub">대화창 안에서 즉시 답을 만드는 일반 AI</p>
        </header>
        <ol className="vs-rows">
          <li className="vs-row" data-num="01">
            <h4 className="vs-row-key">학습 사용 우려</h4>
            <p className="vs-row-sub">입력한 상담 기록이 모델 학습에 쓰일 수 있습니다</p>
          </li>
          <li className="vs-row" data-num="02">
            <h4 className="vs-row-key">대화창마다 기록이 흩어짐</h4>
            <p className="vs-row-sub">내담자별 기록이 여러 채팅 창에 섞여 흩어집니다</p>
          </li>
          <li className="vs-row" data-num="03">
            <h4 className="vs-row-key">이전 회기 흐름을 다시 입력</h4>
            <p className="vs-row-sub">지난 회기 요약과 변화 흐름을 매번 복사해 넣어야 합니다</p>
          </li>
          <li className="vs-row" data-num="04">
            <h4 className="vs-row-key">임상적 검토의 부재</h4>
            <p className="vs-row-sub">상담 현장 기준 없이 일반적인 답변으로 흐를 수 있습니다.</p>
          </li>
          <li className="vs-row" data-num="05">
            <h4 className="vs-row-key">양식은 매번 직접 지시</h4>
            <p className="vs-row-sub">SOAP·기관 양식 등을 매번 프롬프트로 지정해야 합니다</p>
          </li>
        </ol>
      </section>

      
      <section className="vs-side vs-side-mindthos" aria-label="마음토스 비교 항목">
        <span className="vs-side-watermark" aria-hidden="true">
          <Image src="/logo-mindthos-webclip.png" alt="" width={256} height={256} />
        </span>
        <header className="vs-side-head">
          <div className="vs-side-title">
            <Image className="vs-side-logo-img" src="/logo-mindthos.webp" alt="마음토스" width={420} height={108} />
          </div>
          <p className="vs-side-sub">상담사를 위한 전문 AI agent</p>
        </header>
        <ol className="vs-rows">
          <li className="vs-row" data-num="01">
            <h4 className="vs-row-key">AI 재학습 금지</h4>
            <p className="vs-row-sub">내담자 데이터는 AI 학습에 사용되지 않습니다</p>
          </li>
          <li className="vs-row" data-num="02">
            <h4 className="vs-row-key">내담자별 기록 관리</h4>
            <p className="vs-row-sub">내담자별 폴더로 회기 기록이 누적·관리됩니다</p>
          </li>
          <li className="vs-row" data-num="03">
            <h4 className="vs-row-key">회기별 맥락 연결</h4>
            <p className="vs-row-sub">누적된 회기 기록이 다음 상담 준비로 자연스럽게 이어집니다</p>
          </li>
          <li className="vs-row" data-num="04">
            <h4 className="vs-row-key">상담 맞춤형 지식</h4>
            <p className="vs-row-sub">상담 전문 맥락과 축적된 자료를 바탕으로 검토 가능한 초안을 정리합니다.</p>
          </li>
          <li className="vs-row" data-num="05">
            <h4 className="vs-row-key">상담 업무용 템플릿</h4>
            <p className="vs-row-sub">상담노트·기관·슈퍼비전 양식이 미리 준비되어 있습니다</p>
          </li>
        </ol>
      </section>
    </div>

    <div className="vs-bottom-note">
      <p><strong>마음토스는 상담사의 판단을 대체하지 않습니다.</strong><br/>상담 기록이 안전하게 남고, 다음 회기로 이어지도록 돕습니다.</p>
    </div>
  </div>

  
  
</section>
  );
}
