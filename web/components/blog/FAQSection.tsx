interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  schema_markup: Record<string, unknown> | null;
}

function extractFAQs(schema: Record<string, unknown>): FAQItem[] {
  // Direct FAQPage schema
  if (schema['@type'] === 'FAQPage') {
    const mainEntity = schema['mainEntity'];
    if (Array.isArray(mainEntity)) {
      return mainEntity
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item) => {
          const acceptedAnswer = item['acceptedAnswer'] as Record<string, unknown> | undefined;
          return {
            question: String(item['name'] ?? ''),
            answer: String(acceptedAnswer?.['text'] ?? ''),
          };
        })
        .filter((faq) => faq.question && faq.answer);
    }
  }

  // Nested FAQPage inside another schema
  const mainEntity = schema['mainEntity'];
  if (Array.isArray(mainEntity)) {
    const faqPage = mainEntity.find(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null && item['@type'] === 'FAQPage'
    );
    if (faqPage) return extractFAQs(faqPage);
  }

  return [];
}

export function FAQSection({ schema_markup }: FAQSectionProps) {
  if (!schema_markup) return null;

  const faqs = extractFAQs(schema_markup);
  if (faqs.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section className="mt-10 border-t border-[var(--line-1)] pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="mb-6 text-[length:var(--t-h3)] font-semibold text-[var(--text-heading-strong)]">
        자주 묻는 질문
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-[var(--line-1)] bg-[var(--bg-base)] overflow-hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-[length:var(--t-small)] font-medium text-[var(--text-heading-strong)] list-none [&::-webkit-details-marker]:hidden hover:bg-[var(--bg-warm)] transition-colors">
              <span>{faq.question}</span>
              <span className="shrink-0 text-[var(--text-muted)] group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
            </summary>
            <div className="border-t border-[var(--line-2)] px-5 py-4">
              <p className="text-[length:var(--t-small)] leading-relaxed text-[var(--text-body)]">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
