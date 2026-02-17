"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

type BrandVoice = Database["public"]["Tables"]["brand_voices"]["Row"];
type BrandVoiceInsert = Database["public"]["Tables"]["brand_voices"]["Insert"];
type BrandVoiceUpdate = Database["public"]["Tables"]["brand_voices"]["Update"];

export function useBrandVoices() {
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBrandVoices = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setBrandVoices(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBrandVoices();
  }, [fetchBrandVoices]);

  const createBrandVoice = async (voice: Omit<BrandVoiceInsert, "user_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
      .from("brand_voices")
      .insert({ ...voice, user_id: user.id })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    setBrandVoices((prev) => [...prev, data]);
    return { data, error: null };
  };

  const updateBrandVoice = async (id: string, updates: BrandVoiceUpdate) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Only update if the voice belongs to the current user
    const { data, error } = await supabase
      .from("brand_voices")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id) // Security: ensure user owns this voice
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    setBrandVoices((prev) =>
      prev.map((v) => (v.id === id ? data : v))
    );
    return { data, error: null };
  };

  const deleteBrandVoice = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Only delete if the voice belongs to the current user
    const { error } = await supabase
      .from("brand_voices")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Security: ensure user owns this voice

    if (error) {
      return { error: error.message };
    }

    setBrandVoices((prev) => prev.filter((v) => v.id !== id));
    return { error: null };
  };

  const setDefaultVoice = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // The database trigger will handle unsetting other defaults
    const { error } = await supabase
      .from("brand_voices")
      .update({ is_default: true })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    setBrandVoices((prev) =>
      prev.map((v) => ({
        ...v,
        is_default: v.id === id,
      }))
    );
    return { error: null };
  };

  const getDefaultVoice = () => {
    return brandVoices.find((v) => v.is_default) || brandVoices[0] || null;
  };

  return {
    brandVoices,
    loading,
    error,
    createBrandVoice,
    updateBrandVoice,
    deleteBrandVoice,
    setDefaultVoice,
    getDefaultVoice,
    refetch: fetchBrandVoices,
  };
}
