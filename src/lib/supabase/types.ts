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
          is_admin: boolean;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
          is_admin?: boolean;
          timezone?: string | null;
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
      product_feedback: {
        Row: {
          id: string;
          user_id: string;
          type: "bug" | "feature" | "other";
          message: string;
          status: "new" | "reviewed" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: "bug" | "feature" | "other";
          message: string;
          status?: "new" | "reviewed" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "bug" | "feature" | "other";
          message?: string;
          status?: "new" | "reviewed" | "resolved";
          created_at?: string;
        };
      };
      content_pillars: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_articles: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          feed_id: string;
          title: string;
          snippet: string | null;
          url: string;
          author: string | null;
          published_at: string | null;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          feed_id: string;
          title: string;
          snippet?: string | null;
          url: string;
          author?: string | null;
          published_at?: string | null;
          saved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          feed_id?: string;
          title?: string;
          snippet?: string | null;
          url?: string;
          author?: string | null;
          published_at?: string | null;
          saved_at?: string;
        };
      };
      hidden_articles: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          hidden_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          hidden_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          hidden_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          source_type: "idea" | "url" | "rss" | "comment";
          source_url: string | null;
          source_article_id: string | null;
          brand_voice_id: string | null;
          pillar_id: string | null;
          image_url: string | null;
          formats: string[];
          tones: string[];
          angles: string[];
          status: "idea" | "draft" | "ready" | "revisions" | "scheduled" | "published";
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
          source_type?: "idea" | "url" | "rss" | "comment";
          source_url?: string | null;
          source_article_id?: string | null;
          brand_voice_id?: string | null;
          pillar_id?: string | null;
          image_url?: string | null;
          formats?: string[];
          tones?: string[];
          angles?: string[];
          status?: "idea" | "draft" | "ready" | "revisions" | "scheduled" | "published";
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
          source_type?: "idea" | "url" | "rss" | "comment";
          source_url?: string | null;
          source_article_id?: string | null;
          brand_voice_id?: string | null;
          pillar_id?: string | null;
          image_url?: string | null;
          formats?: string[];
          tones?: string[];
          angles?: string[];
          status?: "idea" | "draft" | "ready" | "revisions" | "scheduled" | "published";
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
      popular_posts: {
        Row: {
          id: string; source: string; external_id: string | null;
          author_name: string | null; author_headline: string | null; post_url: string | null;
          content: string; vertical: string | null; keywords: string[];
          likes: number; comments: number; reposts: number;
          posted_at: string | null; created_at: string;
          featured: boolean; featured_at: string | null;
        };
        Insert: {
          id?: string; source?: string; external_id?: string | null;
          author_name?: string | null; author_headline?: string | null; post_url?: string | null;
          content: string; vertical?: string | null; keywords?: string[];
          likes?: number; comments?: number; reposts?: number;
          posted_at?: string | null; created_at?: string;
          featured?: boolean; featured_at?: string | null;
        };
        Update: {
          id?: string; source?: string; external_id?: string | null;
          author_name?: string | null; author_headline?: string | null; post_url?: string | null;
          content?: string; vertical?: string | null; keywords?: string[];
          likes?: number; comments?: number; reposts?: number;
          posted_at?: string | null; created_at?: string;
          featured?: boolean; featured_at?: string | null;
        };
      };
      icp_prospects: {
        Row: {
          id: string; source: string; external_id: string | null;
          full_name: string | null; headline: string | null; profile_url: string | null;
          location: string | null; current_title: string | null; current_company: string | null;
          email: string | null; icp_label: string | null; status: string;
          notes: string | null; raw: unknown | null; created_at: string;
        };
        Insert: {
          id?: string; source?: string; external_id?: string | null;
          full_name?: string | null; headline?: string | null; profile_url?: string | null;
          location?: string | null; current_title?: string | null; current_company?: string | null;
          email?: string | null; icp_label?: string | null; status?: string;
          notes?: string | null; raw?: unknown | null; created_at?: string;
        };
        Update: {
          id?: string; source?: string; external_id?: string | null;
          full_name?: string | null; headline?: string | null; profile_url?: string | null;
          location?: string | null; current_title?: string | null; current_company?: string | null;
          email?: string | null; icp_label?: string | null; status?: string;
          notes?: string | null; raw?: unknown | null; created_at?: string;
        };
      };
      post_structures: {
        Row: {
          id: string; name: string; description: string;
          hook_type: string | null; example: string | null;
          skeleton: string | null; user_id: string | null;
          approved: boolean; created_at: string;
        };
        Insert: {
          id?: string; name: string; description: string;
          hook_type?: string | null; example?: string | null;
          skeleton?: string | null; user_id?: string | null;
          approved?: boolean; created_at?: string;
        };
        Update: {
          id?: string; name?: string; description?: string;
          hook_type?: string | null; example?: string | null;
          skeleton?: string | null; user_id?: string | null;
          approved?: boolean; created_at?: string;
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
