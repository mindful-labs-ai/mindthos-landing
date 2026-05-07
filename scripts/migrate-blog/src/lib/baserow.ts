import { ofetch } from 'ofetch';

const API_URL = process.env.BASEROW_API_URL || 'https://api.baserow.io';
const TOKEN = process.env.BASEROW_TOKEN;
const TABLE_ID = Number(process.env.BASEROW_TABLE_ID || '763048');

/**
 * Baserow 'Mindthos Blog' (table 763048) 의 row 타입.
 * 데이터 수집:
 *   1) BASEROW_TOKEN 이 있으면 REST API 로 직접 fetch (권장)
 *   2) 없으면 Claude 세션의 Baserow MCP 로 받아 .data/baserow-all.json 에 저장
 */
export interface BaserowRow {
  id: number;
  order?: string;
  ID: number;
  Category: string | null;
  Name: string | null;
  thumbnail: string | null;
  'thumbnail-prompt': string | null;
  slug: string | null;
  'short-discription': string | null;
  'editor-note': string | null;
  'body-result-first': string | null;
  'body-json': string | null;
  'body-final': string | null;
  keyword: string | null;
  'outlink-1': string | null;
  'outlink-1-title': string | null;
  'outlink-2': string | null;
  'outlink-2-title': string | null;
  'outlink-3': string | null;
  'outlink-3-title': string | null;
  '콘텐츠 작성 완료'?: boolean;
  '블로그 포스트 완료'?: boolean;
  'Last Modified Time': string | null;
  [key: string]: unknown;
}

interface ListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BaserowRow[];
}

function requireToken(): string {
  if (!TOKEN)
    throw new Error(
      'BASEROW_TOKEN 이 설정되지 않았습니다. scripts/migrate-blog/.env 또는 web/.env.local 확인.'
    );
  return TOKEN;
}

/** Baserow REST API. user_field_names=true 로 컬럼명 그대로 사용. size 200 한도. */
async function fetchPage(page: number, size = 200): Promise<ListResponse> {
  const token = requireToken();
  const url = `${API_URL}/api/database/rows/table/${TABLE_ID}/?user_field_names=true&size=${size}&page=${page}`;
  return ofetch<ListResponse>(url, {
    headers: { Authorization: `Token ${token}` },
    retry: 3,
    retryDelay: 1000,
  });
}

/** 발행 글 전체 페이지네이션 — 큰 표 대비. */
export async function fetchAllRows(): Promise<BaserowRow[]> {
  const all: BaserowRow[] = [];
  const size = 200;
  let page = 1;
  while (true) {
    const res = await fetchPage(page, size);
    all.push(...res.results);
    if (!res.next || res.results.length < size) break;
    page += 1;
  }
  return all;
}

/** 처음 N 개만 (테스트 용도) — page=1 size=N 한 번 호출. */
export async function fetchFirstNRows(n: number): Promise<BaserowRow[]> {
  const res = await fetchPage(1, Math.min(n, 200));
  return res.results.slice(0, n);
}
