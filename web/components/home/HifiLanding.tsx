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
      { label: '상담 주제', type: 'text', value: '대화 단절과 양육 방식 차이로 반복되는 부부 갈등. 최근 6개월 사이 갈등 빈도가 주 2-3회로 증가하며 비난–방어–회피의 상호작용이 고착되는 양상.' },
      { label: '당회기 상담 목표', type: 'text', value: '갈등 상황에서 반복되는 상호작용 패턴(비난–방어–회피)을 함께 확인하고, 각자의 정서 반응을 분리해 살펴봅니다.' },
      { label: '상담 내용 요약', type: 'text', value: '아내(비난) → 남편(방어·침묵) → 아내(추격) → 남편(회피·이탈)의 4단계가 양육 장면에서 자동으로 작동하는 흐름을 함께 재구성. 표면 갈등 아래 "존중받지 못한다"는 공통 기저감이 양쪽 모두에서 확인…' },
      { label: '주요 개입 방향', type: 'text', value: '갈등 직전 첫 감정과 표현된 행동 사이의 거리를 좁히는 작업. "비난 없이 요청하기" 연습으로 양육 가치관 차이를 협의의 출발점으로 재구성합니다.' },
      { label: '다음 회기 계획', type: 'text', value: '갈등 시작 시 각자의 첫 감정과 상대에게 정말 전달하고 싶었던 마음을 정리해보고, 한 박자 멈추는 신호를 부부가 함께 정해 시도하도록 안내합니다.' },
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

export function HifiLanding() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    /* === Promo bar dismiss === */
    {
      const KEY = 'mt-promo-1month-dismissed';
      const html = document.documentElement;
      const top = document.querySelector<HTMLElement>('[data-promo-top]');
      const bottom = document.querySelector<HTMLElement>('[data-promo-bottom]');
      const isDismissed = (): boolean => {
        try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
      };
      const markDismissed = (): void => {
        try { sessionStorage.setItem(KEY, '1'); } catch {}
      };
      const applyState = (dismissed: boolean): void => {
        if (dismissed) {
          if (top) top.style.display = 'none';
          if (bottom) bottom.style.display = 'none';
          html.classList.remove('has-promo-top');
          html.classList.remove('has-promo-bottom');
        } else {
          html.classList.add('has-promo-top');
          html.classList.add('has-promo-bottom');
        }
      };
      applyState(isDismissed());
      const bindClose = (scope: HTMLElement | null): void => {
        if (!scope) return;
        scope.querySelectorAll<HTMLElement>('[data-promo-close]').forEach(btn => {
          const handler = () => { markDismissed(); applyState(true); };
          btn.addEventListener('click', handler);
          cleanups.push(() => btn.removeEventListener('click', handler));
        });
      };
      bindClose(top);
      bindClose(bottom);
    }

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

    /* === §02 / §03 fade-up === */
    const fadeUpGroups: Array<{ sel: string; cls: string; threshold: number; rootMargin: string }> = [
      { sel: '.trust-team, .trust-protect-3 .trust-protect-item', cls: 'trust-rise', threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      { sel: '.pain-scenes .pain-scene', cls: 'pain-rise', threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    ];
    for (const g of fadeUpGroups) {
      const targets = document.querySelectorAll<HTMLElement>(g.sel);
      if (!targets.length) continue;
      targets.forEach(el => el.classList.add(g.cls));
      const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-in-view'));
        continue;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-in-view');
            io.unobserve(e.target);
          }
        });
      }, { threshold: g.threshold, rootMargin: g.rootMargin });
      targets.forEach(el => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

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

    /* === §08 metrics in-view === */
    {
      const strip = document.querySelector('.metrics-strip');
      if (strip) {
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || !('IntersectionObserver' in window)) {
          strip.classList.add('stats-in-view');
        } else {
          const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting && e.intersectionRatio >= 0.2) {
                strip.classList.add('stats-in-view');
                io.unobserve(strip);
              }
            });
          }, { threshold: [0, 0.2, 0.5] });
          io.observe(strip);
          cleanups.push(() => io.disconnect());
        }
      }
    }

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

    /* === §11 final CTA in-view === */
    {
      const section = document.querySelector('.final-cta-section');
      if (section) {
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || !('IntersectionObserver' in window)) {
          section.classList.add('final-in-view');
        } else {
          const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting && e.intersectionRatio >= 0.18) {
                section.classList.add('final-in-view');
                io.unobserve(section);
              }
            });
          }, { threshold: [0, 0.18, 0.4] });
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
    <>
<div className="promo-top" data-promo-top role="region" aria-label="신규 가입 프로모션">
  <div className="promo-top-inner">
    <p className="promo-top-msg">
      <span className="promo-tag">NEW</span>
      <span>신규 가입 상담사님께 첫 1개월 무료 제공 · <a href="#signup-placeholder" data-promo-cta>무료로 시작하기 →</a></span>
    </p>
    <button type="button" className="promo-close" data-promo-close aria-label="프로모션 배너 닫기">✕</button>
  </div>
</div>
  <header className="gnb">
    <div className="container gnb-inner">
      <a className="gnb-logo" href="#" aria-label="마음토스 홈">
        <span className="gnb-logo-mark" aria-hidden="true">
          <svg viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 24 V13 C 4 8.5, 8.5 7, 11.5 10.5 V24" stroke="#44ce4b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M11.5 13 C 11.5 8.5, 16 7, 19 10.5 V24" stroke="#44ce4b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M19 13 C 19 8.5, 23.5 7, 26.5 10.5 V24" stroke="#44ce4b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="5.6" cy="9.4" r="1.5" fill="#44ce4b"/>
          </svg>
        </span>
        <span className="gnb-logo-word">마음토스</span>
      </a>
      <nav className="gnb-nav">
        <a>서비스 소개</a>
        <a>사용 가이드</a>
        <a>블로그</a>
        <a>교육 프로그램</a>
        <a>문의</a>
      </nav>
      <div className="gnb-right">
        <a className="btn sm ghost">로그인</a>
      </div>
    </div>
  </header>
<section className="hero" aria-label="마음토스 — 상담사를 위한 안전한 AI agent">

  
  <div className="hero-bg" aria-hidden="true">
    <video className="hero-bg-video" autoPlay muted loop playsInline preload="auto"
           aria-hidden="true"
           onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}>
      <source src="/hero-bg.mp4" type="video/mp4"/>
    </video>
    <img className="hero-bg-fallback" src="/hero-counselor.svg" alt=""
         aria-hidden="true"
         onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}/>
    <div className="hero-bg-placeholder" aria-hidden="true"></div>
  </div>
  
  <div className="hero-scrim" aria-hidden="true"></div>

  
  <div className="hero-overlay" aria-hidden="true"></div>
  
  <div className="hero-bottom-fade" aria-hidden="true"></div>

  
  <div className="container hero-top">
    <div className="hero-nav">
      <a className="logo" href="#" aria-label="마음토스 홈"><img src="/logo-mindthos.svg" alt="마음토스" onError={(e) => { const t = e.currentTarget; const span = document.createElement('span'); span.textContent = '마음토스'; span.style.cssText = 'font-family:var(--font-heading);font-weight:800;font-size:20px;letter-spacing:-0.01em;color:inherit'; t.replaceWith(span); }} /></a>
      <div className="hero-nav-right">
        <a className="btn sm ghost on-dark">로그인</a>
        <a className="btn sm primary">무료로 시작하기</a>
      </div>
    </div>
    
    <div className="wf-marker">
      <span className="num">01</span>
      <span className="name">Hero</span>
      <span className="purpose">풀스크린 상담 장면 + dark overlay + 좌측 카피 (사수 v5)</span>
    </div>
  </div>

  
  <div className="container hero-content-wrap">
    <div className="hero-content">
      <h1 className="hero-h1">상담사를 위한<br/><span className="hero-h1-accent">안전한 AI 에이전트,</span><br/>마음토스</h1>
      <p className="hero-sub">상담이 끝난 뒤에도 남는 기록과 해석의 부담.<br/>마음토스가 안전하게 정리하고, 다음 회기까지 이어줍니다.</p>
      <div className="hero-ctas">
        <a className="btn primary lg">무료로 시작하기</a>
        <a className="btn lg ghost on-dark">기록은 어떻게 보호되나요? →</a>
      </div>
    </div>
  </div>

  
