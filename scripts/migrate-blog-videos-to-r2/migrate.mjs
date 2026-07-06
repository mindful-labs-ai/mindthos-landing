#!/usr/bin/env node
/**
 * 블로그 동영상 마이그레이션: Supabase Storage(blog-videos) → Cloudflare R2(mindthos-public-assets)
 *
 * - 소스: posts.video_url (Supabase public URL, blog-videos/<slug>/video.mp4)
 * - 대상: R2 blog/videos/<slug>/v1/video.mp4  →  https://media.mindthos.com/blog/videos/<slug>/v1/video.mp4
 * - 무의존(node 내장 crypto/fetch 만), SigV4 직접 서명.
 * - 멱등: R2 에 같은 크기 object 가 이미 있으면 업로드 건너뜀.
 * - 업로드 후 공개 URL(media.mindthos.com)로 HEAD 검증(200 + content-length 일치).
 * - 결과 매핑을 scripts/.data/r2-video-migration-map.json 에 기록(다음 DB 갱신 단계 입력).
 *
 * 실행:
 *   node scripts/migrate-blog-videos-to-r2/migrate.mjs            # 실제 업로드
 *   node scripts/migrate-blog-videos-to-r2/migrate.mjs --dry-run  # 계획만 출력
 *
 * 자격증명은 web/.env.local 에서 로드(커밋 금지).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');
const CONCURRENCY = 4;

/* ---------- env 로드 (web/.env.local) ---------- */
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnv(path.join(REPO_ROOT, 'web/.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AK = process.env.CF_MINDTHOS_PUBLIC_ASSETS_UPLOAD_ACCESS_KEY_ID;
const SK = process.env.CF_MINDTHOS_PUBLIC_ASSETS_UPLOAD_SECRET_ACCESS_KEY;
const ENDPOINT = process.env.CF_MINDTHOS_PUBLIC_ASSETS_R2_ENDPOINT;
const REGION = process.env.CF_MINDTHOS_PUBLIC_ASSETS_R2_REGION || 'auto';
const BUCKET = process.env.CF_MINDTHOS_PUBLIC_ASSETS_R2_BUCKET;
const PUBLIC_BASE = (process.env.CF_MINDTHOS_PUBLIC_ASSETS_PUBLIC_BASE_URL || '').replace(/\/$/, '');

for (const [k, v] of Object.entries({ SUPABASE_URL, SERVICE_KEY, AK, SK, ENDPOINT, BUCKET, PUBLIC_BASE })) {
  if (!v) { console.error(`✗ 환경변수 누락: ${k} (web/.env.local 확인)`); process.exit(1); }
}

/* ---------- SigV4 (S3) ---------- */
const sha256hex = (b) => crypto.createHash('sha256').update(b).digest('hex');
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();

async function s3(method, key, { body = null, headers = {} } = {}) {
  const url = new URL(`${ENDPOINT}/${BUCKET}/${key}`);
  const amzdate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const datestamp = amzdate.slice(0, 8);
  const payloadHash = body ? sha256hex(body) : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const h = { host: url.host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzdate, ...headers };
  const signedHeaders = Object.keys(h).map((k) => k.toLowerCase()).sort().join(';');
  const canonicalHeaders = Object.keys(h)
    .map((k) => [k.toLowerCase(), h[k]])
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => `${k}:${String(v).trim()}\n`)
    .join('');
  const canonicalUri = url.pathname.split('/').map(encodeURIComponent).join('/');
  const canonicalReq = [method, canonicalUri, url.search.slice(1), canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${datestamp}/${REGION}/s3/aws4_request`;
  const sts = ['AWS4-HMAC-SHA256', amzdate, scope, sha256hex(canonicalReq)].join('\n');
  let k = hmac('AWS4' + SK, datestamp); k = hmac(k, REGION); k = hmac(k, 's3'); k = hmac(k, 'aws4_request');
  const sig = crypto.createHmac('sha256', k).update(sts).digest('hex');
  const auth = `AWS4-HMAC-SHA256 Credential=${AK}/${scope}, SignedHeaders=${signedHeaders}, Signature=${sig}`;
  return fetch(url, { method, headers: { ...h, Authorization: auth }, body });
}

/* ---------- 소스 목록 (DB 의 video_url 이 단일 진실 원본) ---------- */
async function fetchPosts() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?select=slug,video_url,video_provider&video_url=not.is.null`,
    { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } },
  );
  if (!res.ok) throw new Error(`posts 조회 실패: ${res.status} ${await res.text()}`);
  return res.json();
}

function targetKeyFor(slug) {
  return `blog/videos/${slug}/v1/video.mp4`;
}

