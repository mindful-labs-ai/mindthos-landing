import { z } from 'zod';

export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
export const COUNSELING_METHODS = ['대면', '비대면', '상관없음'] as const;

export const contactFormSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  phone: z.string().min(10, '연락처를 입력해주세요'),
  birth_date: z.string().min(1, '생년월일을 입력해주세요'),
  counseling_type: z.string().min(1, '상담 유형을 선택해주세요'),
  counseling_method: z.enum(COUNSELING_METHODS, { error: '상담 방식을 선택해주세요' }),
  preferred_days: z.array(z.string()).min(1, '희망 요일을 선택해주세요'),
  message: z.string().min(10, '문의 내용을 10자 이상 입력해주세요'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
