"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

export type QueueItem = Database["public"]["Tables"]["comment_queue"]["Row"];
type QueueUpdate = Database["public"]["Tables"]["comment_queue"]["Update"];

export function useCommentQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("comment_queue")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateItem = async (id: string, updates: QueueUpdate) => {
    const { data, error } = await supabase
      .from("comment_queue")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    return { data, error: null };
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("comment_queue").delete().eq("id", id);
    if (error) return { error: error.message };
    setItems((prev) => prev.filter((i) => i.id !== id));
    return { error: null };
  };

  return { items, loading, updateItem, removeItem, refetch: fetchItems };
}
