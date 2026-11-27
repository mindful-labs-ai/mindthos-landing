import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  MonitorPlay,
  Ticket,
  CheckCircle2,
  Layers,
  Link2,
  Scale,
  Puzzle,
  Compass,
  FileText,
  BrainCircuit,
} from 'lucide-react';
import {
  generateBreadcrumbSchema,
  generateEducationEventSchema,
  generateFAQSchema,
} from '@/lib/seo/schema';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';
import { KAKAO_INQUIRY_URL } from '@/constants/nav';
import {
  DBT_CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR,
  type WebinarOffer,
} from '@/constants/webinar';
import { WebinarApplyForm } from '../_shared/WebinarApplyForm';
import { WebinarFaq } from '../_shared/WebinarFaq';
import '../_shared/webinar.css';

/** 신청 마감 표기 — 실제 마감은 WEBINAR.registrationClosed 플래그로 처리 */
const DEADLINE_LABEL = '12월 21일 (월) 23:59';

const PAIN_POINTS = [
  {
    icon: Layers,
    title: '문제가 여러 개 겹치면, 무엇부터 다뤄야 할지 막막합니다',
    body: '자해, 충동 행동, 관계 갈등이 한 사례 안에 함께 있을 때 어디에서 시작해야 할지 판단이 서지 않습니다.',
  },
  {
    icon: Link2,
    title: '체인 분석을 해도, 사례 전체의 그림으로 이어지지 않습니다',
    body: '한 번의 문제 행동은 꼼꼼히 분석했습니다. 그런데 그 분석이 내담자 전체를 이해하는 개념화로 연결되지 않습니다.',
  },
  {
    icon: Scale,
    title: '수용과 변화 사이, 지금 어느 쪽에 무게를 둘지 어렵습니다',
    body: '타당화가 필요한 순간인지, 변화를 밀어붙일 순간인지 회기 안에서 판단하기가 쉽지 않습니다.',
  },
  {
    icon: Puzzle,
    title: '기술 훈련은 하는데, 왜 이 내담자에게 이 기술인지 설명하기 어렵습니다',
    body: '마음챙김, 고통 감내, 정서 조절 기술을 가르치고 있지만 이 내담자에게 이 기술이 왜 필요한지 근거를 세우기 어렵습니다.',
  },
];

const KEY_QUESTIONS = [
  'DBT 사례개념화는 내담자의 무엇을 설명하나요?',
  '생물사회 이론으로 정서적 취약성과 비타당화 환경을 어떻게 읽어내나요?',
  '치료 목표 위계는 어떻게 정하나요? 생명 위협 행동, 치료 방해 행동, 삶의 질 방해 행동, 기술 습득 순서로 우선순위를 세웁니다.',
  '행동 체인 분석은 어떻게 하나요? 취약 요인부터 촉발 사건, 연결 고리, 문제 행동, 결과까지 문제를 유지시키는 패턴을 찾습니다.',
  '변증법적 딜레마는 개념화에 어떻게 반영하나요? 정서적 취약성과 자기 비타당화, 능동적 수동성과 겉보기 유능성이 대표적인 예입니다.',
  '개념화한 내용을 기술 훈련 계획과 개입 전략으로 어떻게 연결하나요? 마음챙김, 고통 감내, 정서 조절, 대인관계 효율성 기술이 여기에 해당합니다.',
];

const OUTCOMES = [
  {
    icon: Compass,
    step: '01',
    title: 'DBT 사례개념화의 틀',
    body: '김윤수 교수의 강의로 실제 사례에 바로 적용할 수 있는 DBT 사례개념화의 틀을 익힙니다.',
  },
  {
    icon: BrainCircuit,
    step: '02',
    title: '마음토스 신규 기능 활용법',
    body: '마음토스의 신규 기능을 직접 화면으로 확인하고, 상담 실무에서 어떻게 쓸 수 있는지 함께 살펴봅니다.',
  },
  {
    icon: FileText,
    step: '03',
    title: '마음토스로 해보는 DBT 사례개념화',
    body: '1부에서 배운 DBT 사례개념화를 마음토스에서 정리하는 과정을 시연으로 보여드립니다.',
  },
];

