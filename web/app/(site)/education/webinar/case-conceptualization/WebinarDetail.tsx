import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  MonitorPlay,
  Ticket,
  CheckCircle2,
  BookOpen,
  MessageCircleQuestion,
  Waves,
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
import {
  CASE_CONCEPTUALIZATION_WEBINAR as WEBINAR,
  type WebinarOffer,
} from '@/constants/webinar';
import { WebinarApplyForm } from './WebinarApplyForm';
import { WebinarFaq } from './WebinarFaq';
import './webinar.css';

const PAIN_POINTS = [
  {
    icon: BookOpen,
    title: '이론은 배웠는데, 내 사례 앞에선 백지가 됩니다',
    body: '정신역동, 인지행동, 가족체계… 대학원에서 배운 이론은 많은데, 정작 내담자를 마주하면 어떤 틀부터 꺼내야 할지 막막합니다. 이론과 실전 사이의 간극은 혼자 메우기 어렵습니다.',
  },
  {
    icon: MessageCircleQuestion,
    title: '칸은 다 채웠는데, 맞게 쓴 건지 확신이 없습니다',
    body: '보고서 양식은 어떻게든 채웠습니다. 그런데 "이건 사례 요약이지, 개념화가 아니에요"라는 피드백이 돌아옵니다. 요약과 개념화의 차이를 아무도 짚어주지 않았으니까요.',
  },
  {
    icon: Waves,
    title: '정보는 쏟아지는데, 핵심 가설이 보이지 않습니다',
    body: '접수면접에서 얻은 수많은 정보들. 호소 문제, 가족력, 발달력… 어디까지가 배경이고 무엇이 핵심인지, 정보를 가설로 엮어내는 일이 가장 어렵습니다.',
  },
];

/* 1부 확정 목차가 나오면 실제 다루는 범위에 맞춰 조정 */
const KEY_QUESTIONS = [
  '사례 요약과 사례개념화, 정확히 무엇이 다른가?',
  '호소 문제와 핵심 문제는 어떻게 구분하는가?',
  '촉발 요인과 유지 요인은 어디에서 찾는가?',
  '여러 이론 중 내 사례에 맞는 틀은 어떻게 고르는가?',
  '세운 가설을 상담 목표와 개입 전략으로 어떻게 잇는가?',
  '수퍼비전 보고서의 개념화 칸, 어떤 흐름으로 채우는가?',
];

const BEFORE_AFTER = [
  {
    before: '정보를 시간 순서대로 나열한 사례 요약',
    after: '핵심 가설을 중심으로 정리된 사례개념화',
  },
  {
    before: '감에 의존해 회기를 이어가는 상담',
    after: '지도를 갖고 방향을 아는 상담',
  },
  {
    before: '피드백이 두려운 슈퍼비전',
    after: '내 가설을 놓고 논의하는 슈퍼비전',
  },
];

const OUTCOMES = [
  {
    icon: Compass,
    step: '01',
    title: '정보를 가설로 바꾸는 사고 틀',
    body: '호소 문제 → 촉발·유지 요인 → 핵심 가설 → 상담 목표. 쏟아지는 내담자 정보를 하나의 임상적 이야기로 엮어내는 사례개념화의 뼈대를 익힙니다.',
  },
  {
    icon: FileText,
    step: '02',
    title: '실제 사례로 보는 개념화의 실제',
    body: '교과서의 정형화된 사례가 아닙니다. 각색된 실제 임상 사례를 바탕으로, 양학회 1급 수퍼바이저가 정보에서 가설을 세워가는 과정을 그대로 시연합니다.',
  },
  {
    icon: BrainCircuit,
    step: '03',
    title: 'AI 시대의 사례개념화 실무',
    body: '상담 기록에서 마음토스 AI로 개념화 초안을 이끌어내고, 그 초안을 슈퍼비전의 깊은 논의로 연결하는 실무 워크플로를 실시간으로 보여드립니다.',
  },
];

