import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * 쿠키 없는 Supabase 클라이언트 (정적 생성용)
 * cookies()를 사용하지 않으므로 generateStaticParams + SSG에서 사용 가능
 * 공개 읽기 전용 쿼리(블로그 목록, 카테고리 등)에만 사용
 */
export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
