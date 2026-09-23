import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * service_role 클라이언트 — RLS 를 우회하므로 서버 전용(API Route)이며
 * 절대 클라이언트 번들에 import 하면 안 된다.
 * 결제 승인(/api/webinar/confirm)처럼 anon 정책으로 불가능한 UPDATE 에만 사용.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
