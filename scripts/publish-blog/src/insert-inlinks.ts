/**
 * insert-inlinks.ts — content.json 본문에 기존 발행 글 인링크 삽입
 *
 * 마음토스 블로그 자동 발행 파이프라인 보조 스크립트. Claude CLI 가 직접
 * DB 를 못 보는 경우에 본 스크립트가 키워드 매칭 → 후보 조회 → 마크다운 링크
 * 삽입까지 자동 수행.
 *
 * 삽입 규칙:
 *   - 각 키워드의 첫 번째 등장 위치만 링크
 *   - 최대 4개 인링크
 *   - H1/H2/H3 / 코드블록 안에는 삽입하지 않음
 *   - 이미 마크다운 링크인 텍스트 스킵
 *   - 한 문단에 2개 이상 링크 금지
 *   - 긴 키워드 우선 매칭
 *
 * 사용법:
 *   npx tsx scripts/publish-blog/src/insert-inlinks.ts
 *   npx tsx scripts/publish-blog/src/insert-inlinks.ts --content path/to/content.json
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const ENV_PATH = resolve(REPO_ROOT, 'web', '.env.local');
config({ path: ENV_PATH });

const DEFAULT_CONTENT_PATH = resolve(__dirname, '..', 'content.json');
const MAX_INLINKS = 4;

/**
 * 마음토스 블로그 도메인 — 상담사·임상가 대상 핵심 용어.
 * 본문에 등장하면 인링크 후보로 채택. content.keywords 와 별개.
 */
const CLINICAL_TERMS = [
  // 상담 기법·이론
  '사례개념화', '작업동맹', '라포', '치료동맹', '슈퍼비전', '슈퍼바이저',
  '인지행동치료', 'CBT', '변증법적 행동치료', 'DBT', '수용전념치료', 'ACT',
  '정서중심치료', 'EFT', '동기강화', '동기강화상담', 'MI', 'EMDR',
  '해결중심', '해결중심 단기치료', '이야기치료', '게슈탈트', '정신분석',
  '대상관계', '애착이론', '회피형 애착', '불안형 애착', '안정 애착',
  '내적작동모델', '전이', '역전이', '저항', '방어기제',
  // 임상 실무
  '초기상담', '구조화', '회기', '상담 종결', '내담자 저항', '상담 윤리',
  '비밀보장', '경계 설정', '이중관계', '위기개입', '자해', '자살예방',
  '트라우마', 'PTSD', '복합 PTSD', '외상', '재경험',
  '진단', 'DSM', 'DSM-5', '심리평가', 'MMPI', 'TCI', '로르샤흐',
  // 영역·대상
  '부부치료', '가족치료', '가족체계', '제노그램', '놀이치료', '미술치료',
  '아동상담', '청소년상담', '학교상담', '집단상담', '온라인 상담',
  // 자기돌봄·소진
  '상담사 소진', '대리외상', '공감 피로', '자기돌봄',
  // 자격·진로
  '청소년상담사', '임상심리사', '상담심리사', '전문상담사', '학점은행제',
  '수련', '수련감독', '슈퍼바이지', '개업', '프리랜서',
  // 운영
  'EAP', '바우처', '실손보험', '심리상담 바우처', '전국민 마음투자',
  // 마음토스 제품
  '축어록', '진행기록', '사례개념화 AI', '제노그램 자동화', '음성 인식',
];

interface ContentJson {
  categorySlug: string;
  targetAudience?: string;
  status?: string;
  content: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    keywords?: string[];
    [k: string]: any;
  };
  [k: string]: any;
}

interface CandidatePost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  keywords: string[];
}

interface InlinkPlan {
  keyword: string;
  matchKeyword: string;
  url: string;
  postTitle: string;
  postSlug: string;
}

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(`❌ Supabase 환경변수 누락 (확인: ${ENV_PATH})`);
    process.exit(1);
  }
  return createClient(url, key);
}

