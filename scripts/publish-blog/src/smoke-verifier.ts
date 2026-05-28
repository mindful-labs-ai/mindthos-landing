/**
 * Smoke test — V2 + V3 + V5 verifier 가 실제로 작동하는지 검증.
 *
 * 실행: npx tsx scripts/publish-blog/src/smoke-verifier.ts
 *
 * 1) master doc 로딩 인벤토리
 * 2) sample input 으로 verifier 3개 병렬 호출
 * 3) review-feedback JSON 출력
 *
 * 비용: Gemini Flash 2회 + Gemini Pro 1회 ≈ $0.07
 * 운영 환경에 영향 없음 (DB INSERT 안 함, dry test only).
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyAeoStructure } from './verifiers/aeo-structure.js';
import { verifyCounselorContent } from './verifiers/counselor-content.js';
import { verifyFactCheck } from './verifiers/fact-check.js';
import { buildReviewFeedback } from './verifiers/aggregate.js';
import { loadAllMasterDocs } from './verifiers/master-doc-loader.js';
import type { VerifierInput, VerifierVerdict } from './verifiers/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
config({ path: resolve(REPO_ROOT, 'web', '.env.local') });

/** 자격 / 위기 / 윤리 영역을 두루 다루는 샘플 — fact-check 매칭이 일어나야 함 */
const SAMPLE: VerifierInput = {
  title: '임상심리사 1급과 임상심리전문가의 차이 — 자격 체계 정리',
  slug: 'clinical-psychologist-license-comparison',
  summary:
    '많은 상담 선생님들이 임상심리사 1급과 임상심리전문가를 혼동하지만, 둘은 발급 주체가 완전히 다른 별개 자격입니다. 임상심리사 1급은 한국산업인력공단의 국가기술자격이고, 임상심리전문가는 한국임상심리학회의 학회 자격입니다. 본 글에서는 두 자격의 발급기관·취득 요건·실무 활용 차이를 정리합니다.',
  excerpt: '임상심리사 1급과 임상심리전문가의 차이를 발급기관·요건·활용 측면에서 정리합니다.',
  content: `## 자격 체계 개요

임상심리사 1급은 한국산업인력공단(Q-Net)이 시행하는 국가기술자격입니다. 반면 임상심리전문가는 한국임상심리학회(KCP)가 발급하는 학회 자격으로, 국가 자격증과는 별개입니다.

## 임상심리사 1급 응시 자격

임상심리사 1급은 임상심리 분야 석사 이상에 수련 1년을 더하거나, 임상심리사 2급 취득 후 실무 5년 이상 등으로 응시할 수 있습니다.

## 임상심리전문가 취득 요건

임상심리전문가는 (1) 심리학·임상심리 관련 석사 이상, (2) 학회 인정 수련기관에서 3년 이상 수련, (3) 자격 시험 통과, (4) 학회 윤리강령 준수가 요구됩니다.

## 자격 유지

두 자격 모두 보수교육을 통해 유지해야 합니다. 임상심리전문가는 5년마다 보수교육 이수가 필요합니다.

## 위기 상황에서의 역할

자살·자해 위험이 있는 내담자를 만났을 때, 자격을 막 취득한 신규 상담사는 절대 단독으로 사례를 끌고 가지 말고, 반드시 슈퍼바이저 자문 + 정신과 의뢰를 거쳐야 합니다. 한국 자살예방상담전화 109 안내도 본문에 포함해야 합니다.

## 결론

두 자격은 별개 트랙이지만 상보적으로 운영됩니다. 자신의 진로 방향에 맞춰 선택하시되, 둘 중 어느 쪽이든 학회 윤리강령과 임상 안전 절차를 따르는 것이 가장 중요합니다.`,
  keywords: ['임상심리사', '임상심리전문가', '상담사 자격', 'KCP'],
  category: 'counseling-skills',
  references: [
    {
      name: '한국임상심리학회 KCP',
      url: 'https://www.kcp.or.kr/',
      type: 'academic',
    },
    {
      name: '한국산업인력공단 Q-Net',
      url: 'https://www.q-net.or.kr/',
      type: 'government',
    },
  ],
};

async function main() {
  console.log('=== Smoke Test — V2 + V3 + V5 verifier ===\n');

  // 1단계 — master doc 인벤토리
  console.log('1) Master Doc 인벤토리');
  const masters = loadAllMasterDocs();
  for (const m of masters) {
    console.log(
      `   ${m.meta.slug} (v=${m.meta.version}, confidence=${m.meta.confidence_overall}, body=${m.body.length} chars)`,
    );
  }
  console.log(`   총 ${masters.length}개 master doc 로드 완료\n`);

  // 2단계 — 환경변수 점검
  if (!process.env.NANOBANANA_API_KEY) {
    console.error('❌ NANOBANANA_API_KEY 미설정 — smoke test 중단');
    process.exit(1);
  }

  // 3단계 — verifier 3개 병렬 호출
  console.log('2) Verifier 3개 병렬 호출 (Gemini)...');
  const t0 = Date.now();
  const settled = await Promise.allSettled([
    verifyAeoStructure(SAMPLE),
    verifyCounselorContent(SAMPLE),
    verifyFactCheck(SAMPLE),
  ]);
  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`   완료 (${elapsedSec}s)\n`);

  const verdicts: VerifierVerdict[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      verdicts.push(r.value);
      console.log(`   ✅ ${r.value.stage}`);
      console.log(`      score=${r.value.score} mustFix=${r.value.mustFix.length} mustBlock=${r.value.mustBlock.length} notes=${r.value.notes.length}`);
      if (r.value.stage === 'fact_check') {
        const masters = (r.value.details as any)?.masters_consulted ?? [];
        const topics = (r.value.details as any)?.topics ?? [];
        console.log(`      topics=${JSON.stringify(topics)}`);
        console.log(`      masters_consulted=${JSON.stringify(masters)}`);
      }
    } else {
      console.log(`   ❌ verifier 실패: ${r.reason?.message ?? r.reason}`);
    }
  }
  console.log('');

  // 4단계 — aggregate
  console.log('3) Aggregate 결정');
  const feedback = buildReviewFeedback(verdicts);
  console.log(`   overallDecision = ${feedback.overallDecision}`);
  if (feedback.queueReason) console.log(`   queueReason = ${feedback.queueReason}`);
  console.log('');

  console.log('4) revisionGuide preview (앞 600자)');
  console.log(feedback.revisionGuide.slice(0, 600));
  console.log('');

  console.log('=== Smoke Test 종료 ===');
}

main().catch((err) => {
  console.error('❌ Smoke test 치명적 오류:', err);
  process.exit(1);
});
