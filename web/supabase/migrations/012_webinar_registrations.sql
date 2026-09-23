-- 012: 웨비나 신청 + 토스페이먼츠 결제 기록
--
-- 흐름:
--   1) /api/webinar/register  — 신청 폼 제출 시 pending 행 insert (anon)
--   2) 토스페이먼츠 결제창 → successUrl 리다이렉트
--   3) /api/webinar/confirm   — 토스 결제 승인 후 status='paid' 갱신 (service_role)
--
-- RLS: anon 은 insert 만 가능 (SELECT/UPDATE 불가 — 개인정보 보호).
--      상태 갱신은 service_role(SUPABASE_SERVICE_ROLE_KEY) 전용.

create table if not exists public.webinar_registrations (
  id uuid primary key default gen_random_uuid(),
  webinar_slug text not null,
  order_id text not null unique,
  name text not null,
  email text not null,
  phone text not null,
  amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'canceled')),
  payment_key text,
  paid_at timestamptz,
  fail_reason text,
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists webinar_registrations_slug_status_idx
  on public.webinar_registrations (webinar_slug, status);

alter table public.webinar_registrations enable row level security;

-- 신청 접수: 익명 방문자가 pending 행을 만들 수 있어야 한다.
create policy "webinar_registrations_anon_insert"
  on public.webinar_registrations
  for insert
  to anon
  with check (status = 'pending');

-- 운영 조회: 로그인된 운영자만 열람.
create policy "webinar_registrations_authenticated_select"
  on public.webinar_registrations
  for select
  to authenticated
  using (true);
