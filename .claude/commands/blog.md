# 마음토스 블로그 원스톱 발행

주제: $ARGUMENTS

## 지시사항

"$ARGUMENTS" 주제로 키워드 리서치 → 글 작성 → 인링크 → 발행을 한 번에 수행합니다. 주제가 비어 있으면 1단계에서 기회 키워드를 자동 추천합니다.

**중요: 복수 글 발행 시 (예: "글 10개 발행") 요청 수량이 모두 발행 완료될 때까지 멈추지 않고 진행하세요. 사용자에게 중간 확인 ❌. 한 번 시작하면 끝까지 논스톱.**

---

## 1단계: 키워드 리서치 (DataForSEO 실 데이터)

### 1-1. 주제가 없는 경우 (자동 추천)

```bash
python3 scripts/seo-analysis/opportunity_scorer.py --top 10 --output scripts/publish-blog/seo-opportunities.json
```

상위 3개 키워드를 추천 → 사용자가 선택하면 진행. 주제가 명확하면 1-2로.

### 1-2. 주제가 있는 경우 (DataForSEO 리서치)

```bash
python3 scripts/seo-analysis/keyword_research.py "$ARGUMENTS" --expand --serp --output scripts/publish-blog/keyword-report.json
```

결과 요약을 사용자에게 보여준 뒤 결정:
- **핵심 키워드** 1-2개 (검색량 ↑, 경쟁도 ↓)
- **보조 키워드** 3-5개
- **카테고리** (`web/context/target-keywords.md` 참조 — 8개 중 1개)
- **타겟 독자** (counselor / institution / general)
- **CTA 전략** (`free-trial` / `institution-inquiry` / `newsletter`)
- **FAQ 후보** 3-5개

---

## 2단계: SEO 최적화 본문 작성

다음 파일을 모두 읽습니다:
- `web/context/brand-voice.md` — 톤·임상 윤리
- `web/context/style-guide.md` — 마크다운·FAQ·인용
- `web/context/seo-guidelines.md` — 길이·키워드·헤딩
- `web/context/target-keywords.md` — 카테고리별 키워드
- `web/context/internal-links-map.md` — CTA·인링크 규칙
- `web/context/fact-check-protocol.md` — 사실 검증(팩트체크) 필수 규칙

### 2-0. 사실 검증 (팩트체크) — 해당 주제 시 필수

`fact-check-protocol.md` 트리거 판정 수행. 주제가 **자격 취득 / 교육과정·수련 / 학회 규정 / 상담 관련 법률·제도 / 정부 정책·지원사업 / 시점에 따라 변하는 수치·일정** 에 해당하면 본문 작성 **전**에 웹 리서치·교차검증을 수행합니다.

- 1차 공식 출처(정부·법령·학회·자격관리기관) 우선, 핵심 수치·요건은 2개 이상 출처로 교차검증
- 현재 연도 기준 최신 지침·명칭 변경 여부 확인 (예: "전국민 마음투자 지원사업" → "정신건강 심리상담 바우처")
- 검증된 사실만 반영, 확인 못 한 내용은 단정 금지, 변동 항목엔 "공식 공고 확인" 안내, 사용한 1차 출처는 `references` 에 포함

비(非)사실민감 주제(임상 이론·기법·자기돌봄 등)면 생략하고 작성 규칙으로 진행.

1단계 실 데이터(검색량·SERP 경쟁)를 반영하여 작성:

### 작성 규칙
- 본문 1,500-4,000자 (카테고리별 기준 — `seo-guidelines.md`)
- H2 5-8개, 최소 2개에 키워드 포함
- 첫 100자 안에 주요 키워드
- SERP 상위 평균 길이 참고하여 분량 조절
- `brand-voice.md` 동료 상담사 어조 (이모지 ❌, ~습니다체)
- meta_title 30-60자, meta_description 120-155자
- FAQ 3-5개 (1단계 후보 활용)
- references 1-5개 (학술·정부·전문기관)
- URL 슬러그: 영문 소문자 하이픈 3-5단어
- 사례 익명화 + 동의 명시
- DSM 인용 시 버전 표기

### 출력

다음 JSON 형식으로 `scripts/publish-blog/content.json` 에 저장:

```json
{
  "categorySlug": "counseling-skills",
  "targetAudience": "counselor",
  "authorSlug": "mindthos-team",
  "status": "published",
  "skipImage": false,
  "content": {
    "title": "글 제목",
    "slug": "url-slug",
    "content": "## H2 ...",
    "excerpt": "155자 이내",
    "summary": "200-400자",
    "keywords": ["..."],
    "meta_title": "...",
    "meta_description": "...",
    "cta_type": "free-trial",
    "faq": [{ "question": "...?", "answer": "..." }],
    "references": [{ "name": "...", "url": "...", "type": "academic", "description": "..." }],
    "visual_keywords": ["english keywords for image generation"]
  }
}
```

---

## 3단계: 인링크 자동 삽입

```bash
npx tsx scripts/publish-blog/src/insert-inlinks.ts
```

- `content.keywords` + 본문 임상 용어 추출
- 자기 참조 키워드 제외
- Supabase `status='published'` 글 중 후보 조회
- excerpt 비교로 최적 후보 선택
- 마크다운 링크 자동 삽입 (최대 4개, H2 안 ❌, 한 문단 2개 이상 ❌)
- content.json 업데이트

삽입된 인링크 목록을 사용자에게 보여줌. 후보 글 없으면 스킵.

---

## 4단계: SEO 분석 + 발행

### 4-1. SEO 점수 확인

```bash
python3 scripts/seo-analysis/analyze.py scripts/publish-blog/content.json --output scripts/publish-blog/seo-report.json
```

등급별 처리:
- **A/B (70+)**: 발행 진행
- **C (50-69)**: content.json 수정 후 재분석 (2회 시도). 그래도 C 면 사용자 확인
- **D/F (<50)**: 콘텐츠 수정 후 재분석. 개선점 안내

### 4-2. 발행 실행

```bash
npx tsx scripts/publish-blog/src/publish.ts
```

자동 6단계:
1. SEO 분석 (재활용)
2. Gemini 교차 검증 (사실·임상 정확도·윤리)
3. 아웃링크 검증
4. 이미지 생성 (NANOBANANA_API_KEY)
5. CTA 매칭
6. DB INSERT → revalidate → IndexNow

### 4-3. 결과 보고

사용자에게 한 화면 정리:
- 게시글 ID / Slug / 상태
- 카테고리 / 저자
- SEO 점수·등급
- Gemini 점수
- 이미지 생성 여부
- CTA 매칭 결과
- 발행 URL: `https://mindthos.com/blog/{slug}`
