# Master Document 표준 Schema

모든 master doc 는 다음 frontmatter + 본문 구조를 따른다.

## Frontmatter

```yaml
---
slug: counseling-licenses-kr           # 파일명 (확장자 제외) 와 동일
title: 한국 상담 관련 자격증            # 사람이 읽는 제목
aliases:                                # AI 토픽 매칭용 동의어
  - counseling-licenses
  - 상담사 자격
  - 임상심리사
  - 상담심리사
version: v1                             # v1 = single-LLM, v2 = cross-LLM verified
last_reviewed: 2026-05-28               # 사람 또는 cross-LLM spot check 일자
last_refreshed: 2026-05-28              # 외부 source 재 fetch 일자
sources_consulted:                      # 1차 출처 URL 목록
  - https://www.kcp.or.kr/              # 한국임상심리학회
  - https://krcpa.or.kr/                # 한국상담심리학회
  - https://www.law.go.kr/              # 법제처
confidence_overall: 0.85                # 0-1, master 전체 평균 신뢰도
---
```

## 본문 구조

Master 는 다음 섹션을 가진다 (선택 가능):

```markdown
# {Title} — Fact-Check Master

## {도메인 그룹} (예: 진단 기준, 유병률, 치료, 자격 명칭, 윤리 원칙)

### Claim
{사실 주장 1줄 — 명확하고 단정적으로}

- **Source**: {출처 명칭·연도·URL}
- **Confidence**: 0.0-1.0
- **Last verified**: ISO 일자
- **Notes**: (선택) 한국 컨텍스트·예외·예시
```

## Confidence Guide

| 값 | 출처 강도 |
|----|----------|
| 1.0 | DSM-5-TR / 보건복지부 공식 / Cochrane 메타분석 / 법제처 현행 법령 |
| 0.85 - 0.95 | 학회 가이드라인 / 메이저 메타분석 / 정부 백서 |
| 0.7 - 0.85 | 단일 RCT / 한국 단일 연구 / 정부 부처 공지 |
| 0.5 - 0.7 | 학술 의견 / 임상 합의 / 비공식 가이드라인 |
| < 0.5 | 의견·통념. **fact-check 에서 인용 차단** 또는 ambiguous 처리 |

## Anti-Claim 섹션 (선택)

잘못 알려진 정보 — fact-check 시 글이 이렇게 주장하면 즉시 차단:

```markdown
## 잘못 알려진 정보 (Anti-Claims)

### Anti-Claim
"성인 ADHD 는 존재하지 않는다" — 거짓.

- **반박 근거**: DSM-5-TR Adult ADHD Criterion. NICE NG87.
- **Action**: 글에서 이런 주장 발견 시 fact-check 실패 처리.
```

## 갱신 이력 섹션

문서 끝에 변경 이력:

```markdown
---
## 갱신 이력

- 2026-05-28 v1: 최초 작성 (single-LLM draft)
- (예정) cross-LLM 검증 → v2 승격
- (예정) 2026-08-28: 분기 refresh
```

## 파싱 규칙 (V5 Stage 3 verifier 가 읽는 방식)

- `### Claim` 헤딩 단위로 claim 객체 추출
- 각 claim 의 source / confidence / last_verified 메타 동봉
- `## Anti-Claims` 섹션은 별도로 추출 → 글의 claim 과 매칭 시 즉시 mustBlock

## 다중 토픽 글 처리

글이 여러 토픽을 다룰 때 (예: "ADHD 내담자 상담 시 윤리적 고려") master 여러 개 동시 로드:
- `adhd.md` + `counseling-ethics-kr.md` 등
- 토픽별 relevance 점수로 최대 3개 master 까지 로드 (토큰 비용 cap)
