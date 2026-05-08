import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Wallet,
  Shield,
  Zap,
  HeartHandshake,
  GraduationCap,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  FileText,
  Mic,
  BrainCircuit,
} from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo/metadata';
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateFAQSchema,
} from '@/lib/seo/schema';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { SITE_CONFIG } from '@/constants/site';
import { KAKAO_INQUIRY_URL } from '@/constants/nav';
import { AcademyFaq } from './AcademyFaq';
import { AcademyInquiryForm } from './AcademyInquiryForm';
import './academy.css';

export const metadata = generatePageMetadata({
  title: '마음토스 아카데미 — 전문상담사 2급 올인원 패스',
  description:
    '전문상담사 2급 자격 요건을 12개월 안에 완성합니다. 내담자 100% 매칭, 1:1 슈퍼바이저, 필기·면접 합격 보장, AI 협업 상담 교육까지. 합격까지 함께 뛰는 페이스메이커 팀.',
  path: '/academy',
});

const PAIN_POINTS = [
  '내담자 6사례 60시간 어떻게 채우지?',
  '필기 + 면접 시험은 또 따로 준비해야 하고…',
  '수퍼비전, 집단상담, 공개사례발표 일정은 누가 맞춰주지?',
];

const TARGET_CONCERNS = [
  {
    icon: Wallet,
    eyebrow: '예산 부담',
    title: '예산은 빠듯한데, 자격증은 따고 싶어…',
    body: '수천만 원이 드는 대학원 등록금에 수련비까지 더해져 부담스러우셨나요? 거품을 뺀 합리적인 비용으로, 경제적 부담 없이 오직 수련에만 집중하게 해드립니다.',
    keypoint: '합리적인 비용',
  },
  {
    icon: Shield,
    eyebrow: '행정 실수 우려',
    title: '계산 착오로 자격 심사에서 떨어지면 어쩌지…',
    body: '매년 바뀌는 학회 규정, 복잡한 이수 시간 계산… 혼자 끙끙 앓지 마세요. 1:1 전담 매니저가 수련 요건을 더블 체크해 행정상의 실수로 인한 불합격을 원천 차단합니다.',
    keypoint: '완벽한 행정 케어',
  },
  {
    icon: Zap,
    eyebrow: '시간 낭비',
    title: '축어록 쓸 시간에 공부를 더 하고 싶은데…',
    body: '단순 반복 노동은 AI에게 맡기세요. 마음토스 AI로 축어록 작성 시간을 90% 단축하고, 데이터 기반 상담 분석을 경험하세요. 남들보다 앞서가는 스마트한 상담사가 될 기회입니다.',
    keypoint: '스마트한 성장 (AI)',
  },
  {
    icon: Users,
    eyebrow: '내담자 부족',
    title: '내담자 구할 곳이 없어서 걱정돼요',
    body: '지인 영업, 커뮤니티 홍보로 시간 낭비하지 마세요. 상담자 경험 6사례(60시간) 요건 충족을 위한 내담자를 100% 매칭해 드립니다.',
    keypoint: '100% 내담자 매칭',
  },
];

const SOLUTION_REASONS = [
  {
    eyebrow: '01 · 내담자 섭외 NO',
    title: '찾아다니는 수고는 이제 그만. 100% 매칭 보장',
    body: '연구소 대기 내담자를 안전하게 연결해 드립니다. 당근마켓, 에브리타임 전전하며 홍보할 필요 없습니다. 실제 내담자를 100% 만나보세요.',
  },
  {
    eyebrow: '02 · 슈퍼바이저 원스톱 배정',
    title: '한국상담학회 수련감독자 + 1급 전문가 전담 배정',
    body: '한국상담학회 수련감독자 및 1급 전문가 팀이 전담 배정됩니다. 전화 돌리며 섭외할 필요 없이, 수련에 집중해보세요.',
  },
  {
    eyebrow: '03 · 시험 합격 케어',
    title: '필기 · 면접 · 합격 보장까지 전 과정 책임',
    body: '10년 치 기출 분석 기반 핵심 압축 강의, 3인 그룹 모의면접, 그리고 합격하는 그날까지 무한 멘토링·재수강 지원합니다.',
  },
];

