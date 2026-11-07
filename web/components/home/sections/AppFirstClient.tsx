'use client';

import { useEffect, useRef, useState } from 'react';


const VID = '/videos/home-v2';

/* 2026-11 피드백: 탭 대신 짧은 실제 채팅 영상을 캐러셀로 자동 넘김. 영상은 웹 채팅 화면 녹화(가명 홍길동). */
const CHAT_GROUPS = [
  {
    key: 'prep',
    verb: '다음 회기 준비해줘',
    q: '홍길동 지난 회기 요약하고 다음 회기 준비할 것 정리해줘',
    brag: '상담실에 들어가기 전, 지난 흐름·이어갈 지점·던질 질문이 한 화면에 정리됩니다.',
    video: 'chat-summary',
  },
  {
    key: 'find',
    verb: '지난 기록 찾아줘',
    q: '홍길동 잠을 못 잔다고 한 부분 찾아줘',
    brag: '지난 기록을 다시 뒤질 필요가 없습니다. 어느 회기에서 나온 말인지 바로 찾아 드립니다.',
    video: 'chat-find',
  },
  {
    key: 'make',
    verb: '발표 자료 만들어줘',
    q: '‘아이의 감정 읽어주기’ 부모교육 발표 자료 10장 만들어줘',
    brag: '정리에서 끝나지 않습니다. 발표 자료·보고서·질문지까지 바로 쓸 수 있는 파일로 만들어 드립니다.',
    video: 'chat-ppt',
  },
  {
    key: 'task',
    verb: '상담 일정 맡겨줘',
    q: '홍길동 다음 주 화요일 오후 3시에 매주 반복 상담 잡아줘',
    brag: '일정 등록까지 맡길 수 있습니다. 바뀌는 내용은 카드로 먼저 보여 드려 상담사가 확인합니다.',
    video: 'chat-schedule',
  },
] as const;

export function ChatSection() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const videos = useRef<Array<HTMLVideoElement | null>>([]);
  const inView = useRef(false);
  const still = useRef(false);

  // 보이는 슬라이드 영상만 처음부터 재생하고, 끝나면 다음 슬라이드로 넘긴다.
  const play = (i: number) => {
    videos.current.forEach((v, j) => {
      if (!v || j === i) return;
      v.pause();
    });
    const v = videos.current[i];
    if (!v || still.current || !inView.current) return;
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  };

  useEffect(() => {
    still.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = stageRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
      if (e.isIntersecting) play(active);
      else videos.current.forEach((v) => v?.pause());
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    play(active);
     
  }, [active]);

  const go = (i: number) => {
    setProgress(0);
    setActive(i);
  };
  const next = () => go((active + 1) % CHAT_GROUPS.length);

  return (
    <section className="wf-section v2-chat" id="chat" data-funnel-section="chat">
      <div className="container">
        <div className="v2-head">
          <h2 className="t-h2">
            기록 찾기부터 발표 자료까지,
            <br />
            채팅 한 줄로 <span className="brand-word">마음토스</span>에게
          </h2>
          <p className="v2-lead">내담자 기록을 이미 알고 있어, 이름만 적으면 찾아 읽고 정리합니다.</p>
        </div>
        <div className="v2-car" ref={stageRef} aria-roledescription="carousel" aria-label="채팅으로 맡기는 일">
          <div className="v2-car-dots" role="tablist" aria-label="영상 고르기">
            {CHAT_GROUPS.map((g, i) => (
              <button
                key={g.key}
                type="button"
                role="tab"
                aria-selected={active === i}
                className="v2-car-dot"
                onClick={() => go(i)}
              >
                <i style={{ transform: `scaleX(${active === i ? progress : i < active ? 1 : 0})` }} />
                <span>{g.verb}</span>
              </button>
            ))}
          </div>
          <div className="v2-car-view">
          <div className="v2-car-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {CHAT_GROUPS.map((g, i) => (
              <div
                key={g.key}
                className="v2-car-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${CHAT_GROUPS.length} · ${g.verb}`}
                aria-hidden={active !== i}
              >
                <div className="v2-car-copy">
                  <p className="v2-cp-verb">{g.verb}</p>
                  <p className="v2-cp-q">“{g.q}”</p>
                  <p className="v2-cp-brag">{g.brag}</p>
                </div>
                <div className="v2-car-screen">
                  <div className="v2-car-bar" aria-hidden="true"><span /><span /><span /><b>마음토스 · AI 채팅</b></div>
                  <video
                    ref={(v) => { videos.current[i] = v; }}
                    src={`${VID}/${g.video}.mp4`}
                    poster={`${VID}/${g.video}-poster.jpg`}
                    muted
                    playsInline
                    preload={i === 0 ? 'auto' : 'metadata'}
                    onTimeUpdate={(e) => {
                      if (i === active) setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1));
                    }}
                    onEnded={() => { if (i === active) next(); }}
                    aria-label={`마음토스 웹 채팅 화면 — ${g.verb}`}
                  />
                </div>
              </div>
            ))}
          </div>
          </div>
          <button type="button" className="feat-nav prev" aria-label="이전 영상" onClick={() => go((active - 1 + CHAT_GROUPS.length) % CHAT_GROUPS.length)}>‹</button>
          <button type="button" className="feat-nav next" aria-label="다음 영상" onClick={next}>›</button>
        </div>
      </div>
    </section>
  );
}