</section>
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
        <p className="trust-team-eyebrow">상담 기록 보호 기준</p>
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
          <a href="/security">기록은 어떻게 보호되나요? <span aria-hidden="true">→</span></a>
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
              <h3 className="trust-protect-label">이름과 연락처는 먼저 가려집니다</h3>
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
<section className="wf-section tone-light">
  <div className="container">
    <div className="wf-marker">
      <span className="num">03</span>
      <span className="name">문제 공감 · 흩어진 단서 시각화</span>
      <span className="purpose">5 단서 + 중앙 통합 영역 + 대표 quote 1개 — 기능 카탈로그 ❌, 공감 한 장면</span>
    </div>

    <div className="pain-head pain-head--lean">
      <h2 className="t-h2">기록은 남았지만,<br/>해석은 여전히 흩어져 있습니다</h2>
    </div>

    <div className="pain-scenes">

      
      <article className="pain-scene">
        <div className="pain-scene-stage pain-stage-converge paingfx-canvas paingfx-01" aria-label="흩어진 자료가 한 사람의 케이스로 모이는 모습">
          <svg className="paingfx-01-lines" viewBox="0 0 600 360" preserveAspectRatio="none" aria-hidden="true">
            <line className="paingfx-line paingfx-line-1" x1="120" y1="80"  x2="237" y2="145"/>
            <line className="paingfx-line paingfx-line-2" x1="480" y1="80"  x2="363" y2="145"/>
            <line className="paingfx-line paingfx-line-3" x1="120" y1="280" x2="237" y2="215"/>
            <line className="paingfx-line paingfx-line-4" x1="480" y1="280" x2="363" y2="215"/>
          </svg>
          <span className="paingfx-01-sat paingfx-01-sat-tl" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17 L9 13 L13 16 L19 8"/>
              <line x1="6" y1="20" x2="8" y2="20"/>
              <line x1="11" y1="20" x2="14" y2="20"/>
              <line x1="17" y1="20" x2="20" y2="20"/>
            </svg>
          </span>
          <span className="paingfx-01-sat paingfx-01-sat-tr" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7 H19 a2 2 0 0 1 2 2 v6 a2 2 0 0 1-2 2 H10 L6 20 V17 H5 a2 2 0 0 1-2-2 V9 a2 2 0 0 1 2-2 z"/>
              <line x1="8" y1="11" x2="15" y2="11"/>
              <line x1="8" y1="14" x2="13" y2="14"/>
            </svg>
          </span>
          <span className="paingfx-01-sat paingfx-01-sat-bl" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="7"/>
              <path d="M12 9 V13 L15 14.5"/>
              <path d="M5.5 13 a6.5 6.5 0 0 1 1.6-4.2"/>
              <path d="M5.6 8 L5.2 10.6 L7.6 10.4"/>
            </svg>
          </span>
          <span className="paingfx-01-sat paingfx-01-sat-br" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4 H15 L19 8 V19 a1 1 0 0 1-1 1 H6 a1 1 0 0 1-1-1 V5 a1 1 0 0 1 1-1 z"/>
              <path d="M15 4 V8 H19"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="8" y1="15" x2="14" y2="15"/>
            </svg>
          </span>
          <span className="paingfx-01-core" aria-label="내담자">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="16" cy="12" r="4.5"/>
              <path d="M7 26 c0-5 4-8 9-8 s9 3 9 8"/>
            </svg>
          </span>
        </div>
        <div className="pain-scene-text" data-skip-legacy>
          <span className="pain-scene-num">SCENE 01</span>
          <h3 className="pain-scene-title">흩어진 자료를 한 사람의 이야기로 묶어야 할 때</h3>
          <blockquote className="pain-quote">
            <p>"검사 결과랑 면담 기록이 따로 놀 때,<br/>그걸 한 사람의 이야기로 묶는 게 제일 막막해요."</p>
            <cite>마음토스 사용자 인터뷰</cite>
          </blockquote>
        </div>
      </article>

      
      <article className="pain-scene reverse">
        <div className="pain-scene-stage pain-stage-fanout paingfx-canvas paingfx-02" aria-label="상담 후 작성할 문서가 산더미처럼 쌓이는 모습">
          <ul className="paingfx-02-stack" role="list" aria-hidden="true">
            <li className="paingfx-02-doc" data-doc="1"><span className="paingfx-02-num">DOC 01</span><span className="paingfx-02-name">상담노트</span></li>
            <li className="paingfx-02-doc" data-doc="2"><span className="paingfx-02-num">DOC 02</span><span className="paingfx-02-name">사례개념화</span></li>
            <li className="paingfx-02-doc" data-doc="3"><span className="paingfx-02-num">DOC 03</span><span className="paingfx-02-name">슈퍼비전</span></li>
            <li className="paingfx-02-doc" data-doc="4"><span className="paingfx-02-num">DOC 04</span><span className="paingfx-02-name">심리검사</span></li>
            <li className="paingfx-02-doc" data-doc="5"><span className="paingfx-02-num">DOC 05</span><span className="paingfx-02-name">개입계획</span></li>
            <li className="paingfx-02-doc" data-doc="6"><span className="paingfx-02-num">DOC 06</span><span className="paingfx-02-name">심리보고서</span></li>
          </ul>
        </div>
        <div className="pain-scene-text">
          <span className="pain-scene-num">SCENE 02</span>
          <h3 className="pain-scene-title">상담은 끝났는데,<br/>작성할 문서는 아직 산더미처럼 쌓여있다</h3>
          <blockquote className="pain-quote">
            <p>"같은 회기를 양식마다 다시 정리하느라,<br/>퇴근 시간이 자꾸 늦어집니다."</p>
            <cite>마음토스 사용자 인터뷰</cite>
          </blockquote>
        </div>
      </article>

      
      <article className="pain-scene">
        <div className="pain-scene-stage pain-stage-bridge paingfx-canvas paingfx-03" aria-label="기록은 남아 있지만 다음 회기로 이어갈 실마리가 꼬이는 모습">
          <span className="paingfx-03-doc" aria-hidden="true">
            <span className="paingfx-03-doc-line"></span>
            <span className="paingfx-03-doc-line"></span>
            <span className="paingfx-03-doc-line"></span>
            <span className="paingfx-03-doc-line"></span>
          </span>
          <svg className="paingfx-03-flow" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
            <path className="paingfx-03-line" d="M 90 100 L 215 100 Q 222 91, 230 100 Q 238 109, 246 100 Q 254 91, 262 100 Q 270 109, 278 100"/>
            <path className="paingfx-03-scribble" d="M 278 100 c 26 -34 62 -20 52 16 c -4 26 -46 14 -32 -18 c 10 -24 60 -2 38 32 c -14 26 -62 4 -28 -26 c 26 -22 70 4 36 38 c -18 22 -64 -10 -28 -34 c 24 -22 72 12 30 42 c -22 20 -58 -8 -8 -24 c 32 -10 70 18 22 32 c -28 8 -52 -10 -2 -16"/>
            <path className="paingfx-03-dotted" d="M 440 100 L 470 100"/>
          </svg>
          <span className="paingfx-03-x" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/>
              <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
              <line x1="15.5" y1="8.5" x2="8.5" y2="15.5"/>
            </svg>
          </span>
        </div>
        <div className="pain-scene-text">
          <span className="pain-scene-num">SCENE 03</span>
          <h3 className="pain-scene-title">다음 회기에서 어디부터 이어갈지 막막할 때</h3>
          <blockquote className="pain-quote">
            <p>"기록은 남았는데,<br/>다음 회기에서 어디부터 이어가야 할지 다시 찾아봐요."</p>
            <cite>마음토스 사용자 인터뷰</cite>
          </blockquote>
        </div>
      </article>

      </div>

    <p className="pain-motion">scene별 자료가 아직 연결 전 상태로 흩어져 있고, 중앙의 통합·점검·연결은 상담사의 손에 남아 있음</p>
  </div>
  
  