const EXAM_CARE = [
  {
    icon: ClipboardCheck,
    label: '[필기]',
    title: '커트라인만 넘기는 핵심 압축 치트키',
    body: '방대한 이론서를 언제 다 보시겠습니까? 10년 치 기출 데이터를 분석하여 전문가가 시험에 나올 것만 족집게로 뽑아드립니다. 최소한의 공부량으로 합격선을 여유 있게 넘기세요.',
  },
  {
    icon: Users,
    label: '[면접]',
    title: '면접 완벽 대비 3인 그룹 모의면접',
    body: '면접관이 고개를 끄덕이는 포인트는 정해져 있습니다. 가장 까다로운 사례 개념화 질문 공략법부터 꼬리 물기 압박 질문 대처까지, 실전 모의면접(Role-Play)으로 입이 기억하게 만들어 드립니다.',
  },
  {
    icon: Shield,
    label: '[보장]',
    title: '자격증 손에 쥘 때까지 무한 책임제',
    body: '한 번의 실패가 포기로 이어지지 않도록 끝까지 책임집니다. 만약 불합격하더라도, 최종 합격하는 그날까지 수련을 제외한 나머지 과정은 추가 비용 없이 멘토링과 재수강을 지원합니다.',
  },
];

const MENTORING = [
  {
    icon: MessageCircle,
    title: '수련생 전용 핫라인 단톡방',
    body: '상담 진행 중 갑자기 막힐 때, 위기 내담자가 발생했을 때, 행정 절차가 헷갈릴 때. 언제든 물어보세요.',
  },
  {
    icon: HeartHandshake,
    title: '전담 슈퍼바이저의 1:1 상시 피드백',
    body: '공식 슈퍼비전 시간이 아니더라도 간단한 코멘트와 지지를 제공합니다. "혼자 상담하고 있다"는 외로움을 "든든한 전문가가 뒤에 있다"는 안정감으로 바꿔드립니다.',
  },
];

const ROADMAP = [
  {
    step: 'STEP 01',
    season: '입문',
    title: '기초 세팅',
    items: [
      '신입 수련생 OT & 마음토스 활용법 교육',
      '접수면접 워크샵 및 실전',
      '내담자 경험(10hrs) 시작',
      '집단상담 1차(15hrs) 집단원 경험 실시',
      '자격검정 1단계 [수련자격심사] 서류제출 1:1 가이드',
    ],
  },
  {
    step: 'STEP 02',
    season: '실전 1',
    title: '본격 실습 & 필기 합격',
    items: [
      '상담사례 내담자 배정 및 상담 시작',
      '개인상담 슈퍼비전(본인/참관) 시작',
      '집단상담 2차(15hrs) 집단원 경험 실시',
      '공개사례발표 참관 및 분석보고서 지도',
      '자격검정 2단계 [필기시험] 대비 족집게 특강 (7월)',
    ],
  },
  {
    step: 'STEP 03',
    season: '실전 2',
    title: '심화 역량 & 요건 충족',
    items: [
      '심화 상담 실습',
      '심리검사 슈퍼비전',
      '집단상담 3차(15hrs) 집단원 경험 실시',
      '공개사례발표 참관 및 분석보고서 지도',
      '자격검정 3단계 [수련요건심사] 최종 컨설팅',
    ],
  },
  {
    step: 'STEP 04',
    season: '완성',
    title: '최종 완성 & 면접 패스',
    items: [
      '자격검정 4단계 [면접] 심사 실전 모의 수련',
      '"상담자로서의 자기" 수련 점검 및 성찰',
      '최종 합격',
    ],
  },
];

