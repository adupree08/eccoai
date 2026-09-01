"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

type PopularPost = Database["public"]["Tables"]["popular_posts"]["Row"];

export function usePopularPosts(limit = 6) {
  const [popular, setPopular] = useState<PopularPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPopular = useCallback(async () => {
    const { data, error } = await supabase
      .from("popular_posts")
      .select("*")
      .order("likes", { ascending: false })
      .limit(limit);
    if (error) setError(error.message);
    else setPopular(data || []);
    setLoading(false);
  }, [supabase, limit]);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return { popular, loading, error, refetch: fetchPopular };
}