function extractCandidateKeywords(
  contentText: string,
  contentKeywords: string[],
  primaryKeyword: string,
): string[] {
  const lowerContent = contentText.toLowerCase();
  const primary = primaryKeyword.toLowerCase().trim();

  const pool = new Set<string>();
  for (const kw of contentKeywords) {
    if (!kw) continue;
    pool.add(kw.trim());
  }
  for (const term of CLINICAL_TERMS) {
    if (lowerContent.includes(term.toLowerCase())) {
      pool.add(term);
    }
  }

  const filtered: string[] = [];
  for (const kw of pool) {
    const k = kw.toLowerCase().trim();
    if (!k) continue;
    if (k === primary) continue;
    if (primary.length >= 3 && k.length >= 3) {
      if (primary.includes(k) || k.includes(primary)) continue;
    }
    if (!lowerContent.includes(k)) continue;
    filtered.push(kw);
  }

  filtered.sort((a, b) => b.length - a.length);
  return filtered;
}

async function fetchCandidatePosts(
  supabase: any,
  keyword: string,
  excludeSlug: string,
): Promise<CandidatePost[]> {
  // 1차: keywords 배열에 정확히 포함된 글
  const { data: byArr, error: e1 } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, keywords')
    .eq('status', 'published')
    .neq('slug', excludeSlug)
    .contains('keywords', [keyword])
    .order('published_at', { ascending: false })
    .limit(5);

  let candidates: any[] = [];
  if (!e1 && byArr) candidates = byArr;

  // 2차: title ilike 폴백
  if (candidates.length < 1) {
    const { data: byTitle } = await supabase
      .from('posts')
      .select('id, slug, title, excerpt, keywords')
      .eq('status', 'published')
      .neq('slug', excludeSlug)
      .ilike('title', `%${keyword}%`)
      .order('published_at', { ascending: false })
      .limit(3);
    if (byTitle) candidates = candidates.concat(byTitle);
  }

  const seen = new Set<string>();
  const unique: CandidatePost[] = [];
  for (const p of candidates) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? null,
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
    });
  }
  return unique;
}