const SUPERVISORS = [
  {
    name: '이인수',
    role: '대표 수퍼바이저',
    creds: [
      '심리상담연구소 앤아더라이프 대표 교수',
      '(전) 상명대 복지상담대학원 교수',
      '한국상담학회 전문영역 수련감독자',
      '한국상담학회 1급 전문상담사',
      '한국가족치료학회 슈퍼바이저',
    ],
  },
  {
    name: '이현숙',
    role: '수퍼바이저',
    creds: [
      '치유상담대학원대학교 명예교수',
      '치유상담대학원대학교 임상실습교수',
      '한국상담학회 전문영역 수련감독자',
      '한국상담학회 1급 전문상담사',
    ],
  },
  {
    name: '박찬희',
    role: '수퍼바이저',
    creds: [
      '한국상담학회 1급 전문상담사',
      '한국상담심리학회 상담심리사 1급',
      '청소년상담사 1급',
      '임상심리사 1급',
    ],
  },
  {
    name: '노미화',
    role: '수퍼바이저',
    creds: [
      '한국상담학회 1급 전문상담사',
      '한국가족치료학회 1급 부부가족상담사',
      '청소년상담사 1급',
    ],
  },
];

const PRICING_TABLE = [
  { item: '내담자 경험', volume: '10시간', unit: '12만원', subtotal: '120만원' },
  { item: '개인상담 수퍼비전', volume: '7시간', unit: '12만원', subtotal: '84만원' },
  { item: '개인상담 참관 수퍼비전', volume: '9시간', unit: '3만원', subtotal: '27만원' },
  { item: '심리검사 수퍼비전', volume: '4시간', unit: '12만원', subtotal: '48만원' },
  { item: '접수면접', volume: '20회', unit: '1만원', subtotal: '20만원' },
  { item: '공개사례발표', volume: '10시간', unit: '1만 5천원', subtotal: '16만 5천원' },
  { item: '상담자 경험 6사례', volume: '6사례', unit: '15만원', subtotal: '90만원' },
  { item: '집단상담 (3개 집단)', volume: '3개 집단', unit: '25만원', subtotal: '75만원' },
  {
    item: '마음토스 12개월 이용권',
    volume: '1매',
    unit: '36만원',
    subtotal: '무료 제공',
    free: true,
  },
];

const BONUSES = [
  {
    label: 'BONUS 01',
    title: '마음토스 AI 플러스 12개월 이용권',
    note: '정가 360,000원 → 무료',
  },
  {
    label: 'BONUS 02',
    title: '상담사를 위한 AI 활용법 교육',
    note: '정가 300,000원 → 무료',
  },
];

const AI_FEATURES = [
  {
    icon: FileText,
    title: '실무용 상담 노트 양식',
    body: '양식에 맞게 글을 쓰는 것이 어려워도 걱정하지 마세요. 마음토스는 실무에 필요한 대부분의 양식을 템플릿으로 제공하고, AI가 모든 양식에 맞게 상담 노트 초안을 작성해줍니다.',
  },
  {
    icon: Mic,
    title: '녹취록 자동화 및 감정 분석',
    body: '놓치기 쉬운 내담자의 비언어적 표현을 포함하여 높은 정확도로 녹취록을 축어록으로 변환합니다. 축어록 작업 시간이 90% 단축됩니다.',
  },
  {
    icon: BrainCircuit,
    title: '사례 개념화 보조',
    body: 'AI가 상담 내용을 요약하고 초기 분석 리포트를 제공합니다. 이를 바탕으로 슈퍼바이저와 더 깊이 있는 논의가 가능합니다.',
  },
];

