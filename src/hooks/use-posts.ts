"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export function usePosts(status?: "draft" | "scheduled" | "published") {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, [supabase, status]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (post: Omit<PostInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("posts")
      .insert({ ...post, user_id: user.id })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    setPosts((prev) => [data, ...prev]);
    return { data, error: null };
  };

  const updatePost = async (id: string, updates: PostUpdate) => {
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? data : p))
    );
    return { data, error: null };
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
    return { error: null };
  };

  const schedulePost = async (id: string, scheduledAt: Date) => {
    return updatePost(id, {
      status: "scheduled",
      scheduled_at: scheduledAt.toISOString(),
    });
  };

  const publishPost = async (id: string) => {
    return updatePost(id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    refetch: fetchPosts,
  };
}
