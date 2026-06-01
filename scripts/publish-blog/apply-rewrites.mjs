/**
 * apply-rewrites.mjs — 1차 타이틀·메타 리라이트 일괄 적용 (2026-05-27)
 *
 * 1. 현재 meta_title / meta_description 백업 (/tmp/gsc-analysis/backup-...)
 * 2. Supabase 일괄 UPDATE
 * 3. prod /api/revalidate 호출 (slug 별)
 * 4. prod /api/indexnow 호출 (URL 일괄)
 */
import 'dotenv/config';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../web/.env.local') });

const PROD_BASE = 'https://www.mindthos.com';
const BACKUP_PATH = '/tmp/gsc-analysis/meta-backup-2026-05-27.json';

// 1차 배치 10개 페이지의 새 메타 (web/docs/seo-title-rewrite-batch-1-2026-05-27.md 기준)
const REWRITES = [
  {
    slug: 'kcpa-kca-counseling-trainee-guide',
    meta_title: '한상심(한국상담심리학회) 자격증 vs 한국상담학회 한상 차이 — 수련생 선택 가이드 2026',
    meta_description:
      '한상심(한국상담심리학회) 상담심리사 vs 한상(한국상담학회) 자격증 차이를 수련 비용·기간·학회 인지도 기준으로 비교합니다. 비전공자·직장인 수련생이 어느 길을 선택해야 할지 결정 기준을 제공합니다.',
  },
  {
    slug: 'military-life-counselor-reality-survival-guide',
    meta_title:
      '병영생활전문상담관 자격 요건과 채용 — 국방부 공식 정보 + 현직자 현실 가이드 2026',
    meta_description:
      '병영생활전문상담관 지원 자격, 국방부 채용 절차, 학력·자격증 요건을 공식 자료 기준으로 정리하고 현직자가 말하는 근무 환경·연봉·윤리적 딜레마까지 함께 전합니다.',
  },
  {
    slug: 'clinical-interpretation-of-wisc-wais-subtests',
    meta_title:
      '웩슬러 지능검사 소검사 13가지 완전 해설 — 행렬추론·토막짜기·산수 임상 해석 가이드',
    meta_description:
      'K-WAIS-IV·WISC-V 핵심 소검사(행렬추론, 토막짜기, 어휘, 산수, 동형찾기 등) 13개를 임상가 시점에서 해석법과 함의까지 정리. 지표 점수 격차가 의미하는 인지·정서 시그널을 사례와 함께 분석합니다.',
  },
  {
    slug: 'non-major-professional-counselor-roadmap',
    meta_title:
      '심리상담사 되는법 — 비전공자·직장인 4단계 로드맵 (대학원·수련·자격증)',
    meta_description:
      '비전공자가 심리상담사가 되는 가장 현실적인 4단계 로드맵: 학점은행제·대학원 진학·1~2년 수련·상담심리사 2급 자격 취득까지 비용·기간·전략을 단계별로 정리합니다.',
  },
  {
    slug: 'clinical-counseling-school-counselor-guide',
    meta_title:
      '심리상담사 현실 — 임상심리사·상담심리사·전문상담교사 3가지 직군 연봉·장단점 비교',
    meta_description:
      '심리상담사가 되려고 알아보는 분을 위해 임상심리사, 상담심리사, 전문상담교사 3가지 직군의 현실적인 연봉, 근무환경, 자격 요건, 커리어패스를 현직자 시점에서 비교합니다.',
  },
  {
    slug: 'adult-attachment-theory-deep-guide-for-counselors',
    meta_title:
      '안정형 애착 유형 특징 — 안정·불안·회피 4가지 애착 패턴 상담사 가이드',
    meta_description:
      '안정형 애착의 특징, 형성 과정, 다른 유형(불안형·회피형·혼란형)과의 차이를 상담 임상 사례와 함께 정리. 자신의 애착 유형이 궁금한 분과 임상가 모두를 위한 가이드.',
  },
  {
    slug: 'freelance-counselor-tax-refund-guide',
    meta_title:
      '홈택스 3.3% 환급 신고 — 프리랜서 종합소득세 5월 신고 따라하기 (상담사·강사용)',
    meta_description:
      '프리랜서가 미리 떼인 3.3%를 종합소득세 신고로 돌려받는 홈택스 5분 셀프 신고 절차. 5월 신고 기간, 필요 경비 계산, 환급 시기까지 단계별로 정리. 상담사·강사 등 인적용역 사업소득자 기준.',
  },
  {
    slug: 'simple-drawing-test-bgt-organic-brain-damage-screening',
    meta_title:
      'BGT 검사 해석 — 벤더 게슈탈트 9개 도형과 기질적 뇌손상 선별 임상 가이드',
    meta_description:
      'BGT(벤더-게슈탈트) 검사 9개 자극도형 해석법과 기질적 뇌손상(Organic brain damage) 선별 핵심 징후 3가지. 임상가용 채점·해석·보고서 작성 실무 가이드.',
  },
  {
    slug: 'elegant-confrontation-technique-counseling',
    meta_title:
      '직면(Confrontation) 기법 — 내담자 저항 안 사는 화법과 사용 타이밍 5가지',
    meta_description:
      '상담 직면 기법의 정의, 사용 시점, 구체적 화법 예시, 윤리적 주의사항을 정리. 내담자의 모순을 부드럽게 지적하는 "우아한 직면"의 실전 가이드.',
  },
  {
    slug: 'reading-hidden-truth-of-laughing-client',
    meta_title:
      '반동형성(Reaction Formation) 방어기제 — 정의·예시·임상 사례 알아채는 법',
    meta_description:
      '반동형성(Reaction Formation) 방어기제의 정의, 발현 메커니즘, 임상 현장 사례 3가지, 그리고 상담사가 "웃으면서 힘든 이야기" 같은 비언어 시그널로 알아차리는 3단계 개입법.',
  },
];

