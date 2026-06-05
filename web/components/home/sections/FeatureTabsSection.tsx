'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export function FeatureTabsSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §04 feature tabs auto-rotation === */
    {
      const tabs = document.querySelectorAll<HTMLElement>('.feat-tab');
      const panels = document.querySelectorAll<HTMLElement>('.feat-panel');
      if (tabs.length && panels.length) {
        const featRoot = document.querySelector('.feat-tabs');
        const section = featRoot ? featRoot.closest('section') : null;
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ROTATION_ORDER = ['note', 'cnc', 'geno', 'psy', 'trx'];
        const ROTATE_MS = 5000;
        let autoTimer: ReturnType<typeof setInterval> | null = null;
        let hovering = false;
        let inView = false;
        let orderIdx = 0;

        const activate = (key: string): void => {
          tabs.forEach(t => {
            t.setAttribute('aria-selected', t.dataset.tab === key ? 'true' : 'false');
          });
          panels.forEach(p => {
            const on = p.dataset.panel === key;
            p.dataset.active = on ? 'true' : 'false';
            const trig = p.querySelector('.feat-acc-trigger');
            if (trig) trig.setAttribute('aria-expanded', on ? 'true' : 'false');
            const icon = p.querySelector('.feat-acc-icon');
            if (icon) icon.textContent = on ? '−' : '+';
          });
          const foundIdx = ROTATION_ORDER.indexOf(key);
          if (foundIdx >= 0) orderIdx = foundIdx;
        };
        const rotateNext = (): void => {
          orderIdx = (orderIdx + 1) % ROTATION_ORDER.length;
          activate(ROTATION_ORDER[orderIdx]);
        };
        const clearTimer = (): void => {
          if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        };
        const startTimer = (): void => {
          if (prefersReduced) return;
          if (!inView) return;
          if (hovering) return;
          clearTimer();
          autoTimer = setInterval(rotateNext, ROTATE_MS);
        };
        const resetTimer = (): void => { clearTimer(); startTimer(); };

        tabs.forEach(t => {
          const handler = (): void => {
            if (t.dataset.tab) activate(t.dataset.tab);
            resetTimer();
          };
          t.addEventListener('click', handler);
          cleanups.push(() => t.removeEventListener('click', handler));
        });
        panels.forEach(p => {
          const trig = p.querySelector('.feat-acc-trigger');
          if (!trig) return;
          const handler = (): void => {
            if (p.dataset.panel) activate(p.dataset.panel);
            resetTimer();
          };
          trig.addEventListener('click', handler);
          cleanups.push(() => trig.removeEventListener('click', handler));
        });
        if (section) {
          const enter = (): void => { hovering = true; clearTimer(); };
          const leave = (): void => { hovering = false; startTimer(); };
          section.addEventListener('mouseenter', enter);
          section.addEventListener('mouseleave', leave);
          cleanups.push(() => section.removeEventListener('mouseenter', enter));
          cleanups.push(() => section.removeEventListener('mouseleave', leave));
        }
        activate('note');
        if (section && 'IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                inView = true;
                startTimer();
              } else {
                inView = false;
                clearTimer();
              }
            });
          }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
          io.observe(section);
          cleanups.push(() => io.disconnect());
        } else {
          inView = true;
          startTimer();
        }
        cleanups.push(clearTimer);
      }
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
<section className="wf-section alt" data-funnel-section="features">
  <div className="container">
    <div className="wf-marker">
      <span className="num">04</span>
      <span className="name">핵심 기능 · 필요한 순간에 꺼내 쓰는 도구</span>
      <span className="purpose">기능 나열이 아닌, 상담 장면에 맞춰 골라 쓰는 AI agent임을 보여주기</span>
    </div>

    <div className="feat-head feat-head--lean">
      <h2 className="t-h2">필요한 순간에,<br/>필요한 기능만 꺼내 쓰세요</h2>
    </div>

    {/* aria-required-children: role="tablist"는 role="tab" 자식만 허용 — 패널이 형제로 같은 컨테이너에 있으면 위반.
        role/aria-label을 안쪽 .feat-tablist (탭 버튼만 감싸는 wrapper) 로 이동 (Lighthouse 2026-05-08). */}
    <div className="feat-tabs">

      <div className="feat-tablist" role="tablist" aria-label="핵심 기능 탭">
        <button type="button" className="feat-tab" role="tab" aria-selected="false" data-tab="trx">
          <span className="feat-tab-num">01</span>
          <span className="feat-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="13" y="3" width="11" height="14" rx="1.5"/>
              <line x1="16" y1="8" x2="20" y2="8"/>
              <line x1="16" y1="11.5" x2="20" y2="11.5"/>
              <line x1="3.5" y1="20.5" x2="3.5" y2="24.5"/>
              <line x1="6" y1="18" x2="6" y2="25"/>
              <line x1="8.5" y1="15.5" x2="8.5" y2="25"/>
              <line x1="11" y1="19" x2="11" y2="25"/>
            </svg>
          </span>
          <span className="feat-tab-text">
            <span className="feat-tab-label">축어록</span>
            <span className="feat-tab-sub">녹음 정리</span>
          </span>
        </button>
        <button type="button" className="feat-tab" role="tab" aria-selected="true" data-tab="note">
          <span className="feat-tab-num">02</span>
          <span className="feat-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3.5" width="20" height="21" rx="2"/>
              <path d="M8 10.5 L 10 12.5 L 13.5 9"/>
              <path d="M8 16.5 L 10 18.5 L 13.5 15"/>
              <line x1="16" y1="11" x2="20" y2="11"/>
              <line x1="16" y1="17" x2="20" y2="17"/>
            </svg>
          </span>
          <span className="feat-tab-text">
            <span className="feat-tab-label">상담노트</span>
            <span className="feat-tab-sub">문서 초안</span>
          </span>
        </button>
        <button type="button" className="feat-tab" role="tab" aria-selected="false" data-tab="cnc">
          <span className="feat-tab-num">03</span>
          <span className="feat-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <line x1="9" y1="9" x2="19" y2="9"/>
              <line x1="8" y1="11" x2="13.5" y2="20"/>
              <line x1="20" y1="11" x2="14.5" y2="20"/>
              <circle cx="7" cy="8" r="2.5"/>
              <circle cx="21" cy="8" r="2.5"/>
              <circle cx="14" cy="21" r="2.5"/>
            </svg>
          </span>
          <span className="feat-tab-text">
            <span className="feat-tab-label">사례개념화</span>
            <span className="feat-tab-sub">해석 가설</span>
          </span>
        </button>
        <button type="button" className="feat-tab" role="tab" aria-selected="false" data-tab="geno">
          <span className="feat-tab-num">04</span>
          <span className="feat-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="11" y="3" width="6" height="6" rx="0.5"/>
              <line x1="14" y1="9" x2="14" y2="15"/>
              <line x1="7" y1="15" x2="21" y2="15"/>
              <line x1="7" y1="15" x2="7" y2="18"/>
              <line x1="21" y1="15" x2="21" y2="18"/>
              <rect x="4" y="18" width="6" height="6" rx="0.5"/>
              <circle cx="21" cy="21" r="3"/>
            </svg>
          </span>
          <span className="feat-tab-text">
            <span className="feat-tab-label">가계도</span>
            <span className="feat-tab-sub">관계 구조</span>
          </span>
        </button>
        <button type="button" className="feat-tab" role="tab" aria-selected="false" data-tab="psy">
          <span className="feat-tab-num">05</span>
          <span className="feat-tab-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="4" width="21" height="20" rx="2"/>
              <line x1="3.5" y1="10" x2="24.5" y2="10"/>
              <line x1="8" y1="20" x2="8" y2="16.5"/>
              <line x1="12" y1="20" x2="12" y2="14"/>
              <line x1="16" y1="20" x2="16" y2="15.5"/>
              <line x1="20" y1="20" x2="20" y2="13"/>
            </svg>
          </span>
          <span className="feat-tab-text">
            <span className="feat-tab-label">심리검사 해석<span className="feat-tab-new">NEW</span></span>
            <span className="feat-tab-sub">검사 통합</span>
          </span>
        </button>
      </div>

      
      
      <div className="feat-panel" role="tabpanel" data-panel="trx" data-active="false">
        <button type="button" className="feat-acc-trigger" aria-expanded="false">
          <span className="feat-acc-num">01</span>
          <span className="feat-acc-label">축어록</span>
          <span className="feat-acc-icon">+</span>
        </button>
        <div className="feat-acc-body">
          <div className="feat-copy">
            <span className="feat-cat">축어록</span>
            <h3 className="feat-msg">녹음을 상담 기록으로 바꿔드려요</h3>
            <div className="feat-when">다시 들으며 받아쓰는 시간이 부담될 때</div>
            <p className="feat-desc">상담사와 내담자의 말을 구분해 정리하고, 이후 상담노트의 기초 자료로 활용할 수 있어요.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">기록 시간이 오래 걸릴 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock" aria-hidden="true">
            
            <div className="mt2">
              <div className="mt2-head">
                <div className="mt2-title-row">
                  <h4 className="mt2-title">홍길동_2회기_상담녹음.mp3</h4>
                  <svg className="mt2-edit" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 11.5 V12.5 H3 L11 4.5 L10 3.5 Z"/>
                    <path d="M9 4.5 L10 5.5"/>
                  </svg>
                </div>
                <span className="mt2-meta">2026.4.21(화) 15:48</span>
                <div className="mt2-tabs">
                  <span className="mt2-pill is-active">고급 축어록 ✨</span>
                  <span className="mt2-pill">가족센터 상담 노트</span>
                  <span className="mt2-pill-add">+</span>
                </div>
              </div>
              <div className="mt2-card">
                <div className="mt2-card-head">
                  <div>
                    <h5 className="mt2-card-title">고급 축어록</h5>
                    <span className="mt2-card-sub">2026년 4월 21일 작성됨</span>
                  </div>
                  <div className="mt2-card-actions">
                    <button className="mt2-action" type="button">
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9.5 V10.5 H3 L9.5 4 L8.5 3 Z"/></svg>
                      편집
                    </button>
                    <button className="mt2-action" type="button">
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="8" rx="1"/><path d="M3 3 V2 H8 V3"/></svg>
                      복사하기
                    </button>
                  </div>
                </div>
                <div className="mt2-trx">
                  <div className="mt2-trx-row">
                    <span className="mt2-avatar is-c">상</span>
                    <div>
                      <div className="mt2-trx-meta">
                        <span className="mt2-trx-who">상담사</span>
                        <span className="mt2-trx-idx">1</span>
                      </div>
                      <p className="mt2-trx-text">어서 오세요, 홍길동님. 한 주 동안 잘 지내셨나요? 날씨가 제법 쌀쌀해졌는데, 오시는 길 괜찮으셨어요?</p>
                    </div>
                  </div>
                  <div className="mt2-trx-row">
                    <span className="mt2-avatar is-a">A</span>
                    <div>
                      <div className="mt2-trx-meta">
                        <span className="mt2-trx-who">내담자 A</span>
                        <span className="mt2-trx-idx">1</span>
                      </div>
                      <p className="mt2-trx-text">네, 그냥 뭐, 그럭저럭요. 날이 추워서 그런지 몸이 더 쑤시는 것 같고, 오는데 택시가 안 잡혀서 조금 서둘렀네요.</p>
                    </div>
                  </div>
                  <div className="mt2-trx-row">
                    <span className="mt2-avatar is-c">상</span>
                    <div>
                      <div className="mt2-trx-meta">
                        <span className="mt2-trx-who">상담사</span>
                        <span className="mt2-trx-idx">2</span>
                      </div>
                      <p className="mt2-trx-text">아, 그러셨군요. 몸도 편치 않으신데 택시까지 안 잡혀서 마음이 급하셨겠어요. 따뜻한 차 한 잔 드릴까요?</p>
                    </div>
                  </div>
                  <div className="mt2-trx-row">
                    <span className="mt2-avatar is-a">A</span>
                    <div>
                      <div className="mt2-trx-meta">
                        <span className="mt2-trx-who">내담자 A</span>
                        <span className="mt2-trx-idx">2</span>
                      </div>
                      <p className="mt2-trx-text">첫날 다녀오고 나서는 뭔가 속이 후련한 것 같기도 하고, 한편으로는 내가 별소리를 다 했나 싶어서 부끄럽기도 하고, 마음이 좀 복잡했어요. 잠은 여전히 잘 안 와요. <span className="mt2-cue">불안</span> <span className="mt2-cue">자기비난</span></p>
                    </div>
                  </div>
                  <div className="mt2-trx-row">
                    <span className="mt2-avatar is-c">상</span>
                    <div>
                      <div className="mt2-trx-meta">
                        <span className="mt2-trx-who">상담사</span>
                        <span className="mt2-trx-idx">3</span>
                      </div>
                      <p className="mt2-trx-text">속이 후련한 마음과 부끄러운 마음이 같이 올라오신 거네요. 잠이 잘 안 오는 건 첫 회기 이후로 계속 그러신 거예요?</p>
                    </div>
                  </div>
                  <div className="mt2-trx-row">
                    <span className="mt2-avatar is-a">A</span>
                    <div>
                      <div className="mt2-trx-meta">
                        <span className="mt2-trx-who">내담자 A</span>
                        <span className="mt2-trx-idx">3</span>
                      </div>
                      <p className="mt2-trx-text">네, 자려고 누우면 그날 했던 말들이 자꾸 떠올라서… 그냥 휴대폰만 보다가 새벽이 돼요. 그러다 보니 다음 회기 가는 것도 좀 미루고 싶고 그렇더라고요. <span className="mt2-cue">수면 어려움</span> <span className="mt2-cue">회피</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt2-player">
                <span className="mt2-player-time">02:14</span>
                <div className="mt2-player-ctrls">
                  <button className="mt2-player-btn" type="button" aria-label="rewind">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4 L5 8 L11 12 Z"/></svg>
                  </button>
                  <button className="mt2-player-btn play" type="button" aria-label="play">
                    <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2 L10 6 L3 10 Z"/></svg>
                  </button>
                  <button className="mt2-player-btn" type="button" aria-label="forward">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4 L11 8 L5 12 Z"/></svg>
                  </button>
                </div>
                <span className="mt2-player-speed">1×</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="feat-panel" role="tabpanel" data-panel="note" data-active="true">
        <button type="button" className="feat-acc-trigger" aria-expanded="true">
          <span className="feat-acc-num">02</span>
          <span className="feat-acc-label">상담노트 · 20+ 템플릿</span>
          <span className="feat-acc-icon">−</span>
        </button>
        <div className="feat-acc-body">
          <div className="feat-copy">
            <span className="feat-cat">상담노트</span>
            <h3 className="feat-msg">필요한 양식에 맞게 바로 정리해요</h3>
            <div className="feat-when">같은 기록을 양식마다 다시 쓰고 있을 때</div>
            <p className="feat-desc">회기 기록과 메모를 바탕으로 SOAP, DAP, 가족센터, 기관 제출용 기록까지 목적에 맞게 바꿔볼 수 있어요.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">양식마다 다시 쓰기 번거로울 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock" aria-hidden="true">
            <div className="pf-titlebar">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">마음토스 · 상담노트</span>
              <span className="pf-status"><span className="pulse"></span>한 회기 → 여러 양식 자동 변환</span>
            </div>
            
            <div className="pf-body note-fanout">
              <div className="note-source">
                <div className="note-source-card">
                  <span className="note-source-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="3" width="6" height="12" rx="3"/>
                      <path d="M5 11 V13 A7 7 0 0 0 19 13 V11"/>
                      <line x1="12" y1="20" x2="12" y2="23"/>
                      <line x1="9" y1="23" x2="15" y2="23"/>
                    </svg>
                  </span>
                  <div className="note-source-meta">
                    <span className="note-source-name">홍길동_2회기 축어록</span>
                    <span className="note-source-sub">회기 기록 자료</span>
                  </div>
                </div>
                <div className="note-source-tags">
                  <span>회기 메모</span>
                  <span>음성 파일</span>
                </div>
              </div>

              <svg className="note-fanout-svg" viewBox="0 0 100 220" preserveAspectRatio="none" aria-hidden="true">
                <line className="note-fanout-trunk" x1="0" y1="92" x2="30" y2="92"/>
                <path d="M 30 92 C 60 92, 80 80, 100 80"/>
                <path d="M 30 92 C 60 92, 80 137, 100 137"/>
                <path d="M 30 92 C 60 92, 80 196, 100 196"/>
                <path className="is-active" d="M 30 92 C 60 92, 80 24, 100 24"/>
                <circle className="note-fanout-junction" cx="30" cy="92" r="3.5"/>
              </svg>

              <ul className="note-results">
                <li className="note-doc is-active">
                  <span className="note-doc-tag is-selected">선택</span>
                  <div className="note-doc-text">
                    <span className="note-doc-name">가족센터 상담 노트</span>
                    <span className="note-doc-purpose">기관 양식 · 가족 단위 회기</span>
                  </div>
                </li>
                <li className="note-doc">
                  <span className="note-doc-tag">노트</span>
                  <div className="note-doc-text">
                    <span className="note-doc-name">마음토스 상담노트</span>
                    <span className="note-doc-purpose">기본 회기 기록</span>
                  </div>
                </li>
                <li className="note-doc">
                  <span className="note-doc-tag">개념화</span>
                  <div className="note-doc-text">
                    <span className="note-doc-name">인간중심 사례개념화 노트</span>
                    <span className="note-doc-purpose">이론 기반 해석 초안</span>
                  </div>
                </li>
                <li className="note-doc">
                  <span className="note-doc-tag">기관</span>
                  <div className="note-doc-text">
                    <span className="note-doc-name">기관 제출용 기록</span>
                    <span className="note-doc-purpose">심사 · 보고 양식</span>
                  </div>
                </li>
              </ul>
            </div>

            
            <div className="note-preview">
              <div className="note-preview-tabs">
                <span className="note-preview-tab">입력된 텍스트</span>
                <span className="note-preview-tab is-active">가족센터 상담 노트</span>
                <span className="note-preview-tab">마음토스 상담노트</span>
                <span className="note-preview-tab">인간중심 사례개념화 노트</span>
                <span className="note-preview-tab">기관 제출용 기록</span>
                <span className="note-preview-tab is-add">+</span>
              </div>
              <div className="note-preview-doc">
                <div className="note-preview-section">
                  <span className="note-preview-section-h">상담 주제</span>
                  <p className="note-preview-section-body">원가족 부모화 경험과 가족 관계 속 심리적 고통 완화</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">당회기 상담 목표</span>
                  <p className="note-preview-section-body">부모화 양상 통찰, 가족 관계에서의 자기 경계 재정립</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">주요 호소 내용</span>
                  <p className="note-preview-section-body">내담자는 가족 내에서 반복적으로 중재자 역할을 맡아왔으며, 부모 갈등 상황에서 정서적 책임감을 과도하게 느끼고 있음.</p>
                </div>
                <div className="note-preview-section is-highlight">
                  <span className="note-preview-section-h">가족관계 / 가족체계 관찰</span>
                  <p className="note-preview-section-body">원가족 내 부모-자녀 경계가 모호하고, 내담자가 부모의 정서적 부담을 대신 떠안는 패턴이 관찰됨. <span className="note-preview-mark">가계도 분석 결과, 어머니와의 밀착 및 아버지와의 거리감</span>이 상담 주제로 연결됨.</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">상담 개입 요약</span>
                  <p className="note-preview-section-body">자기 대화 연습을 통해 내담자가 가족의 감정과 자신의 감정을 분리해 인식하도록 도왔고, 가족 내 역할을 재정의하는 방향으로 개입함.</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">다음 회기 계획</span>
                  <p className="note-preview-section-body">심리적 거리 유지 연습 지속, 자기 대화 과제 이행 점검, 가족 내 경계 설정 상황 구체화</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">내담자 정서 및 반응</span>
                  <p className="note-preview-section-body">부모와의 거리감에 대해 말할 때 억울함과 죄책감이 함께 나타났으며, 가족 내 역할 부담을 스스로 책임지려는 경향이 관찰됨.</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">가족 내 반복 패턴</span>
                  <p className="note-preview-section-body">갈등 상황에서 직접적인 표현보다 회피와 침묵이 반복되며, 이후 정서적 부담이 내담자에게 집중되는 흐름이 확인됨.</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">상담자 관찰 메모</span>
                  <p className="note-preview-section-body">내담자가 자신의 욕구를 말할 때 목소리가 작아지고 시선을 피하는 반응이 나타나, 자기표현을 안전하게 연습할 필요가 있음.</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">기관 기록용 요약</span>
                  <p className="note-preview-section-body">원가족 관계에서의 정서적 부담과 경계 설정 어려움이 주요 상담 주제로 확인되며, 가족 내 의사소통 방식 조정이 필요함.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="feat-panel" role="tabpanel" data-panel="cnc" data-active="false">
        <button type="button" className="feat-acc-trigger" aria-expanded="false">
          <span className="feat-acc-num">03</span>
          <span className="feat-acc-label">사례개념화 + AI 피드백</span>
          <span className="feat-acc-icon">+</span>
        </button>
        <div className="feat-acc-body">
          <div className="feat-copy">
            <span className="feat-cat">사례개념화</span>
            <h3 className="feat-msg">흩어진 단서를 상담 흐름으로 묶어줘요</h3>
            <div className="feat-when">반복 패턴은 보이는데 정리가 막막할 때</div>
            <p className="feat-desc">반복되는 감정, 관계, 사고 흐름을 정리해 상담자가 검토할 수 있는 가설 초안을 제안해요.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">사례를 어떻게 개념화할지 막막할 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock" aria-hidden="true">
            <div className="pf-titlebar">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">마음토스 · 사례개념화</span>
              <span className="pf-status"><span className="pulse"></span>상담자 검토용</span>
            </div>
            
            <div className="pf-body cnc-result-only">
              <div className="pf-cell result mock-psy-result cnc-result-card">
                <ul className="cnc-theory-tabs">
                  <li className="cnc-theory-tab is-active">인간중심</li>
                  <li className="cnc-theory-tab">CBT</li>
                  <li className="cnc-theory-tab">대상관계</li>
                  <li className="cnc-theory-tab">정신역동</li>
                  <li className="cnc-theory-tab">보웬</li>
                </ul>

                <div className="cnc-doc-fade">
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">총평</span>
                    <p className="cnc-doc-section-body">원가족 부모화 경험과 자기개념 불일치가 현재 갈등을 유지하는 핵심 기제로 보임.</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">상담 배경</span>
                    <p className="cnc-doc-section-body">3남매 중 막내, 어린 시절부터 가족 안에서 정서 조정자 역할을 수행해 왔으며 최근 자기 표현 시도 후 관계 위축을 호소…</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">사례 개념화</span>
                    <p className="cnc-doc-section-body">“수습자” 자기개념과 자신의 욕구 사이 불일치가 반복적인 보호자 역할로 표현되며, 자기 수용이 어려워진 양상…</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">유지 요인</span>
                    <p className="cnc-doc-section-body">가족 시스템의 기대, 거절 후 발생하는 죄책감, 보호자 역할에서 얻는 자기 가치감이 패턴을 강화…</p>
                  </div>

                  <div className="cnc-doc-cite">
                    <span className="cnc-doc-cite-h">이론 기반 해석 · 인간중심 관점</span>
                    <p className="cnc-doc-cite-body">“보호자” 자기개념과 “나도 살아야겠다”는 생존 욕구 사이의 괴리. 자기 수용이 어려워진 상태로 이해할 수 있음.</p>
                    <ul className="cnc-doc-cite-points">
                      <li>유기체적 경험에 대한 인식 회복이 변화의 출발점</li>
                      <li>보호자 역할 외 자기개념 확장 작업 필요</li>
                    </ul>
                  </div>

                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">임상 근거 · 회기 발언</span>
                    <p className="cnc-doc-section-body">3회기 — “억울해도 된다는 말이요. 그 말을 계속 되뇌었어요.” 자기 수용의 첫 신호로 해석…</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">주요 정서 단서</span>
                    <p className="cnc-doc-section-body">억울함, 위축감, 자기비난이 반복적으로 나타나며, 관계 안에서 자신의 욕구를 표현하기 어려워하는 흐름이 관찰됨.</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">상담 개입 초점</span>
                    <p className="cnc-doc-section-body">내담자가 자신의 감정과 욕구를 안전하게 인식하고 표현할 수 있도록 공감적 반영과 자기수용 작업을 우선 제안.</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">다음 회기 질문</span>
                    <p className="cnc-doc-section-body">억울하다는 말이 반복될 때, 내담자가 가장 지키고 싶었던 욕구가 무엇인지 탐색해볼 필요가 있음.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="feat-panel" role="tabpanel" data-panel="geno" data-active="false">
        <button type="button" className="feat-acc-trigger" aria-expanded="false">
          <span className="feat-acc-num">04</span>
          <span className="feat-acc-label">가계도</span>
          <span className="feat-acc-icon">+</span>
        </button>
        <div className="feat-acc-body">
          <div className="feat-copy">
            <span className="feat-cat">가계도</span>
            <h3 className="feat-msg">가족 관계를 한눈에 정리해요</h3>
            <div className="feat-when">가족 구성과 관계 패턴을 빠르게 보고 싶을 때</div>
            <p className="feat-desc">가족 구성원, 관계 단서, 갈등 흐름을 바탕으로 가계도 정리와 해석 초안을 도와줘요.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">가족 관계가 복잡하게 얽혀 있을 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock pf-geno2" aria-hidden="true">
            
            <div className="pf-geno2-topbar">
              <ul className="pf-geno2-tabs" role="list">
                <li className="pf-geno2-tab"><span className="pf-geno2-tab-icon">홍</span>홍길동<span className="pf-geno2-tab-ver">(3회기)</span></li>
                <li className="pf-geno2-tab">가족 구성원 정보</li>
                <li className="pf-geno2-tab is-active">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 2 H10 L13 5 V14 H3.5 z"/>
                    <path d="M10 2 V5 H13"/>
                    <line x1="6" y1="9" x2="11" y2="9"/>
                    <line x1="6" y1="11.5" x2="10" y2="11.5"/>
                  </svg>
                  가계도 분석 보고서
                </li>
              </ul>
              <div className="pf-geno2-status">
                <span className="pf-geno2-saved">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 L6 10.5 L11 4.5"/></svg>
                  저장 완료
                </span>
                <span className="pf-geno2-icons">
                  <span className="pf-geno2-icon-btn" aria-label="undo"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8 H10 a3 3 0 0 1 0 6 H6"/><path d="M5 5 L2 8 L5 11"/></svg></span>
                  <span className="pf-geno2-icon-btn" aria-label="redo"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8 H6 a3 3 0 0 0 0 6 H10"/><path d="M11 5 L14 8 L11 11"/></svg></span>
                  <span className="pf-geno2-icon-btn" aria-label="download"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2 V11"/><path d="M5 8 L8 11 L11 8"/><line x1="3" y1="13.5" x2="13" y2="13.5"/></svg></span>
                  <span className="pf-geno2-icon-btn" aria-label="save"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3 H11 L13 5 V13 H3 z"/><rect x="5" y="3" width="6" height="3.5"/><rect x="5.5" y="9" width="5" height="3"/></svg></span>
                  <span className="pf-geno2-icon-btn" aria-label="more">⋮</span>
                </span>
              </div>
            </div>

            <div className="pf-geno2-canvas">
              <Image className="pf-geno2-image" src="/genogram-honggildong.webp" alt="가계도 분석 보고서 — 홍길동 가족" width={1632} height={1437} sizes="(max-width: 768px) 100vw, 50vw" />

              
              <div className="pf-geno2-toolbar">
                <span className="pf-geno2-tool is-active" title="select"><svg viewBox="0 0 14 14" fill="currentColor"><path d="M3 1 L11 7.5 L6.5 8.5 L4.5 12 z"/></svg></span>
                <span className="pf-geno2-tool" title="move"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/><polyline points="5 4 7 2 9 4"/><polyline points="5 10 7 12 9 10"/><polyline points="4 5 2 7 4 9"/><polyline points="10 5 12 7 10 9"/></svg></span>
                <span className="pf-geno2-tool" title="text"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3 H11"/><path d="M7 3 V12"/></svg></span>
                <span className="pf-geno2-tool" title="tag"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2 H7 L12 7 L7 12 L2 7 z"/><circle cx="4.5" cy="4.5" r="1"/></svg></span>
              </div>

              
              <div className="pf-geno2-zoom">
                <span className="pf-geno2-zoom-btn"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="6" y1="2.5" x2="6" y2="9.5"/><line x1="2.5" y1="6" x2="9.5" y2="6"/></svg></span>
                <span className="pf-geno2-zoom-btn"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2.5" y1="6" x2="9.5" y2="6"/></svg></span>
              </div>

              
              <span className="pf-geno2-insight">
                <span className="pf-geno2-insight-dot" aria-hidden="true"></span>
                핵심 관계축 · 박진호 ↔ 이영숙 (갈등)
              </span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="feat-panel" role="tabpanel" data-panel="psy" data-active="false">
        <button type="button" className="feat-acc-trigger" aria-expanded="false">
          <span className="feat-acc-num">05</span>
          <span className="feat-acc-label">심리검사 해석</span>
          <span className="feat-acc-icon">+</span>
        </button>
        <div className="feat-acc-body">
          <div className="feat-copy">
            <span className="feat-cat"><span className="feat-cat-new">NEW</span>심리검사 해석</span>
            <h3 className="feat-msg">검사 결과와 면담 기록을 함께 읽어요</h3>
            <div className="feat-when">검사 자료를 회기 맥락과 함께 해석해야 할 때</div>
            <p className="feat-desc">검사 결과와 면담 기록을 함께 살펴보고, 상담자가 검토할 단서와 확인 질문을 정리해요.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">심리검사 해석이 막힐 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock" aria-hidden="true">
            <div className="pf-titlebar">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">마음토스 · 심리검사 해석</span>
              <span className="pf-status"><span className="pulse"></span>검사 통합 해석</span>
            </div>

            <div className="pf-body psy-chat-shell">
              {/* 내담자 헤더 */}
              <div className="psy-client">
                <div className="psy-client-id">
                  <span className="psy-client-avatar">홍</span>
                  <div className="psy-client-meta">
                    <span className="psy-client-name">홍길동</span>
                    <span className="psy-client-sub">남성 · 42세 · 8회기 상담 기록 · 최근 검사일 2026-06-01</span>
                  </div>
                </div>
                <span className="psy-client-badge">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 1.5 H3.5 A1 1 0 0 0 2.5 2.5 V11.5 A1 1 0 0 0 3.5 12.5 H10.5 A1 1 0 0 0 11.5 11.5 V5 Z"/>
                    <path d="M8 1.5 V5 H11.5"/>
                  </svg>
                  결과지 등록됨
                </span>
              </div>

              {/* 상담 키워드 */}
              <div className="psy-keywords">
                <span className="psy-keywords-lbl">상담 키워드</span>
                <span className="psy-kw">#대인관계갈등</span>
                <span className="psy-kw">#공허감</span>
                <span className="psy-kw">#우울</span>
              </div>

              {/* 대화 스레드 */}
              <div className="psy-thread">
                <div className="psy-msg-user">
                  <p className="psy-bubble">주요 상승 척도는 무엇이고, 어떻게 해석되나요?</p>
                </div>

                <div className="psy-msg-ai">
                  <p className="psy-ai-text">현재 내담자의 MMPI-2 결과에서 임상적으로 유의미하게 상승한 척도는 다음과 같습니다.</p>
                  <ul className="psy-scale-list">
                    <li><strong>Scale 2 (우울, D) = T74</strong> — 주된 상승. 무력감·자기비난·낮은 에너지 수준과 관련됩니다.</li>
                    <li><strong>Scale 4 (반사회성, Pd) = T71</strong> — 권위·규범과의 갈등보다는 정서적 단절, 가족 내 불화 경험과 관련된 상승으로 해석 여지가 높습니다.</li>
                    <li><strong>Scale 7 (강박, Pt) = T69</strong> — 경계선 상승. 불안·반추·자기의심이 함께 나타납니다.</li>
                  </ul>
                  <p className="psy-ai-text">특히 D와 Pd가 함께 상승한 2-4/4-2 코드타입은, 우울감과 충동적·행동화 경향이 교차하며 나타나는 특징적 패턴입니다. 내담자가 보고한 ‘반복되는 대인관계 갈등’과 ‘공허감’이라는 주호소와 일관됩니다.</p>

                  <div className="psy-ai-actions">
                    <span className="psy-ai-act">
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4.2" y="4.2" width="7" height="8" rx="1.3"/><path d="M2.5 9 V2.8 A1.3 1.3 0 0 1 3.8 1.5 H8.5"/></svg>
                    </span>
                    <span className="psy-ai-act is-active">
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.2 6.6 V12 H2.6 A0.6 0.6 0 0 1 2 11.4 V7.2 A0.6 0.6 0 0 1 2.6 6.6 Z"/><path d="M4.2 6.6 L6.7 1.7 A0.3 0.3 0 0 1 7.2 1.9 V5 H10.6 A1 1 0 0 1 11.55 6.3 L10.6 11 A1 1 0 0 1 9.6 12 H4.2"/></svg>
                    </span>
                    <span className="psy-ai-act">
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.8 7.4 V2 H11.4 A0.6 0.6 0 0 1 12 2.6 V6.8 A0.6 0.6 0 0 1 11.4 7.4 Z"/><path d="M9.8 7.4 L7.3 12.3 A0.3 0.3 0 0 1 6.8 12.1 V9 H3.4 A1 1 0 0 1 2.45 7.7 L3.4 3 A1 1 0 0 1 4.4 2 H9.8"/></svg>
                    </span>
                    <span className="psy-ai-act">
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.6 4.4 A5 5 0 1 0 12.1 7.2"/><path d="M11.9 1.6 V4.4 H9.1"/></svg>
                    </span>
                  </div>

                  <span className="psy-ai-logo">
                    <svg viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2688 105.46C17.2079 105.46 17.1558 105.46 17.095 105.46C11.8723 105.364 7.71853 101.046 7.81412 95.8128L8.76132 44.1022C8.79608 29.1698 18.3203 19.5312 33.0323 19.5312C42.4609 19.5312 48.2137 23.5451 51.3768 26.906C56.5213 32.3653 58.1289 39.4701 57.929 44.4244V81.159C57.8595 82.3257 58.2332 84.4415 59.2412 85.5124C59.4758 85.7562 60.1884 86.5137 62.6564 86.5137C64.0467 86.5137 68.5655 86.0697 68.9566 80.3928V63.8583C68.9218 61.2027 69.3476 52.6176 75.8738 45.9481C78.9066 42.8397 84.3551 39.1393 93.0712 39.1393C101.787 39.1393 107.236 42.8397 110.269 45.9481C116.795 52.6176 117.221 61.194 117.186 63.8583V80.6714C117.186 85.9043 112.954 90.1445 107.731 90.1445C102.508 90.1445 98.2764 85.9043 98.2764 80.6714V63.5797C98.3025 62.4303 97.8506 60.3146 96.7644 59.2088C96.495 58.9302 95.6782 58.0943 93.0799 58.0943C90.4816 58.0943 89.6647 58.9302 89.3953 59.2088C88.3091 60.3146 87.8572 62.4303 87.8833 63.5797V63.7799L87.8746 81.159C87.2489 93.2355 78.3939 105.46 62.6737 105.46C53.923 105.46 48.5352 101.707 45.5459 98.5641C39.2196 91.8859 38.9241 83.3531 39.0284 80.4711L39.0458 43.6495C39.0718 43.1009 38.7764 41.1158 37.6293 39.9055C37.2991 39.5572 36.2824 38.4863 33.041 38.4863C30.2863 38.4863 27.6793 38.4863 27.6793 44.2067V44.3809L26.7321 96.1697C26.6365 101.342 22.4219 105.469 17.2775 105.469L17.2688 105.46Z" fill="var(--brand)"/></svg>
                  </span>
                </div>
              </div>

              {/* 입력창 */}
              <div className="psy-input">
                <span className="psy-input-shield">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1.6 L11.4 3.1 V7 C11.4 9.6 9.4 11.5 7 12.4 C4.6 11.5 2.6 9.6 2.6 7 V3.1 Z"/></svg>
                </span>
                <span className="psy-input-ph">마음토스에게 질문해보세요</span>
                <span className="psy-input-send">
                  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7 L12 2.2 L8.4 12 L7 8 Z"/></svg>
                </span>
              </div>

              <p className="psy-disclaimer">마음토스가 제공하는 해석은 참고용입니다. 최종 해석은 자격을 갖춘 임상가가 수행해야 합니다.</p>
            </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</section>
  );
}
