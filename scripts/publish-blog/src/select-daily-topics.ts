/**
 * select-daily-topics.ts — 마음토스 일일 블로그 주제 선정
 *
 * 사용법:
 *   npx tsx scripts/publish-blog/src/select-daily-topics.ts
 *   npx tsx scripts/publish-blog/src/select-daily-topics.ts --count 5
 *   npx tsx scripts/publish-blog/src/select-daily-topics.ts --dry-run
 *
 * 출력: scripts/publish-blog/daily-topics.json
 *
 * 동작 요약:
 *   1. web/context/target-keywords.md 를 baseline 풀로 파싱 (전체 카테고리 보장)
 *   2. opportunity_scorer.py 로 점수 보강 (실패해도 baseline 유지)
 *   3. Supabase posts.published/draft 키워드와 Jaccard 유사도 비교 — 중복 회피
 *   4. 카테고리/독자/롱테일/상업형 쿼터를 strict → relaxed 2-pass 로 채움
 *
 * 필요 환경변수 (web/.env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// scripts/publish-blog/src/ → 레포 루트
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const ENV_PATH = resolve(REPO_ROOT, 'web', '.env.local');
config({ path: ENV_PATH });

const PUBLISH_DIR = resolve(__dirname, '..');
const SCORER_PATH = resolve(REPO_ROOT, 'scripts', 'seo-analysis', 'opportunity_scorer.py');
const TARGET_KEYWORDS_PATH = resolve(REPO_ROOT, 'web', 'context', 'target-keywords.md');
const SCORED_CACHE_PATH = resolve(PUBLISH_DIR, 'seo-opportunities.json');
const OUTPUT_PATH = resolve(PUBLISH_DIR, 'daily-topics.json');

// ------------------------------------------------------------------
// 카테고리 / 독자 매핑 (마음토스)
// ------------------------------------------------------------------
const CATEGORIES = [
  'case-conceptualization',
  'counseling-skills',
  'training',
  'career',
  'operations',
  'self-care',
  'trends',
  'tech-blog',
] as const;
type Category = (typeof CATEGORIES)[number];

type Audience = 'counselor' | 'institution' | 'general';

// 카테고리 → 기본 타겟 독자
//   tech-blog → institution (기관 도입 담당자)
//   self-care, trends → general (newsletter CTA)
//   나머지 → counselor (free-trial CTA)
function audienceOf(category: string): Audience {
  if (category === 'tech-blog') return 'institution';
  if (category === 'self-care' || category === 'trends') return 'general';
  return 'counselor';
}

// 검색 의도 분류
//   mindthos target-keywords.md: "정보형" / "상업" / "상업형" / "거래형" / "탐색"
function isCommercialIntent(intent: string | undefined): boolean {
  if (!intent) return false;
  return intent.includes('상업') || intent.includes('거래');
}

// ------------------------------------------------------------------
// Format 분류 — article / listicle / guide
// 액션 플랜 §B4 / ai-review-workflow.md
// AI 인용 데이터(Evertune): 전체 인용 63% / 상업 쿼리 40.86% 가 listicle
// ------------------------------------------------------------------
type PostFormat = 'article' | 'listicle' | 'guide';

const LISTICLE_PATTERN =
  /추천|비교|랭킹|순위|best|top\s*\d|vs(?![a-z])|장단점|차이점|선택\s*가이드|뭐가\s*좋|어떤\s*게\s*좋|어떤것이\s*좋/i;
const GUIDE_PATTERN =
  /완벽\s*가이드|총정리|올인원|마스터(?:\s*가이드)?|길라잡이|모든\s*것|모든\s*절차/i;

function inferFormat(keyword: string, intent: string | undefined): PostFormat {
  if (LISTICLE_PATTERN.test(keyword)) return 'listicle';
  if (GUIDE_PATTERN.test(keyword)) return 'guide';
  // 상업·거래 의도 + 짧은 키워드 (단답 비교성) → listicle 후보
  if (isCommercialIntent(intent) && keyword.length <= 25) return 'listicle';
  return 'article';
}

/**
 * 최근 30일 발행 분포에서 누락된 format 의 deficit 을 고려해
 * 이번 배치의 동적 목표 비율을 계산.
 *
 * 기본 목표: article 60% / listicle 30% / guide 10%
 * 최근 분포에서 벗어난 만큼 damp(0.5) 비율로 보정.
 */