</section>
<section className="wf-section alt">
  <div className="container">
    <div className="wf-marker">
      <span className="num">04</span>
      <span className="name">핵심 기능 · 필요한 순간에 꺼내 쓰는 도구</span>
      <span className="purpose">기능 나열이 아닌, 상담 장면에 맞춰 골라 쓰는 AI agent임을 보여주기</span>
    </div>

    <div className="feat-head feat-head--lean">
      <h2 className="t-h2">필요한 순간에,<br/>필요한 기능만 꺼내 쓰세요</h2>
    </div>

    <div className="feat-tabs" role="tablist" aria-label="핵심 기능 탭">
      
      <div className="feat-tablist">
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
            <h3 className="feat-msg">상담 녹음을 화자별 기록으로 정리합니다</h3>
            <div className="feat-when">회기 내용을 다시 듣고 받아쓰는 시간이 부담될 때</div>
            <p className="feat-desc">상담 녹음을 바탕으로 상담자와 내담자의 발화를 구분해 정리합니다.<br/>필요한 장면을 다시 확인하고, 이후 상담노트 작성의 기초 자료로 활용할 수 있습니다.</p>
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
                  <h4 className="mt2-title">가상내담자_이영숙_2회기.mp3</h4>
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
                      <p className="mt2-trx-text">어서 오세요, 영숙님. 한 주 동안 잘 지내셨나요? 날씨가 제법 쌀쌀해졌는데, 오시는 길 괜찮으셨어요?</p>
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
            <h3 className="feat-msg">20가지 이상의 상담노트 템플릿을<br/>상담 목적에 맞게 바로 변환합니다</h3>
            <div className="feat-when">같은 회기 기록을 양식마다 다시 쓰고 있을 때</div>
            <p className="feat-desc">회기 내용과 상담사 메모를 바탕으로 상담노트 초안을 생성합니다.<br/>SOAP, DAP, BIRP 같은 표준 양식부터 CBT, 대상관계, 가족상담, 접수면접, 기관 제출용 양식까지 상담 목적에 맞춰 바로 변환할 수 있습니다.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">같은 기록을 여러 양식으로 바꿔야 할 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock" aria-hidden="true">
            <div className="pf-titlebar">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">Mindthos AI · 상담노트</span>
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
                <path className="is-active" d="M0 110 C 50 110, 50 28, 100 28"/>
                <path d="M0 110 C 50 110, 50 82, 100 82"/>
                <path d="M0 110 C 50 110, 50 138, 100 138"/>
                <path d="M0 110 C 50 110, 50 192, 100 192"/>
              </svg>

              <ul className="note-results">
                <li className="note-doc is-active">
                  <span className="note-doc-tag">선택</span>
                  <span className="note-doc-name">가족센터 상담 노트</span>
                </li>
                <li className="note-doc">
                  <span className="note-doc-tag">노트</span>
                  <span className="note-doc-name">마음토스 상담노트</span>
                </li>
                <li className="note-doc">
                  <span className="note-doc-tag">개념화</span>
                  <span className="note-doc-name">인간중심 사례개념화 노트</span>
                </li>
                <li className="note-doc">
                  <span className="note-doc-tag">기관</span>
                  <span className="note-doc-name">기관 제출용 기록</span>
                </li>
              </ul>
            </div>

            
            <div className="note-preview">
              <div className="note-preview-tabs">
                <span className="note-preview-tab">입력된 텍스트</span>
                <span className="note-preview-tab is-active">가족센터 상담 노트</span>
                <span className="note-preview-tab">인간중심 사례개념화 노트</span>
                <span className="note-preview-tab">Wee 센터 상담노트</span>
                <span className="note-preview-tab is-add">+</span>
              </div>
              <div className="note-preview-doc">
                <div className="note-preview-section">
                  <span className="note-preview-section-h">상담 주제</span>
                  <p className="note-preview-section-body">원가족 부모화 경험과 가족 관계 속 심리적 고통 완화</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">당회기 상담 목표</span>
                  <p className="note-preview-section-body">부모화 양상 통찰과 가족 관계에서의 자기 경계 재정립</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">상담 내용 요약</span>
                  <p className="note-preview-section-body">자기 대화 연습으로 자기 가치 분리 변화 확인, 가계도 분석으로 가족 체계 역할 탐색.</p>
                </div>
                <div className="note-preview-section">
                  <span className="note-preview-section-h">다음 회기 계획</span>
                  <p className="note-preview-section-body">심리적 거리 유지 연습 지속, 자기 대화 과제 이행 점검.</p>
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
            <h3 className="feat-msg">흩어진 단서를 하나의 상담 가설로 정리합니다</h3>
            <div className="feat-when">내담자의 반복 패턴은 보이지만 어떻게 개념화할지 막막할 때</div>
            <p className="feat-desc">회기 기록 속 반복되는 정서, 관계 패턴, 사고 흐름을 바탕으로<br/>상담사가 검토할 수 있는 사례개념화 초안을 제안합니다.<br/>최종 판단은 상담사가 직접 검토하는 구조입니다.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">통합 해석이 막힐 때</span>
              </div>
            </div>
          </div>
          <div className="feat-mock" aria-hidden="true">
            <div className="pf-titlebar">
              <span className="pf-dots"><span></span><span></span><span></span></span>
              <span className="pf-app">Mindthos AI · 사례개념화</span>
              <span className="pf-status"><span className="pulse"></span>상담자 검토용</span>
            </div>
            
            <div className="pf-body cnc-result-only">
              <div className="pf-cell result mock-psy-result cnc-result-card">
                <div className="mock-psy-result-head">
                  <div className="cnc-doc-title-group">
                    <span className="cnc-doc-title">홍길동_4회기 사례개념화</span>
                    <span className="cnc-doc-subtitle">상담사 검토용 초안</span>
                  </div>
                  <span className="mock-psy-result-status">초안 · 검토 필요</span>
                </div>

                <ul className="cnc-theory-tabs">
                  <li className="cnc-theory-tab is-active">인간중심</li>
                  <li className="cnc-theory-tab">가족체계</li>
                  <li className="cnc-theory-tab">CBT</li>
                  <li className="cnc-theory-tab">대상관계</li>
                  <li className="cnc-theory-tab">정신역동</li>
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
                    <p className="cnc-doc-section-body">"수습자" 자기개념과 자신의 욕구 사이 불일치가 반복적인 보호자 역할로 표현되며, 자기 수용이 어려워진 양상…</p>
                  </div>
                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">유지 요인</span>
                    <p className="cnc-doc-section-body">가족 시스템의 기대, 거절 후 발생하는 죄책감, 보호자 역할에서 얻는 자기 가치감이 패턴을 강화…</p>
                  </div>

                  <div className="cnc-doc-cite">
                    <span className="cnc-doc-cite-h">이론 기반 해석 · 인간중심 관점</span>
                    <p className="cnc-doc-cite-body">"보호자" 자기개념과 "나도 살아야겠다"는 생존 욕구 사이의 괴리. 자기 수용이 어려워진 상태로 이해할 수 있음.</p>
                    <ul className="cnc-doc-cite-points">
                      <li>유기체적 경험에 대한 인식 회복이 변화의 출발점</li>
                      <li>보호자 역할 외 자기개념 확장 작업 필요</li>
                    </ul>
                  </div>

                  <div className="cnc-doc-section">
                    <span className="cnc-doc-section-h">임상 근거 · 회기 발언</span>
                    <p className="cnc-doc-section-body">3회기 — "억울해도 된다는 말이요. 그 말을 계속 되뇌었어요." 자기 수용의 첫 신호로 해석…</p>
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
            <h3 className="feat-msg">가족 관계 단서를 구조로 정리합니다</h3>
            <div className="feat-when">가족 관계와 세대 간 패턴을 한눈에 보고 싶을 때</div>
            <p className="feat-desc">상담 기록 속 가족 구성원, 관계 단서, 반복되는 갈등 패턴을 바탕으로<br/>가계도 정리와 해석 초안을 도와줍니다.<br/>가족상담이나 관계 패턴을 다루는 회기에서 활용할 수 있습니다.</p>
            <div className="feat-pain-row">
              <span className="feat-pain-lbl">연결되는 어려움</span>
              <div className="feat-pain-tags">
                <span className="pain-tag">관계 패턴이 복잡할 때</span>
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
              <svg className="pf-geno2-svg" viewBox="0 0 720 380" preserveAspectRatio="xMidYMid meet">
                
                <line x1="135" y1="80" x2="220" y2="80" stroke="#a8b2bd" strokeWidth="1.3"/>
                <line x1="500" y1="78" x2="600" y2="78" stroke="#a8b2bd" strokeWidth="1.3"/>
                <line x1="500" y1="82" x2="600" y2="82" stroke="#a8b2bd" strokeWidth="1.3"/>

                
                <path d="M 175 95 V 138 H 240 V 175" stroke="#a8b2bd" strokeWidth="1.3" fill="none"/>
                <path d="M 550 95 V 138 H 480 V 175" stroke="#a8b2bd" strokeWidth="1.3" fill="none"/>

                
                <path d="M 270 190 L 285 184 L 300 196 L 315 184 L 330 196 L 345 184 L 360 196 L 375 184 L 390 196 L 405 184 L 420 196 L 435 184 L 450 196 L 465 184 L 480 190" stroke="#475569" strokeWidth="1.4" fill="none"/>

                
                <path d="M 360 205 V 250 H 280 V 280" stroke="#a8b2bd" strokeWidth="1.3" fill="none"/>
                <path d="M 360 205 V 250 H 440 V 280" stroke="#a8b2bd" strokeWidth="1.3" fill="none"/>

                
                <text x="175" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Pretendard, sans-serif">1930-</text>
                <text x="550" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Pretendard, sans-serif">1935-</text>
                <text x="240" y="170" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Pretendard, sans-serif">1964</text>
                <text x="480" y="170" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Pretendard, sans-serif">1967</text>
                <text x="280" y="275" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Pretendard, sans-serif">1989</text>
                <text x="440" y="275" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Pretendard, sans-serif">1993</text>

                
                <rect x="120" y="65" width="30" height="30" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="135" y="123" textAnchor="middle" fontSize="10.5" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">시아버지</text>
                <circle cx="220" cy="80" r="15" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="220" y="123" textAnchor="middle" fontSize="10.5" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">시어머니</text>

                
                <rect x="535" y="65" width="30" height="30" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="550" y="123" textAnchor="middle" fontSize="10.5" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">친정아버지</text>
                <circle cx="600" cy="80" r="15" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="600" y="123" textAnchor="middle" fontSize="10.5" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">친정어머니</text>

                
                <rect x="225" y="175" width="30" height="30" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="240" y="195" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="700" fontFamily="Pretendard, sans-serif">61</text>
                <text x="240" y="225" textAnchor="middle" fontSize="11.5" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">박진호</text>

                
                <circle cx="480" cy="190" r="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="2"/>
                <text x="480" y="195" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="800" fontFamily="Pretendard, sans-serif">58</text>
                <text x="480" y="226" textAnchor="middle" fontSize="11.5" fill="#16a34a" fontWeight="700" fontFamily="Pretendard, sans-serif">이영숙</text>

                
                <rect x="266" y="280" width="28" height="28" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="280" y="299" textAnchor="middle" fontSize="10.5" fill="#0f172a" fontWeight="700" fontFamily="Pretendard, sans-serif">36</text>
                <text x="280" y="328" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">민수</text>

                <circle cx="440" cy="294" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                <text x="440" y="298" textAnchor="middle" fontSize="10.5" fill="#0f172a" fontWeight="700" fontFamily="Pretendard, sans-serif">32</text>
                <text x="440" y="328" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="600" fontFamily="Pretendard, sans-serif">지혜</text>
              </svg>

              
              <div className="pf-geno2-toolbar">
                <span className="pf-geno2-tool is-active" title="select"><svg viewBox="0 0 14 14" fill="currentColor"><path d="M3 1 L11 7.5 L6.5 8.5 L4.5 12 z"/></svg></span>
                <span className="pf-geno2-tool" title="move"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/><polyline points="5 4 7 2 9 4"/><polyline points="5 10 7 12 9 10"/><polyline points="4 5 2 7 4 9"/><polyline points="10 5 12 7 10 9"/></svg></span>
                <span className="pf-geno2-tool" title="frame"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"><rect x="2" y="2" width="10" height="10"/></svg></span>
                <span className="pf-geno2-tool" title="rect"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2.5" y="2.5" width="9" height="9"/></svg></span>
                <span className="pf-geno2-tool" title="line"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 11 L4 7 L6 10 L8 5 L10 8 L12 4"/></svg></span>
                <span className="pf-geno2-tool" title="text"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3 H11"/><path d="M7 3 V12"/></svg></span>
                <span className="pf-geno2-tool" title="tag"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2 H7 L12 7 L7 12 L2 7 z"/><circle cx="4.5" cy="4.5" r="1"/></svg></span>
                <span className="pf-geno2-tool danger" title="delete"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4 H11"/><path d="M5 4 V2.5 H9 V4"/><path d="M3.5 4 L4 12 H10 L10.5 4"/></svg></span>
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
            <h3 className="feat-msg">검사 결과와 면담 기록을 함께 읽습니다</h3>
            <div className="feat-when">MMPI, SCT, HTP 같은 검사 자료를 회기 맥락과 함께 해석해야 할 때</div>
            <p className="feat-desc">검사 결과를 따로 떼어 읽지 않고,<br/>회기 맥락 안에서 검사 단서와 면담 기록을 함께 살펴볼 수 있도록 준비 중입니다.<br/>임상 판단을 대신하지 않고, 상담자가 검토할 수 있는 단서를 정리하는 보조 역할을 목표로 합니다.</p>
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
              <span className="pf-app">Mindthos AI · 심리검사 해석</span>
              <span className="pf-status"><span className="pulse"></span>준비 중</span>
            </div>
            
            
            <div className="pf-body psych-test-mock-shell">
              <div className="psych-test-placeholder">
                <div className="psych-test-skeleton-row" aria-hidden="true">
                  <div className="psych-test-skeleton-card">
                    <span className="psych-test-skeleton-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3 H6 A1 1 0 0 0 5 4 V20 A1 1 0 0 0 6 21 H18 A1 1 0 0 0 19 20 V8 Z"/>
                        <path d="M14 3 V8 H19"/>
                        <line x1="8" y1="13" x2="16" y2="13"/>
                        <line x1="8" y1="16" x2="14" y2="16"/>
                      </svg>
                    </span>
                    <span className="psych-test-skeleton-label">검사 자료</span>
                  </div>
                  <div className="psych-test-skeleton-card">
                    <span className="psych-test-skeleton-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 5 H20 V17 H13 L9 21 V17 H4 Z"/>
                      </svg>
                    </span>
                    <span className="psych-test-skeleton-label">면담 기록</span>
                  </div>
                  <div className="psych-test-skeleton-card">
                    <span className="psych-test-skeleton-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="3" width="16" height="18" rx="1.5"/>
                        <line x1="8" y1="9" x2="16" y2="9"/>
                        <line x1="8" y1="13" x2="16" y2="13"/>
                        <line x1="8" y1="17" x2="13" y2="17"/>
                      </svg>
                    </span>
                    <span className="psych-test-skeleton-label">해석 초안</span>
                  </div>
                </div>
                <div className="psych-test-empty-state">
                  <span className="psych-test-empty-title">심리검사 해석 기능 준비 중</span>
                  <p className="psych-test-empty-sub">검사 자료와 면담 기록을 함께 검토할 수 있는 보조 도구를 준비하고 있습니다.</p>
                </div>
              </div>
            </div>
            
        </div>
      </div>
    </div>
  </div>
  </div>
