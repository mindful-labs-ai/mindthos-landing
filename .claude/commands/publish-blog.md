# 마음토스 블로그 발행

$ARGUMENTS

## 지시사항

`scripts/publish-blog/content.json` 에 준비된 글을 검증 후 Supabase 에 발행합니다.

### 1단계: content.json 검증

`scripts/publish-blog/content.json` 을 읽고 필수 필드를 확인:

- `categorySlug` — 8개 카테고리 중 하나
- `targetAudience` — counselor / institution / general
- `status` — published / draft
- `content.title`, `content.slug`, `content.content`
- `content.excerpt`, `content.summary` (각 155자 / 400자 이내)
- `content.keywords` (3-7개)
- `content.meta_title`, `content.meta_description`
- `content.faq` (3-5개 권장)
- `content.references` (1-5개 권장)
- `content.cta_type` (선택; 없으면 카테고리 default)

부족하면 사용자에게 명확히 안내하고 보강 제안.

### 2단계: SEO 분석

```bash
python3 scripts/seo-analysis/analyze.py scripts/publish-blog/content.json --output scripts/publish-blog/seo-report.json
```

결과 등급별 처리:
- **A/B (70+)**: 바로 발행 진행
- **C (50-69)**: 권장 사항 수정 후 재분석 (2회 시도). 그래도 C 면 사용자에게 진행 여부 확인
- **D/F (<50)**: 콘텐츠 수정 후 재분석. 구체적 개선점 안내

### 3단계: 인링크 자동 삽입

```bash
npx tsx scripts/publish-blog/src/insert-inlinks.ts
```

이 스크립트는:
- content.keywords + 본문 임상 용어 매칭
- Supabase `status='published'` 글 중 후보 검색
- 본문에 마크다운 링크 자동 삽입 (최대 4개)
- content.json 업데이트

결과를 사용자에게 보여줌. 후보 글이 없으면 스킵.

### 4단계: 발행 실행

```bash
npx tsx scripts/publish-blog/src/publish.ts
```

자동 수행:
1. SEO 분석 (2단계 결과 재활용)
2. Gemini 교차 검증 (임상 정확도 / 윤리 / 사실 오류)
3. 아웃링크 검증 (3xx 폴백 + 데드링크 제거)
4. 썸네일 이미지 생성 (NANOBANANA_API_KEY 있을 때)
5. CTA 매칭 (`counseling_programs.match_keywords`)
6. DB INSERT (KST 타임스탬프)
7. /api/revalidate (REVALIDATION_SECRET 있을 때)
8. IndexNow 제출 (INDEXNOW_KEY 있을 때)

### 5단계: 결과 보고

발행 결과를 사용자에게 한 화면에 정리:

- 게시글 ID / Slug / 상태
- 카테고리 / 저자
- SEO 점수·등급
- Gemini 점수
- 이미지 생성 여부
- CTA 매칭 결과 (counseling_program_id)
- revalidate / IndexNow 응답
- 발행 URL: `https://mindthos.com/blog/{slug}`

발행이 실패하면 (DB 오류 / Gemini <6점 등) 정확한 원인 + 다음 액션 안내.

## 환경 변수 (web/.env.local)

| 키 | 용도 | 필수 |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | DB | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | DB 쓰기 권한 | ✅ |
| NANOBANANA_API_KEY | Gemini 검증 + 이미지 생성 | 선택 |
| REVALIDATION_SECRET | ISR 즉시 재검증 | 선택 |
| INDEXNOW_KEY | Bing/Yandex/Naver 즉시 색인 | 선택 |
| NEXT_PUBLIC_SITE_URL | 기본 `https://mindthos.com` | 선택 |
