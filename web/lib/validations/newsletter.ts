import { z } from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  name: z.string().max(50).optional(),
  sourceUrl: z.string().url().optional(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
