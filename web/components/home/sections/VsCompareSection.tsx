'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { MindthosLogo } from '@/components/layout/MindthosLogo';

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
<section className="wf-section" data-funnel-section="vs_compare">
  <div className="container">
    <div className="wf-marker">
      <span className="num">07</span>
      <span className="name">범용 AI vs 마음토스 (좌우 비교)</span>
      <span className="purpose">5개 비교쌍 · 마음토스 영역은 단일 신뢰 패널로 강조</span>
    </div>

    <div className="vs-head">
      <h2 className="t-h2">같은 채팅이어도,<br/><span className="brand-word">마음토스</span>는 내 내담자를 압니다</h2>
    </div>

    <div className="vs-compare" aria-label="범용 AI와 마음토스 비교">
      
      <section className="vs-side vs-side-generic" aria-label="범용 AI 비교 항목">
        <header className="vs-side-head">
          <div className="vs-side-title">
            <span className="vs-side-name">범용 AI</span>
            <span className="vs-side-tag-brands" aria-hidden="true">
              <Image src="/logo-gemini.webp" alt="" className="vs-brand-img vs-brand-gemini" width={470} height={135} />
              <Image src="/logo-gpt.webp" alt="" className="vs-brand-img vs-brand-gpt" width={535} height={180} />
            </span>
          </div>
          <p className="vs-side-sub">내 내담자를 모르는 일반 AI 채팅</p>
        </header>
        <ol className="vs-rows">
          <li className="vs-row" data-num="01">
            <h3 className="vs-row-key">기록을 매번 복사해 붙여 넣기</h3>
            <p className="vs-row-sub">지난 회기 요약과 축어록을 창마다 다시 넣어야 합니다</p>
          </li>
          <li className="vs-row" data-num="02">
            <h3 className="vs-row-key">답이 텍스트뿐</h3>
            <p className="vs-row-sub">받은 답을 노트·문서로 다시 옮겨 적어야 합니다</p>
          </li>
          <li className="vs-row" data-num="03">
            <h3 className="vs-row-key">형식은 매번 다시 지시</h3>
            <p className="vs-row-sub">SOAP·기관 양식·인용 형식을 매번 프롬프트로 적어야 합니다</p>
          </li>
          <li className="vs-row" data-num="04">
            <h3 className="vs-row-key">AI마다 따로 가입</h3>
            <p className="vs-row-sub">GPT·Claude·Gemini를 각각 가입하고 창마다 오가야 합니다</p>
          </li>
          <li className="vs-row" data-num="05">
            <h3 className="vs-row-key">학습 사용 우려</h3>
            <p className="vs-row-sub">입력한 상담 기록이 모델 학습에 쓰일 수 있습니다</p>
          </li>
        </ol>
      </section>

      
      <section className="vs-side vs-side-mindthos" aria-label="마음토스 비교 항목">
        <span className="vs-side-watermark" aria-hidden="true">
          <Image src="/logo-mindthos-webclip.webp" alt="" width={256} height={256} />
        </span>
        <header className="vs-side-head">
          <div className="vs-side-title">
            <MindthosLogo className="vs-side-logo-img" aria-label="마음토스" />
          </div>
          <p className="vs-side-sub">상담사를 위한 안전한 AI 파트너</p>
        </header>
        <ol className="vs-rows">
          <li className="vs-row" data-num="01">
            <h3 className="vs-row-key">기록을 붙여 넣지 않습니다</h3>
            <p className="vs-row-sub">내 내담자 기록을 이미 알고 있어 이름만 적으면 됩니다</p>
          </li>
          <li className="vs-row" data-num="02">
            <h3 className="vs-row-key">노트·PPT·일정으로 바로</h3>
            <p className="vs-row-sub">답을 상담노트·파일·일정으로 만들어 저장합니다</p>
          </li>
          <li className="vs-row" data-num="03">
            <h3 className="vs-row-key">작성 형식을 기억</h3>
            <p className="vs-row-sub">한 번 알려 준 양식과 말투로 계속 씁니다</p>
          </li>
          <li className="vs-row" data-num="04">
            <h3 className="vs-row-key">세 AI를 한곳에서</h3>
            <p className="vs-row-sub">GPT·Claude·Gemini를 마음토스 안에서 골라 씁니다</p>
          </li>
          <li className="vs-row" data-num="05">
            <h3 className="vs-row-key">학습 금지 · 저장 전 암호화</h3>
            <p className="vs-row-sub">내담자 데이터는 AI 학습에 사용되지 않습니다</p>
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
