export interface ContactInquiry {
  name: string;
  phone: string;
  email: string;
  counseling_type: string;
  preferred_date?: string;
  message: string;
  source_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ProgramRegistration {
  program_name: string;
  name: string;
  phone: string;
  email: string;
  affiliation?: string;
  message?: string;
}

export interface NewsletterSubscription {
  email: string;
  name?: string;
  source_url?: string;
}
