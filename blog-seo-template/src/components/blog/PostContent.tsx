import { processMarkdown } from '@/lib/markdown/processor';

interface PostContentProps {
  content: string;
}

export async function PostContent({ content }: PostContentProps) {
  const html = await processMarkdown(content);

  return (
    <div
      className="prose prose-slate max-w-none prose-headings:text-[#2f3331] prose-a:text-[#2d6a4f] prose-strong:text-[#2f3331] prose-code:text-[#2d6a4f] prose-pre:bg-[#f5f2ed]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