const SESSIONS = [
  {
    part: '1부',
    title: 'DBT로 사례개념화하기',
    host: '김윤수 교수',
    body: 'DBT 사례개념화의 핵심을 짚고, 실제 사례에 적용하는 방법을 강의합니다.',
  },
  {
    part: '2부',
    title: '마음토스 신규 기능 소개와 DBT 사례개념화 실습 시연',
    host: '마음토스 팀',
    body: '마음토스의 신규 기능을 소개하고, 1부에서 다룬 DBT 사례개념화를 마음토스에서 정리하는 과정을 시연합니다.',
  },
];

const INSTRUCTOR_CREDS = [
  '명지대학교 미래융합대학 겸임교수',
  '수도국제대학원대학교 상담심리학 박사',
  '한국상담학회 전문상담사 1급',
  '청소년상담사 1급 · 임상심리사 1급',
  '한국가족상담협회 가족상담전문가 1급',
  '은평가정폭력상담소 전문상담위원',
  '전 경희대학교 공공대학원 객원교수',
  '전 수원지방법원 안산지원 가사상담위원',
];

const RECOMMENDED_FOR = [
  'DBT를 배웠지만 사례개념화에 어려움을 느끼는 상담사',
  '자해, 자살 사고, 정서조절 곤란, 경계선 성향 내담자를 만나고 있는 상담사',
  '슈퍼비전에서 DBT 사례를 발표할 예정인 수련생',
  '기술 훈련 중심에서 개념화 중심으로 상담을 바꾸고 싶은 상담사',
  '마음토스 기능을 실무에 어떻게 쓰는지 궁금한 분',
];

const FAQS = [
  {
    q: 'DBT를 깊이 공부하지 않았어도 참여할 수 있나요?',
    a: '네. 기본 개념부터 차근차근 설명합니다.',
  },
  {
    q: '참여 링크는 어떻게 받나요?',
    a: 'Google Meet 참여 링크는 웨비나 전에 입력하신 이메일과 문자로 보내드립니다. 따로 설치할 프로그램은 없습니다.',
  },
  {
    q: '카메라와 마이크를 켜야 하나요?',
    a: '꺼 두셔도 괜찮습니다.',
  },
  {
    q: '실시간으로 참여하기 어려우면 어떻게 하나요?',
    a: '카카오톡 채널로 문의해 주세요.',
  },
  {
    q: '환불되나요?',
    a: '환불은 웨비나 시작 3일 전까지 가능합니다. 그 이후에는 환불이 어려운 점 양해 부탁드립니다. 취소·환불 요청은 카카오톡 채널로 남겨주세요.',
  },
];

interface WebinarDetailProps {
  offer: WebinarOffer;
}