/* 1부 세부 목차는 확정 시 교체 (기획 문서 TBD 항목) */
const SESSIONS = [
  {
    part: '1부 · 19:05–19:55',
    title: '초심 상담사를 위한 사례개념화',
    host: '이헌주 교수',
    body: '이론을 실전으로 연결하는 사례개념화의 사고 틀을 다룹니다. 접수면접 정보에서 핵심 가설을 세우고 상담 목표로 이어가는 과정을 실제 사례로 풀어내고, 초심 상담사가 자주 빠지는 함정도 함께 짚습니다. 강연 후 5분 질의응답이 이어집니다.',
  },
  {
    part: '2부 · 20:00–20:25',
    title: 'AI와 함께하는 사례개념화 실무',
    host: '마음토스 팀',
    body: '1부에서 배운 사고 틀을 실무에 붙이는 시간입니다. 마음토스 AI로 상담 기록에서 개념화 초안을 만들고, 슈퍼비전 준비로 연결하는 과정을 라이브로 시연합니다. 세션 후 5분 질의응답으로 마무리합니다.',
  },
];

const INSTRUCTOR_CREDS = [
  '연세대학교 미래융합연구원 연구교수',
  '한국상담학회 다문화상담위원회 위원장',
  '한국상담학회 전문상담사 수련감독(부부 및 가족상담학회)',
  '한국상담심리학회 상담심리사 1급(주수퍼바이저)',
  '저서 『관계의 그릇』(2026) 등 다수',
];

const RECOMMENDED_FOR = [
  '상담은 진행 중인데, 사례를 어떤 틀로 정리해야 할지 막막한 초심 상담사',
  '슈퍼비전·공개사례발표를 앞두고 사례개념화 보고서를 처음 써보는 수련생',
  '이론(정신역동·인지행동 등)은 배웠지만 실제 사례에 적용하기 어려운 분',
  '접수면접 정보에서 핵심 가설을 뽑아내는 연습이 필요한 분',
  'AI를 상담 실무에 어떻게 접목할지 궁금한 경력 상담사',
];

const FAQS = [
  {
    q: '초심 상담사가 아니어도 참여할 수 있나요?',
    a: '네, 가능합니다. 수련 중인 대학원생부터 사례개념화를 다시 정비하고 싶은 경력 상담사까지, 사례개념화가 고민인 분이라면 누구나 환영합니다.',
  },
  {
    q: '참여 방법은 어떻게 되나요?',
    a: '신청 정보를 입력하고 결제를 완료하시면 신청이 확정됩니다. 구글 밋 참여 링크는 웨비나 전에 입력하신 이메일과 문자로 보내드립니다. 별도 프로그램 설치 없이 링크만 누르면 참여할 수 있어요.',
  },
  {
    q: '카메라나 마이크를 켜야 하나요?',
    a: '아니요. 카메라와 마이크를 끄고 편하게 시청하셔도 됩니다. 질문은 채팅으로 남기시면 각 부 Q&A 시간에 답변드립니다.',
  },
  {
    q: '실시간 참여가 어려우면 어떻게 하나요?',
    a: '본 웨비나는 라이브 진행을 기본으로 합니다. 부득이하게 참여가 어려워진 경우, 카카오톡 채널로 문의해 주시면 안내를 도와드릴게요.',
  },
  {
    q: '결제 취소·환불은 어떻게 하나요?',
    a: '웨비나 시작 전까지 카카오톡 채널로 문의해 주시면 취소·환불을 도와드립니다.',
  },
];

interface WebinarDetailProps {
  offer: WebinarOffer;
}

