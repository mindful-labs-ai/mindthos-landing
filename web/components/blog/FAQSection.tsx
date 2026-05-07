/**
 * FAQ UI 렌더링 전용 컴포넌트.
 * JSON-LD 주입은 부모 페이지(app/(site)/blog/[slug]/page.tsx)에서 SchemaMarkup 으로 처리.
 * (이중 주입 방지 + 스키마 단일 책임)
 */

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  schema_markup: Record<string, unknown> | null;
}

export function extractFAQs(
  schema: Record<string, unknown> | null,
): FAQItem[] {
  if (!schema) return [];

  if (schema['@type'] === 'FAQPage') {
    const mainEntity = schema['mainEntity'];
    if (Array.isArray(mainEntity)) {
      return mainEntity
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === 'object' && item !== null,
        )
        .map((item) => {
          const acceptedAnswer = item['acceptedAnswer'] as
            | Record<string, unknown>
            | undefined;
          return {
            question: String(item['name'] ?? ''),
            answer: String(acceptedAnswer?.['text'] ?? ''),
          };
        })
        .filter((faq) => faq.question && faq.answer);
    }
  }

  const mainEntity = schema['mainEntity'];
  if (Array.isArray(mainEntity)) {
    const faqPage = mainEntity.find(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' &&
        item !== null &&
        item['@type'] === 'FAQPage',
    );
    if (faqPage) return extractFAQs(faqPage);
  }

  return [];
}

export function FAQSection({ schema_markup }: FAQSectionProps) {
  const faqs = extractFAQs(schema_markup);
  if (faqs.length === 0) return null;

  return (
    <section className="mt-10 border-t border-[var(--line-1)] pt-8">
      <h2 className="mb-6 text-h3 font-semibold text-[var(--text-heading-strong)]">
        자주 묻는 질문
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] overflow-hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-small font-medium text-[var(--text-heading-strong)] list-none [&::-webkit-details-marker]:hidden hover:bg-[var(--bg-warm)] transition-colors">
              <span>{faq.question}</span>
              <span
                className="shrink-0 text-[var(--text-muted)] group-open:rotate-180 transition-transform"
                aria-hidden="true"
              >
                ▼
              </span>
            </summary>
            <div className="border-t border-[var(--line-2)] px-5 py-4">
              <p className="text-small leading-relaxed text-[var(--text-body)]">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