const SLUGS = REWRITES.map((r) => r.slug);

// ----------------------------------------------------------------------
// 0. Supabase 클라이언트
// ----------------------------------------------------------------------
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supaUrl || !supaKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다');
  process.exit(1);
}
const sb = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

// ----------------------------------------------------------------------
// 1. 백업
// ----------------------------------------------------------------------
console.log('[1/4] 현재 메타 백업 중...');
const { data: backup, error: bErr } = await sb
  .from('posts')
  .select('slug, meta_title, meta_description, updated_at')
  .in('slug', SLUGS);
if (bErr) {
  console.error('백업 실패:', bErr);
  process.exit(1);
}
writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
console.log(`     백업 저장: ${BACKUP_PATH} (${backup.length}건)`);

// 누락 slug 확인
const found = new Set(backup.map((b) => b.slug));
const missing = SLUGS.filter((s) => !found.has(s));
if (missing.length) {
  console.error('Supabase 에서 못 찾은 slug:', missing);
  process.exit(1);
}

// ----------------------------------------------------------------------
// 2. 일괄 UPDATE
// ----------------------------------------------------------------------
console.log(`\n[2/4] Supabase UPDATE — ${REWRITES.length}건`);
let updated = 0;
for (const r of REWRITES) {
  const { error } = await sb
    .from('posts')
    .update({
      meta_title: r.meta_title,
      meta_description: r.meta_description,
    })
    .eq('slug', r.slug);
  if (error) {
    console.error(`     ❌ ${r.slug}: ${error.message}`);
    continue;
  }
  updated++;
  console.log(`     ✅ ${r.slug}`);
}
console.log(`     ${updated}/${REWRITES.length} 성공`);

// ----------------------------------------------------------------------
// 3. ISR revalidate (prod)
// ----------------------------------------------------------------------
const revalidationSecret = process.env.REVALIDATION_SECRET;
if (!revalidationSecret) {
  console.warn('\n[3/4] REVALIDATION_SECRET 없음 — revalidate 스킵 (ISR 1시간 후 자동 반영)');
} else {
  console.log(`\n[3/4] prod /api/revalidate 호출 중...`);
  for (const r of REWRITES) {
    const path = `/blog/${r.slug}`;
    try {
      const res = await fetch(`${PROD_BASE}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: revalidationSecret, path }),
      });
      await res.json().catch(() => ({}));
      console.log(`     ${res.ok ? '✅' : '⚠️'} ${path}  status=${res.status}`);
    } catch (e) {
      console.error(`     ❌ ${path}  ${e.message}`);
    }
  }
}

// ----------------------------------------------------------------------
// 4. IndexNow 알림
// ----------------------------------------------------------------------
console.log(`\n[4/4] IndexNow 알림 중...`);
const urls = REWRITES.map((r) => `https://www.mindthos.com/blog/${r.slug}`);
try {
  const res = await fetch(`${PROD_BASE}/api/indexnow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  const json = await res.json().catch(() => ({}));
  console.log(`     ${res.ok ? '✅' : '⚠️'}`, json);
} catch (e) {
  console.error(`     ❌`, e.message);
}

console.log('\n완료. 6/10 (6월 10일) GSC 재측정 예정.');
