'use client';

export function PricingSection() {
  return (
<section className="wf-section" data-funnel-section="pricing">
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
        <a
          className="btn ghost"
          href="https://app.mindthos.com"
          data-cta-intent="signup"
          data-cta-location="pricing"
          data-cta-tier="starter"
          data-cta-label="체험해보기"
        >체험해보기</a>
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
        <a
          className="btn primary"
          href="https://app.mindthos.com"
          data-cta-intent="signup"
          data-cta-location="pricing"
          data-cta-tier="plus"
          data-cta-label="체험해보기"
        >체험해보기</a>
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
        <a
          className="btn ghost"
          href="https://app.mindthos.com"
          data-cta-intent="signup"
          data-cta-location="pricing"
          data-cta-tier="pro"
          data-cta-label="체험해보기"
        >체험해보기</a>
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
          <p className="price-target">센터 · 병원 · 공공기관 · 학교</p>
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
        <a
          className="btn ghost"
          href="/contact?type=institution-inquiry"
          data-cta-intent="institution_inquiry"
          data-cta-location="pricing"
          data-cta-tier="institution"
          data-cta-label="기관 도입 상담"
        >기관 도입 상담</a>
      </div>
    </div>

    <p className="price-foot">체감 사용량은 평균적인 회기 정리 기준 예시이며,<br/>실제 크레딧 사용량은 작업 종류와 기록 길이에 따라 달라질 수 있습니다.</p>
  </div>
</section>
  );
}
