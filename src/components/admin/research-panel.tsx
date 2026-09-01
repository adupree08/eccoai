"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Loader2, Check, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";
import { toast } from "sonner";

type Structure = Database["public"]["Tables"]["post_structures"]["Row"];

export function AdminResearchPanel() {
  const supabase = createClient();
  const [vertical, setVertical] = useState("");
  const [keywords, setKeywords] = useState("");
  const [searching, setSearching] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [structures, setStructures] = useState<Structure[]>([]);

  const loadStructures = useCallback(async () => {
    const { data } = await supabase
      .from("post_structures")
      .select("*")
      .order("created_at", { ascending: false });
    setStructures(data || []);
  }, [supabase]);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

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
      else toast.success(`Pulled ${data.inserted} posts into research`);
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
