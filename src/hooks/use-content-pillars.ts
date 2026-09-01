"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

type Pillar = Database["public"]["Tables"]["content_pillars"]["Row"];
type PillarInsert = Database["public"]["Tables"]["content_pillars"]["Insert"];
type PillarUpdate = Database["public"]["Tables"]["content_pillars"]["Update"];

export function useContentPillars() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPillars = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("content_pillars")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setPillars(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPillars();
  }, [fetchPillars]);

  const createPillar = async (pillar: Omit<PillarInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("content_pillars")
      .insert({ ...pillar, user_id: user.id })
      .select()
      .single();
    if (error) return { error: error.message };
    setPillars((prev) => [...prev, data]);
    return { data, error: null };
  };

  const updatePillar = async (id: string, updates: PillarUpdate) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("content_pillars")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) return { error: error.message };
    setPillars((prev) => prev.map((p) => (p.id === id ? data : p)));
    return { data, error: null };
  };

  const deletePillar = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("content_pillars")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    setPillars((prev) => prev.filter((p) => p.id !== id));
    return { error: null };
  };

  return { pillars, loading, error, createPillar, updatePillar, deletePillar, refetch: fetchPillars };
}
