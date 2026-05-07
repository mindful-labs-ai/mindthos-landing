import type { BaserowRow } from './baserow.js';

export interface ReferenceItem {
  name: string;
  url: string;
  type: 'academic' | 'government' | 'industry';
  description?: string;
}

/** URL 휴리스틱으로 reference 분류. */
export function inferReferenceType(
  url: string
): 'academic' | 'government' | 'industry' {
  if (/\.go\.kr|\.gov(\.|\/)|\.gov$/.test(url)) return 'government';
  if (/scholar|pubmed|doi\.org|riss\.kr|kci\.go\.kr|oxford|springer|sciencedirect/.test(url))
    return 'academic';
  return 'industry';
}

/** Baserow outlink-1/2/3 → references[] */
export function buildReferences(row: BaserowRow): ReferenceItem[] {
  const out: ReferenceItem[] = [];
  for (const i of [1, 2, 3] as const) {
    const url = (row[`outlink-${i}`] as string | null)?.trim();
    const title = (row[`outlink-${i}-title`] as string | null)?.trim();
    if (!url) continue;
    out.push({
      name: title || url,
      url,
      type: inferReferenceType(url),
    });
  }
  return out;
}

/** keyword 컬럼 → keywords[] (콤마/줄바꿈 분리) */
export function splitKeywords(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\n、・]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 50)
    .slice(0, 10);
}

/** slug 정규화 — 소문자, 영문/숫자/하이픈만, 중복 하이픈 제거. */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** 한글/공백 안전 truncate (그래픽 cluster 단위 아님 — char 단위 충분) */
export function truncate(s: string | null | undefined, max: number): string | null {
  if (!s) return null;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

/** content 길이 → 분 단위 reading_time (한글 500자/분 기준) */
export function readingTimeMinutes(markdown: string): number {
  return Math.max(1, Math.ceil(markdown.length / 500));
}
