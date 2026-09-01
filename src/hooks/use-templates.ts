"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

export type Template = Database["public"]["Tables"]["post_structures"]["Row"];

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    // RLS returns approved global templates + this user's own templates.
    const { data, error } = await supabase
      .from("post_structures")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setTemplates(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (t: {
    name: string;
    description: string;
    skeleton: string;
    hook_type: string | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("post_structures")
      // A user's own template: approved is irrelevant to their own access.
      .insert({ ...t, user_id: user.id, approved: false })
      .select()
      .single();
    if (error) return { error: error.message };
    setTemplates((prev) => [...prev, data]);
    return { data, error: null };
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from("post_structures").delete().eq("id", id);
    if (error) return { error: error.message };
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    return { error: null };
  };

  return { templates, loading, error, userId, createTemplate, deleteTemplate, refetch: fetchTemplates };
}
