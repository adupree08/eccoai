"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Loader2, X, ImageIcon } from "lucide-react";
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
          </div>

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
