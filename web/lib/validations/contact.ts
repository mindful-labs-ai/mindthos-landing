import { z } from 'zod';

export const contactInquirySchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  phone: z
    .string()
    .min(10, '연락처를 정확히 입력해주세요')
    .max(20)
    .optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  inquiryType: z.string().min(1).max(50).optional(),
  preferredDate: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
  sourceUrl: z.string().url().optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
