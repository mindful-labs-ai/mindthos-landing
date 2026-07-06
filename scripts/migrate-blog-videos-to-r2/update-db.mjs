#!/usr/bin/env node
/**
 * posts.video_url 컬럼을 Supabase URL → R2(media.mindthos.com) URL 로 갱신.
 *
 * - 입력: scripts/.data/r2-video-migration-map.json (migrate.mjs 가 생성, 검증 완료된 항목만 포함)
 * - 갱신 전 현재 값을 scripts/.data/video-url-backup-<ts>.json 에 백업(롤백용).
 * - slug 단위 PATCH (video_url 만 변경, video_provider 등 나머지는 건드리지 않음).
 * - 갱신 후 재조회로 검증.
 *
 * 실행:
 *   node scripts/migrate-blog-videos-to-r2/update-db.mjs --dry-run  # 무엇을 바꿀지 출력만
 *   node scripts/migrate-blog-videos-to-r2/update-db.mjs            # 실제 갱신
 *   node scripts/migrate-blog-videos-to-r2/update-db.mjs --rollback <backup.json>  # 백업으로 되돌림
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK = process.argv.includes('--rollback');

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
if (!SUPABASE_URL || !SERVICE_KEY) { console.error('✗ Supabase 환경변수 누락'); process.exit(1); }

const H = { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, 'Content-Type': 'application/json' };

async function getVideoUrl(slug) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&select=slug,video_url`, { headers: H });
  const rows = await res.json();
  return rows[0]?.video_url ?? null;
}

async function patchVideoUrl(slug, url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ video_url: url }),
  });
  if (!res.ok) throw new Error(`PATCH ${slug} 실패: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0]?.video_url ?? null;
}

async function rollback() {
  const backupPath = process.argv[process.argv.indexOf('--rollback') + 1];
  if (!backupPath || !fs.existsSync(backupPath)) { console.error('✗ --rollback <backup.json> 경로 필요'); process.exit(1); }
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`롤백: ${backup.entries.length}개 → 원래 값으로 복원`);
  let ok = 0;
  for (const e of backup.entries) {
    const now = await patchVideoUrl(e.slug, e.video_url);
    if (now === e.video_url) ok++;
    console.log(`  ${now === e.video_url ? '✓' : '✗'} ${e.slug}`);
  }
  console.log(`\n복원 완료: ${ok}/${backup.entries.length}`);
}

async function run() {
  if (ROLLBACK) return rollback();

  const mapFile = path.join(REPO_ROOT, 'scripts/.data/r2-video-migration-map.json');
  if (!fs.existsSync(mapFile)) { console.error(`✗ 매핑 파일 없음: ${mapFile} — 먼저 migrate.mjs 실행`); process.exit(1); }
  const { mapping } = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  console.log(`\nposts.video_url 갱신 ${DRY_RUN ? '(DRY RUN)' : ''} — 대상 ${mapping.length}개\n`);

  // 1) 현재 값 백업
  const entries = [];
  for (const m of mapping) {
    const current = await getVideoUrl(m.slug);
    entries.push({ slug: m.slug, video_url: current, newUrl: m.newUrl });
  }
  const alreadyR2 = entries.filter((e) => e.video_url === e.newUrl).length;
  const toChange = entries.filter((e) => e.video_url && e.video_url !== e.newUrl);
  console.log(`  이미 R2: ${alreadyR2}  변경 대상: ${toChange.length}\n`);

  if (!DRY_RUN && toChange.length) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(REPO_ROOT, `scripts/.data/video-url-backup-${ts}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({ generatedAt: ts, entries }, null, 2));
    console.log(`  백업: ${path.relative(REPO_ROOT, backupFile)}\n`);
  }

  // 2) 갱신
  let done = 0, fail = 0;
  for (const e of toChange) {
    if (DRY_RUN) { console.log(`  · ${e.slug}\n      ${e.video_url}\n   →  ${e.newUrl}`); continue; }
    try {
      const now = await patchVideoUrl(e.slug, e.newUrl);
      if (now === e.newUrl) { done++; console.log(`  ✓ ${e.slug}`); }
      else { fail++; console.log(`  ✗ ${e.slug} 검증 실패: ${now}`); }
    } catch (err) { fail++; console.log(`  ✗ ${e.slug} ${err}`); }
  }

  console.log(`\n── 요약 ── 변경: ${done}  실패: ${fail}  이미R2: ${alreadyR2}`);
  process.exit(fail ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