function computeFormatTarget(
  targetCount: number,
  recentDist: Record<PostFormat, number>,
): Record<PostFormat, number> {
  const BASE = { article: 0.6, listicle: 0.3, guide: 0.1 } as const;
  const DAMP = 0.5;

  // dynamic ratio
  const ratio: Record<PostFormat, number> = {
    article: BASE.article + (BASE.article - recentDist.article) * DAMP,
    listicle: BASE.listicle + (BASE.listicle - recentDist.listicle) * DAMP,
    guide: BASE.guide + (BASE.guide - recentDist.guide) * DAMP,
  };

  // 음수 방지
  for (const k of Object.keys(ratio) as PostFormat[]) {
    if (ratio[k] < 0) ratio[k] = 0;
  }

  // 합 1로 정규화
  const total = ratio.article + ratio.listicle + ratio.guide;
  for (const k of Object.keys(ratio) as PostFormat[]) ratio[k] = ratio[k] / total;

  // 절대 슬롯 수 — listicle 우선 배분 (반올림 오차로 listicle 가 0 되는 것 방지)
  const listicleSlots = Math.max(
    targetCount >= 4 ? 1 : 0,
    Math.round(targetCount * ratio.listicle),
  );
  const guideSlots = Math.max(
    targetCount >= 10 ? 1 : 0,
    Math.round(targetCount * ratio.guide),
  );
  const articleSlots = Math.max(0, targetCount - listicleSlots - guideSlots);

  return { article: articleSlots, listicle: listicleSlots, guide: guideSlots };
}

// ------------------------------------------------------------------
// 타입
// ------------------------------------------------------------------
interface ScoredKeyword {
  keyword: string;
  category: string;
  type: 'core' | 'longtail';
  intent: string;
  volume: number;
  competition: number;
  opportunity_score: number;
}

interface TopicItem {
  keyword: string;
  category: Category;
  type: 'core' | 'longtail';
  audience: Audience;
  format: PostFormat;
  opportunity_score: number;
}

interface DailyTopicsOutput {
  generated_at: string;
  total_selected: number;
  warning?: string;
  topics: TopicItem[];
}

// ------------------------------------------------------------------
// Supabase
// ------------------------------------------------------------------
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

async function fetchExistingPosts(): Promise<{
  slugs: Set<string>;
  keywords: string[];
  recentFormatDist: Record<PostFormat, number>;
}> {
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('slug, title, keywords')
    .in('status', ['published', 'draft']);

  if (error) {
    console.warn('⚠️ 기존 포스트 조회 실패 — 중복 검사 생략:', error.message);
    return {
      slugs: new Set(),
      keywords: [],
      recentFormatDist: { article: 0.6, listicle: 0.3, guide: 0.1 },
    };
  }

  const slugs = new Set<string>((data || []).map((p: any) => p.slug as string));
  const keywords: string[] = [];
  for (const post of data || []) {
    if (Array.isArray(post.keywords)) {
      keywords.push(...(post.keywords as string[]));
    }
    if (post.title) keywords.push(post.title as string);
  }

  // 최근 30일 발행 format 분포 — 동적 quota 계산용
  // posts.format 컬럼 (마이그레이션 010) 가 적용된 경우만 의미 있는 데이터
  let recentFormatDist: Record<PostFormat, number> = { article: 0.6, listicle: 0.3, guide: 0.1 };
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from('posts')
      .select('format')
      .eq('status', 'published')
      .gte('published_at', thirtyDaysAgo);
    if (recentErr) {
      console.warn(`⚠️ 최근 30일 format 분포 조회 실패 — 기본 비율 사용: ${recentErr.message}`);
    } else if (recent && recent.length > 0) {
      const counts = { article: 0, listicle: 0, guide: 0 };
      for (const r of recent as { format: string | null }[]) {
        const f = (r.format ?? 'article') as PostFormat;
        if (f in counts) counts[f]++;
        else counts.article++;
      }
      const total = recent.length;
      recentFormatDist = {
        article: counts.article / total,
        listicle: counts.listicle / total,
        guide: counts.guide / total,
      };
    }
  } catch (e: any) {
    // format 컬럼이 아직 없으면(마이그레이션 미적용) 기본 비율 사용
    console.warn(`⚠️ posts.format 컬럼 미적용으로 추정 — 기본 비율 사용 (${e?.message ?? e})`);
  }

  return { slugs, keywords, recentFormatDist };
}

