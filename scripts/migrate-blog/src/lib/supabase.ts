import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!URL || !KEY) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.'
  );
}

export function createServiceClient(): SupabaseClient {
  return createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'blog-images';
export const STORAGE_PUBLIC_PREFIX = `${URL}/storage/v1/object/public/${STORAGE_BUCKET}`;
