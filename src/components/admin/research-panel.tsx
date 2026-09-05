"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Loader2, Trash2, X, Star, Heart, MessageCircle, Repeat2, TrendingUp, Users, ExternalLink, Copy, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";
import { ExpandableText } from "@/components/ui/expandable-text";
import { toast } from "sonner";

type PopularPost = Database["public"]["Tables"]["popular_posts"]["Row"];
type Prospect = Database["public"]["Tables"]["icp_prospects"]["Row"];

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

const PROSPECT_STATUSES = ["new", "requested", "connected", "skipped"];

export function AdminResearchPanel() {
  const supabase = createClient();

  // ---- Popular posts research ----
  const [vertical, setVertical] = useState("");
  const [keywords, setKeywords] = useState("");
  const [range, setRange] = useState("week");
  const [sortBy, setSortBy] = useState("relevance");
  const [searching, setSearching] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [pool, setPool] = useState<PopularPost[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [selPosts, setSelPosts] = useState<Set<string>>(new Set());
  const [selProspects, setSelProspects] = useState<Set<string>>(new Set());

  // ---- ICP ----
  const [icpQuery, setIcpQuery] = useState("");
  const [icpTitles, setIcpTitles] = useState("");
  const [icpLocations, setIcpLocations] = useState("");
  const [icpWithEmail, setIcpWithEmail] = useState(true);
  const [icpSearching, setIcpSearching] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const loadPool = useCallback(async () => {
    const { data } = await supabase
      .from("popular_posts")
      .select("*")
      .order("featured", { ascending: false })
      .order("likes", { ascending: false })
      .limit(200);
    setPool(data || []);
  }, [supabase]);

  const loadProspects = useCallback(async () => {
    const { data } = await supabase.from("icp_prospects").select("*").order("created_at", { ascending: false }).limit(500);
    setProspects(data || []);
  }, [supabase]);

  useEffect(() => {
    loadPool();
    loadProspects();
  }, [loadPool, loadProspects]);

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
        body: JSON.stringify({ vertical: vertical.trim(), keywords: keywords.trim() || vertical.trim(), range, sortBy }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Research failed");
      else {
        toast.success(`Pulled ${data.inserted} posts into research`);
        loadPool();
      }
    } catch {
      toast.error("Research request failed");
    } finally {
      setSearching(false);
    }
  };

  const toggleFeatured = async (p: PopularPost) => {
    const next = !p.featured;
    const { error } = await supabase
      .from("popular_posts")
      .update({ featured: next, featured_at: next ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast.error("Could not update");
    setPool((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: next } : x)));
    toast.success(next ? "Shared to Popular Posts" : "Removed from Popular Posts");
  };

  const removePost = async (id: string) => {
    const { error } = await supabase.from("popular_posts").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else setPool((prev) => prev.filter((x) => x.id !== id));
  };

  const tagPosts = async () => {
    setTagging(true);
    try {
      const res = await fetch("/api/admin/tag-posts", { method: "POST" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Tagging failed");
      else {
        toast.success(data.tagged > 0 ? `Tagged ${data.tagged} posts` : (data.note || "All posts already tagged"));
        loadPool();
      }
    } catch {
      toast.error("Tagging request failed");
    } finally {
      setTagging(false);
    }
  };

  const runIcp = async () => {
    if (!icpQuery.trim() && !icpTitles.trim()) {
      toast.error("Enter a search query or job title");
      return;
    }
    setIcpSearching(true);
    try {
      const res = await fetch("/api/admin/icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQuery: icpQuery.trim(),
          jobTitles: icpTitles.trim(),
          locations: icpLocations.trim(),
          withEmail: icpWithEmail,
          label: icpQuery.trim() || icpTitles.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "ICP search failed");
      else {
        toast.success(`Pulled ${data.inserted} prospects`);
        loadProspects();
      }
    } catch {
      toast.error("ICP request failed");
    } finally {
      setIcpSearching(false);
    }
  };

  const setProspectStatus = async (p: Prospect, status: string) => {
    const { error } = await supabase.from("icp_prospects").update({ status }).eq("id", p.id);
    if (error) return toast.error("Could not update");
    setProspects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x)));
  };

  const removeProspect = async (id: string) => {
    const { error } = await supabase.from("icp_prospects").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else setProspects((prev) => prev.filter((x) => x.id !== id));
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const togglePost = (id: string) =>
    setSelPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleProspect = (id: string) =>
    setSelProspects((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const bulkDeletePosts = async () => {
    const ids = [...selPosts];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} post${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const { error } = await supabase.from("popular_posts").delete().in("id", ids);
    if (error) return toast.error("Could not delete");
    setPool((prev) => prev.filter((p) => !selPosts.has(p.id)));
    setSelPosts(new Set());
    toast.success(`Deleted ${ids.length} post${ids.length === 1 ? "" : "s"}`);
  };

  const bulkDeleteProspects = async () => {
    const ids = [...selProspects];
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} prospect${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const { error } = await supabase.from("icp_prospects").delete().in("id", ids);
    if (error) return toast.error("Could not delete");
    setProspects((prev) => prev.filter((p) => !selProspects.has(p.id)));
    setSelProspects(new Set());
    toast.success(`Deleted ${ids.length} prospect${ids.length === 1 ? "" : "s"}`);
  };

  const featured = pool.filter((p) => p.featured);
  const categories = useMemo(
    () => Array.from(new Set(pool.map((p) => p.archetype || p.vertical).filter(Boolean))).sort() as string[],
    [pool]
  );
  const shownPool = useMemo(
    () => (catFilter === "all" ? pool : pool.filter((p) => (p.archetype || p.vertical) === catFilter)),
    [pool, catFilter]
  );
  const allPoolSelected = shownPool.length > 0 && shownPool.every((p) => selPosts.has(p.id));
  const allProspectsSelected = prospects.length > 0 && prospects.every((p) => selProspects.has(p.id));
  const tabTrigger = "data-[state=active]:!bg-ecco-navy data-[state=active]:!text-white text-ecco-tertiary px-4 py-2";

  return (
    <Card className="border-ecco">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-ecco-primary">Research &amp; Growth</CardTitle>
        <CardDescription className="text-ecco-tertiary">
          Admin-only. Pull popular posts, choose which to publish, and build an ICP outreach list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="popular">
          <TabsList className="mb-5 bg-ecco-off-white">
            <TabsTrigger value="popular" className={tabTrigger}><Search className="mr-2 h-4 w-4" />Popular Posts</TabsTrigger>
            <TabsTrigger value="live" className={tabTrigger}><TrendingUp className="mr-2 h-4 w-4" />Pushed Live {featured.length > 0 && `(${featured.length})`}</TabsTrigger>
            <TabsTrigger value="icp" className={tabTrigger}><Users className="mr-2 h-4 w-4" />ICP Prospects</TabsTrigger>
          </TabsList>

          {/* ---------- POPULAR POSTS ---------- */}
          <TabsContent value="popular" className="space-y-6 m-0">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Vertical (e.g. femtech)" value={vertical} onChange={(e) => setVertical(e.target.value)} />
                <Input placeholder="Keywords (comma separated)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary">
                  {RANGES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary">
                  <option value="relevance">Most relevant</option>
                  <option value="date">Most recent</option>
                </select>
                <Button onClick={runSearch} disabled={searching} className="bg-ecco-navy hover:bg-ecco-navy-light text-white">
                  {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </div>
            </div>

            {/* Research pool */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ecco-primary">Research pool {pool.length > 0 && `(${featured.length} shared)`}</p>
                <div className="flex items-center gap-2">
                  {categories.length > 0 && (
                    <select
                      value={catFilter}
                      onChange={(e) => setCatFilter(e.target.value)}
                      className="rounded-lg border border-ecco bg-white px-3 py-1.5 text-sm text-ecco-primary"
                    >
                      <option value="all">All categories</option>
                      {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  )}
                  {selPosts.size > 0 && (
                    <Button size="sm" variant="outline" className="border-ecco-error text-ecco-error hover:bg-red-50" onClick={bulkDeletePosts}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete {selPosts.size}
                    </Button>
                  )}
                  {pool.length > 0 && (
                    <Button size="sm" variant="outline" onClick={tagPosts} disabled={tagging}>
                      {tagging ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Tag className="mr-1.5 h-3.5 w-3.5" />}
                      Tag posts
                    </Button>
                  )}
                </div>
              </div>
              {pool.length === 0 && <p className="text-sm text-ecco-muted">Nothing yet. Run a search to pull posts.</p>}
              {pool.length > 0 && shownPool.length === 0 && <p className="text-sm text-ecco-muted">No posts in this category.</p>}
              {shownPool.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-ecco-tertiary">
                  <input type="checkbox" checked={allPoolSelected} onChange={() => setSelPosts(allPoolSelected ? new Set() : new Set(shownPool.map((p) => p.id)))} className="h-3.5 w-3.5" />
                  Select all ({shownPool.length}{catFilter !== "all" ? ` in ${catFilter}` : ""})
                </label>
              )}
              <div className="columns-1 gap-3 sm:columns-2 xl:columns-3">
                {shownPool.map((p) => (
                  <PoolRow key={p.id} p={p} onToggle={toggleFeatured} onRemove={removePost} selected={selPosts.has(p.id)} onSelect={togglePost} />
                ))}
              </div>
            </div>

            <p className="flex items-center gap-1 text-[11px] text-ecco-muted">
              <X className="h-3 w-3" /> LinkedIn scraping is against LinkedIn ToS. Admin research use only.
            </p>
          </TabsContent>

          {/* ---------- PUSHED LIVE ---------- */}
          <TabsContent value="live" className="space-y-3 m-0">
            <p className="text-sm text-ecco-tertiary">These are the posts users currently see on their Popular Posts page. Unstar to pull one back into research.</p>
            {featured.length === 0 && <p className="text-sm text-ecco-muted">Nothing published yet. Star posts in the Popular Posts tab.</p>}
            <div className="columns-1 gap-3 sm:columns-2 xl:columns-3">
              {featured.map((p) => (
                <PoolRow key={p.id} p={p} onToggle={toggleFeatured} onRemove={removePost} selected={selPosts.has(p.id)} onSelect={togglePost} />
              ))}
            </div>
          </TabsContent>

          {/* ---------- ICP ---------- */}
          <TabsContent value="icp" className="space-y-6 m-0">
            <div className="space-y-3">
              <Input placeholder="Search query (e.g. Founder, Head of Marketing)" value={icpQuery} onChange={(e) => setIcpQuery(e.target.value)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Job titles (comma separated)" value={icpTitles} onChange={(e) => setIcpTitles(e.target.value)} />
                <Input placeholder="Locations (e.g. United States)" value={icpLocations} onChange={(e) => setIcpLocations(e.target.value)} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-ecco-secondary">
                  <input type="checkbox" checked={icpWithEmail} onChange={(e) => setIcpWithEmail(e.target.checked)} className="h-4 w-4" />
                  Find emails (costs more)
                </label>
                <Button onClick={runIcp} disabled={icpSearching} className="bg-ecco-navy hover:bg-ecco-navy-light text-white">
                  {icpSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                  Find prospects
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ecco-primary">Prospects {prospects.length > 0 && `(${prospects.length})`}</p>
                {selProspects.size > 0 && (
                  <Button size="sm" variant="outline" className="border-ecco-error text-ecco-error hover:bg-red-50" onClick={bulkDeleteProspects}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete {selProspects.size}
                  </Button>
                )}
              </div>
              {prospects.length === 0 && <p className="text-sm text-ecco-muted">No prospects yet. Run a search to build your list.</p>}
              {prospects.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-ecco-tertiary">
                  <input type="checkbox" checked={allProspectsSelected} onChange={() => setSelProspects(allProspectsSelected ? new Set() : new Set(prospects.map((p) => p.id)))} className="h-3.5 w-3.5" />
                  Select all ({prospects.length})
                </label>
              )}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {prospects.map((p) => (
                  <div key={p.id} className={`rounded-lg border p-3 ${selProspects.has(p.id) ? "border-ecco-navy ring-1 ring-ecco-navy" : "border-ecco-light"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                      <input type="checkbox" checked={selProspects.has(p.id)} onChange={() => toggleProspect(p.id)} className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ecco-primary truncate">{p.full_name || "Unknown"}</p>
                        {p.headline && <p className="text-xs text-ecco-tertiary line-clamp-2">{p.headline}</p>}
                        <p className="mt-1 text-[11px] text-ecco-muted">
                          {[p.current_title, p.current_company, p.location].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {p.profile_url && (
                            <a href={p.profile_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-ecco-accent hover:underline">
                              <ExternalLink className="h-3 w-3" /> Profile
                            </a>
                          )}
                          {p.email && (
                            <button onClick={() => copy(p.email!, "Email")} className="inline-flex items-center gap-1 text-xs text-ecco-accent hover:underline">
                              <Copy className="h-3 w-3" /> {p.email}
                            </button>
                          )}
                        </div>
                      </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <select value={p.status} onChange={(e) => setProspectStatus(p, e.target.value)} className="rounded-md border border-ecco bg-white px-2 py-1 text-xs text-ecco-primary capitalize">
                          {PROSPECT_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-ecco-error" onClick={() => removeProspect(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-ecco-muted">
              <X className="h-3 w-3" /> Prospect data is admin-only and never shown to users. Send connection requests and outreach yourself, within LinkedIn&apos;s limits.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}
function initials(name: string | null): string {
  if (!name) return "IN";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "IN";
}

function PoolAvatar({ src, name }: { src: string | null; name: string | null }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || "author"} onError={() => setFailed(true)} className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ecco-navy to-ecco-blue text-[11px] font-semibold text-white">
      {initials(name)}
    </div>
  );
}

function PoolRow({ p, onToggle, onRemove, selected, onSelect }: { p: PopularPost; onToggle: (p: PopularPost) => void; onRemove: (id: string) => void; selected: boolean; onSelect: (id: string) => void }) {
  const pill = p.archetype || p.vertical;
  return (
    <div className={`mb-3 flex break-inside-avoid flex-col rounded-xl border bg-white p-4 ${selected ? "border-ecco-navy ring-1 ring-ecco-navy" : p.featured ? "border-ecco-accent bg-ecco-blue-pale" : "border-ecco-light"}`}>
      {/* Control bar: checkbox top-left, star (share) + delete, tag far right */}
      <div className="mb-3 flex items-center gap-2">
        <input type="checkbox" checked={selected} onChange={() => onSelect(p.id)} className="h-4 w-4 shrink-0" />
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggle(p)}
            title={p.featured ? "Shared to users — click to unshare" : "Share to users"}
            aria-label={p.featured ? "Unshare" : "Share"}
            className={`rounded-md p-1.5 transition-colors ${p.featured ? "text-ecco-accent" : "text-ecco-tertiary hover:text-ecco-primary"}`}
          >
            <Star className={`h-4 w-4 ${p.featured ? "fill-ecco-accent" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(p.id)}
            aria-label="Delete"
            className="rounded-md p-1.5 text-ecco-error transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {pill && (
            <span className="rounded-full border border-ecco px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-ecco-tertiary">{pill}</span>
          )}
        </div>
      </div>

      {/* Author (full width so the name always has room) */}
      <div className="mb-3 flex items-center gap-2.5">
        <PoolAvatar src={p.author_avatar} name={p.author_name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-ecco-primary break-words">{p.author_name || "LinkedIn author"}</p>
          {p.author_headline && <p className="text-[11px] leading-snug text-ecco-tertiary line-clamp-1">{p.author_headline}</p>}
        </div>
      </div>

      {/* Body */}
      <ExpandableText text={p.content} clampClass="line-clamp-[14]" threshold={500} className="text-sm leading-relaxed text-ecco-secondary" />

      {/* Footer */}
      <div className="mt-3 flex items-center gap-3 border-t border-ecco-light pt-2.5 font-mono text-[11px] text-ecco-tertiary">
        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{compact(p.likes)}</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{compact(p.comments)}</span>
        <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{compact(p.reposts)}</span>
        {p.post_url && (
          <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-ecco-accent hover:underline">
            <ExternalLink className="h-3 w-3" /> Original
          </a>
        )}
      </div>
    </div>
  );
}