export function WebinarDetail({ offer }: WebinarDetailProps) {
  const priceLabel = `${offer.price.toLocaleString('ko-KR')}원`;
  const regularPriceLabel = `${WEBINAR.price.toLocaleString('ko-KR')}원`;
  const isMember = offer.memberLabel !== null;
  const coffeeLabel = offer.price <= 5000 ? '커피 한 잔 값' : '커피 두 잔 값';
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
      value: '10월 6일 (화) 19:00–20:30',
      note: '90분 (1부 강연 + 2부 실무 세션)',
    },
    {
      icon: MonitorPlay,
      label: '진행 방식',
      value: '구글 밋 온라인 라이브',
      note: '참여 링크는 신청 이메일·문자로 발송',
    },
    {
      icon: Ticket,
      label: '참가비',
      value: priceDisplay,
      note: isMember ? `${offer.memberLabel} 할인가` : '토스페이먼츠 간편 결제',
    },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '교육 프로그램', url: `${SITE_CONFIG.url}/education` },
    {
      name: '초심 상담사를 위한 사례개념화 웨비나',
      url: `${SITE_CONFIG.url}${offer.path}`,
    },
  ]);
  const eventSchema = generateEducationEventSchema({
    name: WEBINAR.orderName,
    description:
      '이헌주 교수(양학회 1급)의 사례개념화 강연과 마음토스 AI 실무 세션으로 구성된 초심 상담사 대상 온라인 웨비나입니다.',
    url: `${SITE_CONFIG.url}${offer.path}`,
    startDate: WEBINAR.startsAt,
    endDate: WEBINAR.endsAt,
    price: offer.price,
    imageUrl: `${SITE_CONFIG.url}/webinar-lee-heonju-lecture.webp`,
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
        aria-label="초심 상담사를 위한 사례개념화 웨비나 — 페이지 헤더"
      >
        <div className="container">
          <div className="page-hero-content webinar-hero-content">
            <span className="section-pill">
              {isMember ? `${offer.memberLabel} · ` : '마음토스 웨비나 · '}10월 6일 (화) 19:00
            </span>
            <h1 className="page-hero-h1">
              초심 상담사를 위한<br />
              <span className="webinar-hero-accent">사례개념화</span>
            </h1>
            <p className="page-hero-sub">
              이론과 실전 사이, 그 막막한 간극을 90분에 메웁니다.
              양학회 1급 수퍼바이저 이헌주 교수의 실제 사례 기반 강연과
              마음토스 AI 실무 세션으로, 사례개념화의 실전 감각을 잡아드립니다.
            </p>
            <div className="webinar-hero-cta">
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
              구글 밋 온라인 라이브 · 참가비 {priceDisplay}
              {isMember ? ' (회원 할인가)' : ''} ·
              참여 링크는 신청 이메일·문자로 보내드려요.
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
      <section className="wf-section alt webinar-pain" aria-label="사례개념화의 어려움">
        <div className="container">
          <header className="webinar-section-head webinar-section-head--center">
            <span className="t-tag">사례개념화, 왜 어려울까요</span>
            <h2 className="t-h2">
              오늘도 사례개념화 칸 앞에서 <span className="webinar-accent">커서가 멈추셨나요?</span>
            </h2>
            <p className="t-sub">
              상담을 시작한 선생님들이 가장 먼저, 그리고 가장 오래 부딪히는 벽입니다.
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

      {/* QUOTE BAND */}
      <section className="webinar-quote-band" aria-label="사례개념화의 의미">
        <div className="container">
          <p className="webinar-quote-band-text">
            사례개념화는 상담의 <span className="webinar-quote-band-strong">지도</span>입니다.
          </p>
          <p className="webinar-quote-band-sub">
            지도 없이 떠나는 상담은 회기가 쌓여도 제자리를 맴돕니다.
            내담자의 흩어진 정보가 하나의 임상적 이야기로 연결되는 순간,
            비로소 상담의 방향이 보이기 시작합니다.
          </p>
        </div>
      </section>

      {/* KEY QUESTIONS */}
      <section className="wf-section webinar-questions" aria-label="다루는 질문">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">KEY QUESTIONS</span>
            <h2 className="t-h2">90분 후, 이 질문들에 스스로 답하게 됩니다</h2>
            <p className="t-sub">
              막연한 개론이 아니라, 초심 상담사가 실제로 부딪히는 질문에서 출발합니다.
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
            <p className="t-sub">
              보고서 칸을 채우는 요령이 아니라, 사례를 임상적으로 사고하는 법을 다룹니다.
            </p>
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

      {/* BEFORE / AFTER */}
      <section className="wf-section webinar-shift" aria-label="웨비나 전후 변화">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">BEFORE → AFTER</span>
            <h2 className="t-h2">웨비나 전과 후, 상담이 이렇게 달라집니다</h2>
          </header>
          <ul className="webinar-shift-list">
            {BEFORE_AFTER.map((row) => (
              <li key={row.after} className="webinar-shift-row">
                <span className="webinar-shift-before">{row.before}</span>
                <ArrowRight className="webinar-shift-arrow" width={18} height={18} aria-hidden />
                <span className="webinar-shift-after">{row.after}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROGRAM */}
      <section id="program" className="wf-section alt webinar-program" aria-label="프로그램">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">PROGRAM</span>
            <h2 className="t-h2">90분, 이렇게 진행됩니다</h2>
            <p className="t-sub">
              듣기만 하는 강의가 아닙니다. 각 부가 끝날 때마다 라이브 Q&A로
              선생님의 실제 고민에 답합니다.
            </p>
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

          <div className="webinar-timeline-wrap">
            <table className="webinar-timeline-table">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>구분</th>
                  <th>내용</th>
                  <th>진행</th>
                </tr>
              </thead>
              <tbody>
                {WEBINAR.timeline.map((row) => (
                  <tr key={row.time}>
                    <td>{row.time}</td>
                    <td>{row.part}</td>
                    <td>{row.content}</td>
                    <td>{row.host}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section className="wf-section webinar-instructor" aria-label="강사 소개">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">SPEAKER</span>
            <h2 className="t-h2">양학회 1급 수퍼바이저가 직접 강연합니다</h2>
          </header>
          <div className="webinar-instructor-grid">
            <div className="webinar-instructor-media">
              <Image
                src="/webinar-lee-heonju-profile.webp"
                alt="이헌주 교수 프로필 사진"
                width={627}
                height={682}
                className="webinar-instructor-photo"
              />
            </div>
            <div className="webinar-instructor-body">
              <h3 className="webinar-instructor-name">
                이헌주 교수 <span className="webinar-instructor-badge">양학회 1급</span>
              </h3>
              <p className="webinar-instructor-intro">
                수많은 수련생의 사례를 지도해 온 현장의 수퍼바이저이자,
                『관계의 그릇』의 저자입니다. 초심 상담사가 사례개념화에서
                어디서 막히고 무엇을 놓치는지, 슈퍼비전 현장에서 가장 가까이
                지켜본 사람의 언어로 강연합니다.
              </p>
              <ul className="webinar-instructor-creds">
                {INSTRUCTOR_CREDS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="webinar-instructor-lecture">
            <Image
              src="/webinar-lee-heonju-lecture.webp"
              alt="이헌주 교수 강연 현장"
              width={1400}
              height={933}
              className="webinar-instructor-lecture-photo"
            />
            <p className="webinar-instructor-caption">이헌주 교수 강연 현장</p>
          </div>
          <p className="webinar-instructor-cohost">
            2부 실무 세션은 상담사를 위한 AI 파트너를 만드는 <strong>마음토스 팀</strong>이
            직접 진행합니다.
          </p>
        </div>
      </section>

      {/* RECOMMENDED FOR */}
      <section className="wf-section alt webinar-target" aria-label="추천 대상">
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

      {/* STEPS */}
      <section className="wf-section webinar-steps" aria-label="참여 방법">
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
                웨비나 전, 입력하신 이메일과 문자로 구글 밋
                참여 링크를 보내드립니다.
              </p>
            </li>
            <li className="webinar-step-card">
              <span className="webinar-step-no">STEP 03</span>
              <h3 className="webinar-step-title">10월 6일 저녁 7시, 접속</h3>
              <p className="webinar-step-body">
                별도 설치 없이 링크만 누르면 참여 완료.
                카메라를 켜지 않아도 괜찮습니다.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="wf-section alt webinar-faq-section" aria-label="자주 묻는 질문">
        <div className="container">
          <header className="webinar-section-head">
            <span className="t-tag">FAQ</span>
            <h2 className="t-h2">자주 묻는 질문</h2>
          </header>
          <WebinarFaq items={FAQS} />
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="webinar-apply" aria-label="웨비나 신청">
        <div className="container">
          <div className="webinar-apply-head">
            <span className="webinar-apply-pill">{WEBINAR.dateLabel}</span>
            <h2 className="webinar-apply-h2">
              {coffeeLabel}으로,<br />
              사례개념화의 막막함을 끝내세요.
            </h2>
            <p className="webinar-apply-sub">
              양학회 1급 수퍼바이저의 라이브 강연과 AI 실무 세션이
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
            <ul className="webinar-apply-points">
              <li>라이브 Q&A로 내 사례 고민을 직접 질문</li>
              <li>구글 밋 — 전국 어디서든 링크 하나로 참여</li>
              <li>참여 링크는 이메일·문자로 자동 발송</li>
            </ul>
          </div>
          <WebinarApplyForm offer={offer} />
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
