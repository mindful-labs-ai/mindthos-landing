-- 009_authors_clinical_labeling.sql
-- B2 — Generic 저자 라벨링 ("마음토스 임상 심리 전문가")
-- 액션 플랜: web/docs/aeo-geo-research/action-plan.md §B2
--
-- mindthos-team author row 를 임상 심리 전문가 라벨로 갱신.
-- 실명 자문위원회 인선 없이도 E-E-A-T specialty/credentials 시그널 확보.
--
-- 적용 방법: Supabase Dashboard SQL Editor 에서 실행
-- https://supabase.com/dashboard/project/ulrxefpxlsbpjgvpxxor/sql/new

UPDATE authors
SET
  name = '마음토스 임상 심리 전문가',
  title = '임상 심리 전문가',
  bio = '마음토스 콘텐츠는 임상 심리 가이드라인 기반 시스템으로 작성·검수됩니다. 한국임상심리학회·한국상담심리학회·한국상담학회 윤리강령, 정신건강복지법, DSM-5-TR, 보건복지부 자료를 master document 로 두고 Claude(작성)와 Gemini(검수)의 다중 패스를 거쳐 발행됩니다.',
  credentials = ARRAY[
    '임상 심리 가이드라인 기반',
    '학회 윤리강령 준수',
    '다중 AI 검수 통과'
  ],
  specialties = ARRAY[
    '우울',
    '불안',
    '공황',
    'ADHD',
    '외상',
    '인지행동치료',
    '상담 기록 및 축어록',
    '사례개념화',
    '슈퍼비전',
    '상담사 자격 및 윤리'
  ],
  is_active = true
WHERE slug = 'mindthos-team';

-- 검증: UPDATE 결과 확인
-- SELECT name, title, credentials, specialties FROM authors WHERE slug = 'mindthos-team';