const FAQS = [
  {
    q: '상담 전공자가 아니어도 신청 가능한가요?',
    a: '대학원 재학/졸업생 등 학회 수련 자격 요건에 부합하신다면 누구나 가능합니다. 비전공자라도 따라오실 수 있게 기초부터 잡아드립니다.',
  },
  {
    q: '이 과정을 수료하면 한국상담학회 2급 요건이 100% 충족되나요?',
    a: '네, 그렇습니다. 학회 규정에 맞춘 필수 이수 시간(상담 실습, 슈퍼비전, 공개사례발표 등)을 빈틈없이 채워드립니다. 개인이 챙기기 어려운 자잘한 행정 요건까지 전담 코치가 더블 체크해 드리므로, 선생님은 수련 내용에만 집중하시면 됩니다.',
  },
  {
    q: '필기시험이나 면접에 떨어지면 어떻게 되나요?',
    a: '합격할 때까지 놓지 않습니다. 불합격 시, 다음 시험 일정에 맞춰 추가 멘토링과 모의 면접 피드백을 무료로 제공합니다(재수강 할인 혜택 적용). 단순한 강의 판매가 아닌, 자격증 취득이라는 결과를 만들어내는 것이 저희의 목표입니다.',
  },
  {
    q: '상담실(공간)은 따로 대관해야 하나요?',
    a: '아니요, 센터 내 상담실을 이용하시면 됩니다. 대면 상담 시 센터 내 전문 상담실을 제공해 드립니다. (사전 예약제)',
  },
  {
    q: '지방에 거주하는데 슈퍼비전 참여가 가능한가요?',
    a: '네, 실시간 비대면 슈퍼비전과 병행하여 운영하므로 지역에 상관없이 참여 가능합니다. (단, 집단상담 등 일부 일정은 대면 필요 시 사전 공지)',
  },
  {
    q: '정말 내담자를 안 구해와도 되나요?',
    a: '네, 이것이 마음토스 아카데미의 핵심 약속입니다. 연구소 풀(Pool) 내에서 선생님의 역량에 맞는 내담자를 배정해 드립니다.',
  },
  {
    q: '기계치라서 AI(마음토스) 사용이 걱정됩니다. 어렵지 않나요?',
    a: '카카오톡을 쓰실 수 있다면 충분합니다. 복잡한 설치 없이 바로 사용할 수 있으며, 오리엔테이션 시간에 30분 만에 끝내는 AI 활용법 특강을 진행합니다. 녹취록 작성 시간을 1/10로 줄여주는 신세계를 경험하게 되실 겁니다.',
  },
  {
    q: '환불 규정을 알고 싶어요.',
    a: '본 과정은 장기 수련 특성상 파격 할인이 적용된 결합 패키지입니다. 단순 변심 등으로 인한 중도 해지 시, 환불액 = 실제 결제 금액 − 기 이용분 정가 합산액 − 해지 위약금(결제액의 10%) 으로 산정됩니다. 차감 합계가 결제액을 초과하면 환불 금액은 없는 것으로 하며, 회사가 추가 청구하지 않습니다. 전체 수련 과정의 1/2 이상 진행 시 또는 차감액이 결제액을 초과하면 반환 금액이 없는 것으로 간주합니다. 자세한 항목별 정가 기준은 등록 전 안내드립니다.',
  },
];

