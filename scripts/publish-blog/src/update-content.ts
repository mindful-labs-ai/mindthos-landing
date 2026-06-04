/**
 * update-content.ts — 발행된 글의 content 컬럼만 content.json 기준으로 UPDATE 후 revalidate.
 * 사용법: npx tsx scripts/publish-blog/src/update-content.ts
 */
import 'dotenv/config';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
config({ path: resolve(REPO_ROOT, 'web', '.env.local') });

const DEFAULT_SITE_URL = 'https://mindthos.com';

async function main() {
  const json = JSON.parse(
    readFileSync(resolve(__dirname, '..', 'content.json'), 'utf-8'),
  );
  const { slug, content, faq } = json.content;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const payload: Record<string, any> = { content };
  if (Array.isArray(faq) && faq.length) {
    payload.schema_markup = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f: any) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
  }

  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('slug', slug)
    .select('id, slug')
    .single();

  if (error) {
    console.error('❌ UPDATE 실패:', error.message);
    process.exit(1);
  }
  console.log(`✅ content UPDATE 완료: ${data.slug} (${data.id})`);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

  if (process.env.REVALIDATION_SECRET) {
    const wwwUrl = siteUrl.replace('://', '://www.').replace('www.www.', 'www.');
    const res = await fetch(`${wwwUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.REVALIDATION_SECRET,
        paths: [`/blog/${slug}`, '/blog'],
      }),
    });
    console.log(`  Revalidate: ${res.ok ? '✅' : '⚠️'} HTTP ${res.status}`);
  }

  if (process.env.INDEXNOW_KEY) {
    const host = new URL(siteUrl).hostname;
    const urlList = [`${siteUrl}/blog/${slug}`, `${siteUrl}/blog`, `${siteUrl}/sitemap.xml`];
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: process.env.INDEXNOW_KEY,
        keyLocation: `${siteUrl}/${process.env.INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    console.log(`  IndexNow: ${res.ok || res.status === 202 ? '✅' : '⚠️'} HTTP ${res.status} (${urlList.length} URLs)`);
  }
}

main().catch((err) => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
