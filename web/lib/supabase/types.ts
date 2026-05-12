export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
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
        Relationships: [];
      };
      tags: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: { id?: string; name?: string; slug?: string; created_at?: string };
        Relationships: [];
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
        Relationships: [];
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
          video_url: string | null;
          video_provider: string | null;
          video_position: string | null;
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
          video_url?: string | null;
          video_provider?: string | null;
          video_position?: string | null;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'posts_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'authors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_counseling_program_id_fkey';
            columns: ['counseling_program_id'];
            isOneToOne: false;
            referencedRelation: 'counseling_programs';
            referencedColumns: ['id'];
          },
        ];
      };
      post_tags: {
        Row: { post_id: string; tag_id: string };
        Insert: { post_id: string; tag_id: string };
        Update: { post_id?: string; tag_id?: string };
        Relationships: [
          {
            foreignKeyName: 'post_tags_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          inquiry_type: string | null;
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
          inquiry_type?: string | null;
          preferred_date?: string | null;
          message?: string | null;
          source_url?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contact_inquiries']['Insert']>;
        Relationships: [];
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
        Update: Partial<Database['public']['Tables']['program_registrations']['Insert']>;
        Relationships: [];
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
          is_cta_enabled: boolean;
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
          is_cta_enabled?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['counseling_programs']['Insert']>;
        Relationships: [];
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
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>;
        Relationships: [];
      };
      academy_inquiries: {
        Row: {
          id: string;
          credit_status: 'completed' | 'in-progress' | 'not-yet' | 'unsure';
          name: string;
          phone: string;
          source_url: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          user_agent: string | null;
          status: 'pending' | 'contacted' | 'enrolled' | 'closed';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          credit_status: 'completed' | 'in-progress' | 'not-yet' | 'unsure';
          name: string;
          phone: string;
          source_url?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          user_agent?: string | null;
          status?: 'pending' | 'contacted' | 'enrolled' | 'closed';
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['academy_inquiries']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
