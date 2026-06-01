/**
 * 슬러그 충돌 가드 — 새 글 슬러그가 기존 글과 겹칠 때 Claude 가 두 글을 비교해
 *   - 본질적으로 같은 글이면: 발행 스킵
 *   - 관점/구성이 다른 별개 글이면: 충돌 없는 새 슬러그 부여
 *
 * 호출 위치: publish.ts 의 INSERT 직전(이미지 생성·CTA 매칭 전).
 *
 * 반환:
 *   - { action: 'use', slug }  — 이 슬러그로 발행 가능
 *   - { action: 'skip', reason } — 내용 중복으로 발행 포기 (publish.ts 는 exit 4 로 종료)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { callClaude, extractJson } from './claude-cli.js';

const CONTENT_EXCERPT_CHARS = 1500;
const MAX_RETRY_NEW_SLUG = 3;

export interface SlugGuardInput {
  slug: string;
  title: string;
  summary?: string;
  excerpt?: string;
  metaDescription?: string;
  keywords?: string[];
  content: string;
}

export type SlugGuardResult =
  | { action: 'use'; slug: string; renamedFrom?: string; reason?: string }
  | { action: 'skip'; reason: string };

interface JudgeResponse {
  duplicate: boolean;
  reason?: string;
  newSlug?: string;
}

function clip(s: string | undefined | null, n: number): string {
  if (!s) return '(없음)';
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchExistingPost(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, summary, excerpt, meta_description, keywords, content, published_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    throw new Error(`기존 글 조회 실패: ${error.message}`);
  }
  return data;
}

function buildJudgePrompt(
  existing: any,
  candidate: SlugGuardInput,
  collidingSlug: string,
  blockedSlugs: string[],
): string {
  const blockedList = blockedSlugs.map((s) => `- ${s}`).join('\n');
  return [
    '당신은 마음토스 블로그 편집자입니다. 새로 작성된 글이 이미 발행된 글과 슬러그가 겹쳐서, 두 글이 본질적으로 같은 글인지 판정해야 합니다.',
    '',
    '## 충돌된 슬러그',
    collidingSlug,
    '',
    '## 기존 글',
    `- 제목: ${existing.title ?? '(없음)'}`,
    `- 요약: ${clip(existing.summary, 500)}`,
    `- 발췌: ${clip(existing.excerpt, 300)}`,
    `- 메타 설명: ${clip(existing.meta_description, 300)}`,
    `- 키워드: ${(existing.keywords ?? []).join(', ') || '(없음)'}`,
    `- 본문(앞 ${CONTENT_EXCERPT_CHARS}자):`,
    clip(existing.content, CONTENT_EXCERPT_CHARS),
    '',
    '## 새 글',
    `- 제목: ${candidate.title}`,
    `- 요약: ${clip(candidate.summary, 500)}`,
    `- 발췌: ${clip(candidate.excerpt, 300)}`,
    `- 메타 설명: ${clip(candidate.metaDescription, 300)}`,
    `- 키워드: ${(candidate.keywords ?? []).join(', ') || '(없음)'}`,
    `- 본문(앞 ${CONTENT_EXCERPT_CHARS}자):`,
    clip(candidate.content, CONTENT_EXCERPT_CHARS),
    '',
    '## 판정 기준',
    '- 두 글이 **본질적으로 같은 글**(같은 주제 + 같은 결론 + 비슷한 구성/예시)이면 duplicate=true.',
    '- 같은 주제라도 **타겟 독자·각도·강조 포인트·구성이 명확히 다르면** duplicate=false.',
    '- 보더라인(애매)일 때는 duplicate=false 로 — 차별점이 있다고 보고 발행하는 쪽으로 기울이세요.',
    '',
    '## duplicate=false 일 때 newSlug 규칙',
    '- 영문 소문자 + 하이픈, 3~5단어.',
    '- 새 글의 **차별점**(관점/대상/연도/접근)이 슬러그에서 자연스럽게 드러나야 함.',
    `- 충돌한 슬러그 "${collidingSlug}" 와 절대 같으면 안 되고, 단순한 -2, -v2, -new 같은 무의미 suffix 도 피하세요.`,
    blockedSlugs.length > 0
      ? [
          '- 다음 슬러그는 이미 DB 에 있으니 그것들과도 겹치지 않아야 합니다:',
          blockedList,
        ].join('\n')
      : '',
    '',
    '## 응답 형식 — JSON 만 출력 (코드펜스·해설 금지)',
    '{',
    '  "duplicate": boolean,',
    '  "reason": "한 줄 한국어 사유",',
    '  "newSlug": "..." // duplicate=false 일 때만 채우고, true 일 때는 빈 문자열',
    '}',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export async function resolveSlugCollision(
  supabase: SupabaseClient,
  candidate: SlugGuardInput,
): Promise<SlugGuardResult> {
  const initialSlug = candidate.slug;
  let currentSlug = initialSlug;
  const blockedSlugs: string[] = [];

  for (let attempt = 0; attempt <= MAX_RETRY_NEW_SLUG; attempt += 1) {
    const existing = await fetchExistingPost(supabase, currentSlug);
    if (!existing) {
      return {
        action: 'use',
        slug: currentSlug,
        renamedFrom: currentSlug !== initialSlug ? initialSlug : undefined,
      };
    }

    blockedSlugs.push(currentSlug);

    if (attempt >= MAX_RETRY_NEW_SLUG) {
      return {
        action: 'skip',
        reason: `${MAX_RETRY_NEW_SLUG + 1}회 시도 후에도 비충돌 슬러그 미확보 — 안전하게 스킵`,
      };
    }

    console.log(
      `🪞 슬러그 충돌 감지: "${currentSlug}" (기존 글 id=${existing.id}) — Claude 유사도 판정 호출 (시도 ${attempt + 1}/${MAX_RETRY_NEW_SLUG + 1})`,
    );

    let judge: JudgeResponse | null = null;
    try {
      const result = await callClaude({
        prompt: buildJudgePrompt(existing, candidate, currentSlug, blockedSlugs),
        body: '',
      });
      judge = extractJson<JudgeResponse>(result.text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        action: 'skip',
        reason: `슬러그 판정 LLM 호출 실패 — 안전하게 스킵: ${msg}`,
      };
    }

    if (!judge || typeof judge.duplicate !== 'boolean') {
      return {
        action: 'skip',
        reason: '슬러그 판정 LLM 응답 파싱 실패 — 안전하게 스킵',
      };
    }

    if (judge.duplicate) {
      return {
        action: 'skip',
        reason: judge.reason || '내용 중복으로 판정',
      };
    }

    const proposed = normalizeSlug(judge.newSlug ?? '');
    if (!proposed) {
      return {
        action: 'skip',
        reason: '비중복으로 판정됐지만 새 슬러그 미제안 — 안전하게 스킵',
      };
    }
    if (blockedSlugs.includes(proposed)) {
      console.log(`  ⚠️ 제안 슬러그 "${proposed}" 도 이미 충돌 목록 — 재요청`);
      currentSlug = proposed;
      continue;
    }

    console.log(`  ✏️ Claude 제안 슬러그: "${proposed}" (사유: ${judge.reason || '차별점 있음'})`);
    currentSlug = proposed;
  }

  return {
    action: 'skip',
    reason: '슬러그 재선정 루프 종료 — 안전하게 스킵',
  };
}
