"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePopularPosts } from "@/hooks/use-popular-posts";
import { ExternalLink, Copy, Check, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

// 1200 -> "1.2k", 84 -> "84", 1_400_000 -> "1.4M"
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

// "3 mo ago" style
function relTime(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let value = s;
  let label = "s";
  for (const [step, l] of units) {
    if (value < step) { label = l; break; }
    value = Math.floor(value / step);
    label = l;
  }
  return `${value} ${label} ago`;
}

function initials(name: string | null): string {
  if (!name) return "IN";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "IN";
}

export default function PopularPostsPage() {
  const { popular, loading } = usePopularPosts(60);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ecco-primary">Popular Posts</h1>
        <p className="text-ecco-tertiary">
          High-performing LinkedIn posts, hand-picked for inspiration. Study what works, then make it your own.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ecco-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : popular.length === 0 ? (
        <Card className="border-ecco">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <TrendingUp className="h-8 w-8 text-ecco-muted" />
            <p className="text-sm font-medium text-ecco-primary">No popular posts yet</p>
            <p className="text-sm text-ecco-tertiary">Check back soon. Fresh examples are added regularly.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {popular.map((p) => (
            <article
              key={p.id}
              className="group relative rounded-2xl border border-ecco bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
            >
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ecco-navy to-ecco-blue text-sm font-semibold text-white">
                    {initials(p.author_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold leading-tight text-ecco-primary">
                      {p.author_name || "LinkedIn author"}
                    </p>
                    {p.author_headline && (
                      <p className="mt-0.5 text-[13px] leading-snug text-ecco-tertiary line-clamp-1">
                        {p.author_headline}
                      </p>
                    )}
                  </div>
                </div>
                {p.vertical && (
                  <span className="shrink-0 rounded-full border border-ecco px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ecco-tertiary">
                    {p.vertical}
                  </span>
                )}
              </div>

              {/* Body */}
              <p className="whitespace-pre-wrap text-[15px] leading-[1.7] text-ecco-secondary">
                {p.content}
              </p>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-ecco-light pt-4 font-mono text-xs text-ecco-tertiary">
                <span>
                  {compact(p.likes)} · {compact(p.comments)} · {compact(p.reposts)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span>echoed{relTime(p.posted_at) ? ` · ${relTime(p.posted_at)}` : ""}</span>
                </span>
              </div>

              {/* Hover actions */}
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => copy(p.id, p.content)}
                  aria-label="Copy post"
                  className="rounded-md border border-ecco bg-white p-1.5 text-ecco-tertiary hover:text-ecco-primary"
                >
                  {copiedId === p.id ? <Check className="h-3.5 w-3.5 text-ecco-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                {p.post_url && (
                  <a
                    href={p.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open original"
                    className="rounded-md border border-ecco bg-white p-1.5 text-ecco-tertiary hover:text-ecco-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
