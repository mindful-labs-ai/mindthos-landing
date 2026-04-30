# Conversion Funnel Design

블로그가 단순 콘텐츠가 아니라 **검색 유입 → 전환** 도구로 동작하도록 설계된 데이터 모델입니다.

## 퍼널 구조

### 트랙 A — B2C (일반 사용자, 상담 예약)

```
검색엔진 (정보형 키워드)
   ↓
블로그 글 (mental-health / counseling-stories / relationships-communication / children-youth)
   ↓ InlineCTA / BottomCTA
/counseling/[slug]  (상품 상세)
   ↓ "예약하기" 버튼
/contact            (상담 예약 폼)
   ↓ contact_inquiries INSERT
DB (utm_source/medium/campaign 캡처)
```

### 트랙 B — Lead 확보 (Light commitment)

```
검색엔진 (자기성장 키워드)
   ↓
블로그 글 (self-growth)
   ↓ Sidebar Newsletter Form
이메일 입력
   ↓ newsletter_subscribers INSERT
이메일 시퀀스 (외부 ESP — 별도 구축)
```

### 트랙 C — B2B (전문가, 교육 등록)

```
검색엔진 (전문가 키워드)
   ↓
블로그 글 (expert-column / education-certification)
   ↓ InlineCTA / BottomCTA
/programs           (교육 프로그램 목록)
   ↓
/programs/[slug]    (개별 프로그램)
   ↓ "수강 신청" 버튼
/contact (또는 별도 폼)
   ↓ program_registrations INSERT
DB
```

## 카테고리별 트랙 매핑

`constants/categories.ts` + `categories.target_audience` + `categories.default_cta_type`:

| 카테고리 | target_audience | default_cta_type | 트랙 |
|---------|----------------|------------------|------|
| mental-health | client | consultation | A |
| counseling-stories | client | consultation | A |
| relationships-communication | client | consultation | A (부부상담) |
| children-youth | client | consultation | A (청소년상담) |
| self-growth | client | newsletter | B |
| expert-column | professional | education | C |
| education-certification | professional | education | C |

## CTA 자동 매칭 동작

**1단계: 글별 정확 매칭**

`posts.counseling_program_id` (FK)는 콘텐츠 작성/INSERT 시 다음 알고리즘으로 채우는 것을 권장합니다 (어드민 / 외부 CMS 연동에서 동일 패턴 사용):

```ts
// posts.keywords ↔ counseling_programs.match_keywords
// 양방향 substring includes 비교, 매칭 카운트 최대 프로그램 선택

const programs = await supabase
  .from('counseling_programs')
  .select('id, title, slug, match_keywords')
  .eq('is_active', true)
  .eq('is_cta_enabled', true);

let bestId, bestScore = 0;
for (const prog of programs) {
  let score = 0;
  for (const kw of post.keywords) {
    for (const m of prog.match_keywords) {
      if (kw.includes(m) || m.includes(kw)) { score++; break; }
    }
  }
  if (score > bestScore) { bestScore = score; bestId = prog.id; }
}
```

**2단계: 카테고리 폴백**

매칭 실패 시 `categories.default_program_id`를 사용:

```ts
// app/blog/[category]/[slug]/page.tsx
let program = null;
if (post.counseling_program_id) {
  program = await ...counseling_programs.eq('id', post.counseling_program_id);
}
if (!program && post.category?.default_program_id) {
  program = await ...counseling_programs.eq('id', post.category.default_program_id);
}
```

**3단계: 최종 폴백**

프로그램이 없으면 `cta_type`만으로 일반 CTA 표시:
- `consultation` → /counseling 목록
- `education` → /programs 목록
- `newsletter` → 사이드바 NewsletterForm

## CTA 컴포넌트 구조

이 템플릿은 디자인 컴포넌트(InlineCTA, BottomCTA)는 포함하지 않습니다 (디자인 의존). 새 프로젝트의 디자인 시스템으로 구현하세요. 인터페이스 예시:

```tsx
interface InlineCTAProps {
  ctaType: 'consultation' | 'education' | 'newsletter';
  program?: {
    title: string;
    slug: string;
    cta_heading: string;
    cta_button_text: string;
  } | null;
}

// 본문 중간 (PostContent 직후)
// 글 하단 (RelatedPosts 직전)
```

**랜딩 URL 규칙**
- `program` 있음 → `/counseling/${program.slug}` (B2C) 또는 `/programs/${program.slug}` (B2B)
- `program` 없음 + `consultation` → `/counseling`
- `program` 없음 + `education` → `/programs`
- `newsletter` → 폼 인라인

## UTM 추적

폼 제출 시 모든 광고 유입 정보를 캡처:

```ts
// app/contact/page.tsx (예시)
'use client';
const sp = useSearchParams();
const utmSource = sp.get('utm_source') ?? null;
const utmMedium = sp.get('utm_medium') ?? null;
const utmCampaign = sp.get('utm_campaign') ?? null;
const sourceUrl = window.location.href;

await supabase.from('contact_inquiries').insert({
  name, phone, email, ...
  source_url: sourceUrl,
  utm_source: utmSource,
  utm_medium: utmMedium,
  utm_campaign: utmCampaign,
});
```

## 분석 이벤트 (`lib/analytics/gtag.ts`)

GA4 + Meta Pixel에 동시 송신하는 헬퍼 5종:

| 이벤트 | 호출 시점 | 의미 |
|-------|---------|------|
| `trackViewContent` | 페이지 진입 | 광고 유입 후 랜딩 확인 |
| `trackCTAClick` | InlineCTA/BottomCTA 클릭 | 클릭 트래킹 |
| `trackBeginForm` | 폼 첫 입력 | 작성 시작 (드롭아웃 분석) |
| `trackGenerateLead` | 폼 제출 성공 | **Lead 전환** (currency: KRW, value: 20000) |
| `trackPhoneClick` | tel: 클릭 | 전화 문의 |

전환 추적은 GA4 `generate_lead`, Meta Pixel `Lead` 표준 이벤트 사용 — 광고 최적화 알고리즘이 자동 인식.

## 이식 시 결정 사항

1. **트랙 수** — 도메인이 단일 전환 (예: SaaS 무료 시작) 이면 트랙 1개로 단순화. `categories.default_cta_type`을 모두 동일 값으로.
2. **상품 페이지 URL** — `/counseling/[slug]`을 도메인에 맞게 변경 (`/products/[slug]`, `/services/[slug]`). `lib/seo/schema.ts`의 `generateServiceSchema()`도 같이 업데이트.
3. **전환 가치(value)** — `trackGenerateLead`의 KRW 20000은 LTV에 맞게 조정. Pixel/GA4가 광고 ROI 계산에 사용.
4. **폼 필드** — `contact_inquiries` 테이블의 `counseling_type`, `preferred_date` 등은 도메인에 맞게 ALTER. 검증은 `lib/validations/contact.ts` Zod 스키마.
