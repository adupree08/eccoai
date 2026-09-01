"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Search, Plus, Trash2, Check, Loader2, LayoutTemplate } from "lucide-react";
import { useTemplates, type Template } from "@/hooks/use-templates";
import { toast } from "sonner";

// Render a skeleton string, highlighting {tokens} as chips.
function Skeleton({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <p className="text-xs leading-6 text-ecco-secondary whitespace-pre-wrap">
      {parts.map((p, i) =>
        /^\{[^}]+\}$/.test(p) ? (
          <span
            key={i}
            className="mx-0.5 rounded bg-ecco-blue-pale px-1.5 py-0.5 font-mono text-[11px] text-ecco-accent"
          >
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
}

function familyOf(t: Template) {
  return t.hook_type && t.hook_type.trim() ? t.hook_type : "Other";
}

export function TemplatePicker({
  open,
  onClose,
  onSelect,
  selectedId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (t: Template | null) => void;
  selectedId: string | null;
}) {
  const { templates, loading, userId, createTemplate, deleteTemplate } = useTemplates();
  const [tab, setTab] = useState<"library" | "mine">("library");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", hook_type: "", skeleton: "" });

  const shown = useMemo(() => {
    const base = templates.filter((t) => (tab === "mine" ? t.user_id === userId : t.user_id === null));
    const filtered = q.trim()
      ? base.filter((t) =>
          (t.name + " " + (t.skeleton || t.description || "")).toLowerCase().includes(q.toLowerCase())
        )
      : base;
    const groups: Record<string, Template[]> = {};
    for (const t of filtered) (groups[familyOf(t)] ||= []).push(t);
    return groups;
  }, [templates, tab, userId, q]);

  if (!open) return null;

  const handleCreate = async () => {
    if (!form.name.trim() || !form.skeleton.trim()) return;
    setSaving(true);
    const { error } = await createTemplate({
      name: form.name.trim(),
      description: form.skeleton.trim().slice(0, 400),
      skeleton: form.skeleton.trim(),
      hook_type: form.hook_type.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save template");
      return;
    }
    toast.success("Template saved");
    setForm({ name: "", hook_type: "", skeleton: "" });
    setCreating(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-ecco bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ecco-light px-5 py-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-ecco-blue" />
            <h2 className="text-base font-semibold text-ecco-primary">Template library</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-ecco-tertiary hover:bg-ecco-off-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 border-b border-ecco-light px-5 py-3">
          <div className="flex gap-1 rounded-lg bg-ecco-off-white p-1">
            <button
              onClick={() => { setTab("library"); setCreating(false); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === "library" ? "bg-ecco-navy text-white" : "text-ecco-tertiary"}`}
            >
              Library
            </button>
            <button
              onClick={() => setTab("mine")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === "mine" ? "bg-ecco-navy text-white" : "text-ecco-tertiary"}`}
            >
              My templates
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ecco-muted" />
            <Input placeholder="Search templates..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          {selectedId && (
            <Button variant="outline" size="sm" onClick={() => { onSelect(null); }}>
              Clear
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ecco-tertiary" /></div>
          ) : (
            <>
              {tab === "mine" && (
                <div className="mb-5">
                  {creating ? (
                    <div className="space-y-2 rounded-xl border border-dashed border-ecco p-4">
                      <Input placeholder="Template name (e.g. My contrarian take)" value={form.name} maxLength={80}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      <Input placeholder="Family (optional, e.g. Contrarian)" value={form.hook_type} maxLength={40}
                        onChange={(e) => setForm({ ...form, hook_type: e.target.value })} />
                      <Textarea rows={5} value={form.skeleton}
                        onChange={(e) => setForm({ ...form, skeleton: e.target.value })}
                        placeholder={"Write the skeleton. Wrap the fill-in parts in {curly braces}, e.g.\n{time ago}, I {low moment}.\nHere's what changed: {shift}"} />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setCreating(false)} disabled={saving}>Cancel</Button>
                        <Button size="sm" className="bg-ecco-navy text-white hover:bg-ecco-navy-light" onClick={handleCreate} disabled={saving || !form.name.trim() || !form.skeleton.trim()}>
                          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                          Save template
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setCreating(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Create a template
                    </Button>
                  )}
                </div>
              )}

              {Object.keys(shown).length === 0 ? (
                <p className="py-10 text-center text-sm text-ecco-muted">
                  {tab === "mine" ? "No templates yet. Create one above." : "No templates in the library yet."}
                </p>
              ) : (
                Object.entries(shown).map(([family, items]) => (
                  <div key={family} className="mb-5">
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ecco-muted">{family} · {items.length}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((t) => {
                        const isSel = t.id === selectedId;
                        return (
                          <div key={t.id} className={`rounded-xl border p-3 ${isSel ? "border-ecco-accent bg-ecco-blue-pale" : "border-ecco-light bg-white"}`}>
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <b className="text-sm text-ecco-primary">{t.name}</b>
                              {t.user_id === userId && t.user_id !== null && (
                                <button onClick={() => deleteTemplate(t.id)} aria-label="Delete template" className="text-ecco-muted hover:text-ecco-error">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <Skeleton text={t.skeleton || t.example || t.description} />
                            <Button
                              size="sm"
                              className={`mt-3 w-full ${isSel ? "bg-ecco-accent text-white" : "bg-ecco-navy text-white hover:bg-ecco-navy-light"}`}
                              onClick={() => onSelect(t)}
                            >
                              {isSel ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Selected</> : "Use this template"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
