# 마음토스 블로그 마이그레이션 스크립트 (MCP 기반)

Webflow CMS + Baserow 'Mindthos Blog' (table 763048) 의 발행 글을
Supabase `posts` 스키마로 옮기는 단계별 스크립트.

상위 계획 문서: `web/docs/blog-migration-plan.md`

## 핵심 원칙

- **Baserow / Webflow 데이터 수집은 Claude 세션의 MCP 로 수행** — 토큰 발급 불필요.
- 본 스크립트는 MCP 가 만들어준 캐시 파일 (`.data/*.json`) 만 읽어 변환·업서트.
- Supabase 쓰기 단계만 service role key 사용 (`.env`).

## 0. 준비

```bash
cd scripts/migrate-blog
cp .env.example .env
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 채우기

npm install
```

## 1. 데이터 수집 (Claude 에게 부탁)

Claude 세션에서 다음을 부탁하면 MCP 호출로 `.data/` 에 캐시 파일이 생성됩니다.

### 단일 글 테스트

> "Baserow 'Mindthos Blog' 테이블에서 slug 가 `<TEST_SLUG>` 인 row 1개를 받아서
>  `scripts/migrate-blog/.data/baserow-all.json` 에 배열 형태로 저장해줘."
>
> "Webflow CMS 의 blog collection 에서 slug 가 `<TEST_SLUG>` 인 item 의 `lastPublished` 를 받아서
>  `scripts/migrate-blog/.data/webflow-dates.json` 에 `{ "<slug>": "<ISO date>" }` 형태로 저장해줘."

### 일괄 마이그레이션

> "Baserow 'Mindthos Blog' 테이블 (id 763048) 의 모든 row 를 페이지네이션으로 받아서
>  `scripts/migrate-blog/.data/baserow-all.json` 에 배열로 저장해줘."
>
> "Webflow blog collection 의 모든 item 을 받아서 slug → lastPublished 맵을
>  `scripts/migrate-blog/.data/webflow-dates.json` 에 저장해줘."

생성될 파일 형식:

```jsonc
// .data/baserow-all.json
[
  { "ID": 1, "Name": "...", "slug": "...", "body-result-first": "<HTML>", ... },
  ...
]
```

```jsonc
// .data/webflow-dates.json
{ "clinical-counseling-school-counselor-guide": "2024-08-12T03:14:00Z", ... }
```

## 2. 카테고리 분포 확인 → 003 SQL 채우기

```bash
npm run categories
# → .data/categories-mapping.json 출력
# → 영문 슬러그를 결정해 web/supabase/migrations/003_replace_categories.sql 의 INSERT 채우기
```

## 3. 카테고리 / Author 시드 적용 (003 + 004)

루트의 apply 스크립트에 `blog` 인자를 줍니다.

```bash
cd ../..
# 루트의 .env 에 SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF 필요
bash scripts/apply-supabase-migrations.sh blog
cd scripts/migrate-blog
```

## 4. 단일 글 변환 → 사용자가 썸네일 1개 업로드 → upsert

```bash
# 변환 (특정 slug 만)
npm run transform -- --slug=clinical-counseling-school-counselor-guide

# 사용자: Supabase Storage `blog-images/blog/<uuid>.webp` 에 해당 썸네일 업로드

# 미리보기
npm run upsert -- --slug=clinical-counseling-school-counselor-guide --dry-run

# 실제 적용
npm run upsert -- --slug=clinical-counseling-school-counselor-guide
```

확인:
- 사이트(또는 localhost) `/blog/clinical-counseling-school-counselor-guide` 렌더 확인
- view-source 로 메타 / JSON-LD 확인
- 본문 가독성 / 어색함 평가

## 5. 일괄 마이그레이션

```bash
npm run transform               # 발행글 전체 변환
# 사용자가 모든 썸네일 Storage 업로드 완료
npm run verify:thumbs           # HEAD 200 검증, 누락 리포트
npm run upsert                  # slug upsert (50건 배치)
```

## 디렉토리

```
scripts/migrate-blog/
├── src/
│   ├── lib/
│   │   ├── baserow.ts        # BaserowRow 타입 정의 (fetch 안 함)
│   │   ├── supabase.ts       # service-role 클라이언트
│   │   ├── html-to-md.ts     # turndown + GFM + 이미지 src prefix
│   │   ├── normalize.ts      # slug, references, keywords
│   │   └── log.ts
│   ├── 0-categories.ts       # Baserow Category 분포 분석
│   ├── 4-transform.ts        # HTML→MD, --slug 단일 모드 지원
│   ├── 6-verify-thumbnails.ts
│   ├── 7-upsert-supabase.ts  # slug upsert, --slug + --dry-run 지원
│   └── _smoke-test.ts        # 토큰 없이 sample-row 변환 검증
└── .data/                    # 캐시 (gitignored)
    ├── baserow-all.json      # ★ Claude MCP 가 만들어줌
    ├── webflow-dates.json    # ★ Claude MCP 가 만들어줌
    ├── categories-mapping.json
    ├── posts.json            # 4-transform 산출
    └── thumbnails-missing.txt
```

## smoke test (토큰 / MCP 없이)

`.data/sample-row.json` (Baserow row 1개) 만으로 변환 결과 미리보기:

```bash
npm run smoke
```

## 멱등성

- Phase 4 (transform) 와 7 (upsert) 는 재실행 안전 (slug ON CONFLICT UPDATE)
- 캐시 (`.data/`) 는 변하지 않으면 재변환 결과 동일
- 카테고리 매핑이 바뀌면 `npm run transform` 만 다시 → upsert 재실행
