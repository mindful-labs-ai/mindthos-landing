/**
 * 마음토스 블로그 발행 스크립트
 *
 * 사용법:
 *   1. content.json 을 scripts/publish-blog/content.json 에 저장 (Claude 가 작성)
 *   2. npx tsx scripts/publish-blog/src/publish.ts
 *
 * 6단계:
 *   1) SEO 분석 (Python)
 *   2) Gemini 교차 검증 (사실 / 임상 정확도 / 윤리)
 *   3) 아웃링크 검증 (3xx 폴백 + 데드링크 제거)
 *   4) 썸네일 이미지 생성 (Gemini, 선택)
 *   5) CTA 매칭 (counseling_programs.match_keywords)
 *   6) DB INSERT (KST 타임스탬프)
 *
 * 필요 환경변수 (web/.env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   - NANOBANANA_API_KEY (Gemini 검증 + 이미지, 선택)
 *   - INDEXNOW_KEY (선택)
 *   - NEXT_PUBLIC_SITE_URL (선택, 기본 https://mindthos.com)
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { verifyAeoStructure } from './verifiers/aeo-structure.js';
import { verifyCounselorContent } from './verifiers/counselor-content.js';
import { buildReviewFeedback } from './verifiers/aggregate.js';
import type { ReviewFeedbackV2, VerifierVerdict } from './verifiers/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// scripts/publish-blog/src/ → repo root → web/.env.local
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const ENV_PATH = resolve(REPO_ROOT, 'web', '.env.local');
config({ path: ENV_PATH });

const CONTENT_PATH = resolve(__dirname, '..', 'content.json');
const SEO_REPORT_PATH = resolve(__dirname, '..', 'seo-report.json');
const REVIEW_FEEDBACK_PATH = resolve(__dirname, '..', 'review-feedback.json');

const DEFAULT_CATEGORY_SLUG = 'counseling-skills';
const DEFAULT_AUTHOR_SLUG = 'mindthos-team';
const DEFAULT_SITE_URL = 'https://mindthos.com';

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

/**
 * 현재 시각을 KST(+09:00) 오프셋의 ISO-8601 문자열로 반환.
 */
function toKstISOString(d: Date): string {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  return kst.toISOString().replace('Z', '+09:00');
}

/** mindthos cta_type 컬럼은 'free-trial' | 'institution-inquiry' | 'newsletter' */
function mapCtaType(targetAudience: string | undefined, explicit?: string): string {
  if (explicit && ['free-trial', 'institution-inquiry', 'newsletter'].includes(explicit)) {
    return explicit;
  }
  if (targetAudience === 'institution') return 'institution-inquiry';
  if (targetAudience === 'general') return 'newsletter';
  return 'free-trial';
}

