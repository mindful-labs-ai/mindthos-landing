# 마음토스 블로그 글 작성

주제: $ARGUMENTS

## 지시사항

아래 컨텍스트를 모두 읽은 뒤, "$ARGUMENTS" 주제로 마음토스 블로그 글을 작성합니다. 주 독자는 상담사·임상가·수련생 등 전문가입니다.

### 참조 컨텍스트

1. `web/context/brand-voice.md` — 톤·금지 표현·임상 윤리
2. `web/context/style-guide.md` — 마크다운 / 문단 / FAQ / 인용 규칙
3. `web/context/seo-guidelines.md` — 글자 수 / 키워드 밀도 / 메타
4. `web/context/target-keywords.md` — 카테고리별 키워드 클러스터
5. `web/context/internal-links-map.md` — CTA 매핑 / 인링크 규칙
6. `web/CLAUDE.md` — 프로젝트 전반 규칙 (색상·디자인은 코드 작업 시)
7. `docs/blog-db-guide.md` — DB 스키마
8. `web/context/fact-check-protocol.md` — 사실 검증(팩트체크) 필수 규칙

### 작성 프로세스

#### 1단계: 카테고리·키워드 선정

`target-keywords.md` 에서 주제와 가장 가까운 카테고리(8개 중 1개) 선택:
`case-conceptualization` / `counseling-skills` / `training` / `career` / `operations` / `self-care` / `trends` / `tech-blog`

선정 결과:
- **핵심 키워드** 1-2개 (검색량 높고 경쟁도 낮은 것 우선)
- **보조 키워드** 3-5개
- **타겟 독자** (counselor / institution / general)
- **CTA 전략** (`free-trial` / `institution-inquiry` / `newsletter` 중 하나)
- **FAQ 후보** 3-5개

#### 2단계: 구조 설계

- H2 5-8개 (카테고리 글자 수 기준 — `seo-guidelines.md`)
- 최소 2개 H2 에 키워드 자연 포함
- 도입(임상 장면) → 본론(이론·기법·사례) → 마무리(요약·다음 단계)

#### 2.5단계: 사실 검증 (팩트체크) — 해당 주제 시 필수

`web/context/fact-check-protocol.md` 의 트리거 판정을 먼저 수행합니다. 주제가 **자격 취득 / 교육과정·수련 / 학회 규정 / 상담 관련 법률·제도 / 정부 정책·지원사업 / 시점에 따라 변하는 수치·일정** 에 해당하면, 본문 작성 **전**에 웹 리서치·교차검증을 수행합니다.

- 정부·법령·학회·자격관리기관 등 1차 공식 출처를 우선 확인
- 핵심 수치·요건은 독립된 2개 이상 출처로 교차검증, 현재 연도 기준 최신 지침·명칭 변경 여부 확인
- 검증된 사실만 본문에 반영, 확인 못 한 내용은 단정 금지, 변동 항목엔 "공식 공고 확인" 안내
- 사용한 1차 출처는 `references` 에 포함

순수 임상 이론·기법·자기돌봄 등 비(非)사실민감 주제면 이 단계를 생략하고 3단계로 진행합니다.

#### 3단계: 본문 작성

- `brand-voice.md` 톤 (동료 상담사 어조, 임상 정확성)
- `style-guide.md` 포맷팅 (이모지 ❌, ~습니다체, 문단 3-5문장)
- 카테고리 권장 글자 수 (1,500-4,000자) 도달
- 첫 100자 안에 주요 키워드
- 학술 인용 시 `(저자, 연도)` + references 배열에 추가
- 사례는 익명화 + 변형 + 동의 가정 명시

#### 4단계: SEO 요소

- meta_title: 30-60자, 키워드 앞쪽
- meta_description: 120-155자, 행동 유도 1줄
- FAQ 3-5개 (자연어 질문 + 100-250자 답변)
- URL 슬러그: 영문 소문자 + 하이픈, 3-5단어

#### 5단계: 내부 링크 후보 (선택)

`internal-links-map.md` 참조. 작성 단계에서는 자연스러운 위치만 표시. 실제 인링크 삽입은 `insert-inlinks.ts` 가 발행 단계에서 자동 수행.

#### 6단계: 윤리·임상 안전 점검

- DSM·진단 기준 인용 시 버전 표기 (DSM-5-TR 등)
- 비전문가에게 임상 행위 권유 ❌
- 자해·자살 주제 시 전문가 슈퍼비전 권장 + 자격 범위 명시
- 마음토스 제품 언급은 광고형 ❌, 도구 → 효과 흐름

### 출력 형식

`scripts/publish-blog/content.json` 에 다음 형식으로 저장:

```json
{
  "categorySlug": "counseling-skills",
  "targetAudience": "counselor",
  "authorSlug": "mindthos-team",
  "status": "draft",
  "skipImage": false,
  "content": {
    "title": "글 제목 (30-60자)",
    "slug": "english-slug-3-5-words",
    "content": "## H2 섹션 1\n\n본문...\n\n## H2 섹션 2\n\n...",
    "excerpt": "카드/메타용 발췌 (155자 이내)",
    "summary": "이 글의 핵심 박스용 요약 (200-400자)",
    "keywords": ["핵심키워드", "보조키워드1", "보조키워드2"],
    "meta_title": "SEO 메타 타이틀 (30-60자)",
    "meta_description": "SEO 메타 디스크립션 (120-155자)",
    "cta_type": "free-trial",
    "faq": [
      { "question": "...?", "answer": "..." }
    ],
    "references": [
      { "name": "기관/저자", "url": "https://...", "type": "academic|government|industry", "description": "(선택)" }
    ],
    "visual_keywords": ["thumbnail generation keywords in English"]
  }
}
```

작성 완료 후 사용자에게 다음을 보고:
- 핵심 키워드 / 보조 키워드
- 카테고리 / 타겟 독자 / CTA 전략
- 총 글자 수
- FAQ 개수
- references 개수
- 다음 단계 안내 (`/publish-blog` 로 발행 가능)