export function WebinarDetail({ offer }: WebinarDetailProps) {
  const priceLabel = `${offer.price.toLocaleString('ko-KR')}원`;
  const regularPriceLabel = `${WEBINAR.price.toLocaleString('ko-KR')}원`;
  const isMember = offer.memberLabel !== null;
  const isClosed = WEBINAR.registrationClosed;
  const coffeeLabel = offer.price <= 10000 ? '커피 두 잔 값' : '저녁 한 끼 값';
  /* 회원 전용 오퍼는 "정가 → 할인가" 형태로 표기 */
  const priceDisplay = isMember ? (
    <>
      <s className="webinar-price-strike">{regularPriceLabel}</s> {priceLabel}
    </>
  ) : (
    priceLabel
  );
  const KEY_INFO = [
    {
      icon: CalendarDays,
      label: '일시',
      value: '12월 22일 (화) 19:00–20:30',
      note: `90분 (1부 강의 + 2부 기능 소개·시연) · 신청 마감 ${DEADLINE_LABEL}`,
    },
    {
      icon: MonitorPlay,
      label: '진행 방식',
      value: 'Google Meet 온라인 라이브',
      note: '참여 링크는 신청 이메일·문자로 발송',
    },
    {
      icon: Ticket,
      label: '참가비',
      value: priceDisplay,
      note: isClosed
        ? '신청 마감'
        : isMember
          ? `${offer.memberLabel} 할인가`
          : '마음토스 회원 10,000원 · 토스페이먼츠 간편 결제',
    },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '교육 프로그램', url: `${SITE_CONFIG.url}/education` },
    {
      name: WEBINAR.orderName,
      url: `${SITE_CONFIG.url}${offer.path}`,
    },
  ]);
  const eventSchema = generateEducationEventSchema({
    name: WEBINAR.orderName,
    description:
      '김윤수 교수의 DBT 사례개념화 강의와 마음토스 신규 기능 소개·DBT 사례개념화 실습 시연으로 구성된 온라인 웨비나입니다.',
    url: `${SITE_CONFIG.url}${offer.path}`,
    startDate: WEBINAR.startsAt,
    endDate: WEBINAR.endsAt,
    price: offer.price,
    imageUrl: `${SITE_CONFIG.url}/webinar-kim-yoonsoo-profile.webp`,
    soldOut: isClosed,
  });
  const faqSchema = generateFAQSchema(
    FAQS.map((f) => ({ question: f.q, answer: f.a })),
  );

  return (
    <>
      <SchemaMarkup schema={[breadcrumbSchema, eventSchema, faqSchema]} />

      {/* HERO */}
      <section
        className="page-hero webinar-hero"
        aria-label="DBT로 사례개념화하기 웨비나 — 페이지 헤더"
      >
        <div className="container">
          <div className="page-hero-content webinar-hero-content">
            <span className="section-pill">
              {isClosed
                ? '신청 마감 · '
                : isMember
                  ? `${offer.memberLabel} · `
                  : '마음토스 웨비나 · '}
              12월 22일 (화) 19:00
            </span>
            <h1 className="page-hero-h1">
              <span className="webinar-hero-accent">DBT</span>로<br />
              사례개념화하기
            </h1>
            <p className="page-hero-sub">
              김윤수 교수의 DBT 사례개념화 강의와 함께,
              2부에서는 마음토스 신규 기능과 DBT 사례개념화 실습을 시연합니다.
            </p>
            <div className="webinar-hero-cta">
              {isClosed ? (
                <span className="btn primary lg is-disabled" aria-disabled="true">
                  신청 마감
                </span>
              ) : (
                <a
                  className="btn primary lg"
                  href="#apply"
                  data-cta-intent="webinar_payment"
                  data-cta-location="webinar_hero"
                  data-cta-label="신청하기"
                >
                  신청하기
                  <ArrowRight className="arr" width={18} height={18} aria-hidden />
                </a>
              )}
              <a
                className="btn ghost lg"
                href="#program"
                data-cta-intent="webinar_payment"
                data-cta-location="webinar_hero"
                data-cta-label="프로그램 보기"
              >
                프로그램 보기
              </a>
            </div>
            <p className="webinar-hero-note">
              {isClosed ? (
                <>
                  신청이 마감되었습니다. 신청하신 분께는 Google Meet 참여 링크를
                  이메일·문자로 보내드렸어요.
                </>
              ) : (
                <>
                  Google Meet 온라인 라이브 · 참가비 {priceDisplay}
                  {isMember ? ' (회원 할인가)' : ' (마음토스 회원 10,000원)'} ·
                  신청 마감 {DEADLINE_LABEL} · 참여 링크는 신청 이메일·문자로 보내드려요.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* KEY INFO */}
      <section className="wf-section webinar-info-section" aria-label="웨비나 개요">
        <div className="container">
          <ul className="webinar-info-grid">
            {KEY_INFO.map((info) => {
              const Icon = info.icon;
              return (
                <li key={info.label} className="webinar-info-card">
                  <div className="webinar-info-icon" aria-hidden>
                    <Icon width={24} height={24} />
                  </div>
                  <span className="webinar-info-label">{info.label}</span>
                  <strong className="webinar-info-value">{info.value}</strong>
                  <p className="webinar-info-note">{info.note}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* PAIN */}
      <section className="wf-section alt webinar-pain" aria-label="DBT 사례개념화의 어려움">
        <div className="container">
          <header className="webinar-section-head webinar-section-head--center">
            <span className="t-tag">왜 DBT 사례개념화인가요</span>
            <h2 className="t-h2">
              기술은 배웠는데, <span className="webinar-accent">사례 앞에서 막히지 않나요?</span>
            </h2>
            <p className="t-sub">
              DBT 기술을 배운 선생님들도 실제 사례 앞에서 자주 부딪히는 고민입니다.
            </p>
          </header>
          <ul className="webinar-pain-grid webinar-pain-grid--2col">
            {PAIN_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="webinar-pain-card">
                  <div className="webinar-pain-icon" aria-hidden>
                    <Icon width={24} height={24} />
                  </div>
                  <h3 className="webinar-pain-title">{p.title}</h3>
                  <p className="webinar-pain-body">{p.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* KEY QUESTIONS */}
      <section className="wf-section webinar-questions" aria-label="다루는 질문">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">KEY QUESTIONS</span>
            <h2 className="t-h2">이런 질문을 함께 풀어봅니다</h2>
            <p className="t-sub">
              DBT 사례개념화를 실제 사례에 적용할 때 마주하는 질문에서 출발합니다.
            </p>
          </header>
          <ul className="webinar-question-list">
            {KEY_QUESTIONS.map((q) => (
              <li key={q}>
                <span className="webinar-question-mark" aria-hidden>Q.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="wf-section alt webinar-outcomes" aria-label="웨비나에서 얻어가는 것">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">WHAT YOU GET</span>
            <h2 className="t-h2">90분, 이 세 가지를 가져가세요</h2>
          </header>
          <ol className="webinar-outcome-list">
            {OUTCOMES.map((o) => {
              const Icon = o.icon;
              return (
                <li key={o.step} className="webinar-outcome-card">
                  <div className="webinar-outcome-top">
                    <div className="webinar-outcome-icon" aria-hidden>
                      <Icon width={24} height={24} />
                    </div>
                    <span className="webinar-outcome-step">{o.step}</span>
                  </div>
                  <h3 className="webinar-outcome-title">{o.title}</h3>
                  <p className="webinar-outcome-body">{o.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* PROGRAM */}
      <section id="program" className="wf-section webinar-program" aria-label="프로그램">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">PROGRAM</span>
            <h2 className="t-h2">90분, 이렇게 진행됩니다</h2>
          </header>

          <ul className="webinar-session-list">
            {SESSIONS.map((s) => (
              <li key={s.part} className="webinar-session-card">
                <span className="webinar-session-part">{s.part}</span>
                <h3 className="webinar-session-title">{s.title}</h3>
                <span className="webinar-session-host">{s.host}</span>
                <p className="webinar-session-body">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section className="wf-section alt webinar-instructor" aria-label="강사 소개">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">SPEAKER</span>
            <h2 className="t-h2">강단과 상담 현장을 잇는 김윤수 교수가 강의합니다</h2>
          </header>
          <div className="webinar-instructor-grid">
            <div className="webinar-instructor-media">
              <Image
                src="/webinar-kim-yoonsoo-profile.webp"
                alt="김윤수 교수 프로필 사진"
                width={800}
                height={870}
                className="webinar-instructor-photo"
              />
            </div>
            <div className="webinar-instructor-body">
              <h3 className="webinar-instructor-name">
                김윤수 교수 <span className="webinar-instructor-badge">상담심리학 박사</span>
              </h3>
              <p className="webinar-instructor-intro">
                대학과 대학원에서 상담을 가르치는 한편, 법원 가사상담위원과
                가정폭력상담소 전문상담위원으로 상담 현장에서 활동해 왔습니다.
                전문상담사·청소년상담사·임상심리사 1급 자격을 갖춘 전문가입니다.
              </p>
              <ul className="webinar-instructor-creds">
                {INSTRUCTOR_CREDS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="webinar-instructor-cohost">
            2부 세션은 상담사를 위한 AI 파트너를 만드는 <strong>마음토스 팀</strong>이
            직접 진행합니다.
          </p>
        </div>
      </section>

      {/* RECOMMENDED FOR */}
      <section className="wf-section webinar-target" aria-label="추천 대상">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">WHO</span>
            <h2 className="t-h2">이런 선생님을 기다립니다</h2>
          </header>
          <ul className="webinar-target-list">
            {RECOMMENDED_FOR.map((item) => (
              <li key={item}>
                <CheckCircle2 width={18} height={18} aria-hidden className="webinar-target-check" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STEPS — 마감 후에는 신청 안내가 무의미하므로 숨긴다 */}
      {!isClosed && (
        <section className="wf-section alt webinar-steps" aria-label="참여 방법">
          <div className="container">
            <header className="webinar-section-head">
              <span className="t-tag">HOW TO JOIN</span>
              <h2 className="t-h2">참여 방법은 간단합니다</h2>
            </header>
            <ol className="webinar-step-list">
              <li className="webinar-step-card">
                <span className="webinar-step-no">STEP 01</span>
                <h3 className="webinar-step-title">신청 · 결제</h3>
                <p className="webinar-step-body">
                  {DEADLINE_LABEL}까지 아래 신청 폼에 이름·이메일·연락처를
                  입력하고 토스페이먼츠로 결제하면 신청이 확정됩니다.
                </p>
              </li>
              <li className="webinar-step-card">
                <span className="webinar-step-no">STEP 02</span>
                <h3 className="webinar-step-title">참여 링크 수신</h3>
                <p className="webinar-step-body">
                  웨비나 전, 입력하신 이메일과 문자로 Google Meet
                  참여 링크를 보내드립니다.
                </p>
              </li>
              <li className="webinar-step-card">
                <span className="webinar-step-no">STEP 03</span>
                <h3 className="webinar-step-title">12월 22일 저녁 7시, 접속</h3>
                <p className="webinar-step-body">
                  별도 설치 없이 링크만 누르면 참여 완료.
                  카메라를 켜지 않아도 괜찮습니다.
                </p>
              </li>
            </ol>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="wf-section webinar-faq-section" aria-label="자주 묻는 질문">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">FAQ</span>
            <h2 className="t-h2">자주 묻는 질문</h2>
          </header>
          <WebinarFaq items={FAQS} />
        </div>
      </section>

      {/* APPLY — 마감 시 폼 대신 안내 블록 */}
      <section id="apply" className="webinar-apply" aria-label="웨비나 신청">
        <div className="container">
          {isClosed ? (
            <div className="webinar-apply-head webinar-closed">
              <span className="webinar-apply-pill">{WEBINAR.dateLabel}</span>
              <h2 className="webinar-apply-h2">
                웨비나 신청이<br />
                마감되었습니다.
              </h2>
              <p className="webinar-apply-sub">
                관심 가져주셔서 감사합니다. 신청하신 분께는 입력하신 이메일과 문자로
                Google Meet 참여 링크를 보내드렸어요. 링크를 받지 못하셨거나
                결제·환불 관련 문의는 카카오톡 채널로 남겨주세요.
              </p>
              <div className="webinar-closed-actions">
                <a
                  href={KAKAO_INQUIRY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn primary lg"
                  data-cta-intent="general_inquiry"
                  data-cta-location="webinar_closed"
                  data-cta-label="카카오톡 채널 문의"
                >
                  카카오톡 채널 문의
                  <ArrowRight className="arr" width={18} height={18} aria-hidden />
                </a>
                <Link href="/education" className="btn ghost lg webinar-closed-ghost">
                  다른 교육 프로그램 보기
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="webinar-apply-head">
                <span className="webinar-apply-pill">{WEBINAR.dateLabel}</span>
                <h2 className="webinar-apply-h2">
                  {coffeeLabel}으로,<br />
                  DBT 사례개념화를 정리하세요.
                </h2>
                <p className="webinar-apply-sub">
                  김윤수 교수의 라이브 강의와 마음토스 시연이
                  참가비{' '}
                  {isMember ? (
                    <>
                      정가 <s className="webinar-price-strike webinar-price-strike--dark">{regularPriceLabel}</s>{' '}
                      → {offer.memberLabel} 할인가 <strong>{priceLabel}</strong>
                    </>
                  ) : (
                    priceLabel
                  )}
                  . 신청 정보를 입력하고
                  결제하시면 신청이 완료됩니다.
                </p>
              </div>
              <WebinarApplyForm offer={offer} />
            </>
          )}
        </div>
      </section>

      {/* BACK LINK */}
      <section className="wf-section webinar-back" aria-label="교육 프로그램으로">
        <div className="container">
          <p className="webinar-back-row">
            <Link href="/education" className="webinar-back-link webinar-back-link--dark">
              ← 마음토스 교육 프로그램 전체 보기
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
