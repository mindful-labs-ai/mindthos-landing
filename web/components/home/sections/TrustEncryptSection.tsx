'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export function TrustEncryptSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §02 encmini typing === */
    {
      const sentenceEl = document.querySelector<HTMLElement>('[data-encmini-sentence]');
      const cipherEl = document.querySelector<HTMLElement>('[data-encmini-cipher]');
      if (sentenceEl && cipherEl) {
        const sentence = '오늘 회기 내용을 안전하게 정리했습니다.';
        const cipher = 'a3asd73f9k2x  9f2k7x  x4mn82';
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
          sentenceEl.textContent = sentence;
          cipherEl.textContent = cipher;
        } else {
          const typeInto = (el: HTMLElement, text: string, speed: number, done?: () => void): void => {
            let i = 0;
            el.textContent = '';
            const step = (): void => {
              if (i <= text.length) {
                el.textContent = text.slice(0, i);
                i++;
                setTimeout(step, speed);
              } else if (done) {
                done();
              }
            };
            step();
          };
          const play = (): void => {
            typeInto(sentenceEl, sentence, 38, () => {
              setTimeout(() => typeInto(cipherEl, cipher, 28), 320);
            });
          };
          let played = false;
          const stage = document.querySelector('.trust-visual-encrypt');
          if (!stage || !('IntersectionObserver' in window)) {
            play();
          } else {
            const io = new IntersectionObserver((entries) => {
              entries.forEach((en) => {
                if (en.isIntersecting && !played) {
                  played = true;
                  play();
                  io.disconnect();
                }
              });
            }, { threshold: 0.4 });
            io.observe(stage);
            cleanups.push(() => io.disconnect());
          }
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
      <span className="num">02</span>
      <span className="name">Trust &amp; Security</span>
      <span className="purpose">내담자 데이터라는 특수성 때문에, 기능보다 먼저 안전을 보여줌</span>
    </div>

    <div className="trust-head trust-head--lean">
      <h2 className="t-h2">상담 기록은 AI보다 먼저,<br/>안전하게 다뤄져야 하니까요</h2>
    </div>

    
    <div className="trust-body">
      
      <aside className="trust-team">
        <h3 className="trust-team-title">전문가가 함께 설계한<br/>상담 기록 보호 원칙</h3>

        <div className="expanel" aria-label="상담 기록 보호를 함께 설계하는 전문가 패널">
          <ul className="expanel-grid" role="list">
            <li className="expanel-card">
              <span className="expanel-badge" aria-hidden="true">BE</span>
              <h4 className="expanel-role">금융권 출신<br/>백엔드 엔지니어</h4>
              <p className="expanel-desc">상담 기록이 아무 곳에나 섞이지 않도록 저장 구조와 권한을 나눴어요.</p>
              <ul className="expanel-tags" role="list">
                <li>저장 구조</li><li>권한 분리</li>
              </ul>
            </li>
            <li className="expanel-card">
              <span className="expanel-badge" aria-hidden="true">SEC</span>
              <h4 className="expanel-role">보안 컨설팅<br/>전문가</h4>
              <p className="expanel-desc">내담자 정보가 노출될 수 있는 지점을 기준에 맞춰 점검했어요.</p>
              <ul className="expanel-tags" role="list">
                <li>개인정보 기준</li><li>리스크 점검</li>
              </ul>
            </li>
            <li className="expanel-card">
              <span className="expanel-badge" aria-hidden="true">AI</span>
              <h4 className="expanel-role">AI 엔지니어</h4>
              <p className="expanel-desc">상담 기록이 AI 학습으로 넘어가지 않도록 처리 흐름을 분리했어요.</p>
              <ul className="expanel-tags" role="list">
                <li>학습 금지</li><li>처리 분리</li>
              </ul>
            </li>
          </ul>

          <p className="expanel-conclusion">
            <span className="expanel-conclusion-label" aria-hidden="true">상담 기록을 지키는 기준</span>
            저장 전 암호화 · 학습 금지 · 접근 권한 분리
          </p>
        </div>

        <div className="trust-team-cta">
          <Link href="/security">기록은 어떻게 보호되나요? <span aria-hidden="true">→</span></Link>
        </div>
      </aside>

      
      <div className="trust-timeline trust-protect-3 trust-protect-v2">
        <p className="trust-timeline-title">상담 기록을 지키는 3가지 보호 장치</p>

        
        <div className="trust-protect-item">
          <div className="trust-protect-head">
            <div className="trust-protect-icon" aria-hidden="true">
              
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="11" width="15" height="10" rx="1.8"/>
                <path d="M7.5 11 V7 a4.5 4.5 0 0 1 9 0 V11"/>
                <circle cx="12" cy="15.5" r="1.1" fill="currentColor" stroke="none"/>
                <line x1="12" y1="16.5" x2="12" y2="18.5"/>
              </svg>
            </div>
            <div className="trust-protect-content">
              <h3 className="trust-protect-label">저장되기 전에 먼저 암호화돼요</h3>
              <p className="trust-protect-desc">상담 기록은 저장되기 전 암호화되어, 보호된 형태로만 보관됩니다.</p>
            </div>
          </div>
          <div className="trust-visual trust-visual-encrypt" aria-hidden="true">
            
            <div className="encmini">
              
              <div className="encmini-text">
                <span className="encmini-tag">원문</span>
                <p className="encmini-sentence" data-encmini-sentence></p>
                <span className="encmini-caret" aria-hidden="true"></span>
              </div>

              
              <div className="encmini-flow encmini-flow-l" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>

              
              <div className="encmini-center" aria-hidden="true">
                <span className="encmini-tag encmini-tag-mid">암호화</span>
                <div className="encmini-lock" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="10.5" width="14" height="9" rx="1.6"/>
                    <path d="M8 10.5 V7 a4 4 0 0 1 8 0 V10.5"/>
                  </svg>
                  <span className="encmini-lock-glow" aria-hidden="true"></span>
                </div>
              </div>

              
              <div className="encmini-flow encmini-flow-r" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>

              
              <div className="encmini-code">
                <span className="encmini-tag encmini-tag-code">보관 형태</span>
                <p className="encmini-cipher" data-encmini-cipher></p>
                <span className="encmini-caret encmini-caret-code" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="trust-protect-item">
          <div className="trust-protect-head">
            <div className="trust-protect-icon" aria-hidden="true">
              
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/>
              </svg>
            </div>
            <div className="trust-protect-content">
              <h3 className="trust-protect-label">상담 기록이 학습 데이터가 되지 않게 해요</h3>
              <p className="trust-protect-desc">기록은 필요한 정리에만 쓰이고, AI 학습용으로 남지 않습니다.</p>
            </div>
          </div>
          <div className="trust-visual trust-visual-noai" aria-hidden="true">
            
            <div className="noaimini">
              
              <div className="noaimini-node noaimini-record">
                <span className="noaimini-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3 h9 l4 4 v13 a1.5 1.5 0 0 1-1.5 1.5 H6 a1.5 1.5 0 0 1-1.5-1.5 V4.5 A1.5 1.5 0 0 1 6 3 z"/>
                    <path d="M15 3 v4 h4"/>
                    <line x1="8.5" y1="12" x2="15" y2="12"/>
                    <line x1="8.5" y1="15.5" x2="14" y2="15.5"/>
                  </svg>
                </span>
                <span className="noaimini-label">상담 기록</span>
              </div>

              
              <div className="noaimini-track" aria-hidden="true">
                <span className="noaimini-line noaimini-line-l"></span>
                <span className="noaimini-pulse"></span>
                <span className="noaimini-block">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18"/>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                  </svg>
                </span>
                <span className="noaimini-line noaimini-line-r"></span>
              </div>

              
              <div className="noaimini-node noaimini-ai">
                <span className="noaimini-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                    <rect x="9" y="9" width="6" height="6" rx="0.8"/>
                    <line x1="10.5" y1="3.5" x2="10.5" y2="6"/>
                    <line x1="13.5" y1="3.5" x2="13.5" y2="6"/>
                    <line x1="10.5" y1="18" x2="10.5" y2="20.5"/>
                    <line x1="13.5" y1="18" x2="13.5" y2="20.5"/>
                    <line x1="3.5" y1="10.5" x2="6" y2="10.5"/>
                    <line x1="3.5" y1="13.5" x2="6" y2="13.5"/>
                    <line x1="18" y1="10.5" x2="20.5" y2="10.5"/>
                    <line x1="18" y1="13.5" x2="20.5" y2="13.5"/>
                  </svg>
                </span>
                <span className="noaimini-label">AI 학습</span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="trust-protect-item">
          <div className="trust-protect-head">
            <div className="trust-protect-icon" aria-hidden="true">
              
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.2 12 c2.5-4.6 6-6.7 8.8-6.7 1.4 0 2.8 0.5 4.1 1.3"/>
                <path d="M20.8 12 c-1.1 1.9-2.5 3.5-4.1 4.6"/>
                <circle cx="12" cy="12" r="2.7"/>
                <line x1="3.5" y1="3.5" x2="20.5" y2="20.5"/>
              </svg>
            </div>
            <div className="trust-protect-content">
              <h3 className="trust-protect-label">공유 전에는 민감한 정보가 먼저 가려져요</h3>
              <p className="trust-protect-desc">내담자를 특정할 수 있는 정보는 기본적으로 가려지고, 필요할 때만 확인할 수 있습니다.</p>
            </div>
          </div>
          <div className="trust-visual trust-visual-mask">
            
            <div className="maskmini">
              <div className="maskmini-doc">
                <p className="maskmini-line">
                  내담자 <span className="maskmini-pii" data-mask="인물 1" tabIndex={0}>김민수</span> 님은
                  <span className="maskmini-pii" data-mask="연락처" tabIndex={0}>010-1234-5678</span> 로 연락 가능합니다.
                </p>
                <p className="maskmini-line">
                  소속 기관: <span className="maskmini-pii" data-mask="기관명" tabIndex={0}>강남상담센터</span>, 회기 진행 중.
                </p>
              </div>
              <p className="maskmini-hint">필요할 때만 민감 정보를 확인할 수 있어요</p>
            </div>
          </div>
        </div>

        
        

        
        
        
        
      </div>
    </div>
  </div>
</section>
  );
}
