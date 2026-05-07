'use client';

import { useEffect } from 'react';

type Row = { label: string; type: string; value?: string };
type CaseEntry = { name: string; rows: Row[] };

const CASE_DATA: Record<string, CaseEntry> = {
  '01': {
    name: '불안·우울 — 20대 직장인, 자기비난',
    rows: [
      { label: '상담 주제', type: 'text', value: '업무 평가 상황에서 반복되는 예기 불안과 자기비난, 수면 저하와 일상 기능 위축까지 이어지는 패턴을 호소함.' },
      { label: '당회기 상담 목표', type: 'text', value: '업무 상황에서 반복되는 자동사고 흐름을 구체화하고, 수면 전 반추를 줄이기 위한 인지 분리 작업의 출발점을 마련합니다.' },
      { label: '상담 내용 요약', type: 'text', value: '"내가 망쳤다 / 모두가 알아챘다 / 신뢰를 잃었다" 3가지 핵심 자동사고가 회의 직후 → 자기비난 → 반추 → 수면 저하의 4단계 순환으로 반복되는 양상을 함께 정리함. 회기 후반에 "오늘 잘한 일 1가지" 자기 인정 작업을 짧게 시도…' },
      { label: '주요 개입 방향', type: 'text', value: '인지 재구성 질문으로 사실과 해석을 분리하는 연습. 자동사고와 거리 두기 작업을 단계적으로 적용하고, 자기비난이 불안을 유지하는 방식에 대한 메타 인지를 길러갑니다.' },
      { label: '다음 회기 계획', type: 'text', value: '최근 실수했다고 느꼈던 장면을 하나 선택해 그때 떠오른 생각·신체 반응·이후 행동을 함께 살펴보고, 동료의 관점과 비교하는 관점 확장 작업을 진행합니다.' },
    ],
  },
  '02': {
    name: '부부 갈등 — 대화 단절·양육 갈등',
    rows: [
      { label: '상담 주제', type: 'text', value: '반복되는 대화 단절과 양육 방식 차이로 인한 부부 갈등' },
      { label: '당회기 상담 목표', type: 'text', value: '갈등 상황에서 반복되는 상호작용 패턴을 확인하고, 각자의 정서 반응을 분리해 살펴봅니다.' },
      { label: '상담 내용 요약', type: 'text', value: '최근 6개월 사이 양육 문제를 둘러싼 갈등 빈도가 증가했으며, 대화가 비난-방어-회피의 흐름으로 고착되는 양상이 관찰됩니다.' },
      { label: '상담자가 검토할 포인트', type: 'text', value: '갈등의 표면 주제보다 반복되는 의사소통 방식과 정서적 거리감을 다음 회기에서 함께 확인할 필요가 있습니다.' },
      { label: '다음 회기 계획', type: 'text', value: '최근 갈등 장면 하나를 구체적으로 재구성하고, 각자의 감정·욕구·방어 반응을 구분해 탐색합니다.' },
    ],
  },
  '03': {
    name: '청소년 적응 — 또래 관계 어려움',
    rows: [
      { label: '상담 주제', type: 'text', value: '또래 관계 불안과 학교생활 위축감. 친구의 작은 표정 변화에도 "나를 싫어하는 것 같다"는 해석이 자동으로 떠오르는 패턴을 호소함.' },
      { label: '당회기 상담 목표', type: 'text', value: '쉬는 시간과 점심시간에 커지는 위축감을 살펴보고, 또래 관계에서 반복되는 회피 패턴과 작은 접근 시도의 가능성을 함께 모색합니다.' },
      { label: '상담 내용 요약', type: 'text', value: '또래 시선 인식 → 거절 예상 → 신체 긴장(어깨·복부) → 회피 행동(이어폰 착용·자리 이탈)의 흐름이 반복되며, 회피 직후 일시적 안도감이 강화 요인으로 작용하는 양상을 함께 확인…' },
      { label: '주요 개입 방향', type: 'text', value: '"안녕"·"같이 갈래"처럼 가장 작은 단위의 접근 행동을 함께 떠올려보고 시도 후 떠오를 감정을 미리 예상해보는 연습. 보호자에게는 정서 확인 중심의 대화 방식을 안내합니다.' },
      { label: '다음 회기 계획', type: 'text', value: '학교에서 가장 긴장되는 순간을 하나 선택해 그때의 신체 반응과 떠오른 생각을 살펴보고, 보호자와의 짧은 정서 확인 대화를 한 주 동안 시도하도록 안내합니다.' },
    ],
  },
  '04': {
    name: '가족 관계 — 3대 가족 소통',
    rows: [
      { label: '상담 주제', type: 'text', value: '3대 가족 안에서 반복되는 중재자 역할과 세대 간 소통 갈등. 부모–조부모 사이 감정 통역사 역할로 인한 정서적 소진과 죄책감을 호소함.' },
      { label: '당회기 상담 목표', type: 'text', value: '가족 안에서 내담자가 맡은 중재자 역할을 함께 확인하고, 책임의 경계를 다시 그어볼 수 있는 첫 단서를 마련합니다.' },
      { label: '상담 내용 요약', type: 'text', value: '조부모(직접 표현) → 내담자(중재·완충) → 부모(우회 전달)의 3단계 의사소통 구조가 고착된 양상을 함께 그려봄. 내담자가 빠지면 직접 갈등이 발생하는 패턴이 반복적으로 확인…' },
      { label: '주요 개입 방향', type: 'text', value: '"내가 해야만 한다"는 신념과 실제 책임 영역을 구분해보는 작업. 중재 역할을 잠시 내려놓을 때 떠오르는 죄책감의 출처를 함께 살펴봅니다.' },
      { label: '다음 회기 계획', type: 'text', value: '책임져야 한다고 느끼는 일과 그렇지 않은 일을 함께 구분하고, 한 주 동안 중재 역할을 보류했을 때 떠오른 감정과 가족의 반응을 정리해 가져옵니다.' },
    ],
  },
  '05': {
    name: '접수면접 — 신규 심층 평가',
    rows: [
      { label: '상담 주제', type: 'text', value: '최근 불안과 대인관계 스트레스를 중심으로 한 초기 심층 평가. 6개월 전 직무 변경 이후 수면·식욕·정서 조절 영역까지 누적된 스트레스 양상.' },
      { label: '당회기 상담 목표', type: 'text', value: '주호소와 생활 맥락을 정리하고, 정서 조절·대인관계·가족력 영역에서 확인이 필요한 지점을 파악합니다.' },
      { label: '상담 내용 요약', type: 'text', value: '주호소를 시간 흐름에 따라 정리하며 정서 조절의 어려움과 반복되는 대인관계 갈등을 살펴봄. 수면 저하·사회적 고립감·자기비하 표현을 위험 신호로, 명확한 상담 동기·가족 친구의 지지를 보호 요인으로 정리…' },
      { label: '주요 개입 방향', type: 'text', value: '단기·중기 상담 방향 합의. 외상력과 신체 증상 영역의 추가 평가가 필요하며, 필요 시 의료적 의뢰 가능성도 함께 검토합니다.' },
      { label: '다음 회기 계획', type: 'text', value: '단기·장기 상담 목표를 구분해 지금 가장 먼저 다루고 싶은 영역을 함께 정하고, 외상력·신체 증상 영역을 추가 의제로 다룹니다.' },
    ],
  },
};