// ------------------------------------------------------------------
// Jaccard 단어 유사도 (0.7 이상이면 중복)
// ------------------------------------------------------------------
const SIMILARITY_THRESHOLD = 0.7;

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .trim()
    .split(/[\s\p{P}\p{S}]+/u)
    .filter((w) => w.length > 0);
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const sa = new Set(a);
  const sb = new Set(b);
  let intersect = 0;
  for (const t of sa) if (sb.has(t)) intersect++;
  const union = sa.size + sb.size - intersect;
  return union === 0 ? 0 : intersect / union;
}

function isTooSimilar(candidate: string, existing: string[]): boolean {
  const c = candidate.toLowerCase().trim();
  const cTokens = tokenize(c);
  for (const e of existing) {
    const ee = e.toLowerCase().trim();
    if (!ee) continue;
    if (c === ee) return true;
    if (jaccard(cTokens, tokenize(ee)) >= SIMILARITY_THRESHOLD) return true;
  }
  return false;
}

// ------------------------------------------------------------------
// target-keywords.md 파서 (마음토스 3-컬럼 테이블 + 롱테일)
// ------------------------------------------------------------------
function loadKeywordsFromMarkdown(): ScoredKeyword[] {
  if (!existsSync(TARGET_KEYWORDS_PATH)) {
    console.error(`❌ ${TARGET_KEYWORDS_PATH} 파일이 없습니다`);
    return [];
  }
  const text = readFileSync(TARGET_KEYWORDS_PATH, 'utf-8');
  const keywords: ScoredKeyword[] = [];
  const seen = new Set<string>();
  let currentCategory = '';
  let inCategorySection = false;

  // `### 1. case-conceptualization (...)` 같은 헤더
  const categoryPattern = /^###\s+\d+\.\s+([\w\-]+)/;
  // 롱테일: `- "..."`
  const longtailPattern = /^-\s+"([^"]+)"/;
  // 테이블 헤더 셀에 들어가면 키워드가 아님
  const headerCellsToSkip = new Set([
    '키워드', '의도', '비고', '의도 유형', '시기', '키워드 클러스터',
    '주목 키워드', '이유', '검색 의도', '월간 검색량', '경쟁도', 'CPC',
  ]);

  for (const rawLine of text.split('\n')) {
    const stripped = rawLine.trim();

    // 카테고리 시작
    const catMatch = categoryPattern.exec(stripped);
    if (catMatch) {
      inCategorySection = true;
      currentCategory = catMatch[1].toLowerCase();
      continue;
    }

    // `## `(level 2) 가 다시 나오면 카테고리 영역 종료
    if (inCategorySection && stripped.startsWith('## ') && !stripped.startsWith('###')) {
      inCategorySection = false;
      continue;
    }
    if (!inCategorySection) continue;

    // 테이블 본문 행
    if (stripped.startsWith('|') && !stripped.startsWith('|---')) {
      const cells = stripped.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length < 2) continue;
      const kw = cells[0];
      if (headerCellsToSkip.has(kw)) continue;
      if (!kw || kw.startsWith('-')) continue;

      const key = `${currentCategory}:${kw}`;
      if (!seen.has(key)) {
        seen.add(key);
        keywords.push({
          keyword: kw,
          category: currentCategory,
          type: 'core',
          // 마음토스 테이블 두 번째 컬럼이 "의도"
          intent: cells[1] || '정보형',
          volume: 0,
          competition: 0.5,
          opportunity_score: 50,
        });
      }
      continue;
    }

    // 롱테일 ("...")
    const ltMatch = longtailPattern.exec(stripped);
    if (ltMatch) {
      const kw = ltMatch[1];
      const key = `${currentCategory}:${kw}`;
      if (!seen.has(key)) {
        seen.add(key);
        keywords.push({
          keyword: kw,
          category: currentCategory,
          type: 'longtail',
          intent: '정보형',
          volume: 0,
          competition: 0.3,
          opportunity_score: 45,
        });
      }
    }
  }
  console.log(`  target-keywords.md에서 ${keywords.length}개 키워드 파싱 완료`);
  return keywords;
}