export default function AcademyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '홈', url: SITE_CONFIG.url },
    { name: '아카데미', url: `${SITE_CONFIG.url}/academy` },
  ]);
  const courseSchema = generateCourseSchema({
    name: '전문상담사 2급 올인원 패스 — 마음토스 아카데미',
    description:
      '내담자 매칭부터 슈퍼비전, 필기·면접 시험 대비, AI 협업 상담 교육까지. 12개월 안에 전문상담사 2급 자격 요건을 100% 충족하는 인턴십 프로그램입니다.',
    url: `${SITE_CONFIG.url}/academy`,
    educationalLevel: '전문가',
    audienceType: '심리상담사 (수련생)',
  });
  const faqSchema = generateFAQSchema(
    FAQS.map((f) => ({ question: f.q, answer: f.a })),
  );

  return (
    <>
      <SchemaMarkup schema={[breadcrumbSchema, courseSchema, faqSchema]} />

      {/* HERO */}
      <section className="page-hero academy-hero" aria-label="마음토스 아카데미 — 페이지 헤더">
        <div className="container">
          <div className="page-hero-content academy-hero-content">
            <span className="section-pill">전문상담사 2급 올인원 패스</span>
            <h1 className="page-hero-h1">
              합격까지 함께 뛰는<br />
              <span className="academy-hero-accent">상담사 페이스메이커 팀</span>
            </h1>
            <p className="page-hero-sub">
              내담자 100% 매칭 · 1:1 슈퍼바이저 전담 배정 · 필기/면접 합격 보장.
              복잡한 수련 요건 계산은 저희가 할게요. 선생님은 수련에만 집중하세요.
            </p>
            <div className="academy-hero-cta">
              <a className="btn primary lg" href="#inquiry">
                지금 수련 문의하기
                <ArrowRight className="arr" width={18} height={18} aria-hidden />
              </a>
              <a
                className="btn ghost lg"
                href={KAKAO_INQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                카카오톡 빠른 상담
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="wf-section academy-pain" aria-label="수련 고민">
        <div className="container">
          <header className="academy-section-head academy-section-head--center">
            <span className="t-tag">상담사 자격증, 가장 큰 벽</span>
            <h2 className="t-h2">
              공부보다 <span className="academy-accent">‘요건 파악’</span>이 더 힘들지 않으셨나요?
            </h2>
            <p className="t-sub">
              복잡한 수련 요건과 자격 취득 절차. 마음토스 아카데미가 한 번에 정리해드립니다.
            </p>
          </header>
          <ul className="academy-pain-list">
            {PAIN_POINTS.map((p) => (
              <li key={p}>
                <span className="academy-pain-dot" aria-hidden>•</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="academy-pain-bridge">
            마음토스 아카데미에서는 아무 걱정하지 않으셔도 됩니다.
            <br />
            <span className="academy-pain-bridge-sub">
              맞춤 관리로 전담 코치와 수퍼바이저가 모든 요건 충족을 하나하나 챙겨드립니다.
            </span>
          </div>
        </div>
      </section>

      {/* TARGET CONCERNS */}
      <section className="wf-section academy-concerns" aria-label="수련생 고민별 솔루션">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">CONCERN</span>
            <h2 className="t-h2">수련생이 마주하는 4가지 벽, 모두 해결합니다.</h2>
          </header>
          <ul className="academy-concern-grid">
            {TARGET_CONCERNS.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.title} className="academy-concern-card">
                  <div className="academy-concern-icon" aria-hidden>
                    <Icon width={26} height={26} />
                  </div>
                  <span className="academy-concern-eyebrow">{c.eyebrow}</span>
                  <h3 className="academy-concern-title">{c.title}</h3>
                  <p className="academy-concern-body">{c.body}</p>
                  <span className="academy-concern-keypoint">
                    <CheckCircle2 width={16} height={16} aria-hidden />
                    {c.keypoint}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* BRIDGE QUOTE */}
      <section className="academy-quote-band" aria-label="마음토스 아카데미 약속">
        <div className="container">
          <p className="academy-quote-band-text">
            단순한 수련 기관이 아닙니다.<br />
            <span className="academy-quote-band-strong">합격까지 함께 뛰는 페이스메이커 팀입니다.</span>
          </p>
        </div>
      </section>

      {/* SOLUTION REASONS */}
      <section className="wf-section academy-reasons" aria-label="3가지 선택 이유">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">SOLUTION 01</span>
            <h2 className="t-h2">마음토스 아카데미를 선택해야 하는 3가지 이유</h2>
          </header>
          <ol className="academy-reason-list">
            {SOLUTION_REASONS.map((r) => (
              <li key={r.eyebrow} className="academy-reason-item">
                <span className="academy-reason-eyebrow">{r.eyebrow}</span>
                <h3 className="academy-reason-title">{r.title}</h3>
                <p className="academy-reason-body">{r.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* EXAM CARE */}
      <section className="wf-section alt academy-exam" aria-label="시험 합격 케어">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">SOLUTION 02</span>
            <h2 className="t-h2">필기 · 면접 · 합격까지 — 시험 합격 케어 시스템</h2>
          </header>
          <ul className="academy-exam-grid">
            {EXAM_CARE.map((e) => {
              const Icon = e.icon;
              return (
                <li key={e.title} className="academy-exam-card">
                  <div className="academy-exam-icon" aria-hidden>
                    <Icon width={24} height={24} />
                  </div>
                  <span className="academy-exam-label">{e.label}</span>
                  <h3 className="academy-exam-title">{e.title}</h3>
                  <p className="academy-exam-body">{e.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* MENTORING */}
      <section className="wf-section academy-mentoring" aria-label="24시간 밀착 멘토링">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">SOLUTION 03</span>
            <h2 className="t-h2">24시간 밀착 멘토링 — 혼자가 아닙니다.</h2>
          </header>
          <ul className="academy-mentoring-grid">
            {MENTORING.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.title} className="academy-mentoring-card">
                  <div className="academy-mentoring-icon" aria-hidden>
                    <Icon width={26} height={26} />
                  </div>
                  <h3 className="academy-mentoring-title">{m.title}</h3>
                  <p className="academy-mentoring-body">{m.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="wf-section alt academy-roadmap" aria-label="12개월 로드맵">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">ROADMAP · 12 MONTHS</span>
            <h2 className="t-h2">단 1년, 합격까지 빈틈없이 설계된 초고속 로드맵</h2>
            <p className="t-sub">
              복잡한 계산은 저희가 할게요. 선생님은 수련에 집중하시면 충분합니다.
            </p>
          </header>
          <ol className="academy-roadmap-list">
            {ROADMAP.map((r) => (
              <li key={r.step} className="academy-roadmap-step">
                <div className="academy-roadmap-meta">
                  <span className="academy-roadmap-step-id">{r.step}</span>
                  <span className="academy-roadmap-season">{r.season}</span>
                </div>
                <h3 className="academy-roadmap-title">{r.title}</h3>
                <ul className="academy-roadmap-items">
                  {r.items.map((it) => (
                    <li key={it}>
                      <CheckCircle2 width={16} height={16} aria-hidden className="academy-roadmap-check" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SUPERVISORS */}
      <section className="wf-section academy-supervisors" aria-label="수퍼바이저 소개">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">SUPERVISORS</span>
            <h2 className="t-h2">검증된 수련감독자 + 1급 전문가 팀이 직접 지도합니다.</h2>
          </header>
          <ul className="academy-supervisor-grid">
            {SUPERVISORS.map((s) => (
              <li key={s.name} className="academy-supervisor-card">
                <div className="academy-supervisor-avatar" aria-hidden>
                  <GraduationCap width={28} height={28} />
                </div>
                <div className="academy-supervisor-name">{s.name}</div>
                <div className="academy-supervisor-role">{s.role}</div>
                <ul className="academy-supervisor-creds">
                  {s.creds.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRICING TABLE */}
      <section className="wf-section alt academy-table-section" aria-label="가격 상세 분석">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">PRICING DETAIL</span>
            <h2 className="t-h2">투명하게 공개하는 가격 상세 분석</h2>
            <p className="t-sub">
              학회 정가 기준 합산 약 5,465,000원 상당의 수련 패키지를 35% 할인된 등록가로 제공합니다.
            </p>
          </header>
          <div className="academy-table-wrap">
            <table className="academy-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>시간 / 횟수</th>
                  <th>개별 단가</th>
                  <th>소계</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_TABLE.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.volume}</td>
                    <td>{row.unit}</td>
                    <td className={row.free ? 'academy-table-free' : ''}>{row.subtotal}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3}>전체 등록 총비용 (35% 할인)</th>
                  <th className="academy-table-total">3,390,000원</th>
                </tr>
                <tr>
                  <th colSpan={3}>월 환산 부담</th>
                  <th>월 282,500원</th>
                </tr>
              </tfoot>
            </table>
          </div>

          <ul className="academy-bonuses">
            {BONUSES.map((b) => (
              <li key={b.title} className="academy-bonus-card">
                <span className="academy-bonus-label">{b.label}</span>
                <h3 className="academy-bonus-title">
                  <Sparkles width={18} height={18} aria-hidden />
                  {b.title}
                </h3>
                <p className="academy-bonus-note">{b.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AI FEATURES */}
      <section className="wf-section academy-ai" aria-label="마음토스 AI 기능">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">AI 슈퍼바이저 케어</span>
            <h2 className="t-h2">남들이 타이핑 칠 때, 여러분은 분석을 하세요.</h2>
            <p className="t-sub">
              마음토스 AI 플러스 12개월 이용권이 패키지에 무료 포함됩니다. 상담 기록의 시간을 90% 줄여주는 압도적 효율을 경험하세요.
            </p>
          </header>
          <ul className="academy-ai-grid">
            {AI_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="academy-ai-card">
                  <div className="academy-ai-icon" aria-hidden>
                    <Icon width={24} height={24} />
                  </div>
                  <h3 className="academy-ai-title">{f.title}</h3>
                  <p className="academy-ai-body">{f.body}</p>
                </li>
              );
            })}
          </ul>

          <div className="academy-ai-banner">
            AI를 못 다루셔도 됩니다.<br />
            <span className="academy-ai-banner-strong">
              3시간 실무 교육으로 ‘AI 협업 상담사’로 만들어 드립니다.
            </span>
          </div>
        </div>
      </section>

      {/* MID CTA STRIP */}
      <section className="academy-strip-cta" aria-label="마감 안내">
        <div className="container">
          <p className="academy-strip-cta-text">
            가장 빠르고, 가장 확실하게 상담사가 되는 길.
            <span> 당신의 러닝메이트가 되겠습니다.</span>
          </p>
          <a className="btn primary lg" href="#inquiry">
            수련 문의하기
            <ArrowRight className="arr" width={18} height={18} aria-hidden />
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="wf-section alt academy-faq-section" aria-label="자주 묻는 질문">
        <div className="container">
          <header className="academy-section-head">
            <span className="t-tag">FAQ</span>
            <h2 className="t-h2">자주 묻는 질문</h2>
          </header>
          <AcademyFaq items={FAQS} />
        </div>
      </section>

      {/* INQUIRY */}
      <section
        id="inquiry"
        className="academy-inquiry"
        aria-label="수련 문의"
      >
        <div className="container">
          <div className="academy-inquiry-head">
            <span className="academy-inquiry-pill">선착순 마감 전, 지금 문의하세요</span>
            <h2 className="academy-inquiry-h2">
              전문상담사 2급 자격 취득,<br />
              지금 바로 수련 문의하세요.
            </h2>
            <p className="academy-inquiry-sub">
              아래 정보를 입력하시면 카카오톡 오픈채팅으로 빠르게 연결되어 1:1 상세 안내를 받으실 수 있습니다.
            </p>
          </div>
          <AcademyInquiryForm kakaoUrl={KAKAO_INQUIRY_URL} />
          <p className="academy-inquiry-note">
            바로 카카오톡으로 문의를 원하시면{' '}
            <Link href={KAKAO_INQUIRY_URL} target="_blank" className="academy-inquiry-link">
              카카오톡 오픈채팅 바로가기
            </Link>
            를 이용해 주세요.
          </p>
        </div>
      </section>
    </>
  );
}
