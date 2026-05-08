-- ============================================
-- 006 — academy_inquiries (전문상담사 2급 올인원 패스 문의)
-- ============================================
-- /academy 페이지의 "수련 문의하기" 폼 백엔드 저장소.
-- - 익명 인서트 허용(공개 폼) / 인증 사용자만 조회.
-- - 운영자는 Supabase Studio 에서 status 컬럼으로 응대 진행 추적.
-- ============================================

CREATE TABLE academy_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  /* 학점 이수 여부 (폼 셀렉트 옵션) */
  credit_status TEXT NOT NULL CHECK (
    credit_status IN ('completed', 'in-progress', 'not-yet', 'unsure')
  ),

  name TEXT NOT NULL,
  phone TEXT NOT NULL,

  /* 어떤 페이지에서 제출됐는지 추적용 */
  source_url TEXT,

  /* UTM 트래킹 (마케팅 캠페인 분석용) */
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  user_agent TEXT,

  /* 응대 진행 상태 */
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'contacted', 'enrolled', 'closed')
  ),

  /* 운영자 메모 */
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_academy_inquiries_status_created
  ON academy_inquiries(status, created_at DESC);
CREATE INDEX idx_academy_inquiries_created
  ON academy_inquiries(created_at DESC);

-- RLS
ALTER TABLE academy_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit academy inquiries"
  ON academy_inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated can read academy inquiries"
  ON academy_inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage academy inquiries"
  ON academy_inquiries
  FOR UPDATE
  USING (auth.role() = 'authenticated');
