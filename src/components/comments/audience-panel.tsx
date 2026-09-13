"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAudiences, type Audience } from "@/hooks/use-audiences";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const toList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const fromList = (a: string[]) => a.join(", ");
const EMPTY = { name: "", description: "", watch: "", skip: "", titles: "", industries: "" };

// Who the user wants to reach + what those people talk about. Saved and reused
// by Comments discovery. Set up in plain English, refined by hand.
export function AudiencePanel({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const { audiences, loading, createAudience, updateAudience, deleteAudience } = useAudiences();
  const [editing, setEditing] = useState<Audience | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-select the default (or first) audience once loaded.
  useEffect(() => {
    if (!selectedId && audiences.length > 0) {
      const d = audiences.find((a) => a.is_default) || audiences[0];
      onSelect(d.id);
    }
  }, [audiences, selectedId, onSelect]);

  const openNew = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (a: Audience) => {
    setForm({ name: a.name, description: a.description || "", watch: fromList(a.watch_words), skip: fromList(a.skip_words), titles: fromList(a.titles), industries: fromList(a.industries) });
    setEditing(a);
  };

  const generate = async () => {
    if (form.description.trim().length < 10) return toast.error("Describe your business first");
    setGenerating(true);
    try {
      const res = await fetch("/api/audiences/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description }),
      });
      const d = await res.json();
      if (!res.ok) toast.error(d.error || "Could not generate");
      else setForm((f) => ({ ...f, name: f.name || d.name, watch: fromList(d.watch_words), skip: fromList(d.skip_words), titles: fromList(d.titles), industries: fromList(d.industries) }));
    } catch {
      toast.error("Could not generate");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Give the audience a name");
    const watch = toList(form.watch);
    if (watch.length === 0) return toast.error("Add at least one topic to watch for");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      watch_words: watch.slice(0, 10),
      skip_words: toList(form.skip),
      titles: toList(form.titles),
      industries: toList(form.industries),
    };
    const r = editing === "new"
      ? await createAudience({ ...payload, is_default: audiences.length === 0 })
      : await updateAudience((editing as Audience).id, payload);
    setSaving(false);
    if (r.error) return toast.error("Could not save the audience");
    if (r.data) onSelect(r.data.id);
    setEditing(null);
    toast.success("Audience saved");
  };

  const remove = async (a: Audience) => {
    if (!confirm(`Delete "${a.name}"?`)) return;
    const r = await deleteAudience(a.id);
    if (r.error) return toast.error("Could not delete");
    if (selectedId === a.id) onSelect(null);
  };

  const selected = audiences.find((a) => a.id === selectedId) || null;
  const chip = (t: string, k: string) => (
    <span key={k} className="rounded-full border border-ecco px-2 py-0.5 text-[10px] text-ecco-secondary">{t}</span>
  );

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-ecco-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading audience…</div>;
  }

  if (editing) {
    return (
      <Card className="border-ecco">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-semibold text-ecco-primary">{editing === "new" ? "New audience" : "Edit audience"}</p>
          <textarea
            placeholder="Describe your business and who you want to reach, in plain English. e.g. I sell a menopause support app to OB-GYNs and women's health nurse practitioners."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="min-h-[72px] w-full resize-none rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary"
          />
          <Button size="sm" variant="outline" onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate with AI
          </Button>
          <Input placeholder="Audience name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Field label="Words to watch for" hint="Topics your buyers post about, comma separated (up to 10)" value={form.watch} onChange={(v) => setForm((f) => ({ ...f, watch: v }))} />
          <Field label="Words to skip" hint="Skip any post mentioning these" value={form.skip} onChange={(v) => setForm((f) => ({ ...f, skip: v }))} />
          <Field label="Customer job titles" hint="The people who buy, not peers or students" value={form.titles} onChange={(v) => setForm((f) => ({ ...f, titles: v }))} />
          <Field label="Customer industries" hint="Comma separated" value={form.industries} onChange={(v) => setForm((f) => ({ ...f, industries: v }))} />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving} className="bg-ecco-navy hover:bg-ecco-navy-light text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save audience
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (audiences.length === 0) {
    return (
      <Card className="border-ecco border-dashed">
        <CardContent className="space-y-2 p-5 text-center">
          <p className="text-sm font-semibold text-ecco-primary">Set up your audience</p>
          <p className="text-xs text-ecco-tertiary">Tell eccoai who you want to reach and what they talk about. It finds their posts and drafts your comments.</p>
          <Button size="sm" onClick={openNew} className="bg-ecco-navy hover:bg-ecco-navy-light text-white"><Plus className="mr-2 h-4 w-4" />Create audience</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-ecco">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedId || ""} onChange={(e) => onSelect(e.target.value || null)} className="rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary">
            {audiences.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
          </select>
          {selected && <Button size="sm" variant="outline" onClick={() => openEdit(selected)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>}
          <Button size="sm" variant="outline" onClick={openNew}><Plus className="mr-1.5 h-3.5 w-3.5" />New</Button>
          {selected && (
            <button onClick={() => remove(selected)} className="ml-auto rounded-md p-1.5 text-ecco-error hover:bg-red-50" title="Delete audience">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        {selected && (
          <div className="space-y-1.5">
            <Row label="Watching">{selected.watch_words.map((w, i) => chip(w, `w${i}`))}</Row>
            {selected.skip_words.length > 0 && <Row label="Skipping">{selected.skip_words.map((w, i) => chip(w, `s${i}`))}</Row>}
            {(selected.titles.length > 0 || selected.industries.length > 0) && (
              <Row label="Customers">{[...selected.titles, ...selected.industries].map((w, i) => chip(w, `c${i}`))}</Row>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-ecco-secondary">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} className="mt-1" />
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-ecco-tertiary">{label}</span>
      {children}
    </div>
  );
}
