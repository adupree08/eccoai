"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";
import { toast } from "sonner";

type Structure = Database["public"]["Tables"]["post_structures"]["Row"];

export function StructuresPanel() {
  const supabase = createClient();
  const [extracting, setExtracting] = useState(false);
  const [structures, setStructures] = useState<Structure[]>([]);

  const loadStructures = useCallback(async () => {
    const { data } = await supabase.from("post_structures").select("*").order("created_at", { ascending: false });
    setStructures(data || []);
  }, [supabase]);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

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
    const { error } = await supabase.from("post_structures").update({ approved: !s.approved }).eq("id", s.id);
    if (error) return toast.error("Could not update");
    setStructures((prev) => prev.map((x) => (x.id === s.id ? { ...x, approved: !x.approved } : x)));
  };

  const removeStructure = async (id: string) => {
    const { error } = await supabase.from("post_structures").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else setStructures((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-ecco-off-white p-3">
        <p className="text-sm text-ecco-tertiary">
          Distill reusable writing structures from the research pool. Approved structures guide how new posts are generated.
        </p>
        <Button variant="outline" onClick={extractStructures} disabled={extracting}>
          {extracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Extract structures
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-ecco-primary">
          Writing structures {structures.length > 0 && `(${structures.filter((s) => s.approved).length} approved)`}
        </p>
        {structures.length === 0 && (
          <p className="text-sm text-ecco-muted">None yet. Pull posts in Research &amp; Growth, then extract structures.</p>
        )}
        {structures.map((s) => (
          <div key={s.id} className="rounded-lg border border-ecco-light p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ecco-primary">{s.name}</p>
                <p className="text-xs text-ecco-tertiary">{s.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="sm" variant={s.approved ? "default" : "outline"} className={s.approved ? "bg-ecco-success text-white" : ""} onClick={() => toggleApprove(s)}>
                  {s.approved ? <><Check className="mr-1 h-3.5 w-3.5" /> Approved</> : "Approve"}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-ecco-error" onClick={() => removeStructure(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
