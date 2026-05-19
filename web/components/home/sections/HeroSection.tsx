'use client';

export function HeroSection() {
  /* Hero 비디오 (2026-05-08):
     SSR/CSR 모두 렌더 — preload="metadata" + fetchpriority="low" 로 첫 프레임만 가볍게 받고,
     디코딩/재생은 브라우저가 idle 시점에 처리. 자산은 압축본 (모바일 2.6MB / 데스크톱 2.6MB). */

  return (
<section className="hero" aria-label="마음토스 — 상담사를 위한 안전한 AI agent" data-funnel-section="hero">


  <div className="hero-bg" aria-hidden="true">
    <video
      className="hero-bg-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      // @ts-expect-error — fetchPriority 는 React 19 지원, video 타입엔 아직 미반영
      fetchPriority="low"
      aria-hidden="true"
      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
    >
      {/* 모바일 전용 영상 (세로 비율 + 인물 클로즈업). 720px 이하에서 우선 매칭. */}
      <source src="/hero-bg-mobile.mp4" type="video/mp4" media="(max-width: 720px)" />
      <source src="/hero-bg.mp4" type="video/mp4"/>
    </video>
    {/* SVG fallback for hero video. next/image disallows SVG by default for XSS safety,
        and this asset is a hidden aria-hidden fallback whose onError must mutate the
        rendered <img> directly — keep as native <img>. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="hero-bg-fallback" src="/hero-counselor.svg" alt=""
         aria-hidden="true" width={1440} height={900}
         onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}/>
    <div className="hero-bg-placeholder" aria-hidden="true"></div>
  </div>
  
  <div className="hero-scrim" aria-hidden="true"></div>

  
  <div className="hero-overlay" aria-hidden="true"></div>
  
  <div className="hero-bottom-fade" aria-hidden="true"></div>

  

  
  <div className="container hero-content-wrap">
    <div className="hero-content">
      <h1 className="hero-h1">상담사를 위한<br/><span className="hero-h1-accent"><svg className="hero-h1-accent-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9.9987 18.3346C9.9987 18.3346 16.6654 15.0013 16.6654 10.0013V4.16797L9.9987 1.66797L3.33203 4.16797V10.0013C3.33203 15.0013 9.9987 18.3346 9.9987 18.3346Z" stroke="currentColor" strokeWidth="1.57" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="8" r="2" fill="currentColor"/><path d="M10 8V13" stroke="currentColor" strokeWidth="1.5"/></svg>안전한 AI 에이전트,</span><br/>마음토스</h1>
      <p className="hero-sub">상담이 끝난 뒤에도 남는 기록과 해석의 부담.<br/>마음토스가 안전하게 정리하고, 다음 회기까지 이어줍니다.</p>
      <div className="hero-ctas">
        <a
          className="btn primary lg"
          href="https://app.mindthos.com"
          data-cta-intent="signup"
          data-cta-location="hero"
          data-cta-label="무료로 시작하기"
        >무료로 시작하기</a>
        <a className="btn lg ghost on-dark" href="/security">기록은 어떻게 보호되나요? →</a>
      </div>
    </div>
  </div>

  
</section>
  );
}
