import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  schemaMarkup: Record<string, unknown> | null;
}

function extractFAQs(schemaMarkup: Record<string, unknown>): FAQItem[] {
  // Direct FAQPage schema
  if (schemaMarkup['@type'] === 'FAQPage') {
    const mainEntity = schemaMarkup['mainEntity'];
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

  // Nested inside another schema via mainEntity
  const mainEntity = schemaMarkup['mainEntity'];
  if (Array.isArray(mainEntity)) {
    const faqPage = mainEntity.find(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null && item['@type'] === 'FAQPage'
    );
    if (faqPage) {
      return extractFAQs(faqPage);
    }
  }

  return [];
}

export function FAQSection({ schemaMarkup }: FAQSectionProps) {
  if (!schemaMarkup) return null;

  const faqs = extractFAQs(schemaMarkup);
  if (faqs.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-10 border-t border-[#e0ddd8] pt-8">
      <SchemaMarkup schema={faqSchema} />
      <h2 className="mb-6 text-xl font-bold text-[#2f3331]">자주 묻는 질문</h2>
      <Accordion>
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger className="text-left text-sm font-medium text-[#2f3331]">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm leading-relaxed text-[#5c605d]">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
