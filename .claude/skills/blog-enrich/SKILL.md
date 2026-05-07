---
name: blog-enrich
description: 마이그레이션된 마음토스 블로그 글의 본문을 그대로 두고 누락된 메타(summary, FAQPage schema)만 보강한다. 본문 텍스트는 한 글자도 바꾸지 않는다.
---

# blog-enrich

Webflow 에서 옮겨진 글에 다음 두 가지를 자동 채움:

1. `summary` — 글 상단 "이 글의 핵심" 박스용 200~400자 요약
2. `schema_markup` — 본문에서 추출한 FAQPage JSON-LD (있으면)

## 호출 방식

`scripts/migrate-blog/src/5-enrich.ts` 가 각 prompt 파일을 읽어
`claude -p "<prompt>\n\n---\n\n<body>" --output-format json --max-turns 1` 으로 호출.

응답은 반드시 `result` 필드 안에 JSON 한 객체. 본문 외 어떤 텍스트도 금지.

## 가드레일 (모든 prompt 공통)

- 본문 어떤 텍스트도 수정 금지
- 본문에 없는 사실/주장 만들지 않음
- 응답은 JSON 한 객체만, 코드펜스 / 설명 / 주석 일절 금지