export function SampleExperienceSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === §05 sample-section scroll-in fades === */
    {
      const section = document.querySelector<HTMLElement>('.sample-section');
      const expCard = document.getElementById('sample-step-card');
      const isMobile = window.matchMedia('(max-width: 860px)').matches;
      if (section && isMobile) {
        /* 모바일에서는 스크롤 fade-in 비활성화 — 즉시 visible 처리 */
        section.classList.add('is-in-view', 'exp-in-view');
      } else if (section && 'IntersectionObserver' in window) {
        const ioIntro = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              section.classList.add('is-in-view');
              ioIntro.unobserve(section);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
        ioIntro.observe(section);
        cleanups.push(() => ioIntro.disconnect());

        if (expCard) {
          const ioExp = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                section.classList.add('exp-in-view');
                ioExp.unobserve(expCard);
              }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
          ioExp.observe(expCard);
          cleanups.push(() => ioExp.disconnect());
        }
      } else if (section) {
        section.classList.add('is-in-view', 'exp-in-view');
      }
    }

    /* === §05 sample step card === */
    {
      const card = document.getElementById('sample-step-card');
      if (card) {
        const slides = card.querySelectorAll<HTMLElement>('[data-step]');
        const dots = card.querySelectorAll<HTMLElement>('[data-dot]');
        const counter = card.querySelector<HTMLElement>('[data-step-counter]');
        const nextBtn = card.querySelector<HTMLElement>('[data-step-next]');
        const foot = card.querySelector<HTMLElement>('[data-step-foot]');
        if (foot) foot.style.display = 'none';
        let current = 1;
        const total = slides.length;
        let currentCase = '01';
        let genTimer: ReturnType<typeof setTimeout> | null = null;

        const escapeHtml = (s: string): string => String(s).replace(/[&<>"']/g, (ch) => {
          const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
          return map[ch];
        });

        const renderRowContent = (row: Row): string => {
          if (row.type === 'strong') return '<p class="sm-result-value sm-result-strong">' + escapeHtml(row.value || '') + '</p>';
          if (row.type === 'text') return '<p class="sm-result-value">' + escapeHtml(row.value || '') + '</p>';
          return '';
        };

        const renderResult = (): void => {
          const d = CASE_DATA[currentCase] || CASE_DATA['01'];
          card.querySelectorAll<HTMLElement>('[data-sm-case-name]').forEach(el => { el.textContent = d.name; });
          const rowsContainer = card.querySelector('[data-sm-result-rows]');
          if (!rowsContainer || !d.rows) return;
          const html = d.rows.map(row =>
            '<div class="sm-result-row">' +
              '<span class="sm-result-label">' + escapeHtml(row.label) + '</span>' +
              renderRowContent(row) +
            '</div>'
          ).join('');
          rowsContainer.innerHTML = html;
        };

        const go = (n: number): void => {
          if (n < 1 || n > total) return;
          const prev = current;
          slides.forEach(sl => {
            const i = parseInt(sl.getAttribute('data-step') || '0', 10);
            sl.hidden = (i !== n);
            if (i === n) {
              sl.style.transform = (n > prev ? 'translateX(20px)' : 'translateX(-20px)');
              sl.style.opacity = '0';
              requestAnimationFrame(() => {
                sl.style.transform = 'translateX(0)';
                sl.style.opacity = '1';
              });
            }
          });
          dots.forEach(d => {
            const i = parseInt(d.getAttribute('data-dot') || '0', 10);
            d.classList.remove('active', 'done');
            if (i < n) d.classList.add('done');
            else if (i === n) d.classList.add('active');
          });
          if (counter) counter.textContent = 'Step ' + n + ' / ' + total;
          if (foot) foot.style.display = 'none';
          if (n === 3) renderResult();
          current = n;
          if (n === 2) {
            const stages = card.querySelectorAll<HTMLElement>('[data-stage]');
            const pills = card.querySelectorAll<HTMLElement>('[data-pill]');
            stages.forEach(s => s.removeAttribute('data-state'));
            pills.forEach(p => p.removeAttribute('data-state'));
            const stageDelay = 750;
            stages.forEach((s, idx) => {
              setTimeout(() => { if (current === 2) s.setAttribute('data-state', 'active'); }, stageDelay * idx + 250);
              setTimeout(() => { if (current === 2) s.setAttribute('data-state', 'done'); }, stageDelay * (idx + 1) + 250);
            });
            const pillDelay = 580;
            pills.forEach((p, idx) => {
              setTimeout(() => { if (current === 2) p.setAttribute('data-state', 'done'); }, pillDelay * idx + 600);
            });
            if (genTimer) clearTimeout(genTimer);
            genTimer = setTimeout(() => { if (current === 2) go(3); }, stageDelay * 4 + 1200);
          }
        };

        if (nextBtn) {
          const handler = (): void => go(current + 1);
          nextBtn.addEventListener('click', handler);
          cleanups.push(() => nextBtn.removeEventListener('click', handler));
        }
        const caseCards = card.querySelectorAll<HTMLElement>('[data-case-pick]');
        caseCards.forEach(c => {
          const handler = (): void => {
            const pick = c.getAttribute('data-case-pick');
            if (pick) currentCase = pick;
            caseCards.forEach(cc => cc.classList.toggle('is-selected', cc === c));
            go(2);
          };
          c.addEventListener('click', handler);
          cleanups.push(() => c.removeEventListener('click', handler));
        });
        card.querySelectorAll<HTMLElement>('[data-step-restart]').forEach(restart => {
          const handler = (): void => {
            caseCards.forEach(cc => cc.classList.remove('is-selected'));
            go(1);
          };
          restart.addEventListener('click', handler);
          cleanups.push(() => restart.removeEventListener('click', handler));
        });
        cleanups.push(() => { if (genTimer) clearTimeout(genTimer); });
      }
    }

    /* §05 슬라이드형 핀 트랜지션 — scroll-progress 기반 CSS 변수 구동.
       - --title-progress: slot1.bottom 이 1.2vh → 0.7vh 구간을 지나는 동안 0 → 1
         (slot1 핀 종료 직전부터 핀 종료 직후까지 — 사용자가 타이틀 fade-out 을 viewport 안에서 보게 됨)
       - --card-enter: slot2.top 이 0.7vh → 0 구간을 지나는 동안 0 → 1
         (slot2 가 viewport 하단 70% 지점부터 진입 → 핀 부착 시점까지 좌→중앙 slide in)
       - --card-exit: slot2.top 이 -0.4vh → -0.95vh 구간을 지나는 동안 0 → 1
         (slot2 핀 후반, 카드가 중앙 → 오른쪽 바깥으로 slide out)
       양방향 스크롤에서 동일하게 작동 (값이 progress 에 직접 매핑). */
    {
      const section = document.querySelector<HTMLElement>('.sample-section');
      const slot1 = document.querySelector<HTMLElement>('.sample-pin-slot--title');
      const slot2 = document.querySelector<HTMLElement>('.sample-pin-slot--card');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.matchMedia('(max-width: 860px)').matches;
      /* 모바일에서는 스크롤-progress 애니메이션 비활성화 — CSS 변수도 0 으로 고정 (calc 경로 무력화) */
      if (section && isMobile) {
        section.style.setProperty('--title-progress', '0');
        section.style.setProperty('--card-enter', '1');
        section.style.setProperty('--card-exit', '0');
      }
      if (section && slot1 && slot2 && !reduce && !isMobile) {
        let raf: number | null = null;
        const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
        const update = (): void => {
          const r1 = slot1.getBoundingClientRect();
          const r2 = slot2.getBoundingClientRect();
          const vh = window.innerHeight;
          const tStart = vh * 1.2;
          const tEnd = vh * 0.7;
          const titleProgress = clamp01((tStart - r1.bottom) / (tStart - tEnd));
          /* enter 와 exit 를 동일한 70vh 구간 + linear 보간으로 맞춰 좌우 대칭의 슬라이드 속도감 */
          const enterStart = vh * 0.7;
          const enterEnd = 0;
          const cardEnter = clamp01((enterStart - r2.top) / (enterStart - enterEnd));
          const exitStart = -vh * 0.3;
          const exitEnd = -vh * 1.0;
          const cardExit = clamp01((exitStart - r2.top) / (exitStart - exitEnd));
          section.style.setProperty('--title-progress', titleProgress.toFixed(3));
          section.style.setProperty('--card-enter', cardEnter.toFixed(3));
          section.style.setProperty('--card-exit', cardExit.toFixed(3));
        };
        const handler = (): void => {
          if (raf !== null) return;
          raf = requestAnimationFrame(() => {
            raf = null;
            update();
          });
        };
        window.addEventListener('scroll', handler, { passive: true });
        window.addEventListener('resize', handler);
        update();
        cleanups.push(() => {
          window.removeEventListener('scroll', handler);
          window.removeEventListener('resize', handler);
          if (raf !== null) cancelAnimationFrame(raf);
        });
      }
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
  }, []);

  return (
<section className="wf-section sample-section">
  {/* 슬라이드형 순차 핀 패턴
     두 개의 독립 슬롯이 차례로 viewport 에 핀.
     - .sample-pin-slot: 외곽 (200vh) — 핀 지속 스크롤 거리
     - .sample-pin-frame: position: sticky; top: 0; height: 100vh — viewport 에 고정되는 프레임
     스크롤 → slot 1 의 frame 이 100vh 동안 sticky → slot 1 종료 시 다음 slot 진입 → slot 2 의 frame sticky.
     순수 CSS sticky 로 작동 (overflow:hidden 가 sticky 를 깨므로 .sample-section 에서 제거함).
  */}

  {/* SLOT 1 — 타이틀 페이지 */}
  <div className="sample-pin-slot sample-pin-slot--title">
    <div className="sample-pin-frame">
      <div className="container">
        <div className="sample-head">
          <h2 className="t-h2">시작하기 전,<br/>결과부터 확인해보세요</h2>
          <p className="sample-head-sub">샘플 회기를 선택하고, 마음토스가 정리한 상담노트 초안을 확인해보세요.</p>
          <span className="sample-head-scroll" aria-hidden="true">
            <span className="sample-head-scroll-line"></span>
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* SLOT 2 — 체험 UI 페이지 */}
  <div className="sample-pin-slot sample-pin-slot--card">
    <div className="sample-pin-frame">
      <div className="container">
        <div className="step-card" id="sample-step-card" data-collapsed="false">
      
      <div className="step-progress">
        <div className="step-dots" data-step-dots>
          <span className="step-dot active" data-dot="1"></span>
          <span className="step-dot-line"></span>
          <span className="step-dot" data-dot="2"></span>
          <span className="step-dot-line"></span>
          <span className="step-dot" data-dot="3"></span>
        </div>
        <span className="step-counter" data-step-counter>Step 1 / 3</span>
      </div>

      
      <div className="step-viewport">
        
        <div className="step-slide" data-step="1">
          <span className="step-label">Step 1 / 3 — 가상 사례 선택</span>
          <p className="step-lead">먼저 확인해볼 가상 사례를 선택해주세요</p>
          <p className="step-sub">실제 내담자 자료가 아닌, 마음토스 체험을 위한 예시 사례입니다.</p>

          <div className="sm-mock">
            <div className="sm-mock-head">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">Mindthos AI · 가상 사례 선택</span>
            </div>
            <div className="sm-mock-body">
              <div className="case-grid case-grid-5">
                <button type="button" className="case-card" data-case-pick="01" aria-label="불안·우울 — 20대 직장인 사례 결과 보기">
                  <span className="cc-eyebrow">CASE 01</span>
                  <span className="cc-cat">불안 · 우울</span>
                  <span className="cc-title">20대 직장인,<br/>자기비난</span>
                  <span className="cc-situ">업무 실수에 대한 걱정과 잠들기 전 반복 사고를 호소하는 첫 회기 사례입니다.</span>
                  <div className="cc-tags">
                    <span className="cc-tag">상담노트</span>
                    <span className="cc-tag">사례개념화</span>
                  </div>
                  <span className="cc-pick-link">이 사례로 결과 보기 →</span>
                </button>
                <button type="button" className="case-card" data-case-pick="02" aria-label="부부 갈등 — 대화 단절·양육 갈등 사례 결과 보기">
                  <span className="cc-eyebrow">CASE 02</span>
                  <span className="cc-cat">부부 갈등</span>
                  <span className="cc-title">대화 단절·<br/>양육 갈등</span>
                  <span className="cc-situ">반복되는 대화 단절과 양육 방식 차이로 갈등이 깊어진 부부 상담 사례입니다.</span>
                  <div className="cc-tags">
                    <span className="cc-tag">상담노트</span>
                    <span className="cc-tag">관계 패턴</span>
                  </div>
                  <span className="cc-pick-link">이 사례로 결과 보기 →</span>
                </button>
                <button type="button" className="case-card" data-case-pick="03" aria-label="청소년 적응 — 또래 관계 어려움 사례 결과 보기">
                  <span className="cc-eyebrow">CASE 03</span>
                  <span className="cc-cat">청소년 적응</span>
                  <span className="cc-title">또래 관계<br/>어려움</span>
                  <span className="cc-situ">학교생활과 또래 관계에서 위축감을 느끼는 청소년 상담 사례입니다.</span>
                  <div className="cc-tags">
                    <span className="cc-tag">상담노트</span>
                    <span className="cc-tag">정서 반응</span>
                  </div>
                  <span className="cc-pick-link">이 사례로 결과 보기 →</span>
                </button>
                <button type="button" className="case-card" data-case-pick="04" aria-label="가족 관계 — 3대 가족 소통 사례 결과 보기">
                  <span className="cc-eyebrow">CASE 04</span>
                  <span className="cc-cat">가족 관계</span>
                  <span className="cc-title">3대 가족<br/>소통</span>
                  <span className="cc-situ">부모·자녀·조부모 세대 간 소통 방식과 반복되는 갈등을 다루는 가족 상담 사례입니다.</span>
                  <div className="cc-tags">
                    <span className="cc-tag">가계도</span>
                    <span className="cc-tag">관계 구조</span>
                  </div>
                  <span className="cc-pick-link">이 사례로 결과 보기 →</span>
                </button>
                <button type="button" className="case-card" data-case-pick="05" aria-label="접수면접 — 신규 심층 평가 사례 결과 보기">
                  <span className="cc-eyebrow">CASE 05</span>
                  <span className="cc-cat">접수면접</span>
                  <span className="cc-title">신규<br/>심층 평가</span>
                  <span className="cc-situ">초기 접수면접에서 주호소, 가족력, 위험요인, 상담 목표를 정리하는 사례입니다.</span>
                  <div className="cc-tags">
                    <span className="cc-tag">접수면접</span>
                    <span className="cc-tag">초기평가</span>
                  </div>
                  <span className="cc-pick-link">이 사례로 결과 보기 →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        
        <div className="step-slide" data-step="2" hidden>
          <span className="step-label">Step 2 / 3 — 안전 처리</span>
          <p className="step-lead-big">안전하게 처리한 뒤,<br/>결과를 만듭니다.</p>
          <p className="step-sub">가상 데이터지만, 실제 회기와 동일한 처리 흐름을 따릅니다.</p>

          
          <div className="sm-mock sm-step2-mock sm-step2-mock--secure">
            <div className="sm-mock-head">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">Mindthos AI · 처리 중</span>
              <span className="pf-status"><span className="pulse"></span>4 단계 처리</span>
            </div>
            <div className="sm-mock-body sm-step2-secure-body">
              <ol className="sm-step2-flow" data-flow-stages>
                <li className="sm-step2-stage" data-stage="1">
                  <span className="sm-step2-stage-num">01</span>
                  <span className="sm-step2-stage-name">입력 자료</span>
                  <span className="sm-step2-stage-desc">회기 기록</span>
                  <span className="sm-step2-stage-state" aria-hidden="true">
                    <span className="sm-step2-stage-spinner"></span>
                    <svg className="sm-step2-stage-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 L 6 10.5 L 11 4.5"/></svg>
                  </span>
                </li>
                <span className="sm-step2-stage-arrow" aria-hidden="true"></span>
                <li className="sm-step2-stage" data-stage="2">
                  <span className="sm-step2-stage-num">02</span>
                  <span className="sm-step2-stage-name">보안 처리</span>
                  <span className="sm-step2-stage-desc">암호화 · 비식별</span>
                  <span className="sm-step2-stage-state" aria-hidden="true">
                    <span className="sm-step2-stage-spinner"></span>
                    <svg className="sm-step2-stage-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 L 6 10.5 L 11 4.5"/></svg>
                  </span>
                </li>
                <span className="sm-step2-stage-arrow" aria-hidden="true"></span>
                <li className="sm-step2-stage" data-stage="3">
                  <span className="sm-step2-stage-num">03</span>
                  <span className="sm-step2-stage-name">AI 정리</span>
                  <span className="sm-step2-stage-desc">학습 미사용</span>
                  <span className="sm-step2-stage-state" aria-hidden="true">
                    <span className="sm-step2-stage-spinner"></span>
                    <svg className="sm-step2-stage-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 L 6 10.5 L 11 4.5"/></svg>
                  </span>
                </li>
                <span className="sm-step2-stage-arrow" aria-hidden="true"></span>
                <li className="sm-step2-stage" data-stage="4">
                  <span className="sm-step2-stage-num">04</span>
                  <span className="sm-step2-stage-name">결과 생성</span>
                  <span className="sm-step2-stage-desc">상담노트 초안</span>
                  <span className="sm-step2-stage-state" aria-hidden="true">
                    <span className="sm-step2-stage-spinner"></span>
                    <svg className="sm-step2-stage-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 L 6 10.5 L 11 4.5"/></svg>
                  </span>
                </li>
              </ol>

              <ul className="sm-step2-pills" data-flow-pills>
                <li className="sm-step2-pill" data-pill="1">학습 미사용</li>
                <li className="sm-step2-pill" data-pill="2">저장 전 암호화</li>
                <li className="sm-step2-pill" data-pill="3">개인정보 비식별</li>
                <li className="sm-step2-pill" data-pill="4">상담 기록 구조화</li>
                <li className="sm-step2-pill" data-pill="5">결과 카드 생성</li>
              </ul>
            </div>
          </div>
        </div>

        
        <div className="step-slide" data-step="3" hidden>
          <span className="step-label">Step 3 / 3 — 상담노트 결과</span>
          <p className="step-lead-big">상담노트 초안이 이렇게 정리됩니다</p>

          <div className="sm-mock sm-mock-result">
            <div className="sm-mock-head">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">Mindthos AI · 상담노트</span>
              <span className="pf-status pf-status-done"><span className="check"></span>생성 완료</span>
            </div>
            
            <div className="sm-mock-body sm-result-body sm-result-body-fade">
              <p className="sm-result-context">선택한 사례 · <strong data-sm-case-name>—</strong></p>
              <div data-sm-result-rows></div>
            </div>
          </div>

          <div className="sm-finish-cta-row">
            <a className="step-cta-primary step-cta-primary-anchor" href="https://app.mindthos.com" data-cta="signup">
              <span className="step-cta-primary-label">내 상담도 이렇게 시작하기</span>
              <span className="step-cta-primary-arrow" aria-hidden="true">→</span>
            </a>
            <button type="button" className="step-secondary-link" data-step-restart>다른 사례 체험</button>
          </div>
        </div>
      </div>


      <div className="step-foot" data-step-foot>
        <button type="button" className="step-next" data-step-next>다음 →</button>
      </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