async function main() {
  console.log('=== 마음토스 블로그 발행 ===\n');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(`❌ Supabase 환경변수 누락 (확인: ${ENV_PATH})`);
    process.exit(1);
  }

  if (!existsSync(CONTENT_PATH)) {
    console.error(`❌ content.json 파일이 없습니다: ${CONTENT_PATH}`);
    process.exit(1);
  }

  const contentJson = JSON.parse(readFileSync(CONTENT_PATH, 'utf-8'));
  const content = contentJson.content;

  // AI 다중 검수 결과 (마이그레이션 008 — posts.ai_review JSONB 등에 저장)
  // 참조: web/docs/aeo-geo-research/ai-review-workflow.md
  let reviewFeedback: ReviewFeedbackV2 | null = null;
  let autoReviewQueue = false;
  let reviewIterations = 0;

  if (!content?.title || !content?.slug || !content?.content) {
    console.error('❌ content.json 의 content 에 title, slug, content 필수');
    process.exit(1);
  }

  // FAQSection 컴포넌트가 별도 렌더하므로 본문 끝 FAQ 헤딩 제거
  content.content = content.content.replace(/\n+## 자주 묻는 질문\s*$/, '').trimEnd();

  // ───────────────────────────────────────────────────────────────
  // Step 1: SEO 분석
  // ───────────────────────────────────────────────────────────────
  if (!contentJson.skipSeoAnalysis) {
    console.log('📈 SEO 분석 중...');
    try {
      execSync(
        `python3 scripts/seo-analysis/analyze.py "${CONTENT_PATH}" --output "${SEO_REPORT_PATH}"`,
        { encoding: 'utf-8', cwd: REPO_ROOT },
      );
      const seoReport = JSON.parse(readFileSync(SEO_REPORT_PATH, 'utf-8'));
      const { overall_score, grade, scores, recommendations } = seoReport;
      console.log(`📊 SEO 분석: ${overall_score}점 / ${grade}등급`);
      console.log(
        `  키워드 ${scores?.keyword ?? '-'} | 가독성 ${scores?.readability ?? '-'} | 메타 ${scores?.meta ?? '-'} | 구조 ${scores?.structure ?? '-'}`,
      );
      if (Array.isArray(recommendations)) {
        for (const rec of recommendations) console.log(`  💡 ${rec}`);
      }
      if (overall_score < 50) {
        console.warn(`⚠️ SEO 점수 낮음 (${overall_score}). 콘텐츠 개선 권장.`);
      }
      console.log(`💾 ${SEO_REPORT_PATH}\n`);
    } catch (err) {
      console.warn('⚠️ SEO 분석 스킵 (Python 실행 오류)');
    }
  } else {
    console.log('⏭️ SEO 분석 스킵\n');
  }

  // ───────────────────────────────────────────────────────────────
  // Step 2: AI 다중 검수 (Stage 2 AEO + Stage 4 상담사 콘텐츠)
  // 참조: web/docs/aeo-geo-research/ai-review-workflow.md
  //
  // 결정 규칙:
  //   - pass   → 다음 단계 진행, ai_review JSONB 에 결과 저장
  //   - revise → exit 3 (daily-auto-publish.sh 의 fact-fix 루프가 revisionGuide 보고 Claude 호출 → 재발행)
  //   - queue  → status='draft' 강제 + auto_review_queue=true 로 DB 저장 + exit 0
  //              (운영자가 prompt/master doc 보완 후 수동 재실행)
  // ───────────────────────────────────────────────────────────────
  if (!contentJson.skipReview && process.env.NANOBANANA_API_KEY) {
    console.log('🔍 AI 다중 검수 시작 (Stage 2 AEO + Stage 4 상담사 콘텐츠)...');

    // 이전 review-feedback.json 이 있으면 iterations 증가 (fact-fix 루프 트래킹)
    if (existsSync(REVIEW_FEEDBACK_PATH)) {
      try {
        const prev = JSON.parse(readFileSync(REVIEW_FEEDBACK_PATH, 'utf-8'));
        if (prev?.version === 2 && typeof prev?.iterations === 'number') {
          reviewIterations = prev.iterations + 1;
        }
      } catch {
        // 기존 v1 파일 또는 파싱 실패 — 0 으로 시작
      }
    }

    const verifierInput = {
      title: content.title,
      slug: content.slug,
      content: content.content,
      summary: content.summary ?? '',
      excerpt: content.excerpt ?? '',
      keywords: content.keywords ?? [],
      category: contentJson.categorySlug,
      references: content.references ?? [],
    };

    try {
      const verdicts: VerifierVerdict[] = [];
      const settled = await Promise.allSettled([
        verifyAeoStructure(verifierInput),
        verifyCounselorContent(verifierInput),
      ]);

      for (const r of settled) {
        if (r.status === 'fulfilled') {
          verdicts.push(r.value);
        } else {
          console.warn(`⚠️ verifier 실패: ${r.reason?.message ?? r.reason}`);
        }
      }

      if (verdicts.length === 0) {
        console.warn('⚠️ 모든 verifier 실패 — 검수 스킵하고 발행 진행');
      } else {
        reviewFeedback = buildReviewFeedback(verdicts);
        (reviewFeedback as ReviewFeedbackV2 & { iterations: number }).iterations =
          reviewIterations;

        // 콘솔 출력
        console.log(`📊 검수 결정: ${reviewFeedback.overallDecision}`);
        for (const v of verdicts) {
          console.log(`  - ${v.stage}: score ${v.score} / mustFix ${v.mustFix.length} / mustBlock ${v.mustBlock.length}`);
        }
        console.log('');

        // 통합 review-feedback.json 저장 (v2 구조)
        writeFileSync(
          REVIEW_FEEDBACK_PATH,
          JSON.stringify(reviewFeedback, null, 2),
          'utf-8',
        );
        console.log(`💾 ${REVIEW_FEEDBACK_PATH} (v2)\n`);

        if (reviewFeedback.overallDecision === 'queue') {
          // 즉시 큐 격리 — DB 저장은 진행하되 status='draft' + auto_review_queue=true
          console.warn(
            `⚠️ 검수 차단 사유 (mustBlock) — 격리 큐로 진입: ${reviewFeedback.queueReason}`,
          );
          autoReviewQueue = true;
          // contentJson.status 를 'draft' 로 강제
          contentJson.status = 'draft';
        } else if (reviewFeedback.overallDecision === 'revise') {
          // Claude 수정 → 재발행 패턴 (기존 fact-fix 루프 활용)
          console.error(
            `❌ 검수 mustFix 항목 — 본문 수정 후 재발행 필요. (exit 3)\n` +
              reviewFeedback.revisionGuide.slice(0, 800),
          );
          process.exit(3);
        }
        // pass → 진행
      }
    } catch (err) {
      console.warn('⚠️ AI 다중 검수 예외:', err);
    }
  } else {
    console.log('⏭️ AI 다중 검수 스킵 (skipReview 또는 NANOBANANA_API_KEY 미설정)\n');
  }

  // ───────────────────────────────────────────────────────────────
  // Step 3: 아웃링크 검증
  // ───────────────────────────────────────────────────────────────
  if (Array.isArray(content.references) && content.references.length > 0 && !contentJson.skipLinkCheck) {
    console.log(`🔗 아웃링크 검증 (${content.references.length}개)...`);
    const validRefs: any[] = [];
    const failedRefs: any[] = [];

    const checkUrl = async (url: string): Promise<{ ok: boolean; title: string }> => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: ctrl.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MindthosLinkChecker/1.0)' },
        });
        clearTimeout(t);
        if (!res.ok) return { ok: false, title: '' };
        const html = await res.text();
        const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return { ok: true, title: m ? m[1].trim() : '' };
      } catch {
        return { ok: false, title: '' };
      }
    };

    for (const ref of content.references) {
      const result = await checkUrl(ref.url);
      if (result.ok) {
        console.log(`  ✅ ${ref.name}`);
        validRefs.push(ref);
        continue;
      }

      try {
        const mainDomain = new URL(ref.url).origin;
        if (mainDomain !== ref.url) {
          console.log(`  🔄 ${ref.name} — 원본 실패, 메인 도메인 시도`);
          const fallback = await checkUrl(mainDomain);
          if (fallback.ok) {
            console.log(`  ✅ ${ref.name} — 메인 도메인으로 대체`);
            validRefs.push({ ...ref, url: mainDomain });
            continue;
          }
        }
      } catch {}

      console.log(`  ❌ ${ref.name} — 접속 불가, 제외`);
      failedRefs.push(ref);
    }

    console.log(`  결과: ${validRefs.length} 통과 / ${failedRefs.length} 실패\n`);
    content.references = validRefs;
  }

  const supabase = createSupabase();

  // 카테고리 조회
  const { data: category } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('slug', contentJson.categorySlug || DEFAULT_CATEGORY_SLUG)
    .single();

  if (!category) {
    console.error(`❌ 카테고리를 찾을 수 없습니다: ${contentJson.categorySlug || DEFAULT_CATEGORY_SLUG}`);
    process.exit(1);
  }

  // 저자 조회 (기본: mindthos-team)
  const { data: author } = await supabase
    .from('authors')
    .select('id')
    .eq('slug', contentJson.authorSlug || DEFAULT_AUTHOR_SLUG)
    .maybeSingle();

  // ───────────────────────────────────────────────────────────────
  // Step 4: 이미지 생성 (Gemini)
  //
  // STRICT 모드 (AUTO_PUBLISH_STRICT=1):
  //   - skipImage=false 이고 기존 thumbnail_url 도 없는 글은 반드시 썸네일을 만들어야 함
  //   - NANOBANANA_API_KEY 누락 / API 실패 / 업로드 실패 → exit code 2 로 abort
  //   - daily-auto-publish.sh 가 이 코드를 보고 일일 배치 전체를 중단함
  //   - skipImage=true 또는 기존 thumbnail_url 이 있으면 영향 없음
  // 일반 모드 (수동 `npx tsx publish.ts`): 기존처럼 경고만 출력하고 계속 진행
  // ───────────────────────────────────────────────────────────────
  const STRICT_MODE = process.env.AUTO_PUBLISH_STRICT === '1';
  const STRICT_EXIT = 2; // 썸네일 실패 전용 exit code
  let thumbnailUrl: string | null = content.thumbnail_url ?? null;
  let imageFailureReason: string | null = null;

  if (contentJson.skipImage) {
    console.log('⏭️ 이미지 생성 스킵 (skipImage=true)');
  } else if (thumbnailUrl) {
    console.log(`📸 기존 썸네일 사용: ${thumbnailUrl}`);
  } else if (!process.env.NANOBANANA_API_KEY) {
    if (STRICT_MODE) {
      console.error(
        '❌ [STRICT] NANOBANANA_API_KEY 가 없어 썸네일을 생성할 수 없습니다. ' +
          '자동 발행 전체 배치를 중단합니다.',
      );
      process.exit(STRICT_EXIT);
    }
    console.log('⏭️ 이미지 생성 스킵 (NANOBANANA_API_KEY 없음)');
  } else {
    console.log('📸 이미지 생성 중...');
    try {
      const visualKeywords = content.visual_keywords || [];
      const topicPrompt = visualKeywords.join(', ');
      // 마음토스 브랜드 톤: 신뢰감 있는 미니멀, 따뜻한 그린(#44ce4b)·웜그레이
      // CRITICAL: 어떤 문자(한글/영문/숫자/기호)도 이미지에 들어가면 안 됨 — 깨짐 방지
      const stylePrompt =
        'Minimal professional illustration with warm green (#44ce4b) and neutral cream tones, ' +
        'clean editorial composition, soft shadows, calm and trustworthy mood suitable for a counselor-facing platform. ' +
        'STRICT REQUIREMENTS — TEXT-FREE ILLUSTRATION ONLY: ' +
        'absolutely NO text of any language, NO Korean characters (한글), NO English letters (A-Z, a-z), NO numbers (0-9), ' +
        'NO words, NO captions, NO labels, NO logos, NO watermarks, NO typography, NO signs with writing, ' +
        'NO UI mockups containing text, NO chat bubbles with letters, NO book covers with titles, NO documents with readable content. ' +
        'The image must be a pure visual / symbolic / abstract illustration. ' +
        'If a scene normally contains writing (e.g., signboards, notebooks, screens), depict them blank or with abstract patterns only. ' +
        'Zero written language anywhere in the image.';
      const fullPrompt =
        `${stylePrompt} Topic (visual concepts only — do not render as text): ${topicPrompt}. ` +
        'Render purely visual illustration with no text or letters of any kind anywhere in the image.';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${process.env.NANOBANANA_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate an image: ${fullPrompt}` }] }],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
          }),
        },
      );

      if (!response.ok) {
        imageFailureReason = `Gemini API ${response.status} ${response.statusText}`;
      } else {
        const result = await response.json();
        const parts = result.candidates?.[0]?.content?.parts;
        const imagePart = parts?.find((p: any) =>
          p.inlineData?.mimeType?.startsWith('image/'),
        );
        if (!imagePart) {
          imageFailureReason = 'Gemini 응답에 image 파트가 없음';
        } else {
          const sharp = (await import('sharp')).default;
          const rawBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
          const optimizedBuffer = await sharp(rawBuffer)
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          const originalKB = Math.round(rawBuffer.length / 1024);
          const optimizedKB = Math.round(optimizedBuffer.length / 1024);
          console.log(
            `  원본 ${originalKB}KB → 최적화 ${optimizedKB}KB (${Math.round((1 - optimizedKB / originalKB) * 100)}% 감소)`,
          );

          const fileName = `thumbnails/${content.slug}.webp`;
          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(fileName, optimizedBuffer, {
              contentType: 'image/webp',
              upsert: true,
            });

          if (uploadError) {
            imageFailureReason = `Supabase Storage upload 실패: ${uploadError.message}`;
          } else {
            const { data: urlData } = supabase.storage
              .from('blog-images')
              .getPublicUrl(fileName);
            thumbnailUrl = urlData.publicUrl;
            console.log(`✅ 업로드: ${thumbnailUrl}`);
          }
        }
      }
    } catch (err) {
      imageFailureReason = `이미지 생성 예외: ${err instanceof Error ? err.message : String(err)}`;
    }

    if (imageFailureReason && !thumbnailUrl) {
      if (STRICT_MODE) {
        console.error(
          `❌ [STRICT] 썸네일 생성 실패 — ${imageFailureReason}. ` +
            '자동 발행 전체 배치를 중단합니다 (DB INSERT 전 abort).',
        );
        process.exit(STRICT_EXIT);
      }
      console.warn(`⚠️ 이미지 생성 스킵: ${imageFailureReason}`);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Step 5: CTA 매칭 (counseling_programs.match_keywords)
  //
  // STRICT 모드(자동 발행): CTA 매칭을 스킵하고 fallback 으로 고정한다.
  //   - counseling_program_id = null  → web/components/blog/_cta.ts 의 fallback 경로 진입
  //   - cta_type = 'free-trial'      → institution-inquiry 분기 차단 → 디폴트 헤딩 보장
  //   → 모든 자동 발행 글에 동일한 CTA 노출:
  //      "상담사를 위한 가장 안전한 AI 에이전트, 마음토스" / 버튼 "무료로 시작하기"
  // 수동 발행(manual)은 기존처럼 keyword 매칭으로 program_id 설정.
  // ───────────────────────────────────────────────────────────────
  let counselingProgramId: string | null = null;
  let forcedDefaultCta = false;
  if (STRICT_MODE) {
    forcedDefaultCta = true;
    console.log('🔗 CTA 디폴트 고정 (STRICT) — 매칭 스킵, fallback CTA 사용');
  } else {
    console.log('🔗 CTA 매칭 중...');
    try {
      const { data: programs } = await supabase
        .from('counseling_programs')
        .select('id, title, slug, match_keywords')
        .eq('is_active', true)
        .eq('is_cta_enabled', true);

      if (programs && content.keywords) {
        let bestId: string | null = null;
        let bestScore = 0;
        for (const prog of programs) {
          const mk: string[] = (prog as any).match_keywords || [];
          let score = 0;
          for (const kw of content.keywords) {
            for (const m of mk) {
              if (
                kw.toLowerCase().includes(m.toLowerCase()) ||
                m.toLowerCase().includes(kw.toLowerCase())
              ) {
                score++;
                break;
              }
            }
          }
          if (score > bestScore) {
            bestScore = score;
            bestId = prog.id;
            console.log(`  매칭: ${(prog as any).title} (점수 ${score})`);
          }
        }
        counselingProgramId = bestId;
      }
    } catch (err) {
      console.warn('⚠️ CTA 매칭 스킵');
    }
    console.log(counselingProgramId ? '✅ CTA 매칭 완료' : '⚠️ 매칭 없음 (카테고리 default 폴백)');
  }

  // ───────────────────────────────────────────────────────────────
  // Step 6: DB 저장
  // ───────────────────────────────────────────────────────────────
  console.log('💾 DB 저장 중...');
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (content.faq || []).map((f: any) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  // 마음토스 blog-db-guide: content.length / 500
  const readingTime = Math.max(1, Math.ceil((content.content?.length || 0) / 500));
  // STRICT 모드: cta_type 도 free-trial 로 고정 — _cta.ts fallback 헤딩 보장
  const ctaType = forcedDefaultCta
    ? 'free-trial'
    : mapCtaType(contentJson.targetAudience, content.cta_type);

  const insertPayload: Record<string, any> = {
    title: content.title,
    slug: content.slug,
    content: content.content,
    excerpt: content.excerpt,
    summary: content.summary,
    keywords: content.keywords,
    category_id: category.id,
    author_id: author?.id ?? null,
    status: contentJson.status || 'draft',
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    schema_markup: content.faq?.length ? faqSchema : null,
    references: content.references ?? [],
    thumbnail_url: thumbnailUrl,
    counseling_program_id: counselingProgramId,
    reading_time: readingTime,
    cta_type: ctaType,
    is_featured: !!content.is_featured,
    published_at:
      contentJson.status === 'published' ? toKstISOString(new Date()) : null,
    // 마이그레이션 008 — AI 다중 검수 결과 기록
    ...(reviewFeedback ? { ai_review: reviewFeedback } : {}),
    ...(autoReviewQueue ? { auto_review_queue: true } : {}),
    review_iterations: reviewIterations,
  };

  // 영상 컬럼 — content.json 에 명시된 경우에만 전달
  if (content.video_url) insertPayload.video_url = content.video_url;
  if (content.video_provider) insertPayload.video_provider = content.video_provider;
  if (content.video_position) insertPayload.video_position = content.video_position;

  const { data: post, error } = await supabase
    .from('posts')
    .insert(insertPayload)
    .select('id, slug, title')
    .single();

  if (error) {
    console.error('❌ DB 저장 실패:', error.message);
    process.exit(1);
  }

  console.log(`\n✅ 발행 완료!`);
  console.log(`  제목: ${post.title}`);
  console.log(`  Slug: ${post.slug}`);
  console.log(`  ID: ${post.id}`);
  console.log(`  상태: ${contentJson.status || 'draft'}`);
  console.log(`  카테고리: ${category.slug}`);
  console.log(`  이미지: ${thumbnailUrl ? '있음' : '없음'}`);
  console.log(`  CTA: ${counselingProgramId ? '매칭됨' : '카테고리 기본'}`);

  // ───────────────────────────────────────────────────────────────
  // Step 7: revalidate + IndexNow
  // ───────────────────────────────────────────────────────────────
  if (contentJson.status !== 'published') return;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const urlList = [postUrl, `${siteUrl}/blog`, `${siteUrl}/sitemap.xml`];

  // ISR revalidate (REVALIDATION_SECRET 있을 때)
  if (process.env.REVALIDATION_SECRET) {
    try {
      const wwwUrl = siteUrl.replace('://', '://www.').replace('www.www.', 'www.');
      const res = await fetch(`${wwwUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.REVALIDATION_SECRET,
          paths: [`/blog/${post.slug}`, '/blog'],
        }),
      });
      console.log(`  Revalidate: ${res.ok ? '✅' : '⚠️'} HTTP ${res.status}`);
    } catch (err) {
      console.warn('  Revalidate: ⚠️ 실패', err);
    }
  }

  // IndexNow (Bing/Yandex/Naver → ChatGPT/Copilot 색인)
  if (process.env.INDEXNOW_KEY) {
    try {
      const host = new URL(siteUrl).hostname;
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
      console.log(
        `  IndexNow: ${res.ok || res.status === 202 ? '✅' : '⚠️'} HTTP ${res.status} (${urlList.length} URLs)`,
      );
    } catch (err) {
      console.warn('  IndexNow: ⚠️ 실패', err);
    }
  }
}

main().catch((err) => {
  console.error('❌ 치명적 오류:', err);
  process.exit(1);
});
