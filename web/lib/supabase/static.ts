import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * 쿠키 없이 동작하는 Supabase 클라이언트 (정적 생성용).
 * generateStaticParams / sitemap.ts / robots.ts 처럼 빌드 타임에 호출되는 곳에서 사용.
 * 공개 읽기 쿼리(블로그 목록 등)에만 사용하세요.
 */
export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