function pickBestCandidate(
  candidates: CandidatePost[],
  keyword: string,
): CandidatePost | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const k = keyword.toLowerCase();
  let best: CandidatePost | null = null;
  let bestScore = -1;
  for (const c of candidates) {
    let score = 0;
    if (c.title.toLowerCase().includes(k)) score += 3;
    if ((c.excerpt || '').toLowerCase().includes(k)) score += 2;
    if (c.keywords.some((kw) => kw.toLowerCase() === k)) score += 1;
    if (c.slug.split('-').length <= 4) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

interface InsertResult {
  newContent: string;
  applied: InlinkPlan[];
  skipped: { keyword: string; reason: string }[];
}

function insertInlinksIntoContent(content: string, plans: InlinkPlan[]): InsertResult {
  const lines = content.split('\n');
  const applied: InlinkPlan[] = [];
  const skipped: { keyword: string; reason: string }[] = [];

  const paragraphIds: number[] = [];
  let paragraphId = 0;
  let inEmptyRun = true;
  for (const line of lines) {
    if (line.trim() === '') {
      paragraphIds.push(-1);
      inEmptyRun = true;
    } else {
      if (inEmptyRun) {
        paragraphId++;
        inEmptyRun = false;
      }
      paragraphIds.push(paragraphId);
    }
  }
  const paragraphLinkCount: Record<number, number> = {};
  const linkedKeywords = new Set<string>();
  const linkedUrls = new Set<string>();

  for (const plan of plans) {
    if (applied.length >= MAX_INLINKS) break;
    const kw = plan.keyword;
    if (linkedKeywords.has(kw.toLowerCase())) {
      skipped.push({ keyword: kw, reason: '이미 같은 키워드 링크됨' });
      continue;
    }
    if (linkedUrls.has(plan.url)) {
      skipped.push({ keyword: kw, reason: '이미 같은 URL로 링크됨' });
      continue;
    }

    let inserted = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^#{1,6}\s/.test(trimmed)) continue;
      if (/^```/.test(trimmed)) continue;

      const pid = paragraphIds[i];
      if (pid <= 0) continue;
      if ((paragraphLinkCount[pid] || 0) >= 1) continue;

      const result = insertLinkOnLine(line, kw, plan.url);
      if (result) {
        lines[i] = result;
        paragraphLinkCount[pid] = (paragraphLinkCount[pid] || 0) + 1;
        linkedKeywords.add(kw.toLowerCase());
        linkedUrls.add(plan.url);
        applied.push(plan);
        inserted = true;
        break;
      }
    }
    if (!inserted) skipped.push({ keyword: kw, reason: '본문에서 삽입 위치 없음' });
  }

  return { newContent: lines.join('\n'), applied, skipped };
}

function insertLinkOnLine(line: string, keyword: string, url: string): string | null {
  const idx = line.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx < 0) return null;
  if (isInsideMarkdownLink(line, idx)) return null;

  const before = line.slice(0, idx);
  const after = line.slice(idx + keyword.length);
  if (before.endsWith('[') && after.startsWith(']')) return null;

  const realKw = line.substring(idx, idx + keyword.length);
  return before + `[${realKw}](${url})` + after;
}

function isInsideMarkdownLink(line: string, pos: number): boolean {
  const pattern = /\[[^\]]*\]\([^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(line)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (pos >= start && pos < end) return true;
  }
  return false;
}

async function main() {
  console.log('=== 인링크 삽입 (마음토스) ===\n');

  const args = process.argv.slice(2);
  const contentArgIdx = args.indexOf('--content');
  const contentPath =
    contentArgIdx !== -1 && args[contentArgIdx + 1]
      ? resolve(args[contentArgIdx + 1])
      : DEFAULT_CONTENT_PATH;

  if (!existsSync(contentPath)) {
    console.error(`❌ content.json 없음: ${contentPath}`);
    process.exit(1);
  }

  const raw = readFileSync(contentPath, 'utf-8');
  let json: ContentJson;
  try {
    json = JSON.parse(raw);
  } catch (e: any) {
    console.error('❌ content.json 파싱 실패:', e.message);
    process.exit(1);
  }

  const content = json.content;
  if (!content?.content || !content?.slug) {
    console.error('❌ content.content / content.slug 필수');
    process.exit(1);
  }

  const primaryKeyword = (content.keywords && content.keywords[0]) || content.title || '';
  console.log(`📝 대상 글: ${content.title} (slug: ${content.slug})`);
  console.log(`🔑 핵심 키워드: ${primaryKeyword}`);

  const contentKeywords = Array.isArray(content.keywords) ? content.keywords : [];
  const candidates = extractCandidateKeywords(
    content.content,
    contentKeywords,
    primaryKeyword,
  );

  if (candidates.length === 0) {
    console.log('⏭️ 후보 키워드 없음 — 스킵');
    return;
  }
  console.log(`\n🔍 후보 키워드 ${candidates.length}개 (긴 키워드 우선):`);
  for (const k of candidates.slice(0, 12)) console.log(`  - ${k}`);

  const supabase = createSupabase();
  const plans: InlinkPlan[] = [];
  const usedSlugs = new Set<string>([content.slug]);

  for (const kw of candidates) {
    if (plans.length >= MAX_INLINKS * 2) break;
    const found = await fetchCandidatePosts(supabase, kw, content.slug);
    const filtered = found.filter((c) => !usedSlugs.has(c.slug));
    if (filtered.length === 0) continue;
    const best = pickBestCandidate(filtered, kw);
    if (!best) continue;
    // 마음토스 블로그 URL 은 카테고리 prefix 없음 — /blog/<slug>
    const url = `/blog/${best.slug}`;
    plans.push({
      keyword: kw,
      matchKeyword: kw,
      url,
      postTitle: best.title,
      postSlug: best.slug,
    });
    usedSlugs.add(best.slug);
  }

  if (plans.length === 0) {
    console.log('\n⏭️ 인링크 후보 글 없음 — 스킵');
    return;
  }

  console.log(`\n🎯 인링크 후보 ${plans.length}개:`);
  for (const p of plans) {
    console.log(`  - "${p.keyword}" → ${p.url} (${p.postTitle})`);
  }

  const { newContent, applied, skipped } = insertInlinksIntoContent(content.content, plans);

  console.log(`\n✅ 삽입 ${applied.length}개:`);
  for (const a of applied) console.log(`  - "${a.keyword}" → ${a.url}`);
  if (skipped.length > 0) {
    console.log(`\n⏭️ 스킵 ${skipped.length}:`);
    for (const s of skipped) console.log(`  - "${s.keyword}" — ${s.reason}`);
  }

  if (applied.length === 0) {
    console.log('\n⚠️ 실제 삽입 0개');
    return;
  }

  json.content.content = newContent;
  writeFileSync(contentPath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`\n💾 ${contentPath}`);
}

main().catch((err) => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
