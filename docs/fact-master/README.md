# Master Document Fact-Check 시스템

마음토스 블로그 콘텐츠 AI 다중 검수(Stage 3)의 정답지.

- **설계 문서**: `web/docs/aeo-geo-research/master-docs-architecture.md`
- **검수 워크플로**: `web/docs/aeo-geo-research/ai-review-workflow.md`
- **사용 위치**: `scripts/publish-blog/src/verifiers/fact-check.ts` (V5 — 후속)

## 디렉토리 구성

```
docs/fact-master/
├── README.md              # 이 문서 (인덱스)
├── _schema.md             # master doc 표준 schema
├── _sources.md            # 신뢰 source whitelist (한국·국제)
│
├── # ── 상담사 실무 영역 (Phase 1) ──
├── counseling-licenses-kr.md
├── counseling-ethics-kr.md
├── counseling-regulations-kr.md
├── crisis-response.md
└── counseling-techniques.md
```

## Phase 별 우선순위

### Phase 1 — 상담사 실무 (5개, 작성 완료)
마음토스 블로그 발행 콘텐츠 = 상담사 실무·정책·자격·기법 중심.

| Slug | 다루는 영역 |
|------|-----------|
| counseling-licenses-kr | 한국 상담 관련 자격증 8종 |
| counseling-ethics-kr | 학회 윤리강령 핵심 원칙 |
| counseling-regulations-kr | 정신건강복지법·청소년복지법·바우처 |
| crisis-response | 자살·자해·학대 위기 표준 절차 |
| counseling-techniques | CBT/DBT/ACT/EMDR 등 기법 일반 |

### Phase 2 — 평가도구·기록 (후속)
- supervision-standards.md
- assessment-tools.md (K-WAIS·MMPI-2·BDI·PHQ-9)
- counseling-records.md

### Phase 3 — 조건/장애명 (후속)
- adhd.md / major-depressive-disorder.md / panic-disorder.md /
- generalized-anxiety-disorder.md / ptsd.md / trauma.md /
- bipolar-disorder.md / eating-disorders.md / insomnia.md / grief.md /
- child-adolescent.md / couples-family.md

## 작성 상태 표기

각 master 의 frontmatter `version` / `confidence_overall` 필드 참조.

- **v1** = 단일 LLM (Claude) 1차 draft. 후속 cross-LLM (Gemini) 검증 필요.
- **v2** = cross-LLM 합의 + 외부 source URL 검증 완료.

## 갱신 사이클

- **분기 1회 (90일)**: 외부 source URL 재 fetch + diff 검증 → 변경 큰 master 는 운영자 spot check.
- **Trigger 기반**: Stage 3 fact-check 에서 `missing_in_master` / `contradicts` 빈도 누적 → 즉시 갱신.

자세한 갱신 절차: `master-docs-architecture.md` §6.
