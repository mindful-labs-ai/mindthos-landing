import Image from 'next/image';

/* 앱·신기능을 앞세운 홈 개편(2026-11) 섹션 모음.
   화면은 모두 실제 Android 앱 캡처(가명 홍길동, 2026-10 촬영) — public/images/home-v2/ */

const IMG = '/images/home-v2';
const STORE_IOS = 'https://apps.apple.com/kr/app/id6814934565';
const STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.mindthos';
const SIGNUP = 'https://app.mindthos.com';

export function StoreBadges({ onDark = false, location }: { onDark?: boolean; location: string }) {
  return (
    <div className={onDark ? 'v2-stores on-dark' : 'v2-stores'}>
      <a
        className="v2-store"
        href={STORE_IOS}
        target="_blank"
        rel="noopener noreferrer"
        data-cta-intent="app_download"
        data-cta-location={location}
        data-cta-label="App Store"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" />
        </svg>
        <span>
          <small>Download on the</small>App Store
        </span>
      </a>
      <a
        className="v2-store"
        href={STORE_ANDROID}
        target="_blank"
        rel="noopener noreferrer"
        data-cta-intent="app_download"
        data-cta-location={location}
        data-cta-label="Google Play"
      >
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
          <path fill="#34a853" d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1z" />
          <path fill="#fbbc04" d="m16.7 15.3-3.3-3.3 3.3-3.3 3.8 2.2c1 .6 1 1.6 0 2.2z" />
          <path fill="#4285f4" d="M16.7 15.3 13.4 12l-9.8 9.7c.4.2.9.2 1.4-.1z" />
          <path fill="#ea4335" d="M16.7 8.7 4.9 2.4c-.5-.3-1-.3-1.4-.1L13.4 12z" />
        </svg>
        <span>
          <small>GET IT ON</small>Google Play
        </span>
      </a>
    </div>
  );
}

const SHOWCASE = [
  ['AI 채팅', '“홍길동 주호소와 회기 흐름 요약해줘” — 기록을 찾아 읽고 표로 정리합니다', 'app-08-client-summary.png'],
  ['모바일 녹음', '상담실에서 바로 녹음합니다. 알림을 허용하면 화면이 잠겨도 녹음이 이어집니다', 'app-32-audio-record.png'],
  ['축어록 → 상담노트', '녹음 파일 하나로 축어록과 상담노트가 함께 만들어집니다', 'app-63-transcript-result.png'],
  ['내 양식 그대로 보고서', '쓰던 워드 양식을 올리면 그 항목대로 채운 DOCX를 돌려드립니다', 'app-74-custom-template-result.png'],
  ['일정 관리', '“이번 주 상담 일정 보여줘” 한 줄이면 한 주 상담이 한눈에 정리됩니다. 예약·반복 일정도 채팅으로 잡습니다', 'chat-calendar-week.png'],
  ['사전 질문지', '첫 회기 전에 보낼 질문지를 문항까지 채워 만듭니다', 'app-47-questionnaire-create.png'],
  ['심리검사 해석', 'PHQ-9 점수를 넣으면 문항별 해석과 확인할 점을 정리합니다', 'app-14-assessment-interpretation.png'],
  ['AI 모델 선택', 'GPT·Claude·Gemini도 마음토스 안에서 골라 씁니다', 'app-05-model-sheet.png'],
] as const;

