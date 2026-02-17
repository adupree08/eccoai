"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  content: string;
  status: string;
  source_type: string;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  reposts: number | null;
  published_at: string | null;
  created_at: string;
}

interface AnalyticsStats {
  totalPosts: number;
  drafts: number;
  scheduled: number;
  published: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  bySourceType: {
    idea: number;
    url: number;
    rss: number;
  };
  topPosts: Array<{
    id: string;
    content: string;
    impressions: number;
    likes: number;
    comments: number;
    reposts: number;
    published_at: string | null;
  }>;
}

export function useAnalytics(period: string = "30 days") {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7 days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30 days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90 days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "All time":
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Fetch all posts for the user within the period
    const { data, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("impressions", { ascending: false });

    const posts = data as Post[] | null;

    if (postsError) {
      setError(postsError.message);
      setLoading(false);
      return;
    }

    if (!posts || posts.length === 0) {
      setStats(null);
      setLoading(false);
      return;
    }

    // Calculate stats
    const drafts = posts.filter(p => p.status === "draft").length;
    const scheduled = posts.filter(p => p.status === "scheduled").length;
    const published = posts.filter(p => p.status === "published").length;

    const totalImpressions = posts.reduce((sum, p) => sum + (p.impressions || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalReposts = posts.reduce((sum, p) => sum + (p.reposts || 0), 0);

    const bySourceType = {
      idea: posts.filter(p => p.source_type === "idea").length,
      url: posts.filter(p => p.source_type === "url").length,
      rss: posts.filter(p => p.source_type === "rss").length,
    };

    // Get top 5 posts by impressions (only published ones)
    const topPosts = posts
      .filter(p => p.status === "published")
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        content: p.content,
        impressions: p.impressions || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
        reposts: p.reposts || 0,
        published_at: p.published_at,
      }));

    setStats({
      totalPosts: posts.length,
      drafts,
      scheduled,
      published,
      totalImpressions,
      totalLikes,
      totalComments,
      totalReposts,
      bySourceType,
      topPosts,
    });
    setLoading(false);
  }, [supabase, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    loading,
    error,
    refetch: fetchAnalytics,
    hasData: stats !== null && stats.totalPosts > 0,
  };
}
