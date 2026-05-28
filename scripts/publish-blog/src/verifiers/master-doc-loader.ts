/**
 * Master Document 로더.
 * docs/fact-master/*.md 파일을 읽어서 frontmatter 메타 + 본문 텍스트로 분해.
 *
 * V5 fact-check verifier 에서 토픽 추론 후 매칭된 master 를 prompt 에 포함하기 위해 사용.
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const FACT_MASTER_DIR = resolve(REPO_ROOT, 'docs', 'fact-master');

export interface MasterDocMeta {
  slug: string;
  title: string;
  aliases: string[];
  version: string;
  last_reviewed: string;
  last_refreshed: string;
  confidence_overall: number;
  sources_consulted: string[];
}

export interface MasterDoc {
  meta: MasterDocMeta;
  /** frontmatter 제외한 본문 마크다운 */
  body: string;
  /** 전체 파일 경로 */
  path: string;
}

/**
 * 매우 가벼운 YAML frontmatter 파서.
 * 외부 의존 없이 동작하도록 단순 string parsing 사용.
 * 정식 YAML 의 모든 케이스를 다루지는 않지만 fact-master frontmatter 형식만 다룸.
 */
function parseFrontmatter(text: string): { meta: Record<string, any>; body: string } {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fm) return { meta: {}, body: text };

  const block = fm[1];
  const body = fm[2];

  const meta: Record<string, any> = {};
  const lines = block.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;

    // list item ("  - value")
    const listMatch = line.match(/^\s+-\s+(.*)$/);
    if (listMatch && currentList) {
      currentList.push(listMatch[1].trim());
      continue;
    }

    // key: value (or key: with list)
    const kvMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === '') {
        currentList = [];
        meta[currentKey] = currentList;
      } else {
        currentList = null;
        // number 또는 string 으로 변환
        const asNum = Number.parseFloat(value);
        meta[currentKey] =
          !Number.isNaN(asNum) && /^[\d.]+$/.test(value) ? asNum : value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return { meta, body };
}

let cache: MasterDoc[] | null = null;

/**
 * fact-master 폴더에서 모든 master doc 로드. 메모리 캐시.
 * `_` 로 시작하는 파일(`_schema.md`, `_sources.md`)과 `README.md` 는 제외.
 */
export function loadAllMasterDocs(): MasterDoc[] {
  if (cache) return cache;

  const files = readdirSync(FACT_MASTER_DIR).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md',
  );

  const docs: MasterDoc[] = [];
  for (const file of files) {
    const path = resolve(FACT_MASTER_DIR, file);
    const text = readFileSync(path, 'utf-8');
    const { meta, body } = parseFrontmatter(text);

    const slug = (meta.slug as string) || basename(file, '.md');
    docs.push({
      meta: {
        slug,
        title: (meta.title as string) ?? slug,
        aliases: Array.isArray(meta.aliases) ? meta.aliases : [],
        version: (meta.version as string) ?? 'v1',
        last_reviewed: (meta.last_reviewed as string) ?? '',
        last_refreshed: (meta.last_refreshed as string) ?? '',
        confidence_overall:
          typeof meta.confidence_overall === 'number' ? meta.confidence_overall : 0.5,
        sources_consulted: Array.isArray(meta.sources_consulted)
          ? meta.sources_consulted
          : [],
      },
      body,
      path,
    });
  }

  cache = docs;
  return docs;
}

/**
 * verifier 의 토픽 추론 단계에서 prompt 에 주입할 alias 인덱스.
 *
 * 출력 예시:
 * ```
 * - counseling-licenses-kr: 한국 상담 관련 자격증 / aliases: 임상심리사, 상담심리사, ...
 * - counseling-ethics-kr: 한국 상담사 윤리강령 / aliases: 비밀보장, 이중관계, ...
 * ```
 */
export function renderMasterDocList(): string {
  const docs = loadAllMasterDocs();
  return docs
    .map((d) => {
      const aliases = d.meta.aliases.slice(0, 8).join(', ');
      return `- ${d.meta.slug}: ${d.meta.title} / aliases: ${aliases}`;
    })
    .join('\n');
}

/**
 * 주어진 slug 목록에 해당하는 master 들의 본문을 prompt 주입용으로 직렬화.
 * 토큰 비용 cap 을 위해 한 master 당 최대 8,000 chars 로 자른다.
 */
export function renderMasterDocsForPrompt(slugs: string[]): string {
  const docs = loadAllMasterDocs();
  const selected = docs.filter((d) => slugs.includes(d.meta.slug));
  if (selected.length === 0) return '(no master docs matched)';

  const MAX_CHARS_PER_DOC = 8000;
  return selected
    .map((d) => {
      const trimmed =
        d.body.length > MAX_CHARS_PER_DOC
          ? d.body.slice(0, MAX_CHARS_PER_DOC) + '\n\n[... truncated for token budget ...]'
          : d.body;
      return `### Master: ${d.meta.slug} (v=${d.meta.version}, confidence=${d.meta.confidence_overall})\n\n${trimmed}`;
    })
    .join('\n\n---\n\n');
}
