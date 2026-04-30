import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
// rehype-autolink-headings removed — 본문 헤드라인 클릭 불필요
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

// Custom plugin: wrap tables in responsive container
function rehypeResponsiveTable() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-responsive'] },
          children: [node],
        };
        (parent as Element).children[index] = wrapper;
      }
    });
  };
}

// Custom plugin: add security attributes to external links
function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a') {
        const href = node.properties?.href as string | undefined;
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          node.properties = node.properties || {};
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}

export async function processMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    // rehype-slug만 사용 (ID 부여), autolink-headings 제거 — 본문 헤드라인에 클릭 불필요
    .use(rehypeResponsiveTable)
    .use(rehypeExternalLinks)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(result);
}
