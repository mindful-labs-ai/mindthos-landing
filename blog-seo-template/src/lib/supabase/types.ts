export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    // Required by @supabase/supabase-js v2.100+
    PostgrestVersion: '12';
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          target_audience: string;
          default_cta_type: string;
          seo_title: string | null;
          seo_description: string | null;
          sort_order: number;
          default_program_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          target_audience?: string;
          default_cta_type?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          sort_order?: number;
          default_program_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          target_audience?: string;
          default_cta_type?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          sort_order?: number;
          default_program_id?: string | null;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      authors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          title: string | null;
          bio: string | null;
          profile_image_url: string | null;
          credentials: string[];
          specialties: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          title?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          credentials?: string[];
          specialties?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          title?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          credentials?: string[];
          specialties?: string[];
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          summary: string | null;
          keywords: string[];
          category_id: string;
          thumbnail_url: string | null;
          author_id: string | null;
          status: string;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          schema_markup: Json | null;
          references: Json | null;
          cta_type: string;
          reading_time: number | null;
          view_count: number;
          is_featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          counseling_program_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          summary?: string | null;
          keywords?: string[];
          category_id: string;
          thumbnail_url?: string | null;
          author_id?: string | null;
          counseling_program_id?: string | null;
          status?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          schema_markup?: Json | null;
          references?: Json | null;
          cta_type?: string;
          reading_time?: number | null;
          view_count?: number;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          summary?: string | null;
          keywords?: string[];
          category_id?: string;
          thumbnail_url?: string | null;
          author_id?: string | null;
          status?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          schema_markup?: Json | null;
          references?: Json | null;
          cta_type?: string;
          reading_time?: number | null;
          view_count?: number;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          counseling_program_id?: string | null;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          counseling_type: string | null;
          preferred_date: string | null;
          message: string | null;
          source_url: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          counseling_type?: string | null;
          preferred_date?: string | null;
          message?: string | null;
          source_url?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          counseling_type?: string | null;
          preferred_date?: string | null;
          message?: string | null;
          source_url?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      program_registrations: {
        Row: {
          id: string;
          program_name: string;
          name: string;
          phone: string | null;
          email: string | null;
          affiliation: string | null;
          message: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_name: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          affiliation?: string | null;
          message?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_name?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          affiliation?: string | null;
          message?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      counseling_programs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          cta_heading: string | null;
          cta_button_text: string | null;
          match_keywords: string[];
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          cta_heading?: string | null;
          cta_button_text?: string | null;
          match_keywords?: string[];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          subtitle?: string | null;
          cta_heading?: string | null;
          cta_button_text?: string | null;
          match_keywords?: string[];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          source_url: string | null;
          subscribed_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          source_url?: string | null;
          subscribed_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          source_url?: string | null;
          subscribed_at?: string;
          is_active?: boolean;
        };
      };
    };
  };
}
