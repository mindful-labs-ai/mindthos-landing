import { processMarkdown } from '@/lib/markdown/processor';

interface PostContentProps {
  content: string;
}

export async function PostContent({ content }: PostContentProps) {
  const html = await processMarkdown(content);

  return (
    <div
      className="prose mt-10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
