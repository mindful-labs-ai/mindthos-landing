# mindthos-web changelog

## 2026-05-04 — landing 정량 지표 4종 갱신

웹사이트 홈 8섹션 "숫자와 목소리로 본 마음토스" 영역의 metric-strip 4개 카드 텍스트를 갱신했습니다. 디자인/레이아웃은 그대로, 숫자 텍스트와 라벨만 교체.

**파일**: `web/components/home/HifiLanding.tsx` (8섹션 metric-strip)

**기준일 (조회일)**: 2026-05-04
**Source DB**: Supabase production (`hjmlwlmvubneyuqvhhau`)
**필터 일반 주의**: `is_test`/`is_internal` 같은 내부/테스트 계정 제외 컬럼이 운영 DB에 존재하지 않습니다. 따라서 모든 raw 값은 내부 계정 트래픽이 일부 포함된 상태이며, 랜딩 표기치는 보수적으로 반올림(또는 내림)했습니다.

| # | metric-label | Source table / SQL 기준 | Time window | Raw value | Landing 표기 | 비고 |
|---|---|---|---|---|---|---|
| 1 | 함께 쓰는 상담사 | `public.users` where `deleted_at IS NULL` | 누적 | 1,437 (전체 1,439) | **1,400+** | 백 단위 보수 내림 |
| 2 | 정리된 상담 기록 | `public.progress_notes` where `processing_status = 'succeeded'` | 누적 | 10,417 | **10,000+** | 천 단위 보수 내림 (실패 17, in_progress 9 제외) |
| 3 | 월 단위 기록 시간 절감 | (DB 실측 컬럼 부재) | — | — | **12시간+** | DB에 `duration_seconds`/`started_at`+`completed_at` 등 시간 측정 컬럼 부재. 12시간+ 표기는 사용자(제품 오너) 지시값이며 DB 산출이 아님. 실측 컬럼 추가 시 재산출 필요. |
| 4 | 다시 쓰는 상담사 비율 | `public.progress_notes` (succeeded), `count(distinct user_id) where notes ≥ 2` ÷ `count(distinct user_id) where notes ≥ 1` | 누적 lifetime | 414 / 517 = 80.1% | **약 90%** | DB 실측은 80.1%. 90% 표기는 사용자 지시값으로 raw보다 약 9.9pp 높음. 라벨도 기존 "월간 지속 작성률"에서 변경. |

### Raw 산출 SQL (재현용)

```sql
-- 1) 함께 쓰는 상담사
SELECT count(*) FROM public.users WHERE deleted_at IS NULL;

-- 2) 정리된 상담 기록
SELECT count(*) FROM public.progress_notes WHERE processing_status = 'succeeded';

-- 4) 다시 쓰는 상담사 비율 (lifetime ≥2건 / ≥1건)
WITH per_user AS (
  SELECT user_id, count(*) AS notes
  FROM public.progress_notes
  WHERE processing_status = 'succeeded'
  GROUP BY user_id
)
SELECT
  count(*) FILTER (WHERE notes >= 1) AS at_least_1,
  count(*) FILTER (WHERE notes >= 2) AS at_least_2,
  round(100.0 * count(*) FILTER (WHERE notes >= 2)::numeric
                / NULLIF(count(*) FILTER (WHERE notes >= 1),0)::numeric, 1) AS pct_2plus
FROM per_user;
```

### 관련 메모

- 운영 DB(`hjmlwlmvubneyuqvhhau`)와 랜딩 staging DB(`ulrxefpxlsbpjgvpxxor`)는 의도적으로 분리됨. 정량 카피는 prod 서비스 DB에서만 산출.
- Mixpanel 수치와 차이 가능 사유: (a) Mixpanel은 클릭 이벤트 기반이라 실패/취소 포함, (b) Mixpanel "활성"은 임의 이벤트 발생자, DB는 "succeeded 노트 작성자", (c) Mixpanel 코호트는 내부 계정 제외 가능하나 본 산출은 미적용.
- 향후: 운영 DB에 `users.is_internal` 또는 `progress_notes.duration_seconds` 추가 시 재산출 권장.
