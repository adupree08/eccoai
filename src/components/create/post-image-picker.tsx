"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Loader2, X, ImageIcon, FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function PostImagePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState<string[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const openLibrary = async () => {
    if (showLibrary) {
      setShowLibrary(false);
      return;
    }
    setShowLibrary(true);
    setLoadingLibrary(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoadingLibrary(false);
      return;
    }
    const { data, error } = await supabase.storage
      .from("post-images")
      .list(user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (error || !data) {
      setLoadingLibrary(false);
      return;
    }
    const urls = data
      .filter((f: { name: string }) => /\.(png|jpe?g|webp|gif)$/i.test(f.name))
      .map((f: { name: string }) => supabase.storage.from("post-images").getPublicUrl(`${user.id}/${f.name}`).data.publicUrl);
    setLibrary(urls);
    setLoadingLibrary(false);
  };

  const uploadBlob = async (blob: Blob, ext: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in again to add images");
      return null;
    }
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, blob, {
      contentType: blob.type || "image/png",
      upsert: false,
    });
    if (error) {
      toast.error("Could not upload the image");
      return null;
    }
    return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setBusy(true);
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const url = await uploadBlob(file, ext);
    setBusy(false);
    if (url) {
      onChange(url);
      toast.success("Image added");
    }
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
      if (!res.ok) {
        toast.error(data.error || "Could not generate image");
        return;
      }
      const blob = await (await fetch(data.dataUrl)).blob();
      const url = await uploadBlob(blob, "png");
      if (url) {
        onChange(url);
        setShowPrompt(false);
        setPrompt("");
        toast.success("Image generated");
      }
    } catch {
      toast.error("Image generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-ecco-blue mb-3">Post Image</p>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-ecco">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image src={value} alt="Post image" width={512} height={288} className="w-full h-auto object-cover" unoptimized />
          <button
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-ecco p-4">
          <div className="mb-3 flex items-center justify-center text-ecco-muted">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload image
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowPrompt((v) => !v)}
              disabled={busy}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={openLibrary}
              disabled={busy}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Choose from your media
            </Button>
          </div>

          {showLibrary && (
            <div className="mt-3">
              {loadingLibrary ? (
                <div className="flex items-center justify-center py-4 text-ecco-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : library.length === 0 ? (
                <p className="py-3 text-center text-xs text-ecco-muted">No images in your account yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                  {library.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => { onChange(url); setShowLibrary(false); }}
                      className="relative aspect-square overflow-hidden rounded-md border border-ecco hover:border-ecco-navy focus:outline-none focus:ring-2 focus:ring-ecco-navy"
                    >
                      <Image src={url} alt="" fill sizes="120px" className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showPrompt && (
            <div className="mt-3 space-y-2">
              <Input
                placeholder="Describe the image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                type="button"
                className="w-full bg-ecco-navy hover:bg-ecco-navy-light text-white"
                onClick={handleGenerate}
                disabled={busy || !prompt.trim()}
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
              </Button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      )}
    </div>
  );
}