</section>
<section className="wf-section sample-section">
  <div className="container">
    <div className="wf-marker">
      <span className="num">05</span>
      <span className="name">샘플 상담노트 체험</span>
      <span className="purpose">로그인 없이, 4-state 흐름을 랜딩 안에서 체감 (핵심 전환 포인트)</span>
    </div>

    <div className="sample-head">
      <h2 className="t-h2">실제 자료를 올리기 전,<br/>마음토스의 결과를 먼저 확인해보세요</h2>
    </div>
    
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
            <a className="step-cta-primary step-cta-primary-anchor" href="#signup-placeholder" data-cta="signup">
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
</section>
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

              
              <g transform="translate(8 188)" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.62">
                <path d="M0 12 L 6 0 L 12 12 z"/>
                <line x1="6" y1="4" x2="6" y2="8"/>
                <circle cx="6" cy="10.5" r="0.5" fill="#16a34a" stroke="none"/>
              </g>

              
              <g transform="translate(220 12)">
                <rect width="36" height="20" rx="3" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.2"/>
                <line x1="0" y1="6" x2="36" y2="6" stroke="#1f3329" strokeWidth="1.2"/>
                <text x="18" y="16" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="9" fontWeight="700" fill="#1f3329">MON</text>
              </g>

              
              <g transform="translate(232 50)">
                
                <circle cx="36" cy="36" r="34" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.6"/>
                <circle cx="36" cy="36" r="34" fill="none" stroke="#bfe7c4" strokeWidth="2" opacity="0.65"/>
                
                <circle cx="36" cy="6"  r="1.4" fill="#1f3329"/>
                <circle cx="66" cy="36" r="1.4" fill="#1f3329"/>
                <circle cx="36" cy="66" r="1.4" fill="#1f3329"/>
                <circle cx="6"  cy="36" r="1.4" fill="#1f3329"/>
                
                <circle cx="50.5" cy="9.5"  r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="61.5" cy="20.5" r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="61.5" cy="51.5" r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="50.5" cy="62.5" r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="21.5" cy="62.5" r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="10.5" cy="51.5" r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="10.5" cy="20.5" r="0.9" fill="#1f3329" opacity="0.55"/>
                <circle cx="21.5" cy="9.5"  r="0.9" fill="#1f3329" opacity="0.55"/>
                
                <line x1="36" y1="36" x2="22" y2="20" stroke="#1f3329" strokeWidth="2.6" strokeLinecap="round"/>
                
                <line x1="36" y1="36" x2="36" y2="12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
                
                <circle cx="36" cy="36" r="2.6" fill="#1f3329"/>
                
                <text x="36" y="86" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="10" fontWeight="700" fill="#1f3329">10:00 PM</text>
              </g>

              
              <g stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" opacity="0.42">
                <line x1="208" y1="76" x2="222" y2="76"/>
                <line x1="212" y1="86" x2="222" y2="86"/>
              </g>

              
              
              <g transform="translate(28 50) rotate(-4)">
                <rect width="124" height="52" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="6" fill="none" stroke="#1f3329" strokeWidth="1.2"/>
                <circle cx="14" cy="13" r="1.8" fill="none" stroke="#1f3329" strokeWidth="1.2"/>
                <path d="M9 19 Q 14 16 19 19" fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="26" y1="12" x2="80" y2="12" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <line x1="26" y1="18" x2="64" y2="18" stroke="#94a3b8" strokeWidth="1"/>
                <circle cx="14" cy="34" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="34" x2="96" y2="34" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <circle cx="14" cy="42" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="42" x2="86" y2="42" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(72 76) rotate(3)">
                <rect width="120" height="46" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <path d="M8 18 Q 12 10 16 18 Q 20 26 24 18 Q 28 10 32 18" fill="none" stroke="#1f3329" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="42" y1="14" x2="92" y2="14" stroke="#1f3329" strokeWidth="1.1" opacity="0.55"/>
                <circle cx="14" cy="34" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="34" x2="98" y2="34" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(20 102) rotate(-2)">
                <rect width="124" height="50" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="12" cy="14" r="1.6" fill="#22c55e"/>
                <line x1="20" y1="14" x2="86" y2="14" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <circle cx="12" cy="22" r="1.6" fill="#22c55e"/>
                <line x1="20" y1="22" x2="76" y2="22" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <circle cx="12" cy="30" r="1.6" fill="#22c55e"/>
                <line x1="20" y1="30" x2="84" y2="30" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <circle cx="12" cy="38" r="1.6" fill="#22c55e"/>
                <line x1="20" y1="38" x2="68" y2="38" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(8 142) rotate(-8)">
                <rect width="42" height="38" fill="#bfe7c4" stroke="#1f3329" strokeWidth="1.2"/>
                <line x1="6" y1="10" x2="34" y2="10" stroke="#1f3329" strokeWidth="1" opacity="0.6"/>
                <line x1="6" y1="18" x2="30" y2="18" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="26" x2="34" y2="26" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(168 100) rotate(6)">
                <rect width="50" height="42" rx="4" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.2"/>
                <line x1="6" y1="10" x2="40" y2="10" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="18" x2="38" y2="18" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="26" x2="42" y2="26" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="34" x2="34" y2="34" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(40 152) rotate(1)">
                <rect width="158" height="40" rx="9" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.4"/>
                <circle cx="16" cy="20" r="9" fill="#bfe7c4" stroke="#1f3329" strokeWidth="1.3"/>
                <polygon points="13,16 13,24 22,20" fill="#1f3329"/>
                <g stroke="#1f3329" strokeWidth="1.3" strokeLinecap="round">
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
                <text x="135" y="14" textAnchor="end" fontFamily="Pretendard, sans-serif" fontSize="8" fill="#1f3329" opacity="0.55">42:18</text>
              </g>

              
              <circle cx="200" cy="48" r="17" fill="#16a34a"/>
              <text x="200" y="55" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="18" fontWeight="800" fill="#fff">6</text>
              
              <text x="200" y="78" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="9" fontWeight="600" fill="#16a34a" opacity="0.85">남은 노트</text>

              
              <line x1="0" y1="198" x2="320" y2="198" stroke="#1f3329" strokeWidth="1.2" opacity="0.30"/>

              
              <g transform="translate(208 122)">
                
                <path d="M0 76 L 6 36 Q 30 24 64 32 Q 78 38 78 76 Z" fill="url(#p1pile-skin)" stroke="#1f3329" strokeWidth="1.5" strokeLinejoin="round"/>
                
                <path d="M2 76 L 10 56 Q 36 48 84 52 L 92 76 Z" fill="url(#p1pile-skin)" stroke="#1f3329" strokeWidth="1.4" strokeLinejoin="round"/>
                
                <ellipse cx="46" cy="46" rx="20" ry="14" fill="url(#p1pile-skin)" stroke="#1f3329" strokeWidth="1.5"/>
                
                <path d="M28 42 Q 32 26 46 26 Q 62 26 64 42 Q 60 36 50 36 Q 36 38 30 42 Z" fill="#1f3329"/>
                
                <path d="M28 42 Q 26 50 30 56 L 34 56 L 34 46 Z" fill="#1f3329" opacity="0.55"/>
                
                <line x1="38" y1="50" x2="44" y2="50" stroke="#1f3329" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
              </g>

              
              <g stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
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
                <path d="M0 0 H58 L68 10 V108 H0 z" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M58 0 V10 H68" fill="none" stroke="#1f3329" strokeWidth="1.4"/>
                <circle cx="10" cy="14" r="2.4" fill="#16a34a"/>
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

              
              <circle cx="98" cy="80" r="3" fill="#22c55e"/>
              <circle cx="92" cy="108" r="3.4" fill="#22c55e"/>
              <circle cx="98" cy="138" r="3" fill="#22c55e"/>
              <circle cx="116" cy="68" r="2.4" fill="#22c55e" opacity="0.75"/>

              
              <g stroke="#22c55e" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                <path d="M 100 80 c 28 -8 46 12 26 30 c -22 20 48 30 68 -8"/>
                <path d="M 95 108 c 22 -22 60 -2 48 28 c -10 30 70 -8 64 -28"/>
                <path d="M 100 138 c 28 2 38 -22 68 -10 c 30 12 56 -22 50 -42"/>
                <path d="M 119 68 c 8 28 -18 50 12 58 c 30 8 50 -20 68 0"/>
              </g>

              
              <text x="146" y="56" fontFamily="Pretendard, sans-serif" fontSize="16" fontWeight="700" fill="#22c55e" opacity="0.85">?</text>
              <text x="170" y="44" fontFamily="Pretendard, sans-serif" fontSize="22" fontWeight="700" fill="#16a34a" opacity="0.95">?</text>
              <circle cx="194" cy="58" r="1.4" fill="#22c55e" opacity="0.6"/>
              <circle cx="200" cy="64" r="1.2" fill="#22c55e" opacity="0.5"/>

              
              <line x1="208" y1="110" x2="232" y2="110" stroke="#22c55e" strokeWidth="1.7" strokeLinecap="round"/>
              <polygon points="234,110 226,106 226,114" fill="#22c55e"/>

              
              <line x1="86" y1="108" x2="92" y2="108" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" opacity="0.65"/>

              
              <g transform="translate(238 26)">
                <rect x="0" y="0" width="68" height="168" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="0" y="0" width="4" height="168" rx="2" fill="#16a34a"/>
                <text x="12" y="20" fontFamily="Pretendard, sans-serif" fontSize="9" fontWeight="700" fill="#1f3329">Hypothesis</text>
                <line x1="12" y1="26" x2="60" y2="26" stroke="#94a3b8" strokeWidth="0.8" opacity="0.5"/>
                
                <g opacity="0.88">
                  <circle cx="14" cy="42" r="1.7" fill="#16a34a"/>
                  <line x1="20" y1="42" x2="58" y2="42" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="48" x2="48" y2="48" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="66" r="1.7" fill="#16a34a"/>
                  <line x1="20" y1="66" x2="60" y2="66" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="72" x2="50" y2="72" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="90" r="1.7" fill="#16a34a"/>
                  <line x1="20" y1="90" x2="58" y2="90" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="96" x2="44" y2="96" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="114" r="1.7" fill="#16a34a"/>
                  <line x1="20" y1="114" x2="60" y2="114" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="20" y1="120" x2="46" y2="120" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="14" cy="138" r="1.7" fill="#16a34a"/>
                  <line x1="20" y1="138" x2="58" y2="138" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
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
            
            <svg viewBox="0 0 320 244" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
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

              
              <g transform="translate(20 16)" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55">
                <path d="M2 6 c4 -6 12 -2 8 4 c -3 6 -10 0 -6 -6 c 4 -4 12 2 8 6"/>
              </g>

              
              
              <g transform="translate(20 38) rotate(-8)">
                <rect width="68" height="50" rx="3" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <text x="6" y="16" fontFamily="Pretendard, sans-serif" fontSize="13" fontWeight="700" fill="#16a34a">?</text>
                <line x1="18" y1="14" x2="58" y2="14" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="24" x2="60" y2="24" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="32" x2="52" y2="32" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="40" x2="56" y2="40" stroke="#94a3b8" strokeWidth="0.9"/>
              </g>

              
              <g transform="translate(102 30) rotate(5)">
                <rect width="56" height="48" fill="#bfe7c4" stroke="#1f3329" strokeWidth="1.2"/>
                <line x1="6" y1="12" x2="46" y2="12" stroke="#1f3329" strokeWidth="1" opacity="0.6"/>
                <line x1="6" y1="20" x2="40" y2="20" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="28" x2="48" y2="28" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <line x1="6" y1="36" x2="36" y2="36" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(36 102) rotate(-3)">
                <rect width="80" height="62" rx="3" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <line x1="6" y1="12" x2="64" y2="12" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="22" x2="70" y2="22" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="30" x2="58" y2="30" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="38" x2="68" y2="38" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="46" x2="48" y2="46" stroke="#94a3b8" strokeWidth="0.9"/>
                <circle cx="9" cy="54" r="1.5" fill="#22c55e"/>
                <line x1="14" y1="54" x2="56" y2="54" stroke="#1f3329" strokeWidth="0.9" opacity="0.55"/>
              </g>

              
              <g transform="translate(116 122) rotate(7)">
                <rect width="62" height="48" rx="3" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <line x1="6" y1="12" x2="50" y2="12" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <line x1="6" y1="22" x2="54" y2="22" stroke="#94a3b8" strokeWidth="0.9"/>
                <line x1="6" y1="30" x2="46" y2="30" stroke="#94a3b8" strokeWidth="0.9"/>
                <text x="48" y="42" fontFamily="Pretendard, sans-serif" fontSize="14" fontWeight="700" fill="#16a34a">?</text>
              </g>

              
              <text x="166" y="84" fontFamily="Pretendard, sans-serif" fontSize="22" fontWeight="800" fill="#16a34a" opacity="0.85">?</text>
              <circle cx="184" cy="92" r="2.2" fill="#22c55e" opacity="0.65"/>
              <circle cx="190" cy="98" r="1.4" fill="#22c55e" opacity="0.45"/>

              
              <g fill="none" stroke="#1f3329" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 3" opacity="0.55">
                <path d="M 92 64 C 130 70, 170 86, 200 100"/>
                <path d="M 138 88 C 162 100, 184 112, 200 118"/>
                <path d="M 110 158 C 144 156, 174 144, 200 134"/>
                <path d="M 168 156 C 182 152, 194 150, 200 148"/>
              </g>
              
              <line x1="190" y1="124" x2="206" y2="124" stroke="#16a34a" strokeWidth="1.7" strokeLinecap="round"/>
              <polygon points="208,124 200,120 200,128" fill="#16a34a"/>

              
              <g transform="translate(214 24)">
                <rect width="92" height="200" rx="8" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.6" strokeLinejoin="round"/>
                <rect width="4" height="200" rx="2" fill="#16a34a"/>
                <text x="14" y="22" fontFamily="Pretendard, sans-serif" fontSize="11" fontWeight="700" fill="#1f3329">Supervision</text>
                <line x1="14" y1="30" x2="84" y2="30" stroke="#1f3329" strokeWidth="0.8" opacity="0.5"/>

                
                <g opacity="0.92">
                  <circle cx="16" cy="48" r="2" fill="#16a34a"/>
                  <line x1="22" y1="48" x2="84" y2="48" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="54" x2="68" y2="54" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="76" r="2" fill="#16a34a"/>
                  <line x1="22" y1="76" x2="84" y2="76" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="82" x2="74" y2="82" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="104" r="2" fill="#16a34a"/>
                  <line x1="22" y1="104" x2="84" y2="104" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="110" x2="62" y2="110" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="132" r="2" fill="#16a34a"/>
                  <line x1="22" y1="132" x2="84" y2="132" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="138" x2="70" y2="138" stroke="#94a3b8" strokeWidth="1"/>

                  <circle cx="16" cy="160" r="2" fill="#16a34a"/>
                  <line x1="22" y1="160" x2="84" y2="160" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                  <line x1="22" y1="166" x2="58" y2="166" stroke="#94a3b8" strokeWidth="1"/>
                </g>

                
                <circle cx="76" cy="14" r="6" fill="#16a34a"/>
                <path d="M73 14 L75 16 L79 12" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </g>

              
              <g transform="translate(8 168)">
                
                <path d="M0 56 L 6 26 Q 22 18 38 22 L 44 56 Z" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.5" strokeLinejoin="round"/>
                
                <ellipse cx="22" cy="10" rx="14" ry="14" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.5"/>
                
                <ellipse cx="9" cy="6" rx="5" ry="5" fill="#1f3329"/>
                
                <path d="M10 6 Q 14 -4 26 -2 Q 36 0 36 12 Q 34 6 28 6 Q 18 6 12 10 Z" fill="#1f3329"/>
                
                <path d="M30 14 Q 33 14 35 13" fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
                
                <path d="M16 32 Q 18 22 24 18 Q 30 14 32 18" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.5" strokeLinejoin="round"/>
                
                <ellipse cx="32" cy="18" rx="5" ry="4" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.3"/>
              </g>

              
              <line x1="0" y1="222" x2="320" y2="222" stroke="#1f3329" strokeWidth="1.2" opacity="0.30"/>

              
              <g transform="translate(192 224)" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
                <path d="M0 12 L 6 0 L 12 12 z"/>
                <line x1="6" y1="4" x2="6" y2="8"/>
                <circle cx="6" cy="10.5" r="0.5" fill="#16a34a" stroke="none"/>
              </g>

              
              <g style={{"display":"none"}}>
                
                <path d="M126 206 L 132 160 Q 168 150 200 160 L 206 206 Z" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.6" strokeLinejoin="round"/>
                
                <path d="M157 158 Q 168 164 178 158" fill="none" stroke="#1f3329" strokeWidth="1.2" opacity="0.5"/>
                
                <path d="M200 162 Q 222 174 226 200 L 232 206 L 200 206 z" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.6" strokeLinejoin="round"/>
                
                <ellipse cx="172" cy="120" rx="22" ry="24" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.6"/>
                
                <path d="M150 116 Q 154 96 172 94 Q 192 94 194 116 Q 192 110 184 108 Q 168 106 158 112 Z" fill="#1f3329"/>
                
                <path d="M150 116 Q 148 132 152 144 L 156 144 L 156 124 Z" fill="#1f3329" opacity="0.55"/>
                
                <path d="M168 134 Q 172 136 176 134" fill="none" stroke="#1f3329" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
                
                <path d="M132 168 Q 122 144 134 122 Q 146 108 158 116" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.6" strokeLinejoin="round"/>
                
                <ellipse cx="158" cy="118" rx="6.5" ry="5" fill="url(#p3sup-skin)" stroke="#1f3329" strokeWidth="1.4"/>
              </g>

              
              <g stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
                <line x1="248" y1="142" x2="282" y2="142"/>
                <line x1="256" y1="152" x2="272" y2="152"/>
                <line x1="248" y1="162" x2="284" y2="162"/>
              </g>
              
              <g stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.40">
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
                
                <rect x="14" y="60" width="110" height="100" rx="8" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.4" strokeLinejoin="round"/>
                
                <rect x="98" y="52" width="20" height="22" rx="3" fill="#bfe7c4" stroke="#1f3329" strokeWidth="1.1"/>
                <line x1="108" y1="58" x2="108" y2="69" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round"/>
                
                <circle cx="32" cy="78" r="8.5" fill="none" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="32" cy="76" r="2.6" fill="none" stroke="#1f3329" strokeWidth="1.3"/>
                <path d="M26 84 Q 32 80 38 84" fill="none" stroke="#1f3329" strokeWidth="1.3" strokeLinecap="round"/>
                
                <line x1="48" y1="74" x2="112" y2="74" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="48" y1="80" x2="104" y2="80" stroke="#94a3b8" strokeWidth="1"/>
                
                <circle cx="26" cy="108" r="1.8" fill="#22c55e"/>
                <line x1="32" y1="108" x2="112" y2="108" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <circle cx="26" cy="124" r="1.8" fill="#22c55e"/>
                <line x1="32" y1="124" x2="106" y2="124" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <circle cx="26" cy="140" r="1.8" fill="#22c55e"/>
                <line x1="32" y1="140" x2="98" y2="140" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
              </g>

              
              <circle cx="124" cy="110" r="3.4" fill="#22c55e"/>

              
              <g stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85">
                
                <path d="M 124 110 C 152 102, 156 50, 170 38"/>
                
                <path d="M 124 110 C 154 108, 160 82, 178 80"/>
                
                <path d="M 124 110 C 154 112, 160 130, 170 126"/>
                
                <path d="M 124 110 C 152 118, 158 168, 178 174"/>
              </g>

              
              <circle cx="170" cy="38" r="3" fill="#22c55e"/>
              <circle cx="178" cy="80" r="3" fill="#22c55e"/>
              <circle cx="170" cy="126" r="3" fill="#22c55e"/>
              <circle cx="178" cy="174" r="3" fill="#22c55e"/>

              
              <polygon points="178,38 172,35 172,41" fill="#22c55e"/>
              <polygon points="186,80 180,77 180,83" fill="#22c55e"/>
              <polygon points="178,126 172,123 172,129" fill="#22c55e"/>
              <polygon points="186,174 180,171 180,177" fill="#22c55e"/>

              
              
              <g transform="translate(180 14)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3" strokeLinejoin="round"/>
                <circle cx="14" cy="14" r="6" fill="none" stroke="#1f3329" strokeWidth="1.2"/>
                <circle cx="14" cy="13" r="1.8" fill="none" stroke="#1f3329" strokeWidth="1.2"/>
                <path d="M9 19 Q 14 16 19 19" fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="26" y1="12" x2="78" y2="12" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <line x1="26" y1="18" x2="62" y2="18" stroke="#94a3b8" strokeWidth="1"/>
                <circle cx="14" cy="32" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="32" x2="92" y2="32" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <circle cx="14" cy="40" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="40" x2="84" y2="40" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(188 56)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3" strokeLinejoin="round"/>
                
                <rect x="8" y="8" width="14" height="14" rx="1" fill="none" stroke="#1f3329" strokeWidth="1.1"/>
                <line x1="8" y1="13" x2="22" y2="13" stroke="#1f3329" strokeWidth="0.9"/>
                <line x1="8" y1="18" x2="22" y2="18" stroke="#1f3329" strokeWidth="0.9"/>
                <line x1="13" y1="8" x2="13" y2="22" stroke="#1f3329" strokeWidth="0.9"/>
                <line x1="17" y1="8" x2="17" y2="22" stroke="#1f3329" strokeWidth="0.9"/>
                
                <line x1="32" y1="14" x2="84" y2="14" stroke="#1f3329" strokeWidth="1.1" opacity="0.55"/>
                
                <rect x="8" y="28" width="34" height="14" fill="none" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <rect x="42" y="28" width="34" height="14" fill="none" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
                <rect x="76" y="28" width="40" height="14" fill="none" stroke="#1f3329" strokeWidth="1" opacity="0.55"/>
              </g>

              
              <g transform="translate(180 102)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3" strokeLinejoin="round"/>
                
                <path d="M8 18 Q 12 10 16 18 Q 20 26 24 18" fill="none" stroke="#1f3329" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="34" y1="14" x2="86" y2="14" stroke="#1f3329" strokeWidth="1.1" opacity="0.55"/>
                <circle cx="14" cy="34" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="34" x2="96" y2="34" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <circle cx="14" cy="42" r="1.5" fill="#22c55e"/>
                <line x1="20" y1="42" x2="80" y2="42" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
              </g>

              
              <g transform="translate(188 150)">
                <rect x="0" y="0" width="124" height="48" rx="6" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3" strokeLinejoin="round"/>
                
                <path d="M6 6 H16 L22 12 V24 H6 z" fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M16 6 V12 H22" fill="none" stroke="#1f3329" strokeWidth="1.2"/>
                <line x1="32" y1="14" x2="98" y2="14" stroke="#1f3329" strokeWidth="1.1" opacity="0.55"/>
                <line x1="8" y1="32" x2="108" y2="32" stroke="#1f3329" strokeWidth="1" opacity="0.5"/>
                <line x1="8" y1="40" x2="92" y2="40" stroke="#94a3b8" strokeWidth="1"/>
              </g>

              
              <g stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5">
                <path d="M14 196 c4 -6 12 -2 8 4 c -3 6 -10 0 -6 -6 c 4 -4 12 2 8 6"/>
              </g>
              <g stroke="#22c55e" strokeWidth="1.3" strokeLinecap="round" opacity="0.6">
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

              
              
              <g fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round">
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

              
              <g fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.55">
                
                <path d="M 28 116 C 50 100, 64 92, 74 92"/>
                
                <line x1="160" y1="156" x2="142" y2="186"/>
                <line x1="160" y1="156" x2="178" y2="186"/>
                
                <path d="M 220 138 L 256 168 L 286 174"/>
              </g>

              
              <path d="M 124 92 L 130 98 L 124 104 L 130 110 L 124 116 L 130 122 L 124 128 L 146 138" fill="none" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" opacity="0.85"/>

              
              
              
              <g transform="translate(69 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(107 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              
              <g transform="translate(215 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(253 23)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(63 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(113 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              
              <g transform="translate(209 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(259 81)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(17 105)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              
              <g transform="translate(275 163)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(146 124)">
                <circle cx="14" cy="14" r="15" fill="#bfe7c4" stroke="#1f3329" strokeWidth="1.7"/>
                <circle cx="14" cy="11" r="3.2" fill="none" stroke="#1f3329" strokeWidth="1.2"/>
                <path d="M7 22 Q 14 18 21 22" fill="none" stroke="#1f3329" strokeWidth="1.2" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(208 127)">
                <circle cx="11" cy="11" r="11" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="11" cy="9" r="2.4" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 17 Q 11 13 17 17" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              <g transform="translate(132 178)">
                <circle cx="10" cy="10" r="10" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="10" cy="8" r="2.2" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 15 Q 10 12 15 15" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>
              <g transform="translate(168 178)">
                <circle cx="10" cy="10" r="10" fill="#fbf9f1" stroke="#1f3329" strokeWidth="1.3"/>
                <circle cx="10" cy="8" r="2.2" fill="none" stroke="#1f3329" strokeWidth="1"/>
                <path d="M5 15 Q 10 12 15 15" fill="none" stroke="#1f3329" strokeWidth="1" strokeLinecap="round"/>
              </g>

              
              
              <g transform="translate(16 188)" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.72">
                <path d="M0 12 L 6 0 L 12 12 z"/>
                <line x1="6" y1="4" x2="6" y2="8"/>
                <circle cx="6" cy="10.5" r="0.5" fill="#16a34a" stroke="none"/>
              </g>
              
              <g transform="translate(290 18)" stroke="#16a34a" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.55">
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
        <button type="button" className="persona-nav persona-nav-prev" data-persona-prev aria-label="이전 상황">←</button>
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
        <button type="button" className="persona-nav persona-nav-next" data-persona-next aria-label="다음 상황">→</button>
      </div>
    </div>
  </div>
