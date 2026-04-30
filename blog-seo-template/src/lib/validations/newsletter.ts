import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  name: z.string().optional(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