/** 히어로 바로 아래: 같은 '홍길동 회기 요약' 채팅을 PC·태블릿·휴대폰에서. 화면은 실제 웹·앱 캡처(가명 홍길동). */
export function DevicesSection() {
  return (
    <section className="wf-section v2-devices" id="devices" data-funnel-section="devices">
      <div className="container">
        <div className="v2-head">
          <p className="v2-kicker dark">PC · 태블릿 · 휴대폰</p>
          <h2 className="t-h2">
            어디서 열어도,
            <br />
            같은 <span className="brand-word">마음토스</span>
          </h2>
          <p className="v2-lead">PC에서 시작한 채팅을 태블릿과 휴대폰에서 그대로 이어서 씁니다. 기록도, 대화도 한곳에 있습니다.</p>
        </div>
        <div className="v2-dev-stage">
          <figure className="v2-dev v2-dev-tablet">
            <div className="v2-tablet">
              <Image src={`${IMG}/tablet-chat-summary.png`} alt="태블릿에서 본 마음토스 AI 채팅 — 홍길동 회기 요약" width={1200} height={1097} sizes="(max-width: 860px) 45vw, 260px" />
            </div>
            <figcaption>태블릿<span>AI 채팅</span></figcaption>
          </figure>
          <figure className="v2-dev v2-dev-laptop">
            <div className="v2-laptop">
              <div className="v2-laptop-screen">
                <Image src={`${IMG}/web-chat-summary.png`} alt="PC 웹에서 본 마음토스 AI 채팅 — 홍길동 회기 요약" width={1600} height={1187} sizes="(max-width: 860px) 92vw, 620px" />
              </div>
              <div className="v2-laptop-base" aria-hidden="true" />
            </div>
            <figcaption>PC 웹<span>AI 채팅</span></figcaption>
          </figure>
          <figure className="v2-dev v2-dev-phone">
            <div className="v2-phone sm">
              <Image className="on" src={`${IMG}/app-01-summary-result.png`} alt="휴대폰 앱에서 본 마음토스 AI 채팅 — 홍길동 회기 요약" width={840} height={1866} sizes="(max-width: 860px) 30vw, 200px" />
            </div>
            <figcaption>모바일 앱<span>AI 채팅 · iOS · Android</span></figcaption>
          </figure>
        </div>
        <div className="v2-dev-cta">
          <StoreBadges location="devices" />
        </div>
      </div>
    </section>
  );
}

export function NewFeaturesSection() {
  return (
    <section className="wf-section v2-show" id="new" data-funnel-section="new_features">
      <div className="container">
        <div className="v2-head">
          <h2 className="t-h2">
            <span className="brand-word">마음토스</span>는
            <br />
            시키면 해냅니다
          </h2>
          <p className="v2-lead">
            AI 채팅부터 휴대폰 앱, 파일 만들기까지. 새로 생긴 것만 모았습니다.
            <br />
            아래 화면은 모두 실제 앱 화면입니다.
          </p>
        </div>
        <ul className="v2-show-grid">
          {SHOWCASE.map(([title, desc, img]) => (
            <li key={title}>
              <div className="v2-show-shot">
                <Image
                  src={`${IMG}/${img}`}
                  alt={`${title} 실제 앱 화면`}
                  width={540}
                  height={1200}
                  sizes="(max-width: 1023px) 50vw, 280px"
                />
              </div>
              <p>
                <em>NEW</em>
                <b>{title}</b>
              </p>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
        <div className="v2-show-cta">
          <a
            className="btn primary lg"
            href={SIGNUP}
            data-cta-intent="signup"
            data-cta-location="new_features"
            data-cta-label="무료로 써 보기"
          >
            무료로 써 보기
          </a>
          <StoreBadges onDark location="new_features" />
        </div>
      </div>
    </section>
  );
}

const APP_STEPS = [
  ['상담실에서 바로 녹음', '앱의 녹음 버튼 하나. 알림을 허용하면 화면이 잠기거나 다른 앱을 써도 녹음이 이어집니다.', 'app-32-audio-record.png'],
  ['이동하는 사이 정리 끝', '녹음이 올라가면 축어록과 상담노트가 만들어지고, 다 되면 알림이 옵니다.', 'app-63-transcript-result.png'],
  ['퇴근길엔 채팅으로', '“다음 회기 준비해줘” 한 줄이면 이어갈 지점과 질문이 정리됩니다.', 'app-01-summary-result.png'],
] as const;

export function MobileAppSection() {
  return (
    <section className="wf-section v2-app" id="app-flow" data-funnel-section="mobile_app">
      <div className="container">
        <div className="v2-head">
          <p className="v2-kicker dark">NEW · 모바일 앱</p>
          <h2 className="t-h2">
            녹음부터 다음 상담 준비까지,
            <br />
            <span className="brand-word">마음토스</span> 하나로
          </h2>
          <p className="v2-lead">상담실에서 녹음을 올리고, 이동하는 사이 축어록을 받고, 퇴근길에 다음 상담을 준비합니다.</p>
        </div>
        <ol className="v2-app-steps">
          {APP_STEPS.map(([title, desc, img], i) => (
            <li key={title}>
              <div className="v2-phone sm">
                <Image
                  className="on"
                  src={`${IMG}/${img}`}
                  alt={`${title} 실제 앱 화면`}
                  width={840}
                  height={1866}
                  sizes="300px"
                />
              </div>
              <p className="v2-step-n">{String(i + 1).padStart(2, '0')}</p>
              <b>{title}</b>
              <span>{desc}</span>
            </li>
          ))}
        </ol>
        <div className="v2-app-cta" id="app-install">
          <StoreBadges onDark location="mobile_app" />
        </div>
      </div>
    </section>
  );
}
