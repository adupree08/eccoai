"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Loader2, Trash2, Copy, Check, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type MediaItem = { name: string; path: string; url: string };

export default function MediaPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase.storage
      .from("post-images")
      .list(user.id, { sortBy: { column: "created_at", order: "desc" } });
    if (error) { setLoading(false); return; }
    const mapped = (data || [])
      .filter((f: { name: string }) => f.name && !f.name.startsWith("."))
      .map((f: { name: string }) => {
        const path = `${user.id}/${f.name}`;
        return { name: f.name, path, url: supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl };
      });
    setItems(mapped);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const uploadBlob = async (blob: Blob, ext: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in again"); return; }
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, blob, {
      contentType: blob.type || "image/png",
    });
    if (error) { toast.error("Upload failed"); return; }
    toast.success("Added to media");
    load();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setBusy(true);
    await uploadBlob(file, (file.name.split(".").pop() || "png").toLowerCase());
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Generation failed"); return; }
      const blob = await (await fetch(data.dataUrl)).blob();
      await uploadBlob(blob, "png");
      setPrompt("");
      setShowPrompt(false);
    } catch {
      toast.error("Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this image?")) return;
    const { error } = await supabase.storage.from("post-images").remove([path]);
    if (error) { toast.error("Could not delete"); return; }
    setItems((prev) => prev.filter((i) => i.path !== path));
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch { toast.error("Could not copy"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">Media</h1>
          <p className="text-sm text-ecco-tertiary">Upload or generate visuals to reuse in your posts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload
          </Button>
          <Button className="bg-ecco-navy hover:bg-ecco-navy-light text-white" onClick={() => setShowPrompt((v) => !v)} disabled={busy}>
            <Sparkles className="mr-2 h-4 w-4" /> Generate
          </Button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </div>

      {showPrompt && (
        <Card className="border-ecco">
          <CardContent className="p-4 flex gap-2">
            <Input placeholder="Describe the image you want..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <Button className="bg-ecco-navy hover:bg-ecco-navy-light text-white shrink-0" onClick={handleGenerate} disabled={busy || !prompt.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-ecco-tertiary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ecco bg-ecco-off-white py-16 text-center">
          <ImageIcon className="mx-auto mb-3 h-8 w-8 text-ecco-muted" />
          <p className="text-sm text-ecco-tertiary">No media yet. Upload an image or generate one with AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.path} className="group relative overflow-hidden rounded-xl border border-ecco-light bg-white">
              <Image src={item.url} alt="Media" width={300} height={300} className="aspect-square w-full object-cover" unoptimized />
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyUrl(item.url)} aria-label="Copy URL" className="rounded-md bg-white/90 p-1.5 text-ecco-primary hover:bg-white">
                  {copied === item.url ? <Check className="h-3.5 w-3.5 text-ecco-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => handleDelete(item.path)} aria-label="Delete" className="rounded-md bg-white/90 p-1.5 text-ecco-error hover:bg-white">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
