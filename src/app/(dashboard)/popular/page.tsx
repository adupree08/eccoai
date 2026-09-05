"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePopularPosts } from "@/hooks/use-popular-posts";
import { ExternalLink, Copy, Check, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

function relTime(iso: string | null): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  const steps: [number, string][] = [[60, "s"], [60, "m"], [24, "h"], [30, "d"], [12, "mo"], [Infinity, "y"]];
  let value = s;
  let label = "s";
  for (const [step, l] of steps) {
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

function Avatar({ src, name }: { src: string | null; name: string | null }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name || "author"}
        onError={() => setFailed(true)}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ecco-navy to-ecco-blue text-sm font-semibold text-white">
      {initials(name)}
    </div>
  );
}

export default function PopularPostsPage() {
  const { popular, loading } = usePopularPosts(200);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [topic, setTopic] = useState("all");
  const [sort, setSort] = useState("popular");

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

  const types = useMemo(() => Array.from(new Set(popular.map((p) => p.archetype).filter(Boolean))) as string[], [popular]);
  const topics = useMemo(() => Array.from(new Set(popular.map((p) => p.vertical).filter(Boolean))) as string[], [popular]);

  const shown = useMemo(() => {
    let list = popular.slice();
    if (type !== "all") list = list.filter((p) => p.archetype === type);
    if (topic !== "all") list = list.filter((p) => p.vertical === topic);
    list.sort((a, b) =>
      sort === "recent"
        ? Date.parse(b.posted_at || b.created_at) - Date.parse(a.posted_at || a.created_at)
        : b.likes - a.likes
    );
    return list;
  }, [popular, type, topic, sort]);

  const selectCls = "rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ecco-primary">Popular Posts</h1>
        <p className="text-ecco-tertiary">
          High-performing LinkedIn posts, hand-picked for inspiration. Study what works, then make it your own.
        </p>
      </div>

      {/* Selector */}
      {!loading && popular.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
            <option value="all">All types</option>
            {types.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          {topics.length > 0 && (
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={selectCls}>
              <option value="all">All topics</option>
              {topics.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
            <option value="popular">Most popular</option>
            <option value="recent">Most recent</option>
          </select>
          <span className="ml-auto text-sm text-ecco-tertiary">{shown.length} post{shown.length === 1 ? "" : "s"}</span>
        </div>
      )}

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
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const pill = p.archetype || p.vertical;
            return (
              <article
                key={p.id}
                className="group relative flex h-full flex-col rounded-[20px] border border-ecco bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.author_avatar} name={p.author_name} />
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-tight text-ecco-primary line-clamp-1">
                        {p.author_name || "LinkedIn author"}
                      </p>
                      {p.author_headline && (
                        <p className="mt-0.5 text-[13px] leading-snug text-ecco-tertiary line-clamp-1">
                          {p.author_headline}
                        </p>
                      )}
                    </div>
                  </div>
                  {pill && (
                    <span className="shrink-0 rounded-full border border-ecco px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ecco-tertiary">
                      {pill}
                    </span>
                  )}
                </div>

                {/* Body */}
                <p className="flex-1 whitespace-pre-wrap text-[15px] leading-[1.6] text-ecco-secondary line-clamp-[14]">
                  {p.content}
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-ecco-light pt-3.5 font-mono text-xs text-ecco-tertiary">
                  <span>{compact(p.likes)} · {compact(p.comments)} · {compact(p.reposts)}</span>
                  <span>echoed{relTime(p.posted_at) ? ` · ${relTime(p.posted_at)}` : ""}</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
