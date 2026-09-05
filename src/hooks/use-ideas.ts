"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

export type Idea = Database["public"]["Tables"]["ideas"]["Row"];
type IdeaInsert = Database["public"]["Tables"]["ideas"]["Insert"];
type IdeaUpdate = Database["public"]["Tables"]["ideas"]["Update"];
type PopularPost = Database["public"]["Tables"]["popular_posts"]["Row"];

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchIdeas = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("ideas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setIdeas(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const createIdea = async (idea: Omit<IdeaInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("ideas")
      .insert({ ...idea, user_id: user.id })
      .select()
      .single();
    if (error) return { error: error.message };
    setIdeas((prev) => [data, ...prev]);
    return { data, error: null };
  };

  const updateIdea = async (id: string, updates: IdeaUpdate) => {
    const { data, error } = await supabase
      .from("ideas")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    setIdeas((prev) => prev.map((i) => (i.id === id ? data : i)));
    return { data, error: null };
  };

  const deleteIdea = async (id: string) => {
    const { error } = await supabase.from("ideas").delete().eq("id", id);
    if (error) return { error: error.message };
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    return { error: null };
  };

  // Save a Popular Posts card into the vault as a raw research idea.
  const saveResearchPost = async (p: PopularPost) => {
    return createIdea({
      source: "research",
      status: "approved",
      title: p.author_name,
      source_popular_post_id: p.id,
      source_author: p.author_name,
      source_avatar: p.author_avatar,
      source_content: p.content,
      source_url: p.post_url,
    });
  };

  return { ideas, loading, createIdea, updateIdea, deleteIdea, saveResearchPost, refetch: fetchIdeas };
}
