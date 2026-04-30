import GithubSlugger from 'github-slugger';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 본문 H2/H3 견출만 추출. ID 는 rehype-slug 가 본문에 박는 것과 동일한 github-slugger 로 생성.
 * 두 곳에서 같은 슬러거를 쓰므로 ToC anchor 와 본문 id 가 항상 일치한다.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    items.push({ id: slugger.slug(text), text, level });
  }

  return items;
}
