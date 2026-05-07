import TurndownService from 'turndown';
// @ts-expect-error — 타입 미제공 패키지
import { gfm, tables, strikethrough } from '@joplin/turndown-plugin-gfm';
import { STORAGE_PUBLIC_PREFIX } from './supabase.js';

/**
 * Webflow Rich Text 의 HTML 을 GFM Markdown 으로 변환.
 *
 * 변환 룰:
 * - h1~h6 → ATX (#)
 * - 표 → GFM 표 (turndown-plugin-gfm)
 * - 이미지 src 가 'blog/...' 또는 절대 URL 이 아니면 Supabase Storage prefix 부착
 * - 외부 링크는 그대로 (페이지 처리 단계의 rehypeExternalLinks 가 target 부착)
 * - <figure> 는 안의 <table>/<img> 만 추출 (figure 자체는 markdown 에 없음)
 * - <br> 는 한 줄 공백, <hr> 는 ---
 * - 빈 단락 정리 (>1 빈 줄 → 2 줄)
 */
export function htmlToMarkdown(html: string): string {
  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });

  td.use(gfm);
  td.use(tables);
  td.use(strikethrough);

  // figure → 안의 콘텐츠만
  td.addRule('figure-unwrap', {
    filter: ['figure'],
    replacement(content: string) {
      return '\n\n' + content.trim() + '\n\n';
    },
  });

  // <b> / <strong> 은 raw HTML 로 보존.
  // 한글 인접 시 markdown emphasis (`**X**`) 가 CommonMark right-flanking 조건을 만족 못 해
  // 별표가 그대로 노출되는 문제 회피. processor 의 rehypeSanitize 가 strong 태그를 허용한다.
  td.addRule('strong-raw-html', {
    filter: ['b', 'strong'],
    replacement(content: string) {
      const trimmed = content.trim();
      if (!trimmed) return '';
      return `<strong>${trimmed}</strong>`;
    },
  });

  // <em> / <i> 도 동일 사유로 raw HTML 보존.
  td.addRule('em-raw-html', {
    filter: ['em', 'i'],
    replacement(content: string) {
      const trimmed = content.trim();
      if (!trimmed) return '';
      return `<em>${trimmed}</em>`;
    },
  });

  // 이미지 src prefix 변환
  td.addRule('image-prefix', {
    filter: 'img',
    replacement(_: string, node: unknown) {
      const el = node as { getAttribute(name: string): string | null };
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';
      if (!src) return '';
      const fullSrc = resolveImageSrc(src);
      return `![${escapeAlt(alt)}](${fullSrc})`;
    },
  });

  // <br> 줄바꿈
  td.addRule('br', {
    filter: 'br',
    replacement: () => '  \n',
  });

  // <hr> 제거 — Webflow 원문의 결론 직전 hr 가 시각적 흐름을 끊는다는 사용자 피드백 반영.
  td.addRule('hr-strip', {
    filter: ['hr'],
    replacement: () => '\n\n',
  });

  let md = td.turndown(html);
  md = collapseBlankLines(md);
  md = ensureLeadingBlankBeforeHeading(md);
  md = unescapeBenignMarkers(md);
  md = stripStrayHorizontalRules(md);
  md = trimWhitespace(md);
  return md;
}

/**
 * turndown 이 본문 텍스트에 부착한 안전 escape 백슬래시 제거.
 * `\[`, `\]`, `\(`, `\)`, `\.`, `\!` 만 대상 — `\*`, `\#`, `\<`, `\>` 등은 보존.
 * 헤딩 텍스트가 ToC 에 그대로 노출되는 경우 백슬래시 시각 노출이 어색해서 추가.
 */
function unescapeBenignMarkers(md: string): string {
  return md.replace(/\\([\[\]()!.])/g, '$1');
}

/**
 * 'blog/<uuid>.webp' 같은 상대 경로 → Storage 절대 URL. http(s) 시작이면 그대로.
 * 사용자가 Storage 버킷에 'blog/' 폴더 없이 루트에 직접 업로드했으므로,
 * Baserow 의 'blog/' 접두어는 떼고 매핑한다.
 */
export function resolveImageSrc(src: string): string {
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  const clean = src.replace(/^\/+/, '').replace(/^blog\//, '');
  return `${STORAGE_PUBLIC_PREFIX}/${clean}`;
}

function escapeAlt(alt: string): string {
  return alt.replace(/[\[\]]/g, '');
}

/** 3줄 이상 빈줄 → 2줄 */
function collapseBlankLines(md: string): string {
  return md.replace(/\n{3,}/g, '\n\n');
}

/** 헤딩 직전에 빈 줄 보장 (## 라인 위가 텍스트면 빈 줄 삽입) */
function ensureLeadingBlankBeforeHeading(md: string): string {
  return md.replace(/([^\n])\n(#{1,6} )/g, '$1\n\n$2');
}

function trimWhitespace(md: string): string {
  return md.replace(/[ \t]+\n/g, '\n').trim() + '\n';
}

/**
 * 본문 안의 horizontal rule (`---`, `***`, `* * *`) 라인을 모두 빈 줄로 치환.
 * <hr-strip> 룰이 turndown 출력에서 hr 을 제거하지만, 안전망으로 한 번 더.
 */
function stripStrayHorizontalRules(md: string): string {
  return md.replace(/^\s*(\*\s?\*\s?\*|---|___)\s*$/gm, '');
}