</section>
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
          <span className="vs-side-tag">GENERIC AI</span>
          <span className="vs-side-name">범용 AI</span>
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
        <header className="vs-side-head">
          <span className="vs-side-tag is-brand">MINDTHOS</span>
          <span className="vs-side-name">마음토스</span>
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
<section className="wf-section tone-dark">
  <div className="container">
    <div className="wf-marker">
      <span className="num">08</span>
      <span className="name">숫자와 목소리로 본 마음토스</span>
      <span className="purpose">정량 4 + 후기 stream + 기관/사용처 strip · 차분한 신뢰 (placeholder 명시)</span>
    </div>

    
    <div className="metrics-screen">
    <div className="metrics-strip" aria-label="마음토스 정량 지표">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val">000<span className="unit">+</span></div>
          <div className="metric-label">함께 쓰는 상담사</div>
        </div>

        <div className="metric-card">
          <div className="metric-val">00,000<span className="unit">+</span></div>
          <div className="metric-label">정리된 상담 기록</div>
        </div>

        <div className="metric-card">
          <div className="metric-val"><span className="prefix">월</span>00<span className="unit">시간</span></div>
          <div className="metric-label">줄어든 기록 시간</div>
        </div>

        <div className="metric-card">
          <div className="metric-val">00<span className="unit">%</span></div>
          <div className="metric-label">지속 사용률</div>
        </div>
      </div>
    </div>
    </div>

    
    

    
    <div className="reviews-screen">
    
    <p className="tm-bridge">숫자로 보이는 변화 뒤에는,<br/>상담사들이 <span className="tm-bridge-mark">계속 찾게 된 이유</span>가 있습니다.</p>

    <div className="tm-section-label">실제 상담사들이 남긴 이야기</div>

    
    <div className="tm-stream" aria-label="상담사 후기 자동 스트림">
      <div className="tm-track">
        
        <article className="tm-card">
          <span className="tm-reason">기록 부담 감소</span>
          <h3 className="tm-card-title">기록 부담이 한결 가벼워졌어요</h3>
          <blockquote className="tm-text">회기 직후 떠오른 흐름을 빠르게 정리해두면, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄어듭니다. 메모에 신경 쓰는 부담이 줄어드니 회기 자체에 더 머무를 수 있게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=47" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>김OO 상담사</b><span>13년차 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">사례 정리 도움</span>
          <h3 className="tm-card-title">슈퍼비전 전에 정리가 쉬워졌어요</h3>
          <blockquote className="tm-text">무엇을 가져가야 할지 막막할 때, 회기 핵심과 질문거리가 먼저 정리되어 도움이 됩니다. 교수님이나 슈퍼바이저에게 가져갈 자료를 준비하는 부담이 줄었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=32" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>이OO 수련생</b><span>상담 수련생</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">기관 기록 정리</span>
          <h3 className="tm-card-title">기관 기록의 일관성이 잡혔어요</h3>
          <blockquote className="tm-text">센터마다 양식이 달라도 같은 회기 내용을 한 흐름으로 정리할 수 있어 좋았습니다. 같은 기록을 양식마다 다시 쓰는 시간이 줄어, 행정 부담이 눈에 띄게 가벼워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=12" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>박OO 센터장</b><span>상담센터 운영자</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">회기 정리 효율</span>
          <h3 className="tm-card-title">기록 정리에 쓰던 시간이 줄었어요</h3>
          <blockquote className="tm-text">상담 직후 짧은 시간 안에 초안이 정리되니, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄었습니다. 이전보다 내담자와 나눈 흐름을 놓치지 않고 확인할 수 있었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=49" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>정OO 상담사</b><span>청소년 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">내담자에 집중</span>
          <h3 className="tm-card-title">메모 부담이 덜해졌어요</h3>
          <blockquote className="tm-text">이전에는 상담 중에도 ‘이걸 나중에 어떻게 적지’라는 생각이 많았습니다. 지금은 회기 중에는 내담자에게 더 집중하고, 끝난 뒤 초안을 보며 필요한 부분만 다듬게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=44" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>윤OO 상담사</b><span>대학상담센터 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">관점 재검토</span>
          <h3 className="tm-card-title">막힐 때 다시 정리할 길이 생겼어요</h3>
          <blockquote className="tm-text">사례개념화가 막힐 때 다른 관점에서 정리된 초안을 보면 놓쳤던 단서가 보입니다. 그대로 쓰기보다, 제 판단을 다시 점검하는 기준점으로 활용하고 있어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=23" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>한OO 수련생</b><span>상담심리 대학원생</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">양식 자동 변환</span>
          <h3 className="tm-card-title">양식이 달라도 한 흐름으로 정리돼요</h3>
          <blockquote className="tm-text">기관 양식에 맞춰 같은 내용을 반복해서 다시 쓰는 시간이 줄었습니다. 상담 흐름은 유지하면서 필요한 형식에 맞춰 정리할 수 있어 행정 부담이 덜해졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=15" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>최OO 상담사</b><span>사설 상담센터 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">보고서 톤 정리</span>
          <h3 className="tm-card-title">보고서 다듬는 시간이 짧아졌어요</h3>
          <blockquote className="tm-text">제가 자주 쓰는 어투로 초안이 정리되니, 처음부터 다시 쓰지 않고 필요한 부분만 손보게 됐습니다. 행정 보고서까지 정리하는 흐름이 한결 자연스러워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=56" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>서OO 실무자</b><span>정신건강복지센터 실무자</span></div>
          </div>
        </article>

        
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">기록 부담 감소</span>
          <h3 className="tm-card-title">기록 부담이 한결 가벼워졌어요</h3>
          <blockquote className="tm-text">회기 직후 떠오른 흐름을 빠르게 정리해두면, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄어듭니다. 메모에 신경 쓰는 부담이 줄어드니 회기 자체에 더 머무를 수 있게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=47" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>김OO 상담사</b><span>13년차 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">사례 정리 도움</span>
          <h3 className="tm-card-title">슈퍼비전 전에 정리가 쉬워졌어요</h3>
          <blockquote className="tm-text">무엇을 가져가야 할지 막막할 때, 회기 핵심과 질문거리가 먼저 정리되어 도움이 됩니다. 교수님이나 슈퍼바이저에게 가져갈 자료를 준비하는 부담이 줄었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=32" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>이OO 수련생</b><span>상담 수련생</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">기관 기록 정리</span>
          <h3 className="tm-card-title">기관 기록의 일관성이 잡혔어요</h3>
          <blockquote className="tm-text">센터마다 양식이 달라도 같은 회기 내용을 한 흐름으로 정리할 수 있어 좋았습니다. 같은 기록을 양식마다 다시 쓰는 시간이 줄어, 행정 부담이 눈에 띄게 가벼워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=12" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>박OO 센터장</b><span>상담센터 운영자</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">회기 정리 효율</span>
          <h3 className="tm-card-title">기록 정리에 쓰던 시간이 줄었어요</h3>
          <blockquote className="tm-text">상담 직후 짧은 시간 안에 초안이 정리되니, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄었습니다. 이전보다 내담자와 나눈 흐름을 놓치지 않고 확인할 수 있었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=49" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>정OO 상담사</b><span>청소년 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">내담자에 집중</span>
          <h3 className="tm-card-title">메모 부담이 덜해졌어요</h3>
          <blockquote className="tm-text">이전에는 상담 중에도 ‘이걸 나중에 어떻게 적지’라는 생각이 많았습니다. 지금은 회기 중에는 내담자에게 더 집중하고, 끝난 뒤 초안을 보며 필요한 부분만 다듬게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=44" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>윤OO 상담사</b><span>대학상담센터 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">관점 재검토</span>
          <h3 className="tm-card-title">막힐 때 다시 정리할 길이 생겼어요</h3>
          <blockquote className="tm-text">사례개념화가 막힐 때 다른 관점에서 정리된 초안을 보면 놓쳤던 단서가 보입니다. 그대로 쓰기보다, 제 판단을 다시 점검하는 기준점으로 활용하고 있어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=23" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>한OO 수련생</b><span>상담심리 대학원생</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">양식 자동 변환</span>
          <h3 className="tm-card-title">양식이 달라도 한 흐름으로 정리돼요</h3>
          <blockquote className="tm-text">기관 양식에 맞춰 같은 내용을 반복해서 다시 쓰는 시간이 줄었습니다. 상담 흐름은 유지하면서 필요한 형식에 맞춰 정리할 수 있어 행정 부담이 덜해졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=15" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>최OO 상담사</b><span>사설 상담센터 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">보고서 톤 정리</span>
          <h3 className="tm-card-title">보고서 다듬는 시간이 짧아졌어요</h3>
          <blockquote className="tm-text">제가 자주 쓰는 어투로 초안이 정리되니, 처음부터 다시 쓰지 않고 필요한 부분만 손보게 됐습니다. 행정 보고서까지 정리하는 흐름이 한결 자연스러워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><img src="https://i.pravatar.cc/120?img=56" alt="" loading="lazy"/></span>
            <div className="tm-who"><b>서OO 실무자</b><span>정신건강복지센터 실무자</span></div>
          </div>
        </article>
      </div>
    </div>

    </div>

    
  </div>
