"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Loader2, Check, Trash2, X, Star, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";
import { toast } from "sonner";

type Structure = Database["public"]["Tables"]["post_structures"]["Row"];
type PopularPost = Database["public"]["Tables"]["popular_posts"]["Row"];

export function AdminResearchPanel() {
  const supabase = createClient();
  const [vertical, setVertical] = useState("");
  const [keywords, setKeywords] = useState("");
  const [searching, setSearching] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [pool, setPool] = useState<PopularPost[]>([]);

  const loadStructures = useCallback(async () => {
    const { data } = await supabase
      .from("post_structures")
      .select("*")
      .order("created_at", { ascending: false });
    setStructures(data || []);
  }, [supabase]);

  const loadPool = useCallback(async () => {
    const { data } = await supabase
      .from("popular_posts")
      .select("*")
      .order("featured", { ascending: false })
      .order("likes", { ascending: false })
      .limit(100);
    setPool(data || []);
  }, [supabase]);

  useEffect(() => {
    loadStructures();
    loadPool();
  }, [loadStructures, loadPool]);

  const toggleFeatured = async (p: PopularPost) => {
    const next = !p.featured;
    const { error } = await supabase
      .from("popular_posts")
      .update({ featured: next, featured_at: next ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) {
      toast.error("Could not update");
      return;
    }
    setPool((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: next } : x)));
    toast.success(next ? "Shared to Popular Posts" : "Removed from Popular Posts");
  };

  const removePost = async (id: string) => {
    const { error } = await supabase.from("popular_posts").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else setPool((prev) => prev.filter((x) => x.id !== id));
  };

  const runSearch = async () => {
    if (!vertical.trim() && !keywords.trim()) {
      toast.error("Enter a vertical or keywords");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/admin/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical: vertical.trim(), keywords: keywords.trim() || vertical.trim() }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Research failed");
      else {
        toast.success(`Pulled ${data.inserted} posts into research`);
        loadPool();
      }
    } catch {
      toast.error("Research request failed");
    } finally {
      setSearching(false);
    }
  };

  const extractStructures = async () => {
    setExtracting(true);
    try {
      const res = await fetch("/api/admin/extract-structures", { method: "POST" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Extraction failed");
      else {
        toast.success(`Extracted ${data.extracted} structures to review`);
        loadStructures();
      }
    } catch {
      toast.error("Extraction request failed");
    } finally {
      setExtracting(false);
    }
  };

  const toggleApprove = async (s: Structure) => {
    const { error } = await supabase
      .from("post_structures")
      .update({ approved: !s.approved })
      .eq("id", s.id);
    if (error) {
      toast.error("Could not update");
      return;
    }
    setStructures((prev) => prev.map((x) => (x.id === s.id ? { ...x, approved: !x.approved } : x)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("post_structures").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else setStructures((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <Card className="border-ecco">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-ecco-primary">Vertical Research</CardTitle>
        <CardDescription className="text-ecco-tertiary">
          Pull popular posts in your vertical (admin only), then learn reusable writing structures from them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Vertical (e.g. femtech)" value={vertical} onChange={(e) => setVertical(e.target.value)} />
          <Input placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <Button onClick={runSearch} disabled={searching} className="bg-ecco-navy hover:bg-ecco-navy-light text-white">
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </div>

        {/* Research pool — choose which posts go on the public Popular Posts page */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ecco-primary">
              Research pool {pool.length > 0 && `(${pool.filter((p) => p.featured).length} shared)`}
            </p>
            <p className="text-xs text-ecco-muted">Star a post to show it on the users&apos; Popular Posts page</p>
          </div>
          {pool.length === 0 && (
            <p className="text-sm text-ecco-muted">Nothing yet. Run a search to pull posts.</p>
          )}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {pool.map((p) => (
              <div key={p.id} className={`rounded-lg border p-3 ${p.featured ? "border-ecco-accent bg-ecco-blue-pale" : "border-ecco-light"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {(p.author_name || p.author_headline) && (
                      <p className="text-xs font-medium text-ecco-primary truncate">
                        {p.author_name}{p.author_headline ? ` · ${p.author_headline}` : ""}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-ecco-secondary whitespace-pre-wrap line-clamp-4">{p.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-ecco-tertiary">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.comments}</span>
                      <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{p.reposts}</span>
                      {p.vertical && <span className="rounded bg-ecco-off-white px-1.5 py-0.5">{p.vertical}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant={p.featured ? "default" : "outline"}
                      className={p.featured ? "bg-ecco-accent text-white" : ""}
                      onClick={() => toggleFeatured(p)}
                    >
                      <Star className={`mr-1 h-3.5 w-3.5 ${p.featured ? "fill-white" : ""}`} />
                      {p.featured ? "Shared" : "Share"}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-ecco-error" onClick={() => removePost(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extract */}
        <div className="flex items-center justify-between rounded-lg bg-ecco-off-white p-3">
          <p className="text-sm text-ecco-tertiary">Distill writing structures from the research so far</p>
          <Button variant="outline" onClick={extractStructures} disabled={extracting}>
            {extracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Extract structures
          </Button>
        </div>

        {/* Structures list */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ecco-primary">
            Writing structures {structures.length > 0 && `(${structures.filter((s) => s.approved).length} approved)`}
          </p>
          {structures.length === 0 && (
            <p className="text-sm text-ecco-muted">None yet. Run a search, then extract structures.</p>
          )}
          {structures.map((s) => (
            <div key={s.id} className="rounded-lg border border-ecco-light p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ecco-primary">{s.name}</p>
                  <p className="text-xs text-ecco-tertiary">{s.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant={s.approved ? "default" : "outline"}
                    className={s.approved ? "bg-ecco-success text-white" : ""}
                    onClick={() => toggleApprove(s)}
                  >
                    {s.approved ? <><Check className="mr-1 h-3.5 w-3.5" /> Approved</> : "Approve"}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-ecco-error" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="flex items-center gap-1 text-[11px] text-ecco-muted">
          <X className="h-3 w-3" /> LinkedIn scraping is against LinkedIn ToS. Admin research use only.
        </p>
      </CardContent>
    </Card>
  );
}