async function migrateOne(post) {
  const { slug, video_url, video_provider } = post;
  // youtube 등 외부 provider 는 대상 아님(파일 없음)
  if (video_provider && video_provider !== 'supabase' && video_provider !== 'mp4' && video_provider !== null) {
    // provider 가 명시적으로 외부면 스킵. (현 데이터는 전부 mp4/self-hosted)
  }
  if (!/\/blog-videos\//.test(video_url)) {
    return { slug, status: 'skip-nonsupabase', video_url };
  }
  const key = targetKeyFor(slug);
  const publicUrl = `${PUBLIC_BASE}/${key}`;

  // 1) 소스 크기 확인 (HEAD)
  const srcHead = await fetch(video_url, { method: 'HEAD' });
  if (!srcHead.ok) return { slug, status: 'error', error: `source HEAD ${srcHead.status}`, video_url };
  const srcLen = Number(srcHead.headers.get('content-length') || 0);

  // 2) 대상 존재/크기 확인 (멱등)
  const dstHead = await s3('HEAD', key);
  if (dstHead.status === 200) {
    const dstLen = Number(dstHead.headers.get('content-length') || 0);
    if (dstLen === srcLen && srcLen > 0) {
      return { slug, status: 'already-exists', key, publicUrl, bytes: srcLen, newUrl: publicUrl };
    }
  }

  if (DRY_RUN) {
    return { slug, status: 'would-upload', key, publicUrl, bytes: srcLen, newUrl: publicUrl };
  }

  // 3) 다운로드 → 버퍼
  const getRes = await fetch(video_url);
  if (!getRes.ok) return { slug, status: 'error', error: `source GET ${getRes.status}`, video_url };
  const buf = Buffer.from(await getRes.arrayBuffer());
  if (srcLen && buf.length !== srcLen) {
    return { slug, status: 'error', error: `download size mismatch ${buf.length} != ${srcLen}`, video_url };
  }

  // 4) R2 PUT
  const put = await s3('PUT', key, {
    body: buf,
    headers: { 'content-type': 'video/mp4', 'cache-control': 'public, max-age=31536000, immutable' },
  });
  if (put.status >= 400) return { slug, status: 'error', error: `R2 PUT ${put.status} ${await put.text()}`, video_url };

  // 5) 공개 URL 검증 (custom domain)
  const verify = await fetch(publicUrl, { method: 'HEAD' });
  const vLen = Number(verify.headers.get('content-length') || 0);
  if (verify.status !== 200) return { slug, status: 'error', error: `public HEAD ${verify.status}`, key, publicUrl, video_url };
  if (vLen !== buf.length) return { slug, status: 'error', error: `public size mismatch ${vLen} != ${buf.length}`, key, publicUrl, video_url };
  const ctype = verify.headers.get('content-type') || '';

  return { slug, status: 'uploaded', key, publicUrl, bytes: buf.length, contentType: ctype, oldUrl: video_url, newUrl: publicUrl };
}

/* ---------- 실행 (제한 동시성) ---------- */
async function run() {
  console.log(`\n블로그 동영상 → R2 마이그레이션 ${DRY_RUN ? '(DRY RUN)' : ''}`);
  console.log(`대상 버킷: ${BUCKET}  공개 기준: ${PUBLIC_BASE}\n`);
  const posts = await fetchPosts();
  console.log(`video_url 보유 글: ${posts.length}개\n`);

  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < posts.length) {
      const my = idx++;
      const post = posts[my];
      try {
        const r = await migrateOne(post);
        results.push(r);
        const mark = { uploaded: '✓', 'already-exists': '=', 'would-upload': '·', 'skip-nonsupabase': '−' }[r.status] || '✗';
        const mb = r.bytes ? `${(r.bytes / 1048576).toFixed(1)}MB` : '';
        console.log(`  ${mark} [${results.length}/${posts.length}] ${post.slug} ${r.status} ${mb} ${r.error ? '→ ' + r.error : ''}`);
      } catch (e) {
        results.push({ slug: post.slug, status: 'error', error: String(e) });
        console.log(`  ✗ ${post.slug} EXCEPTION ${e}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  /* 요약 */
  const by = (s) => results.filter((r) => r.status === s).length;
  const totalBytes = results.reduce((a, r) => a + (r.bytes || 0), 0);
  console.log(`\n── 요약 ──`);
  console.log(`  업로드: ${by('uploaded')}  기존존재: ${by('already-exists')}  예정: ${by('would-upload')}  스킵: ${by('skip-nonsupabase')}  오류: ${by('error')}`);
  console.log(`  총 용량: ${(totalBytes / 1048576).toFixed(1)}MB`);

  const errors = results.filter((r) => r.status === 'error');
  if (errors.length) {
    console.log(`\n⚠ 오류 ${errors.length}건:`);
    for (const e of errors) console.log(`  - ${e.slug}: ${e.error}`);
  }

  /* 매핑 파일 기록 (DB 갱신 단계 입력) */
  const mapDir = path.join(REPO_ROOT, 'scripts/.data');
  fs.mkdirSync(mapDir, { recursive: true });
  const mapFile = path.join(mapDir, 'r2-video-migration-map.json');
  const mapping = results
    .filter((r) => r.newUrl && (r.status === 'uploaded' || r.status === 'already-exists'))
    .map((r) => ({ slug: r.slug, oldUrl: r.oldUrl || null, newUrl: r.newUrl, key: r.key, bytes: r.bytes }));
  fs.writeFileSync(mapFile, JSON.stringify({ generatedAt: new Date().toISOString(), count: mapping.length, mapping }, null, 2));
  console.log(`\n매핑 기록: ${path.relative(REPO_ROOT, mapFile)} (${mapping.length}개)`);
  console.log(errors.length ? '\n❌ 일부 오류 — 재실행하면 멱등적으로 이어서 처리됩니다.\n' : '\n✅ 완료.\n');

  process.exit(errors.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