// ------------------------------------------------------------------
// 점수 보강 (opportunity_scorer.py 호출 → JSON 머지)
// ------------------------------------------------------------------
function loadScoredKeywords(): ScoredKeyword[] {
  console.log('📊 키워드 풀 로드 중...');
  const baseline = loadKeywordsFromMarkdown();
  if (baseline.length === 0) return [];

  let scored: ScoredKeyword[] = [];
  try {
    execSync(
      `python3 "${SCORER_PATH}" --top 300 --output "${SCORED_CACHE_PATH}"`,
      {
        encoding: 'utf-8',
        cwd: REPO_ROOT,
        timeout: 120_000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );
    console.log('✅ DataForSEO 기회 점수 산출 완료 — 보강 적용');
  } catch {
    if (existsSync(SCORED_CACHE_PATH)) {
      console.warn('⚠️ DataForSEO API 실패 — 기존 캐시 점수로 보강');
    } else {
      console.warn('⚠️ 점수 파일 없음 — 모든 키워드 기본 점수(50) 사용');
    }
  }

  if (existsSync(SCORED_CACHE_PATH)) {
    try {
      const raw = JSON.parse(readFileSync(SCORED_CACHE_PATH, 'utf-8'));
      scored = raw.all_scored || raw.top_opportunities || [];
    } catch {
      console.warn('⚠️ 점수 파일 파싱 실패 — baseline 점수만 사용');
    }
  }

  // baseline 의 카테고리를 정답으로 보고, 점수만 보강
  const byKey = new Map<string, ScoredKeyword>();
  for (const k of baseline) byKey.set(k.keyword, k);

  let enriched = 0;
  for (const s of scored) {
    const existing = byKey.get(s.keyword);
    if (existing) {
      byKey.set(s.keyword, {
        ...existing,
        intent: s.intent || existing.intent,
        volume: s.volume || existing.volume,
        competition: s.competition ?? existing.competition,
        opportunity_score: s.opportunity_score ?? existing.opportunity_score,
      });
      enriched++;
    } else {
      // 점수 데이터에만 존재하는 키워드도 풀에 합류
      byKey.set(s.keyword, s);
    }
  }

  const merged = Array.from(byKey.values());
  console.log(`  최종 풀: ${merged.length}개 (baseline ${baseline.length}, 점수 보강 ${enriched})`);
  return merged;
}

// ------------------------------------------------------------------
// 주제 선정 (쿼터 기반 2-pass)
// ------------------------------------------------------------------
function selectTopics(
  scored: ScoredKeyword[],
  existingKeywords: string[],
  targetCount: number,
  recentFormatDist: Record<PostFormat, number>,
): { topics: TopicItem[]; warning?: string } {
  const filtered = scored.filter((kw) => !isTooSimilar(kw.keyword, existingKeywords));
  console.log(`  중복 제거 후: ${filtered.length}개 (전체 ${scored.length}개 중)`);

  // 각 키워드에 미리 format 추정
  const scoredWithFormat = filtered.map((kw) => ({
    ...kw,
    format: inferFormat(kw.keyword, kw.intent),
  }));

  const sorted = [...scoredWithFormat].sort(
    (a, b) => b.opportunity_score - a.opportunity_score,
  );

  // 쿼터
  //   - 카테고리: max(2, ceil(targetCount / 8))
  //   - 독자: counselor 65% / institution 15% / general 20%
  //   - 롱테일 최소 30% / 상업형 최소 20%
  //   - format: 동적 목표 (recentFormatDist 보정)
  const maxPerCategory = Math.max(2, Math.ceil(targetCount / CATEGORIES.length));
  const counselorTarget = Math.max(1, Math.round(targetCount * 0.65));
  const institutionTarget = Math.max(1, Math.round(targetCount * 0.15));
  const generalTarget = Math.max(1, targetCount - counselorTarget - institutionTarget);
  const minLongtail = Math.floor(targetCount * 0.3);
  const minCommercial = Math.max(1, Math.floor(targetCount * 0.2));

  const formatMax = computeFormatTarget(targetCount, recentFormatDist);
  console.log(
    `  최근 30일 분포: article ${(recentFormatDist.article * 100).toFixed(0)}%, ` +
      `listicle ${(recentFormatDist.listicle * 100).toFixed(0)}%, ` +
      `guide ${(recentFormatDist.guide * 100).toFixed(0)}%`,
  );
  console.log(
    `  동적 format 목표 (N=${targetCount}): ` +
      `article ${formatMax.article}, listicle ${formatMax.listicle}, guide ${formatMax.guide}`,
  );

  const audienceMax: Record<Audience, number> = {
    counselor: counselorTarget,
    institution: institutionTarget,
    general: generalTarget,
  };
  const audienceCount: Record<Audience, number> = { counselor: 0, institution: 0, general: 0 };
  const categoryCount: Record<string, number> = {};
  const formatCount: Record<PostFormat, number> = { article: 0, listicle: 0, guide: 0 };
  let longtailCount = 0;
  let commercialCount = 0;
  const selected: TopicItem[] = [];
  const usedKeys = new Set<string>();

  type ScoredWithFormat = ScoredKeyword & { format: PostFormat };

  const tryAdd = (
    kw: ScoredWithFormat,
    opts: { strict: boolean; allowFormatOverflow?: boolean },
  ): boolean => {
    if (selected.length >= targetCount) return false;
    const key = `${kw.category}:${kw.keyword}`;
    if (usedKeys.has(key)) return false;

    const cat = kw.category as Category;
    if (!CATEGORIES.includes(cat)) return false; // 알 수 없는 카테고리 스킵

    const aud = audienceOf(cat);
    const catUsed = categoryCount[cat] || 0;
    const remaining = targetCount - selected.length;
    const isLongtail = kw.type === 'longtail';
    const isCommercial = isCommercialIntent(kw.intent);
    const fmt = kw.format;

    if (opts.strict) {
      if (catUsed >= maxPerCategory && selected.length < targetCount - 2) return false;
      if (audienceCount[aud] >= audienceMax[aud]) return false;
      // format quota — strict 에서는 초과 ❌
      if (formatCount[fmt] >= formatMax[fmt]) return false;
      // 남은 자리가 미달 쿼터를 채울 수 있는 후보만 허용
      const longtailNeeded = Math.max(0, minLongtail - longtailCount);
      const commercialNeeded = Math.max(0, minCommercial - commercialCount);
      const listicleNeeded = Math.max(0, formatMax.listicle - formatCount.listicle);
      const guideNeeded = Math.max(0, formatMax.guide - formatCount.guide);
      if (remaining <= longtailNeeded && !isLongtail) return false;
      if (remaining <= commercialNeeded && !isCommercial) return false;
      if (remaining <= listicleNeeded && fmt !== 'listicle') return false;
      if (remaining <= guideNeeded && fmt !== 'guide') return false;
    } else if (!opts.allowFormatOverflow) {
      // relaxed 단계에서도 format quota 는 상한 유지 (단, 마지막 완전 완화 단계는 예외)
      if (formatCount[fmt] >= formatMax[fmt]) return false;
    }

    selected.push({
      keyword: kw.keyword,
      category: cat,
      type: kw.type as 'core' | 'longtail',
      audience: aud,
      format: fmt,
      opportunity_score: kw.opportunity_score,
    });
    usedKeys.add(key);
    categoryCount[cat] = catUsed + 1;
    audienceCount[aud]++;
    formatCount[fmt]++;
    if (isLongtail) longtailCount++;
    if (isCommercial) commercialCount++;
    return true;
  };

  // Pass 1: 쿼터 엄격 (모든 제약 + format quota 포함)
  for (const kw of sorted) {
    if (selected.length >= targetCount) break;
    tryAdd(kw, { strict: true });
  }

  // Pass 2a: 부족한 format quota 강제 채움 — listicle / guide 부족 시 그 format 키워드 우선
  for (const fmt of ['listicle', 'guide'] as const) {
    while (formatCount[fmt] < formatMax[fmt] && selected.length < targetCount) {
      const candidate = sorted.find(
        (kw) =>
          kw.format === fmt &&
          !usedKeys.has(`${kw.category}:${kw.keyword}`) &&
          CATEGORIES.includes(kw.category as Category),
      );
      if (!candidate) break; // 풀에 해당 format 키워드 없음
      const added = tryAdd(candidate, { strict: false });
      if (!added) break; // 추가 실패 (예: 모든 audience 가 가득)
    }
  }

  // Pass 2b: 부족한 독자 쿼터 채움 — format quota 는 여전히 존중
  if (selected.length < targetCount) {
    for (const kw of sorted) {
      if (selected.length >= targetCount) break;
      const cat = kw.category as Category;
      if (!CATEGORIES.includes(cat)) continue;
      const aud = audienceOf(cat);
      if (audienceCount[aud] >= audienceMax[aud]) continue;
      tryAdd(kw, { strict: false });
    }
  }

  // Pass 2c: 끝까지 부족하면 완전 완화 (format quota·audienceMax 모두 해제)
  if (selected.length < targetCount) {
    for (const kw of sorted) {
      if (selected.length >= targetCount) break;
      tryAdd(kw, { strict: false, allowFormatOverflow: true });
    }
  }

  let warning: string | undefined;
  if (selected.length < targetCount) {
    warning = `선정 가능한 주제가 ${selected.length}개입니다 (요청: ${targetCount}개). 새 키워드 추가를 고려하세요.`;
    console.warn(`⚠️ ${warning}`);
  }

  console.log(
    `  쿼터 결과: counselor=${audienceCount.counselor}/${audienceMax.counselor}, ` +
      `institution=${audienceCount.institution}/${audienceMax.institution}, ` +
      `general=${audienceCount.general}/${audienceMax.general}, ` +
      `longtail=${longtailCount}/${minLongtail}+, commercial=${commercialCount}/${minCommercial}+`,
  );
  console.log(
    `  format 결과: article=${formatCount.article}/${formatMax.article}, ` +
      `listicle=${formatCount.listicle}/${formatMax.listicle}, ` +
      `guide=${formatCount.guide}/${formatMax.guide}`,
  );

  return { topics: selected, warning };
}

// ------------------------------------------------------------------
// 메인
// ------------------------------------------------------------------
async function main() {
  console.log('=== 마음토스 일일 블로그 주제 선정 ===\n');

  const args = process.argv.slice(2);
  const countIdx = args.indexOf('--count');
  const targetCount = countIdx !== -1 ? parseInt(args[countIdx + 1], 10) || 5 : 5;
  const isDryRun = args.includes('--dry-run');

  console.log(`목표 주제 수: ${targetCount}개${isDryRun ? ' (dry-run)' : ''}`);

  const scored = loadScoredKeywords();
  if (scored.length === 0) {
    console.error('❌ 점수화된 키워드가 없습니다. 종료합니다.');
    process.exit(1);
  }

  console.log('\n📄 기존 발행 포스트 조회 중...');
  const {
    slugs,
    keywords: existingKeywords,
    recentFormatDist,
  } = await fetchExistingPosts();
  console.log(`  기존 포스트: ${slugs.size}개`);

  console.log('\n🎯 주제 선정 중...');
  const { topics, warning } = selectTopics(
    scored,
    existingKeywords,
    targetCount,
    recentFormatDist,
  );

  console.log(`\n선정된 주제 ${topics.length}개:`);
  topics.forEach((t, i) => {
    console.log(
      `  ${String(i + 1).padStart(2)}. [${t.opportunity_score.toFixed(0)}점] ${t.keyword} ` +
        `(${t.category}/${t.audience}, ${t.type}, format=${t.format})`,
    );
  });

  if (isDryRun) {
    console.log('\n[dry-run] 파일 저장 생략');
    return;
  }

  const output: DailyTopicsOutput = {
    generated_at: new Date().toISOString(),
    total_selected: topics.length,
    ...(warning ? { warning } : {}),
    topics,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 저장 완료: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
