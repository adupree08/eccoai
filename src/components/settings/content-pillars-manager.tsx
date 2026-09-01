"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Layers } from "lucide-react";
import { useContentPillars } from "@/hooks/use-content-pillars";
import { toast } from "sonner";

const PILLAR_COLORS = ["#2563eb", "#0a66c2", "#7c3aed", "#16a34a", "#dc2626", "#d97706", "#0891b2"];

export function ContentPillarsManager() {
  const { pillars, loading, error, createPillar, updatePillar, deletePillar } = useContentPillars();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PILLAR_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await createPillar({
      name: name.trim(),
      description: description.trim() || null,
      color,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not create pillar");
      return;
    }
    toast.success("Pillar added");
    setName("");
    setDescription("");
    setColor(PILLAR_COLORS[0]);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deletePillar(id);
    if (error) toast.error("Could not delete pillar");
    else toast.success("Pillar removed");
  };

  return (
    <Card className="border-ecco">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-ecco-blue" />
          <div>
            <CardTitle className="text-base font-semibold text-ecco-primary">
              Content Pillars
            </CardTitle>
            <CardDescription className="text-ecco-tertiary">
              The recurring themes you post about. Pick one when creating a post to steer the topic.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="text-sm text-ecco-error bg-red-50 p-3 rounded-lg">
            Could not load your pillars. Refresh to try again.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-ecco-tertiary" />
          </div>
        ) : (
          <div className="space-y-2">
            {pillars.length === 0 && (
              <p className="text-sm text-ecco-muted py-2">
                No pillars yet. Add your first theme below (e.g. &quot;Founder lessons&quot;, &quot;Industry news&quot;).
              </p>
            )}
            {pillars.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-ecco-light p-3"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ecco-primary truncate">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-ecco-tertiary truncate">{p.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ecco-error"
                  onClick={() => handleDelete(p.id)}
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new pillar */}
        <div className="space-y-3 rounded-lg border border-dashed border-ecco p-4">
          <Input
            placeholder="Pillar name (e.g. Menopause education)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <Textarea
            placeholder="Optional: what this pillar is about, in a sentence"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={200}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {PILLAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Pick color ${c}`}
                  className="h-6 w-6 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#0f172a" : "transparent",
                    transform: color === c ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <Button
              onClick={handleAdd}
              disabled={saving || !name.trim()}
              className="bg-ecco-navy hover:bg-ecco-navy-light text-white"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add pillar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
