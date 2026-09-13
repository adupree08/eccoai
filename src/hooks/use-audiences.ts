"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

export type Audience = Database["public"]["Tables"]["audiences"]["Row"];
type AudienceInsert = Database["public"]["Tables"]["audiences"]["Insert"];
type AudienceUpdate = Database["public"]["Tables"]["audiences"]["Update"];

export function useAudiences() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAudiences = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("audiences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setAudiences(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAudiences();
  }, [fetchAudiences]);

  const createAudience = async (a: Omit<AudienceInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("audiences")
      .insert({ ...a, user_id: user.id })
      .select()
      .single();
    if (error) return { error: error.message };
    setAudiences((prev) => [...prev, data]);
    return { data, error: null };
  };

  const updateAudience = async (id: string, updates: AudienceUpdate) => {
    const { data, error } = await supabase
      .from("audiences")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    setAudiences((prev) => prev.map((a) => (a.id === id ? data : a)));
    return { data, error: null };
  };

  const deleteAudience = async (id: string) => {
    const { error } = await supabase.from("audiences").delete().eq("id", id);
    if (error) return { error: error.message };
    setAudiences((prev) => prev.filter((a) => a.id !== id));
    return { error: null };
  };

  return { audiences, loading, createAudience, updateAudience, deleteAudience, refetch: fetchAudiences };
}