</section>
<section className="wf-section">
  <div className="container">
    <div className="wf-marker">
      <span className="num">09</span>
      <span className="name">상담 규모에 맞는 요금 (4 플랜)</span>
      <span className="purpose">스타터 / 플러스 / 프로 / 기관 — 크레딧 설명은 각 카드 안에 흡수</span>
    </div>
    <div className="pricing-head pricing-head--lean">
      <h2 className="t-h2">내 상담 규모에 맞게,<br/>필요한 만큼 시작할 수 있습니다</h2>
    </div>

    
    <div className="price-grid">
      
      <div className="price-card">
        <div className="price-head">
          <div className="price-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5 H20 L25 10 V25 A2 2 0 0 1 23 27 H9 A2 2 0 0 1 7 25 V7 A2 2 0 0 1 9 5 Z"/>
              <path d="M20 5 V10 H25"/>
              <line x1="11" y1="15" x2="21" y2="15"/>
              <line x1="11" y1="19" x2="18" y2="19"/>
              <circle className="accent-fill" cx="13" cy="23" r="1.7"/>
            </svg>
          </div>
          <span className="price-name">스타터</span>
          <p className="price-target">마음토스를 처음 써보는 개인 상담사</p>
        </div>
        <div className="price-money">
          <div className="price-amt">8,900<span className="per">원/월</span></div>
          <div className="price-credits">
            <strong>500 크레딧 / 월</strong>
          </div>
        </div>
        <div className="price-feel">
          <span className="price-feel-label">체감 사용량</span>
          <div className="price-feel-summary">
            <ul className="price-feel-stats">
              <li><span className="price-feel-k">내담자</span><span className="price-feel-v">월 5명 이하</span></li>
              <li><span className="price-feel-k">월 회기</span><span className="price-feel-v">약 8회 이하</span></li>
            </ul>
          </div>
        </div>
        <ul className="price-ul">
          <li>일반 / 고급 축어록</li>
          <li>상담노트</li>
          <li>AI 슈퍼비전</li>
        </ul>
        <a className="btn ghost">체험해보기</a>
      </div>

      
      <div className="price-card featured">
        <span className="price-badge">추천</span>
        <div className="price-head">
          <div className="price-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="13" width="6" height="6" rx="1.5"/>
              <rect className="accent-fill" x="13" y="13" width="6" height="6" rx="1.5"/>
              <rect x="23" y="13" width="6" height="6" rx="1.5"/>
              <path d="M9 16 Q 11 13.5, 13 16"/>
              <path d="M19 16 Q 21 18.5, 23 16"/>
            </svg>
          </div>
          <span className="price-name">플러스</span>
          <p className="price-target">꾸준히 운영하는 개인 상담사</p>
        </div>
        <div className="price-money">
          <div className="price-amt">29,900<span className="per">원/월</span></div>
          <div className="price-credits">
            <strong>2,500 크레딧 / 월</strong>
          </div>
        </div>
        <div className="price-feel">
          <span className="price-feel-label">체감 사용량</span>
          <div className="price-feel-summary">
            <ul className="price-feel-stats">
              <li><span className="price-feel-k">내담자</span><span className="price-feel-v">월 15명 이하</span></li>
              <li><span className="price-feel-k">월 회기</span><span className="price-feel-v">약 40회 이하</span></li>
            </ul>
          </div>
        </div>
        <ul className="price-ul">
          <li>스타터의 모든 기능 포함</li>
          <li>모든 사례개념화 노트 사용 가능</li>
          <li>모든 이론 AI 슈퍼비전 사용 가능</li>
        </ul>
        <a className="btn primary">체험해보기</a>
      </div>

      
      <div className="price-card">
        <div className="price-head">
          <div className="price-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="14" y="4" width="13" height="14" rx="2" fill="#fff"/>
              <rect x="10" y="8" width="13" height="14" rx="2" fill="#fff"/>
              <rect x="6" y="12" width="15" height="15" rx="2" fill="#fff"/>
              <line x1="9" y1="17" x2="18" y2="17"/>
              <path className="accent-stroke" d="M9 22 L11.5 24.5 L16.5 19.5"/>
            </svg>
          </div>
          <span className="price-name">프로</span>
          <p className="price-target">풀타임 상담사 또는 소규모 팀</p>
        </div>
        <div className="price-money">
          <div className="price-amt">49,900<span className="per">원/월</span></div>
          <div className="price-credits">
            <strong>5,000 크레딧 / 월</strong>
          </div>
        </div>
        <div className="price-feel">
          <span className="price-feel-label">체감 사용량</span>
          <div className="price-feel-summary">
            <ul className="price-feel-stats">
              <li><span className="price-feel-k">내담자</span><span className="price-feel-v">월 30명 이상</span></li>
              <li><span className="price-feel-k">월 회기</span><span className="price-feel-v">약 80회 이상</span></li>
            </ul>
          </div>
        </div>
        <ul className="price-ul">
          <li>플러스의 모든 기능 포함</li>
          <li>최신 기능 우선 사용</li>
          <li>대용량 데이터 우선 처리</li>
        </ul>
        <a className="btn ghost">체험해보기</a>
      </div>

      
      <div className="price-card">
        <div className="price-head">
          <div className="price-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="8" r="2.4"/>
              <circle cx="26" cy="8" r="2.4"/>
              <circle cx="16" cy="27.5" r="2.4"/>
              <line x1="8" y1="9.5" x2="11.5" y2="11.5"/>
              <line x1="24" y1="9.5" x2="20.5" y2="11.5"/>
              <line x1="16" y1="25" x2="16" y2="22"/>
              <path d="M16 10 L20 12 V16 C 20 19, 16 21.5, 16 21.5 C 12 19, 12 16, 12 16 V12 Z" fill="#fff"/>
              <path className="accent-stroke" d="M14 16 L15.5 17.4 L18 14.6"/>
            </svg>
          </div>
          <span className="price-name">기관</span>
          <p className="price-target">센터 · 병원 · 공공기관 · 대학</p>
        </div>
        <div className="price-money">
          <div className="price-amt-custom">문의</div>
          <div className="price-credits">
            <strong>맞춤 크레딧</strong>
          </div>
        </div>
        <div className="price-feel">
          <span className="price-feel-label">체감 사용량</span>
          <div className="price-feel-summary">
            <ul className="price-feel-stats">
              <li><span className="price-feel-k">내담자</span><span className="price-feel-v">팀 규모에 맞춰 협의</span></li>
              <li><span className="price-feel-k">상담노트</span><span className="price-feel-v">기관 양식 맞춤 협의</span></li>
            </ul>
          </div>
        </div>
        <ul className="price-ul">
          <li>여러 상담사 계정 · 권한 관리</li>
          <li>기관 양식 맞춤 템플릿</li>
          <li>관리자 도구 / 팀 관리</li>
          <li>도입 지원 · 보안 협의</li>
        </ul>
        <a className="btn ghost">기관 도입 상담</a>
      </div>
    </div>

    <p className="price-foot">체감 사용량은 평균적인 회기 정리 기준 예시이며,<br/>실제 크레딧 사용량은 작업 종류와 기록 길이에 따라 달라질 수 있습니다.</p>
  </div>
