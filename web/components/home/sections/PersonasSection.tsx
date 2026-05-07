'use client';

import Image from 'next/image';
import { useEffect } from 'react';

const PERSONAS: Array<{
  slot: number;
  src: string;
  cat: string;
  scene: React.ReactNode;
  quote: string;
  desc: string;
  tags: [string, string];
}> = [
  {
    slot: -2,
    src: '/personas/persona-1-late-night-notes.webp',
    cat: '기록이 밀리는 상담사',
    scene: (
      <>
        월요일 밤 10시,
        <br />
        아직 노트가 6개 남았다면
      </>
    ),
    quote: '상담은 끝났는데, 기록은 자꾸 하루씩 밀려요.',
    desc: '회기 녹음과 메모를 바로 쓸 수 있는 상담노트 초안으로 정리합니다.',
    tags: ['축어록', '상담노트'],
  },
  {
    slot: -1,
    src: '/personas/persona-2-test-and-interview.webp',
    cat: '통합 해석이 막히는 상담사',
    scene: (
      <>
        검사 결과와 면담 기록이
        <br />
        따로 놀 때
      </>
    ),
    quote: '검사 결과는 있는데, 실제 면담 흐름과 어떻게 연결해야 할지 막막해요.',
    desc: '검사 결과와 회기 기록을 함께 보며 통합 해석 초안을 정리합니다.',
    tags: ['심리검사 해석', '사례개념화'],
  },
  {
    slot: 0,
    src: '/personas/persona-3-supervision-prep.webp',
    cat: '슈퍼비전 준비 중인 상담사',
    scene: (
      <>
        슈퍼비전 전날,
        <br />
        사례를 어떻게 가져가야 할지 막막할 때
      </>
    ),
    quote: '무엇을 핵심 사례로 가져가야 할지 정리가 안 돼요.',
    desc: '회기 흐름과 반복 단서를 바탕으로 사례개념화와 질문거리를 정리합니다.',
    tags: ['사례개념화', 'AI 피드백'],
  },
  {
    slot: 1,
    src: '/personas/persona-4-multi-format.webp',
    cat: '기관 양식에 묶인 상담사',
    scene: (
      <>
        같은 기록을 기관 양식마다
        <br />
        다시 써야 할 때
      </>
    ),
    quote: '상담 내용은 같은데, 제출 양식은 매번 달라요.',
    desc: '상담 기록을 기관·보고용 양식에 맞춰 정리합니다.',
    tags: ['상담노트', '기관 양식'],
  },
  {
    slot: 2,
    src: '/personas/persona-5-genogram.webp',
    cat: '가족 관계를 구조화해야 하는 상담사',
    scene: (
      <>
        가족 관계가 복잡해서
        <br />
        한눈에 정리되지 않을 때
      </>
    ),
    quote: '관계 흐름은 보이는데, 구조로 정리하기가 어려워요.',
    desc: '가족 단서와 관계 정보를 가계도 중심으로 정리합니다.',
    tags: ['가계도', '관계 정리'],
  },
];

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
          <h2 className="t-h2">
            기록이 밀리는 순간부터,
            <br />
            해석이 막히는 회기까지
          </h2>
        </div>

        <div className="persona-rail-wrap">
          <button
            type="button"
            className="persona-nav persona-nav-prev persona-nav-side"
            data-persona-prev
            aria-label="이전 상황"
          >
            ←
          </button>
          <button
            type="button"
            className="persona-nav persona-nav-next persona-nav-side"
            data-persona-next
            aria-label="다음 상황"
          >
            →
          </button>

          <div className="persona-rail" data-persona-rail aria-label="상담사 사용 상황 카드 rail">
            {PERSONAS.map((p) => (
              <article key={p.src} className="persona-card" data-slot={p.slot}>
                <div className="persona-card-art" aria-hidden="true">
                  <Image
                    className="persona-card-art-img"
                    src={p.src}
                    alt=""
                    aria-hidden="true"
                    width={1536}
                    height={1024}
                    sizes="(max-width: 880px) 90vw, 360px"
                  />
                </div>
                <p className="persona-card-cat">{p.cat}</p>
                <h3 className="persona-card-scene">{p.scene}</h3>
                <blockquote className="persona-card-quote">{p.quote}</blockquote>
                <p className="persona-card-desc">{p.desc}</p>
                <ul className="persona-card-tags">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="persona-rail-foot">
            <div className="persona-rail-counter" role="group" aria-label="현재 상황 위치">
              <ul className="persona-rail-dots" data-persona-dots>
                {PERSONAS.map((p) => (
                  <li key={p.src} className="persona-rail-dot" />
                ))}
              </ul>
              <span className="persona-rail-counter-text" data-persona-counter aria-live="polite">
                <strong>1</strong>/{PERSONAS.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
