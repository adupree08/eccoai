export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: "free" | "pro" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
          created_at?: string;
          updated_at?: string;
        };
      };
      brand_voices: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          guidelines: string[];
          excluded_terms: string[];
          preferred_terms: string[];
          samples: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          guidelines?: string[];
          excluded_terms?: string[];
          preferred_terms?: string[];
          samples?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_default?: boolean;
          guidelines?: string[];
          excluded_terms?: string[];
          preferred_terms?: string[];
          samples?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      feeds: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          feed_type: "url" | "keyword";
          keywords: string | null;
          is_active: boolean;
          last_fetched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          url: string;
          feed_type?: "url" | "keyword";
          keywords?: string | null;
          is_active?: boolean;
          last_fetched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          url?: string;
          feed_type?: "url" | "keyword";
          keywords?: string | null;
          is_active?: boolean;
          last_fetched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          feed_id: string;
          title: string;
          snippet: string | null;
          url: string;
          author: string | null;
          published_at: string | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          feed_id: string;
          title: string;
          snippet?: string | null;
          url: string;
          author?: string | null;
          published_at?: string | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          feed_id?: string;
          title?: string;
          snippet?: string | null;
          url?: string;
          author?: string | null;
          published_at?: string | null;
          fetched_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          source_type: "idea" | "url" | "rss";
          source_url: string | null;
          source_article_id: string | null;
          brand_voice_id: string | null;
          formats: string[];
          tones: string[];
          angles: string[];
          status: "draft" | "scheduled" | "published";
          scheduled_at: string | null;
          published_at: string | null;
          linkedin_post_id: string | null;
          impressions: number;
          likes: number;
          comments: number;
          reposts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          source_type?: "idea" | "url" | "rss";
          source_url?: string | null;
          source_article_id?: string | null;
          brand_voice_id?: string | null;
          formats?: string[];
          tones?: string[];
          angles?: string[];
          status?: "draft" | "scheduled" | "published";
          scheduled_at?: string | null;
          published_at?: string | null;
          linkedin_post_id?: string | null;
          impressions?: number;
          likes?: number;
          comments?: number;
          reposts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          source_type?: "idea" | "url" | "rss";
          source_url?: string | null;
          source_article_id?: string | null;
          brand_voice_id?: string | null;
          formats?: string[];
          tones?: string[];
          angles?: string[];
          status?: "draft" | "scheduled" | "published";
          scheduled_at?: string | null;
          published_at?: string | null;
          linkedin_post_id?: string | null;
          impressions?: number;
          likes?: number;
          comments?: number;
          reposts?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
