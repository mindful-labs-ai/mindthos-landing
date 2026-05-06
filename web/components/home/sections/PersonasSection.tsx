'use client';

import { useEffect } from 'react';

export function PersonasSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §06 persona rail === */
    {
      const root = document.querySelector<HTMLElement>('[data-persona-rail]');
      if (root) {
        const cards = Array.from(root.querySelectorAll<HTMLElement>('.persona-card'));
        const wrap = root.parentElement;
        const prevBtn = wrap ? wrap.querySelector<HTMLElement>('[data-persona-prev]') : null;
        const nextBtn = wrap ? wrap.querySelector<HTMLElement>('[data-persona-next]') : null;
        const dotsEl = wrap ? wrap.querySelector('[data-persona-dots]') : null;
        const counterEl = wrap ? wrap.querySelector<HTMLElement>('[data-persona-counter]') : null;
        const dots = dotsEl ? Array.from(dotsEl.querySelectorAll<HTMLElement>('.persona-rail-dot')) : [];
        const total = cards.length;
        if (total > 0) {
          let center = 0;
          for (let i = 0; i < total; i++) {
            if (cards[i].getAttribute('data-slot') === '0') { center = i; break; }
          }
          const half = Math.floor(total / 2);
          const render = (): void => {
            cards.forEach((card, i) => {
              let offset = i - center;
              while (offset > half) offset -= total;
              while (offset < -half) offset += total;
              card.setAttribute('data-slot', String(offset));
              card.setAttribute('aria-hidden', Math.abs(offset) > 1 ? 'true' : 'false');
            });
            for (let j = 0; j < dots.length; j++) {
              if (j === center) dots[j].setAttribute('aria-current', 'true');
              else dots[j].removeAttribute('aria-current');
            }
            if (counterEl) counterEl.innerHTML = '<strong>' + (center + 1) + '</strong>/' + total;
          };
          const go = (delta: number): void => {
            center = (center + delta + total) % total;
            render();
          };
          if (prevBtn) {
            const h = (): void => go(-1);
            prevBtn.addEventListener('click', h);
            cleanups.push(() => prevBtn.removeEventListener('click', h));
          }
          if (nextBtn) {
            const h = (): void => go(1);
            nextBtn.addEventListener('click', h);
            cleanups.push(() => nextBtn.removeEventListener('click', h));
          }
          root.setAttribute('tabindex', '0');
          const keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
          };
          root.addEventListener('keydown', keyHandler);
          cleanups.push(() => root.removeEventListener('keydown', keyHandler));
          render();
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
      <span className="num">06</span>
      <span className="name">페르소나 · 사용 상황 (Situation cards 5)</span>
      <span className="purpose">직함이 아닌 ‘막히는 장면’으로 분기 · 5개 카드 동등 무게 · 자기 매칭</span>
    </div>

    <div className="persona-head persona-head--lean">
      <h2 className="t-h2">기록이 밀리는 순간부터,<br/>해석이 막히는 회기까지</h2>
    </div>

    
    <div className="persona-rail-wrap">

      <button type="button" className="persona-nav persona-nav-prev persona-nav-side" data-persona-prev aria-label="이전 상황">←</button>
      <button type="button" className="persona-nav persona-nav-next persona-nav-side" data-persona-next aria-label="다음 상황">→</button>

      <div className="persona-rail" data-persona-rail aria-label="상담사 사용 상황 카드 rail">

        
        <article className="persona-card" data-slot="-2">
          <div className="persona-card-art" aria-hidden="true">
            
            <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="p1pile-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef6f0"/>
                  <stop offset="100%" stopColor="#dcebde"/>
                </linearGradient>
                <linearGradient id="p1pile-skin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f7f4ec"/>
                  <stop offset="100%" stopColor="#ece7da"/>
                </linearGradient>
              </defs>

              
              <rect width="320" height="220" fill="url(#p1pile-bg)"/>

              
              <g transform="translate(8 188)" stroke="#168A35" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.62">
                <path d="M0 12 L 6 0 L 12 12 z"/>
                <line x1="6" y1="4" x2="6" y2="8"/>
                <circle cx="6" cy="10.5" r="0.5" fill="#168A35" stroke="none"/>
              </g>

              
              <g transform="translate(220 12)">
                <rect width="36" height="20" rx="3" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.2"/>
                <line x1="0" y1="6" x2="36" y2="6" stroke="#1F2937" strokeWidth="1.2"/>
                <text x="18" y="16" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="9" fontWeight="700" fill="#1F2937">MON</text>
              </g>

              
              <g transform="translate(232 50)">
                
                <circle cx="36" cy="36" r="34" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.6"/>
                <circle cx="36" cy="36" r="34" fill="none" stroke="#bfe7c4" strokeWidth="2" opacity="0.65"/>
                
                <circle cx="36" cy="6"  r="1.4" fill="#1F2937"/>
                <circle cx="66" cy="36" r="1.4" fill="#1F2937"/>
                <circle cx="36" cy="66" r="1.4" fill="#1F2937"/>
                <circle cx="6"  cy="36" r="1.4" fill="#1F2937"/>
                
                <circle cx="50.5" cy="9.5"  r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="61.5" cy="20.5" r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="61.5" cy="51.5" r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="50.5" cy="62.5" r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="21.5" cy="62.5" r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="10.5" cy="51.5" r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="10.5" cy="20.5" r="0.9" fill="#1F2937" opacity="0.55"/>
                <circle cx="21.5" cy="9.5"  r="0.9" fill="#1F2937" opacity="0.55"/>
                
                <line x1="36" y1="36" x2="22" y2="20" stroke="#1F2937" strokeWidth="2.6" strokeLinecap="round"/>
                
                <line x1="36" y1="36" x2="36" y2="12" stroke="#168A35" strokeWidth="2" strokeLinecap="round"/>
                
                <circle cx="36" cy="36" r="2.6" fill="#1F2937"/>
                
                <text x="36" y="86" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="10" fontWeight="700" fill="#1F2937">10:00 PM</text>
              </g>

              
              <g stroke="#32D74B" strokeWidth="1.4" strokeLinecap="round" opacity="0.42">
                <line x1="208" y1="76" x2="222" y2="76"/>
                <line x1="212" y1="86" x2="222" y2="86"/>
              </g>

              
              
              <g transform="translate(28 50) rotate(-4)">
                <rect width="124" height="52" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="6" fill="none" stroke="#1F2937" strokeWidth="1.2"/>
                <circle cx="14" cy="13" r="1.8" fill="none" stroke="#1F2937" strokeWidth="1.2"/>
                <path d="M9 19 Q 14 16 19 19" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="26" y1="12" x2="80" y2="12" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <line x1="26" y1="18" x2="64" y2="18" stroke="#94a3b8" strokeWidth="1"/>
                <circle cx="14" cy="34" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="34" x2="96" y2="34" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <circle cx="14" cy="42" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="42" x2="86" y2="42" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(72 76) rotate(3)">
                <rect width="120" height="46" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <path d="M8 18 Q 12 10 16 18 Q 20 26 24 18 Q 28 10 32 18" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="42" y1="14" x2="92" y2="14" stroke="#1F2937" strokeWidth="1.1" opacity="0.55"/>
                <circle cx="14" cy="34" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="34" x2="98" y2="34" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(20 102) rotate(-2)">
                <rect width="124" height="50" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="12" cy="14" r="1.6" fill="#32D74B"/>
                <line x1="20" y1="14" x2="86" y2="14" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <circle cx="12" cy="22" r="1.6" fill="#32D74B"/>
                <line x1="20" y1="22" x2="76" y2="22" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <circle cx="12" cy="30" r="1.6" fill="#32D74B"/>
                <line x1="20" y1="30" x2="84" y2="30" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <circle cx="12" cy="38" r="1.6" fill="#32D74B"/>
                <line x1="20" y1="38" x2="68" y2="38" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(8 142) rotate(-8)">
                <rect width="42" height="38" fill="#bfe7c4" stroke="#1F2937" strokeWidth="1.2"/>
                <line x1="6" y1="10" x2="34" y2="10" stroke="#1F2937" strokeWidth="1" opacity="0.6"/>
                <line x1="6" y1="18" x2="30" y2="18" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="26" x2="34" y2="26" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(168 100) rotate(6)">
                <rect width="50" height="42" rx="4" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.2"/>
                <line x1="6" y1="10" x2="40" y2="10" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="18" x2="38" y2="18" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="26" x2="42" y2="26" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="34" x2="34" y2="34" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(40 152) rotate(1)">
                <rect width="158" height="40" rx="9" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.4"/>
                <circle cx="16" cy="20" r="9" fill="#bfe7c4" stroke="#1F2937" strokeWidth="1.3"/>
                <polygon points="13,16 13,24 22,20" fill="#1F2937"/>
                <g stroke="#1F2937" strokeWidth="1.3" strokeLinecap="round">
                  <line x1="34" y1="16" x2="34" y2="24"/>
                  <line x1="38" y1="13" x2="38" y2="27"/>
                  <line x1="42" y1="11" x2="42" y2="29"/>
                  <line x1="46" y1="15" x2="46" y2="25"/>
                  <line x1="50" y1="11" x2="50" y2="29"/>
                  <line x1="54" y1="16" x2="54" y2="24"/>
                  <line x1="58" y1="13" x2="58" y2="27"/>
                  <line x1="62" y1="15" x2="62" y2="25"/>
                  <line x1="66" y1="12" x2="66" y2="28"/>
                  <line x1="70" y1="16" x2="70" y2="24"/>
                  <line x1="74" y1="11" x2="74" y2="29"/>
                  <line x1="78" y1="15" x2="78" y2="25"/>
                  <line x1="82" y1="13" x2="82" y2="27"/>
                  <line x1="86" y1="16" x2="86" y2="24"/>
                  <line x1="90" y1="12" x2="90" y2="28"/>
                  <line x1="94" y1="16" x2="94" y2="24"/>
                  <line x1="98" y1="15" x2="98" y2="25"/>
                  <line x1="102" y1="13" x2="102" y2="27"/>
                  <line x1="106" y1="17" x2="106" y2="23"/>
                  <line x1="110" y1="16" x2="110" y2="24"/>
                  <line x1="114" y1="18" x2="114" y2="22"/>
                  <line x1="118" y1="16" x2="118" y2="24"/>
                  <line x1="122" y1="15" x2="122" y2="25"/>
                  <line x1="126" y1="17" x2="126" y2="23"/>
                  <line x1="130" y1="18" x2="130" y2="22"/>
                  <line x1="134" y1="16" x2="134" y2="24"/>
                  <line x1="138" y1="18" x2="138" y2="22"/>
                  <line x1="142" y1="17" x2="142" y2="23"/>
                  <line x1="146" y1="18" x2="146" y2="22"/>
                </g>
                <text x="135" y="14" textAnchor="end" fontFamily="Pretendard, sans-serif" fontSize="8" fill="#1F2937" opacity="0.55">42:18</text>
              </g>

              
              <circle cx="200" cy="48" r="17" fill="#168A35"/>
              <text x="200" y="55" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="18" fontWeight="800" fill="#fff">6</text>
              
              <text x="200" y="78" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="9" fontWeight="600" fill="#168A35" opacity="0.85">남은 노트</text>

              
              <line x1="0" y1="198" x2="320" y2="198" stroke="#1F2937" strokeWidth="1.2" opacity="0.30"/>

              
              <g transform="translate(208 122)">
                
                <path d="M0 76 L 6 36 Q 30 24 64 32 Q 78 38 78 76 Z" fill="url(#p1pile-skin)" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round"/>
                
                <path d="M2 76 L 10 56 Q 36 48 84 52 L 92 76 Z" fill="url(#p1pile-skin)" stroke="#1F2937" strokeWidth="1.4" strokeLinejoin="round"/>
                
                <ellipse cx="46" cy="46" rx="20" ry="14" fill="url(#p1pile-skin)" stroke="#1F2937" strokeWidth="1.5"/>
                
                <path d="M28 42 Q 32 26 46 26 Q 62 26 64 42 Q 60 36 50 36 Q 36 38 30 42 Z" fill="#1F2937"/>
                
                <path d="M28 42 Q 26 50 30 56 L 34 56 L 34 46 Z" fill="#1F2937" opacity="0.55"/>
                
                <line x1="38" y1="50" x2="44" y2="50" stroke="#1F2937" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
              </g>

              
              <g stroke="#32D74B" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
                <path d="M286 142 L 296 142 L 286 152 L 296 152"/>
                <path d="M276 156 L 282 156 L 276 162 L 282 162"/>
              </g>
            </svg>
          </div>
          <p className="persona-card-cat">기록이 밀리는 상담사</p>
          <h3 className="persona-card-scene">월요일 밤 10시,<br/>아직 노트가 6개 남았다면</h3>
          <blockquote className="persona-card-quote">상담은 끝났는데, 기록은 자꾸 하루씩 밀려요.</blockquote>
          <p className="persona-card-desc">회기 녹음과 메모를 바로 쓸 수 있는 상담노트 초안으로 정리합니다.</p>
          <ul className="persona-card-tags">
            <li>축어록</li>
            <li>상담노트</li>
          </ul>
        </article>

        
        <article className="persona-card" data-slot="-1">
          <div className="persona-card-art" aria-hidden="true">
            
            <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="p2int-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef6f0"/>
                  <stop offset="100%" stopColor="#dcebde"/>
                </linearGradient>
                <radialGradient id="p2int-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(74, 222, 128, 0.28)"/>
                  <stop offset="70%" stopColor="rgba(74, 222, 128, 0.06)"/>
                  <stop offset="100%" stopColor="rgba(74, 222, 128, 0)"/>
                </radialGradient>
              </defs>

              
              <rect width="320" height="220" fill="url(#p2int-bg)"/>

              
              <circle cx="160" cy="110" r="84" fill="none" stroke="rgba(22,163,74,0.08)" strokeWidth="0.9"/>
              <circle cx="160" cy="110" r="58" fill="none" stroke="rgba(22,163,74,0.10)" strokeWidth="0.9" strokeDasharray="3 4"/>

              
              <ellipse cx="158" cy="112" rx="64" ry="40" fill="url(#p2int-glow)"/>

              
              <g transform="translate(18 56)">
                <path d="M0 0 H58 L68 10 V108 H0 z" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M58 0 V10 H68" fill="none" stroke="#1F2937" strokeWidth="1.4"/>
                <circle cx="10" cy="14" r="2.4" fill="#168A35"/>
                <line x1="16" y1="14" x2="58" y2="14" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="26" x2="60" y2="26" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="34" x2="56" y2="34" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="42" x2="60" y2="42" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="50" x2="48" y2="50" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="58" x2="58" y2="58" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="66" x2="42" y2="66" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="76" x2="60" y2="76" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="84" x2="56" y2="84" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="6" y1="94" x2="50" y2="94" stroke="#94a3b8" strokeWidth="1"/>
              </g>

              
              <circle cx="98" cy="80" r="3" fill="#32D74B"/>
              <circle cx="92" cy="108" r="3.4" fill="#32D74B"/>
              <circle cx="98" cy="138" r="3" fill="#32D74B"/>
              <circle cx="116" cy="68" r="2.4" fill="#32D74B" opacity="0.75"/>

              
              <g stroke="#32D74B" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                <path d="M 100 80 c 28 -8 46 12 26 30 c -22 20 48 30 68 -8"/>
                <path d="M 95 108 c 22 -22 60 -2 48 28 c -10 30 70 -8 64 -28"/>
                <path d="M 100 138 c 28 2 38 -22 68 -10 c 30 12 56 -22 50 -42"/>
                <path d="M 119 68 c 8 28 -18 50 12 58 c 30 8 50 -20 68 0"/>
              </g>

              
              <text x="146" y="56" fontFamily="Pretendard, sans-serif" fontSize="16" fontWeight="700" fill="#32D74B" opacity="0.85">?</text>
              <text x="170" y="44" fontFamily="Pretendard, sans-serif" fontSize="22" fontWeight="700" fill="#168A35" opacity="0.95">?</text>
              <circle cx="194" cy="58" r="1.4" fill="#32D74B" opacity="0.6"/>
              <circle cx="200" cy="64" r="1.2" fill="#32D74B" opacity="0.5"/>

              
              <line x1="208" y1="110" x2="232" y2="110" stroke="#32D74B" strokeWidth="1.7" strokeLinecap="round"/>
              <polygon points="234,110 226,106 226,114" fill="#32D74B"/>

              
              <line x1="86" y1="108" x2="92" y2="108" stroke="#32D74B" strokeWidth="1.6" strokeLinecap="round" opacity="0.65"/>

              
              <g transform="translate(238 26)">
                <rect x="0" y="0" width="68" height="168" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="0" y="0" width="4" height="168" rx="2" fill="#168A35"/>
                <text x="12" y="20" fontFamily="Pretendard, sans-serif" fontSize="9" fontWeight="700" fill="#1F2937">Hypothesis</text>
                <line x1="12" y1="26" x2="60" y2="26" stroke="#94a3b8" strokeWidth="0.8" opacity="0.5"/>
                
                <g opacity="0.88">
                  <circle cx="14" cy="42" r="1.7" fill="#168A35"/>
                  <line x1="20" y1="42" x2="58" y2="42" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="48" x2="48" y2="48" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="66" r="1.7" fill="#168A35"/>
                  <line x1="20" y1="66" x2="60" y2="66" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="72" x2="50" y2="72" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="90" r="1.7" fill="#168A35"/>
                  <line x1="20" y1="90" x2="58" y2="90" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="96" x2="44" y2="96" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="114" r="1.7" fill="#168A35"/>
                  <line x1="20" y1="114" x2="60" y2="114" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="120" x2="46" y2="120" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="138" r="1.7" fill="#168A35"/>
                  <line x1="20" y1="138" x2="58" y2="138" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="144" x2="42" y2="144" stroke="#94a3b8" strokeWidth="1"/>
                </g>
              </g>
            </svg>
          </div>
          <p className="persona-card-cat">통합 해석이 막히는 상담사</p>
          <h3 className="persona-card-scene">검사 결과와 면담 기록이<br/>따로 놀 때</h3>
          <blockquote className="persona-card-quote">검사 결과는 있는데, 실제 면담 흐름과 어떻게 연결해야 할지 막막해요.</blockquote>
          <p className="persona-card-desc">검사 결과와 회기 기록을 함께 보며 통합 해석 초안을 정리합니다.</p>
          <ul className="persona-card-tags">
            <li>심리검사 해석</li>
            <li>사례개념화</li>
          </ul>
        </article>

        
        <article className="persona-card" data-slot="0">
          <div className="persona-card-art" aria-hidden="true">
            
            <svg viewBox="0 24 320 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="p3sup-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef6f0"/>
                  <stop offset="100%" stopColor="#dcebde"/>
                </linearGradient>
                <linearGradient id="p3sup-skin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f7f4ec"/>
                  <stop offset="100%" stopColor="#ece7da"/>
                </linearGradient>
              </defs>

              
              <rect width="320" height="244" fill="url(#p3sup-bg)"/>

              
              <circle cx="252" cy="124" r="86" fill="none" stroke="rgba(22,163,74,0.10)" strokeWidth="0.9"/>
              <circle cx="252" cy="124" r="60" fill="none" stroke="rgba(22,163,74,0.12)" strokeWidth="0.9" strokeDasharray="3 4"/>

              
              <g transform="translate(20 16)" stroke="#168A35" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55">
                <path d="M2 6 c4 -6 12 -2 8 4 c -3 6 -10 0 -6 -6 c 4 -4 12 2 8 6"/>
              </g>

              
              
              <g transform="translate(20 38) rotate(-8)">
                <rect width="68" height="50" rx="3" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <text x="6" y="16" fontFamily="Pretendard, sans-serif" fontSize="13" fontWeight="700" fill="#168A35">?</text>
                <line x1="18" y1="14" x2="58" y2="14" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="24" x2="60" y2="24" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="32" x2="52" y2="32" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="40" x2="56" y2="40" stroke="#94a3b8" strokeWidth="0.9"/>
              </g>

              
              <g transform="translate(102 30) rotate(5)">
                <rect width="56" height="48" fill="#bfe7c4" stroke="#1F2937" strokeWidth="1.2"/>
                <line x1="6" y1="12" x2="46" y2="12" stroke="#1F2937" strokeWidth="1" opacity="0.6"/>
                <line x1="6" y1="20" x2="40" y2="20" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="28" x2="48" y2="28" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="36" x2="36" y2="36" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(36 102) rotate(-3)">
                <rect width="80" height="62" rx="3" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <line x1="6" y1="12" x2="64" y2="12" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="22" x2="70" y2="22" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="30" x2="58" y2="30" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="38" x2="68" y2="38" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="46" x2="48" y2="46" stroke="#94a3b8" strokeWidth="0.9"/>
                <circle cx="9" cy="54" r="1.5" fill="#32D74B"/>
                <line x1="14" y1="54" x2="56" y2="54" stroke="#1F2937" strokeWidth="0.9" opacity="0.55"/>
              </g>

              
              <g transform="translate(116 122) rotate(7)">
                <rect width="62" height="48" rx="3" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <line x1="6" y1="12" x2="50" y2="12" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="22" x2="54" y2="22" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="30" x2="46" y2="30" stroke="#94a3b8" strokeWidth="0.9"/>
                <text x="48" y="42" fontFamily="Pretendard, sans-serif" fontSize="14" fontWeight="700" fill="#168A35">?</text>
              </g>

              
              <text x="166" y="84" fontFamily="Pretendard, sans-serif" fontSize="22" fontWeight="800" fill="#168A35" opacity="0.85">?</text>
              <circle cx="184" cy="92" r="2.2" fill="#32D74B" opacity="0.65"/>
              <circle cx="190" cy="98" r="1.4" fill="#32D74B" opacity="0.45"/>

              
              <g fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 3" opacity="0.55">
                <path d="M 92 64 C 130 70, 170 86, 200 100"/>
                <path d="M 138 88 C 162 100, 184 112, 200 118"/>
                <path d="M 110 158 C 144 156, 174 144, 200 134"/>
                <path d="M 168 156 C 182 152, 194 150, 200 148"/>
              </g>
              
              <line x1="190" y1="124" x2="206" y2="124" stroke="#168A35" strokeWidth="1.7" strokeLinecap="round"/>
              <polygon points="208,124 200,120 200,128" fill="#168A35"/>

              
              <g transform="translate(214 24)">
                <rect width="92" height="200" rx="8" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.6" strokeLinejoin="round"/>
                <rect width="4" height="200" rx="2" fill="#168A35"/>
                <text x="14" y="22" fontFamily="Pretendard, sans-serif" fontSize="11" fontWeight="700" fill="#1F2937">Supervision</text>
                <line x1="14" y1="30" x2="84" y2="30" stroke="#1F2937" strokeWidth="0.8" opacity="0.5"/>

                
                <g opacity="0.92">
                  <circle cx="16" cy="48" r="2" fill="#168A35"/>
                  <line x1="22" y1="48" x2="84" y2="48" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="54" x2="68" y2="54" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="76" r="2" fill="#168A35"/>
                  <line x1="22" y1="76" x2="84" y2="76" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="82" x2="74" y2="82" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="104" r="2" fill="#168A35"/>
                  <line x1="22" y1="104" x2="84" y2="104" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="110" x2="62" y2="110" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="132" r="2" fill="#168A35"/>
                  <line x1="22" y1="132" x2="84" y2="132" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="138" x2="70" y2="138" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="160" r="2" fill="#168A35"/>
                  <line x1="22" y1="160" x2="84" y2="160" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="166" x2="58" y2="166" stroke="#94a3b8" strokeWidth="1"/>
                </g>

                
                <circle cx="76" cy="14" r="6" fill="#168A35"/>
                <path d="M73 14 L75 16 L79 12" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>

              
              <g transform="translate(8 168)">
                
                <path d="M0 56 L 6 26 Q 22 18 38 22 L 44 56 Z" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round"/>
                
                <ellipse cx="22" cy="10" rx="14" ry="14" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.5"/>
                
                <ellipse cx="9" cy="6" rx="5" ry="5" fill="#1F2937"/>
                
                <path d="M10 6 Q 14 -4 26 -2 Q 36 0 36 12 Q 34 6 28 6 Q 18 6 12 10 Z" fill="#1F2937"/>
                
                <path d="M30 14 Q 33 14 35 13" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
                
                <path d="M16 32 Q 18 22 24 18 Q 30 14 32 18" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round"/>
                
                <ellipse cx="32" cy="18" rx="5" ry="4" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.3"/>
              </g>

              
              <line x1="0" y1="222" x2="320" y2="222" stroke="#1F2937" strokeWidth="1.2" opacity="0.30"/>

              
              <g transform="translate(192 224)" stroke="#168A35" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
                <path d="M0 12 L 6 0 L 12 12 z"/>
                <line x1="6" y1="4" x2="6" y2="8"/>
                <circle cx="6" cy="10.5" r="0.5" fill="#168A35" stroke="none"/>
              </g>

              
              <g style={{"display":"none"}}>
                
                <path d="M126 206 L 132 160 Q 168 150 200 160 L 206 206 Z" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.6" strokeLinejoin="round"/>
                
                <path d="M157 158 Q 168 164 178 158" fill="none" stroke="#1F2937" strokeWidth="1.2" opacity="0.5"/>
                
                <path d="M200 162 Q 222 174 226 200 L 232 206 L 200 206 z" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.6" strokeLinejoin="round"/>
                
                <ellipse cx="172" cy="120" rx="22" ry="24" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.6"/>
                
                <path d="M150 116 Q 154 96 172 94 Q 192 94 194 116 Q 192 110 184 108 Q 168 106 158 112 Z" fill="#1F2937"/>
                
                <path d="M150 116 Q 148 132 152 144 L 156 144 L 156 124 Z" fill="#1F2937" opacity="0.55"/>
                
                <path d="M168 134 Q 172 136 176 134" fill="none" stroke="#1F2937" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
                
                <path d="M132 168 Q 122 144 134 122 Q 146 108 158 116" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.6" strokeLinejoin="round"/>
                
                <ellipse cx="158" cy="118" rx="6.5" ry="5" fill="url(#p3sup-skin)" stroke="#1F2937" strokeWidth="1.4"/>
              </g>

              
              <g stroke="#32D74B" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
                <line x1="248" y1="142" x2="282" y2="142"/>
                <line x1="256" y1="152" x2="272" y2="152"/>
                <line x1="248" y1="162" x2="284" y2="162"/>
              </g>
              
              <g stroke="#32D74B" strokeWidth="1.5" strokeLinecap="round" opacity="0.40">
                <line x1="14" y1="180" x2="34" y2="180"/>
                <line x1="20" y1="190" x2="32" y2="190"/>
              </g>
            </svg>
          </div>
          <p className="persona-card-cat">슈퍼비전 준비 중인 상담사</p>
          <h3 className="persona-card-scene">슈퍼비전 전날,<br/>사례를 어떻게 가져가야 할지 막막할 때</h3>
          <blockquote className="persona-card-quote">무엇을 핵심 사례로 가져가야 할지 정리가 안 돼요.</blockquote>
          <p className="persona-card-desc">회기 흐름과 반복 단서를 바탕으로 사례개념화와 질문거리를 정리합니다.</p>
          <ul className="persona-card-tags">
            <li>사례개념화</li>
            <li>AI 피드백</li>
          </ul>
        </article>

        
        <article className="persona-card" data-slot="1">
          <div className="persona-card-art" aria-hidden="true">
            
            <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="p4fan-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef6f0"/>
                  <stop offset="100%" stopColor="#dcebde"/>
                </linearGradient>
              </defs>

              
              <rect width="320" height="220" fill="url(#p4fan-bg)"/>

              
              <g>
                
                <rect x="14" y="60" width="110" height="100" rx="8" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.4" strokeLinejoin="round"/>
                
                <rect x="98" y="52" width="20" height="22" rx="3" fill="#bfe7c4" stroke="#1F2937" strokeWidth="1.1"/>
                <line x1="108" y1="58" x2="108" y2="69" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round"/>
                
                <circle cx="32" cy="78" r="8.5" fill="none" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="32" cy="76" r="2.6" fill="none" stroke="#1F2937" strokeWidth="1.3"/>
                <path d="M26 84 Q 32 80 38 84" fill="none" stroke="#1F2937" strokeWidth="1.3" strokeLinecap="round"/>
                
                <line x1="48" y1="74" x2="112" y2="74" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="48" y1="80" x2="104" y2="80" stroke="#94a3b8" strokeWidth="1"/>
                
                <circle cx="26" cy="108" r="1.8" fill="#32D74B"/>
                <line x1="32" y1="108" x2="112" y2="108" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <circle cx="26" cy="124" r="1.8" fill="#32D74B"/>
                <line x1="32" y1="124" x2="106" y2="124" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <circle cx="26" cy="140" r="1.8" fill="#32D74B"/>
                <line x1="32" y1="140" x2="98" y2="140" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
              </g>

              
              <circle cx="124" cy="110" r="3.4" fill="#32D74B"/>

              
              <g stroke="#32D74B" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85">
                
                <path d="M 124 110 C 152 102, 156 50, 170 38"/>
                
                <path d="M 124 110 C 154 108, 160 82, 178 80"/>
                
                <path d="M 124 110 C 154 112, 160 130, 170 126"/>
                
                <path d="M 124 110 C 152 118, 158 168, 178 174"/>
              </g>

              
              <circle cx="170" cy="38" r="3" fill="#32D74B"/>
              <circle cx="178" cy="80" r="3" fill="#32D74B"/>
              <circle cx="170" cy="126" r="3" fill="#32D74B"/>
              <circle cx="178" cy="174" r="3" fill="#32D74B"/>

              
              <polygon points="178,38 172,35 172,41" fill="#32D74B"/>
              <polygon points="186,80 180,77 180,83" fill="#32D74B"/>
              <polygon points="178,126 172,123 172,129" fill="#32D74B"/>
              <polygon points="186,174 180,171 180,177" fill="#32D74B"/>

              
              
              <g transform="translate(180 14)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="6" fill="none" stroke="#1F2937" strokeWidth="1.2"/>
                <circle cx="14" cy="13" r="1.8" fill="none" stroke="#1F2937" strokeWidth="1.2"/>
                <path d="M9 19 Q 14 16 19 19" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="26" y1="12" x2="78" y2="12" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <line x1="26" y1="18" x2="62" y2="18" stroke="#94a3b8" strokeWidth="1"/>
                <circle cx="14" cy="32" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="32" x2="92" y2="32" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <circle cx="14" cy="40" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="40" x2="84" y2="40" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(188 56)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3" strokeLinejoin="round"/>
                
                <rect x="8" y="8" width="14" height="14" rx="1" fill="none" stroke="#1F2937" strokeWidth="1.1"/>
                <line x1="8" y1="13" x2="22" y2="13" stroke="#1F2937" strokeWidth="0.9"/>
                <line x1="8" y1="18" x2="22" y2="18" stroke="#1F2937" strokeWidth="0.9"/>
                <line x1="13" y1="8" x2="13" y2="22" stroke="#1F2937" strokeWidth="0.9"/>
                <line x1="17" y1="8" x2="17" y2="22" stroke="#1F2937" strokeWidth="0.9"/>
                
                <line x1="32" y1="14" x2="84" y2="14" stroke="#1F2937" strokeWidth="1.1" opacity="0.55"/>
                
                <rect x="8" y="28" width="34" height="14" fill="none" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <rect x="42" y="28" width="34" height="14" fill="none" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
                <rect x="76" y="28" width="40" height="14" fill="none" stroke="#1F2937" strokeWidth="1" opacity="0.55"/>
              </g>

              
              <g transform="translate(180 102)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3" strokeLinejoin="round"/>
                
                <path d="M8 18 Q 12 10 16 18 Q 20 26 24 18" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="34" y1="14" x2="86" y2="14" stroke="#1F2937" strokeWidth="1.1" opacity="0.55"/>
                <circle cx="14" cy="34" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="34" x2="96" y2="34" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <circle cx="14" cy="42" r="1.5" fill="#32D74B"/>
                <line x1="20" y1="42" x2="80" y2="42" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(188 150)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3" strokeLinejoin="round"/>
                
                <path d="M6 6 H16 L22 12 V24 H6 z" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M16 6 V12 H22" fill="none" stroke="#1F2937" strokeWidth="1.2"/>
                <line x1="32" y1="14" x2="98" y2="14" stroke="#1F2937" strokeWidth="1.1" opacity="0.55"/>
                <line x1="8" y1="32" x2="108" y2="32" stroke="#1F2937" strokeWidth="1" opacity="0.5"/>
                <line x1="8" y1="40" x2="92" y2="40" stroke="#94a3b8" strokeWidth="1"/>
              </g>

              
              <g stroke="#32D74B" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5">
                <path d="M14 196 c4 -6 12 -2 8 4 c -3 6 -10 0 -6 -6 c 4 -4 12 2 8 6"/>
              </g>
              <g stroke="#32D74B" strokeWidth="1.3" strokeLinecap="round" opacity="0.6">
                <line x1="296" y1="14" x2="304" y2="14"/>
                <line x1="300" y1="10" x2="300" y2="18"/>
              </g>
            </svg>
          </div>
          <p className="persona-card-cat">기관 양식에 묶인 상담사</p>
          <h3 className="persona-card-scene">같은 기록을 기관 양식마다<br/>다시 써야 할 때</h3>
          <blockquote className="persona-card-quote">상담 내용은 같은데, 제출 양식은 매번 달라요.</blockquote>
          <p className="persona-card-desc">상담 기록을 기관·보고용 양식에 맞춰 정리합니다.</p>
          <ul className="persona-card-tags">
            <li>상담노트</li>
            <li>기관 양식</li>
          </ul>
        </article>

        
        <article className="persona-card" data-slot="2">
          <div className="persona-card-art" aria-hidden="true">
            
            <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="p5fam-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef6f0"/>
                  <stop offset="100%" stopColor="#dcebde"/>
                </linearGradient>
                <radialGradient id="p5fam-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(74, 222, 128, 0.30)"/>
                  <stop offset="70%" stopColor="rgba(74, 222, 128, 0.05)"/>
                  <stop offset="100%" stopColor="rgba(74, 222, 128, 0)"/>
                </radialGradient>
              </defs>

              
              <rect width="320" height="220" fill="url(#p5fam-bg)"/>
              <circle cx="160" cy="138" r="86" fill="none" stroke="rgba(22,163,74,0.06)" strokeWidth="0.9"/>
              <circle cx="160" cy="138" r="60" fill="none" stroke="rgba(22,163,74,0.08)" strokeWidth="0.9" strokeDasharray="3 4"/>
              <ellipse cx="160" cy="138" rx="64" ry="40" fill="url(#p5fam-glow)"/>

              
              
              <g fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round">
                <line x1="80" y1="34" x2="118" y2="34"/>
                <line x1="226" y1="34" x2="264" y2="34"/>
                <line x1="99" y1="34" x2="99" y2="60"/>
                <line x1="245" y1="34" x2="245" y2="60"/>
                
                <line x1="74" y1="60" x2="124" y2="60"/>
                <line x1="220" y1="60" x2="270" y2="60"/>
                
                <line x1="74" y1="60" x2="74" y2="80"/>
                <line x1="124" y1="60" x2="124" y2="80"/>
                <line x1="220" y1="60" x2="220" y2="80"/>
                <line x1="270" y1="60" x2="270" y2="80"/>
                
                <line x1="124" y1="100" x2="146" y2="124"/>
                <line x1="220" y1="100" x2="174" y2="124"/>
                
                <line x1="184" y1="138" x2="208" y2="138"/>
              </g>

              
              <g fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.55">
                
                <path d="M 28 116 C 50 100, 64 92, 74 92"/>
                
                <line x1="160" y1="156" x2="142" y2="186"/>
                <line x1="160" y1="156" x2="178" y2="186"/>
                
                <path d="M 220 138 L 256 168 L 286 174"/>
              </g>

              
              <path d="M 124 92 L 130 98 L 124 104 L 130 110 L 124 116 L 130 122 L 124 128 L 146 138" fill="none" stroke="#168A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.85"/>

              
              
              
              <g transform="translate(69 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(107 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              
              <g transform="translate(215 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(253 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(63 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(113 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              
              <g transform="translate(209 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(259 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(17 105)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              
              <g transform="translate(275 163)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(146 124)">
                <circle cx="14" cy="14" r="15" fill="#bfe7c4" stroke="#1F2937" strokeWidth="1.7"/>
                <circle cx="14" cy="11" r="3.2" fill="none" stroke="#1F2937" strokeWidth="1.2"/>
                <path d="M7 22 Q 14 18 21 22" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(208 127)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(132 178)">
                <circle cx="10" cy="10" r="10" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="10" cy="8" r="2.2" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 15 Q 10 12 15 15" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(168 178)">
                <circle cx="10" cy="10" r="10" fill="#fbf9f1" stroke="#1F2937" strokeWidth="1.3"/>
                <circle cx="10" cy="8" r="2.2" fill="none" stroke="#1F2937" strokeWidth="1"/>
                <path d="M5 15 Q 10 12 15 15" fill="none" stroke="#1F2937" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              
              <g transform="translate(16 188)" stroke="#168A35" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.72">
                <path d="M0 12 L 6 0 L 12 12 z"/>
                <line x1="6" y1="4" x2="6" y2="8"/>
                <circle cx="6" cy="10.5" r="0.5" fill="#168A35" stroke="none"/>
              </g>
              
              <g transform="translate(290 18)" stroke="#168A35" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.55">
                <path d="M2 6 c4 -6 12 -2 8 4 c -3 6 -10 0 -6 -6 c 4 -4 12 2 8 6"/>
              </g>
            </svg>
          </div>
          <p className="persona-card-cat">가족 관계를 구조화해야 하는 상담사</p>
          <h3 className="persona-card-scene">가족 관계가 복잡해서<br/>한눈에 정리되지 않을 때</h3>
          <blockquote className="persona-card-quote">관계 흐름은 보이는데, 구조로 정리하기가 어려워요.</blockquote>
          <p className="persona-card-desc">가족 단서와 관계 정보를 가계도 중심으로 정리합니다.</p>
          <ul className="persona-card-tags">
            <li>가계도</li>
            <li>관계 정리</li>
          </ul>
        </article>

      </div>

      <div className="persona-rail-foot">
        <div className="persona-rail-counter" role="group" aria-label="현재 상황 위치">
          <ul className="persona-rail-dots" data-persona-dots>
            <li className="persona-rail-dot"></li>
            <li className="persona-rail-dot"></li>
            <li className="persona-rail-dot"></li>
            <li className="persona-rail-dot"></li>
            <li className="persona-rail-dot"></li>
          </ul>
          <span className="persona-rail-counter-text" data-persona-counter aria-live="polite"><strong>1</strong>/5</span>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
