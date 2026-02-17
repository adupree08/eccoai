"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

type Feed = Database["public"]["Tables"]["feeds"]["Row"];
type FeedInsert = Database["public"]["Tables"]["feeds"]["Insert"];
type FeedUpdate = Database["public"]["Tables"]["feeds"]["Update"];
type Article = Database["public"]["Tables"]["articles"]["Row"];

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchFeeds = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("feeds")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setFeeds(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const createFeed = async (feed: Omit<FeedInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("feeds")
      .insert({ ...feed, user_id: user.id })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    setFeeds((prev) => [...prev, data]);
    return { data, error: null };
  };

  const updateFeed = async (id: string, updates: FeedUpdate) => {
    const { data, error } = await supabase
      .from("feeds")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? data : f))
    );
    return { data, error: null };
  };

  const deleteFeed = async (id: string) => {
    const { error } = await supabase
      .from("feeds")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    setFeeds((prev) => prev.filter((f) => f.id !== id));
    return { error: null };
  };

  const toggleFeedActive = async (id: string) => {
    const feed = feeds.find((f) => f.id === id);
    if (!feed) return { error: "Feed not found" };

    return updateFeed(id, { is_active: !feed.is_active });
  };

  return {
    feeds,
    loading,
    error,
    createFeed,
    updateFeed,
    deleteFeed,
    toggleFeedActive,
    refetch: fetchFeeds,
  };
}

export function useFeedArticles(feedId: string | null) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchArticles = useCallback(async () => {
    if (!feedId) {
      setArticles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("feed_id", feedId)
      .order("published_at", { ascending: false })
      .limit(20);

    if (error) {
      setError(error.message);
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  }, [supabase, feedId]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  };
}