</section>
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
      <a className="faq-foot-cta" href="#contact">기관 도입 상담하기</a>
    </div>

    
    
  </div>
</section>
<section className="wf-section final-cta-section">
  <div className="container">
    <div className="wf-marker">
      <span className="num">11</span>
      <span className="name">최종 CTA</span>
      <span className="purpose">와이어프레임 문구 회수 · 중앙 카드 · primary + secondary + trust chip 3 (preview UI 없음)</span>
    </div>

    
    <div className="final-cta-inner">
      <h2 className="final-cta-h2">상담 기록 정리,<br/>이제 더 가볍게</h2>
      <div className="final-cta-btns">
        <a className="btn lg primary">무료로 시작하기 <span className="arr" aria-hidden="true">→</span></a>
        <a className="final-cta-link" href="#contact">기관 도입 상담</a>
      </div>
    </div>
  </div>

  
  
</section>
  <footer className="footer">
    <div className="container">
      <div className="footer-top">
        <div className="footer-brand">
          <a className="gnb-logo" href="#" aria-label="마음토스 홈">
        <span className="gnb-logo-mark" aria-hidden="true">
          <svg viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 24 V13 C 4 8.5, 8.5 7, 11.5 10.5 V24" stroke="#44ce4b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M11.5 13 C 11.5 8.5, 16 7, 19 10.5 V24" stroke="#44ce4b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M19 13 C 19 8.5, 23.5 7, 26.5 10.5 V24" stroke="#44ce4b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="5.6" cy="9.4" r="1.5" fill="#44ce4b"/>
          </svg>
        </span>
        <span className="gnb-logo-word">마음토스</span>
      </a>
          <p>상담사를 위한 AI 파트너.<br/>축어록·상담노트·사례개념화까지 상담 기록을 더 안전하고 쉽게 정리합니다.</p>
          <div className="t-tag">학습 미사용 · 안전한 기록</div>
        </div>
        <div className="footer-col">
          <h5>마음토스</h5>
          <ul>
            <li><a>서비스 소개</a></li>
            <li><a>사용 가이드</a></li>
            <li><a>블로그</a></li>
            <li><a>교육 프로그램</a></li>
            <li><a>문의</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>회사</h5>
          <ul>
            <li><a>회사 소개</a></li>
            <li><a>이메일</a></li>
            <li><a>주소</a></li>
            <li><a>SNS</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>약관</h5>
          <ul>
            <li><a>서비스 이용약관</a></li>
            <li><a>개인정보처리방침</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div>Copyright © Mindful Labs Inc. All Rights Reserved.</div>
        <div className="legal-info">사업자등록번호 [placeholder] · 통신판매신고번호 [placeholder] · 대표 [placeholder] · 주소 [placeholder]</div>
      </div>
    </div>
  </footer>
<div className="promo-bottom" data-promo-bottom role="region" aria-label="신규 가입 프로모션">
  <div className="promo-bottom-msg">
    <span className="promo-tag">NEW</span>
    <span className="promo-bottom-text">신규 가입 시 첫 1개월 무료</span>
  </div>
  <a className="btn primary" href="#signup-placeholder" data-promo-cta>무료로 시작하기</a>
  <button type="button" className="promo-close" data-promo-close aria-label="프로모션 배너 닫기">✕</button>
</div>

    </>
  );
}
