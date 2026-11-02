import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  MonitorPlay,
  Ticket,
  CheckCircle2,
  Brain,
  GitBranch,
  Target,
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
  CBT_CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR,
  type WebinarOffer,
} from '@/constants/webinar';
import { WebinarApplyForm } from '../_shared/WebinarApplyForm';
import { WebinarFaq } from '../_shared/WebinarFaq';
import '../_shared/webinar.css';

const PAIN_POINTS = [
  {
    icon: Brain,
    title: '자동적 사고는 찾았는데, 그다음이 막힙니다',
    body: '회기에서 내담자의 생각은 어렵지 않게 포착했습니다. 그런데 그 생각들이 어떤 믿음에서 나오는지, 하나의 그림으로 묶으려 하면 손이 멈춥니다.',
  },
  {
    icon: GitBranch,
    title: '기법은 아는데, 왜 이 기법인지 설명하기 어렵습니다',
    body: '사고 기록지도, 행동 실험도 배웠습니다. 하지만 이 내담자에게 왜 지금 이 개입인지 묻는 질문 앞에서는 답이 흐려집니다.',
  },
  {
    icon: Target,
    title: '회기는 쌓이는데, 개념화는 처음 그대로입니다',
    body: '초기에 정리한 개념화가 보고서 안에만 머물러 있습니다. 새로 알게 된 내용을 어떻게 반영하고 상담 계획과 이어야 할지 고민이 남습니다.',
  },
];

/* 1부 확정 목차가 나오면 실제 다루는 범위에 맞춰 조정 */
const KEY_QUESTIONS = [
  'CBT 관점의 사례개념화는 무엇을 설명하는 작업인가?',
  '내담자의 호소 문제를 인지·정서·행동으로 어떻게 나눠 볼 것인가?',
  '자동적 사고에서 핵심 신념까지 어떻게 가설을 세우는가?',
  '문제를 유지시키는 패턴은 어디에서 찾는가?',
  '세운 개념화를 상담 목표와 개입 계획으로 어떻게 잇는가?',
];

const OUTCOMES = [
  {
    icon: Compass,
    step: '01',
    title: 'CBT 사례개념화의 틀',
    body: '김윤수 교수의 강의로 내담자의 문제를 CBT 관점에서 이해하고 정리하는 사례개념화의 틀을 익힙니다.',
  },
  {
    icon: BrainCircuit,
    step: '02',
    title: '새로워진 마음토스의 주요 기능',
    body: '새로워진 마음토스의 신규 기능을 직접 화면으로 확인합니다. 상담 실무에서 어떻게 쓸 수 있는지 함께 살펴봅니다.',
  },
  {
    icon: FileText,
    step: '03',
    title: '마음토스로 해보는 CBT 사례개념화',
    body: '1부에서 배운 CBT 사례개념화를 마음토스에서 어떻게 활용하는지, 실제 사용 과정을 시연으로 보여드립니다.',
  },
];

const SESSIONS = [
  {
    part: '1부',
    title: 'CBT로 사례개념화하기',
    host: '김윤수 교수',
    body: 'CBT의 관점으로 내담자의 문제를 이해하고 사례개념화하는 방법을 강의합니다.',
  },
  {
    part: '2부',
    title: '새로워진 마음토스, 신규 기능 소개와 CBT 사례개념화 시연',
    host: '마음토스 팀',
    body: '새로워진 마음토스의 주요 기능을 소개하고, 실제 CBT 사례개념화에 활용하는 방법을 시연합니다.',
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
  'CBT를 배웠지만 실제 사례를 개념화하는 데 어려움을 느끼는 상담사',
  '슈퍼비전·사례발표를 앞두고 CBT 사례개념화를 정리하고 싶은 수련생',
  '기법 중심의 개입에서 개념화 중심의 개입으로 넘어가고 싶은 분',
  '새로워진 마음토스의 기능을 실무에 어떻게 쓸 수 있는지 궁금한 분',
];

const FAQS = [
  {
    q: 'CBT를 깊이 공부하지 않았어도 참여할 수 있나요?',
    a: '네, 가능합니다. 수련 중인 대학원생부터 CBT 사례개념화를 다시 정비하고 싶은 경력 상담사까지 누구나 환영합니다.',
  },
  {
    q: '참여 방법은 어떻게 되나요?',
    a: '신청 정보를 입력하고 결제를 완료하시면 신청이 확정됩니다. Google Meet 참여 링크는 웨비나 전에 입력하신 이메일과 문자로 보내드립니다. 별도 프로그램 설치 없이 링크만 누르면 참여할 수 있어요.',
  },
  {
    q: '카메라나 마이크를 켜야 하나요?',
    a: '아니요. 카메라와 마이크를 끄고 편하게 시청하셔도 됩니다.',
  },
  {
    q: '실시간 참여가 어려우면 어떻게 하나요?',
    a: '본 웨비나는 라이브 진행을 기본으로 합니다. 부득이하게 참여가 어려워진 경우, 카카오톡 채널로 문의해 주시면 안내를 도와드릴게요.',
  },
  {
    q: '결제 취소·환불은 어떻게 하나요?',
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
      value: '11월 17일 (화) 19:00–20:30',
      note: '90분 (1부 강의 + 2부 기능 소개·시연)',
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
      '김윤수 교수의 CBT 사례개념화 강의와 새로워진 마음토스의 신규 기능 소개·사례개념화 시연으로 구성된 온라인 웨비나입니다.',
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
        aria-label="CBT로 사례개념화하기 웨비나 — 페이지 헤더"
      >
        <div className="container">
          <div className="page-hero-content webinar-hero-content">
            <span className="section-pill">
              {isClosed
                ? '신청 마감 · '
                : isMember
                  ? `${offer.memberLabel} · `
                  : '마음토스 웨비나 · '}
              11월 17일 (화) 19:00
            </span>
            <h1 className="page-hero-h1">
              <span className="webinar-hero-accent">CBT</span>로<br />
              사례개념화하기
            </h1>
            <p className="page-hero-sub">
              김윤수 교수의 CBT 사례개념화 강의와 함께,
              2부에서는 새로워진 마음토스의 주요 기능과
              실제 사례개념화 활용 방법을 시연합니다.
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
                  참여 링크는 신청 이메일·문자로 보내드려요.
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
      <section className="wf-section alt webinar-pain" aria-label="CBT 사례개념화의 어려움">
        <div className="container">
          <header className="webinar-section-head webinar-section-head--center">
            <span className="t-tag">CBT 사례개념화, 왜 어려울까요</span>
            <h2 className="t-h2">
              기법은 익숙한데, <span className="webinar-accent">사례의 그림이 그려지지 않나요?</span>
            </h2>
            <p className="t-sub">
              CBT를 공부한 선생님들도 실제 사례 앞에서 자주 부딪히는 지점입니다.
            </p>
          </header>
          <ul className="webinar-pain-grid">
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
              CBT 사례개념화를 실제 사례에 적용할 때 마주하는 질문에서 출발합니다.
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
                  아래 신청 폼에 이름·이메일·연락처를 입력하고
                  토스페이먼츠로 결제하면 신청이 확정됩니다.
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
                <h3 className="webinar-step-title">11월 17일 저녁 7시, 접속</h3>
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
                  CBT 사례개념화를 정리하세요.
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
