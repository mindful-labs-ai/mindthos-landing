export interface ContactInquiry {
  name: string;
  phone?: string;
  email?: string;
  inquiryType?: string;
  preferredDate?: string;
  message?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface NewsletterSubscription {
  email: string;
  name?: string;
  sourceUrl?: string;
}
