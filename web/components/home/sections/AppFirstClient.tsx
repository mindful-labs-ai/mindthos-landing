'use client';

import Image from 'next/image';
import { useState } from 'react';

const IMG = '/images/home-v2';

const CHAT_GROUPS = [
  {
    key: 'prep',
    verb: '준비해줘',
    q: '다음 회기 준비할 내용 정리해줘',
    brag: '상담실에 들어가기 전, 지난 흐름·이어갈 지점·던질 질문이 한 화면에 정리됩니다.',
    tools: ['다음 회기 준비', '사례개념화 초안', '심리검사 결과와 회기 기록 함께 보기', '웹 검색(출처 포함)'],
    img: 'chat-prep.png',
    h: 1080,
  },
  {
    key: 'find',
    verb: '찾아줘',
    q: '홍길동 상담에서 잠을 못 잔다고 한 부분 찾아줘',
    brag: '지난 기록을 다시 뒤질 필요가 없습니다. 어느 회기에서 나온 말인지 바로 찾아 드립니다.',
    tools: ['기록 검색', '회기 요약', '회기 수·상태', '내담자 목록'],
    img: 'chat-find.png',
    h: 450,
  },
  {
    key: 'make',
    verb: '만들어줘',
    q: '2회기 상담 내용을 정리해서 사례회의 발표용 PPT 파일로 만들어줘',
    brag: '정리에서 끝나지 않습니다. 발표 자료·사전 질문지·동의서·안내 문자까지 바로 쓸 수 있는 파일로 만들어 드립니다.',
    tools: ['PPT·Word·Excel 만들기', '사전 질문지·동의서', '안내 문자 초안', '수퍼비전 보고서', '축어록 내려받기'],
    img: 'chat-make.png',
    h: 488,
  },
  {
    key: 'task',
    verb: '맡겨줘',
    q: '다음 주 수요일 오전 10시부터 11시까지 사례회의 일정 넣어줘',
    brag: '일정 등록까지 맡길 수 있습니다. 바뀌는 내용은 카드로 먼저 보여 드려 상담사가 확인합니다.',
    tools: ['개인 일정 등록', '확인 카드로 결과 표시'],
    img: 'chat-task.png',
    h: 560,
  },
] as const;

const TRUST3 = [
  ['확인 카드', '일정처럼 바뀌는 내용은 카드로 먼저 보여 드립니다. AI가 몰래 바꾸지 않습니다.'],
  ['헷갈리면 되묻기', '이름이 같은 내담자가 있으면 추측하지 않고 선택지를 보여 드립니다.'],
  ['내 스타일 기억', '“인용은 내1, 상1 형식으로” 한 번 알려 주면 다음부터 그 형식으로 씁니다.'],
] as const;

export function ChatSection() {
  const [active, setActive] = useState<string>(CHAT_GROUPS[0].key);

  return (
    <section className="wf-section v2-chat" id="chat" data-funnel-section="chat">
      <div className="container">
        <div className="v2-head">
          <p className="v2-kicker">NEW · AI 채팅</p>
          <h2 className="t-h2">
            채팅 한 번이면,
            <br />
            나머지는 마음토스가 합니다
          </h2>
          <p className="v2-lead v2-lead-tight">
            <b>웹에서도, 앱에서도 같은 채팅입니다.</b>
          </p>
          <p className="v2-lead">
            범용 AI는 내 내담자를 모르지만, 마음토스 채팅은 압니다.
            <br />
            기록을 복사해 붙여 넣을 필요 없이 이름만 적으면 됩니다.
          </p>
        </div>
        <div className="v2-ctabs" role="tablist" aria-label="채팅으로 맡기는 일">
          {CHAT_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              className="v2-ct"
              role="tab"
              id={`v2-ct-${g.key}`}
              aria-selected={active === g.key}
              aria-controls={`v2-cp-${g.key}`}
              onClick={() => setActive(g.key)}
            >
              <b>{g.verb}</b>
              <span>“{g.q}”</span>
            </button>
          ))}
        </div>
        {CHAT_GROUPS.map((g) => (
          <div
            key={g.key}
            className="v2-cp"
            role="tabpanel"
            id={`v2-cp-${g.key}`}
            aria-labelledby={`v2-ct-${g.key}`}
            hidden={active !== g.key}
          >
            <div className="v2-cp-copy">
              <p className="v2-cp-verb">{g.verb}</p>
              <p className="v2-cp-q">“{g.q}”</p>
              <p className="v2-cp-brag">{g.brag}</p>
              <ul>
                {g.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <figure className="v2-cp-shot">
              <Image
                src={`${IMG}/${g.img}`}
                alt={`마음토스 웹 채팅 실제 화면 — ${g.verb}`}
                width={1040}
                height={g.h}
                sizes="(max-width: 860px) 100vw, 640px"
              />
              <figcaption>실제 마음토스 화면 (운영 v1.17)</figcaption>
            </figure>
          </div>
        ))}
        <ul className="v2-trust3">
          {TRUST3.map(([title, desc]) => (
            <li key={title}>
              <b>{title}</b>
              <p>{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
