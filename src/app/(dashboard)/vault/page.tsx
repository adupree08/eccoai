"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIdeas, type Idea } from "@/hooks/use-ideas";
import { useContentPillars } from "@/hooks/use-content-pillars";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExpandableText } from "@/components/ui/expandable-text";
import { Lightbulb, Bookmark, Sparkles, Rss, PenLine, Trash2, ExternalLink, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SavedArticle = Database["public"]["Tables"]["saved_articles"]["Row"];
type Pillar = Database["public"]["Tables"]["content_pillars"]["Row"];

const selectCls = "rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary";
const tabTrigger = "data-[state=active]:!bg-ecco-navy data-[state=active]:!text-white text-ecco-tertiary px-4 py-2";

function initials(name: string | null): string {
  if (!name) return "IN";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "IN";
}

function Avatar({ src, name }: { src: string | null; name: string | null }) {
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

// Tag chip + editor. A tag is either a content pillar or a freeform "Other" label.
function TagControl({
  pillarId,
  tag,
  pillars,
  onSet,
}: {
  pillarId: string | null;
  tag: string | null;
  pillars: Pillar[];
  onSet: (v: { pillar_id: string | null; tag: string | null }) => void;
}) {
  const pillar = pillarId ? pillars.find((p) => p.id === pillarId) : null;
  const label = pillar ? pillar.name : tag;
  const value = pillarId ? `p:${pillarId}` : tag ? "other" : "none";
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
          style={{ backgroundColor: pillar?.color || "#64748b" }}
        >
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "none") onSet({ pillar_id: null, tag: null });
          else if (v === "other") {
            const t = window.prompt("Tag label")?.trim();
            if (t) onSet({ pillar_id: null, tag: t });
          } else if (v.startsWith("p:")) {
            const id = v.slice(2);
            const p = pillars.find((x) => x.id === id);
            onSet({ pillar_id: id, tag: p ? p.name : null });
          }
        }}
        className="rounded-md border border-ecco bg-white px-1.5 py-0.5 text-[11px] text-ecco-tertiary"
      >
        <option value="none">{label ? "Change tag" : "+ Tag"}</option>
        {pillars.map((p) => (<option key={p.id} value={`p:${p.id}`}>{p.name}</option>))}
        <option value="other">Other…</option>
        {label && <option value="none">Remove tag</option>}
      </select>
    </div>
  );
}

function tagLabelOf(pillarId: string | null, tag: string | null, pillars: Pillar[]): string {
  if (pillarId) return pillars.find((p) => p.id === pillarId)?.name || "";
  return tag || "";
}

export default function VaultPage() {
  const router = useRouter();
  const { ideas, loading, updateIdea, deleteIdea, createIdea } = useIdeas();
  const { pillars } = useContentPillars();
  const supabase = createClient();

  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaBody, setNewIdeaBody] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setArticlesLoading(false); return; }
      const { data } = await supabase
        .from("saved_articles")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false });
      setArticles(data || []);
      setArticlesLoading(false);
    })();
  }, [supabase]);

  const setIdeaTag = async (id: string, v: { pillar_id: string | null; tag: string | null }) => {
    const { error } = await updateIdea(id, v);
    if (error) toast.error("Could not update tag");
  };
  const setArticleTag = async (id: string, v: { pillar_id: string | null; tag: string | null }) => {
    const { error } = await supabase.from("saved_articles").update(v).eq("id", id);
    if (error) return toast.error("Could not update tag");
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, ...v } : a)));
  };
  const removeArticle = async (id: string) => {
    const { error } = await supabase.from("saved_articles").delete().eq("id", id);
    if (error) return toast.error("Could not remove");
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };
  const removeIdea = async (id: string) => {
    const { error } = await deleteIdea(id);
    if (error) toast.error("Could not delete");
  };

  const writeFromIdea = (id: string) => router.push(`/create?ideaId=${id}`);
  const writeFromArticle = (a: SavedArticle) => {
    const q = new URLSearchParams({
      source: "rss",
      title: a.title || "",
      url: a.url || "",
      content: a.snippet || a.title || "",
    });
    router.push(`/create?${q.toString()}`);
  };

  const addManualIdea = async () => {
    if (!newIdeaBody.trim() && !newIdeaTitle.trim()) return;
    const { error } = await createIdea({
      source: "manual",
      status: "approved",
      title: newIdeaTitle.trim() || null,
      body: newIdeaBody.trim() || null,
    });
    if (error) return toast.error("Could not add idea");
    setNewIdeaTitle("");
    setNewIdeaBody("");
    toast.success("Idea added");
  };

  // Filter + sort helpers, applied inside each tab.
  const matchIdea = (i: Idea) => {
    if (tagFilter !== "all") {
      const t = tagLabelOf(i.pillar_id, i.tag, pillars).toLowerCase();
      if (tagFilter === "untagged" ? t !== "" : t !== tagFilter.toLowerCase()) return false;
    }
    if (search.trim()) {
      const hay = `${i.title || ""} ${i.body || ""} ${i.angle || ""} ${i.source_content || ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  };
  const matchArticle = (a: SavedArticle) => {
    if (tagFilter !== "all") {
      const t = tagLabelOf(a.pillar_id, a.tag, pillars).toLowerCase();
      if (tagFilter === "untagged" ? t !== "" : t !== tagFilter.toLowerCase()) return false;
    }
    if (search.trim()) {
      const hay = `${a.title || ""} ${a.snippet || ""} ${a.author || ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  };
  const byDate = <T extends { created_at?: string; saved_at?: string }>(a: T, b: T) => {
    const da = Date.parse(a.created_at || a.saved_at || "");
    const db = Date.parse(b.created_at || b.saved_at || "");
    return sort === "newest" ? db - da : da - db;
  };

  const savedPosts = ideas.filter((i) => i.source === "research" && i.status === "approved").filter(matchIdea).sort(byDate);
  const aiIdeas = ideas.filter((i) => i.source === "ai" && i.status === "approved").filter(matchIdea).sort(byDate);
  const manualIdeas = ideas.filter((i) => i.source === "manual" && i.status === "approved").filter(matchIdea).sort(byDate);
  const savedArticles = articles.filter(matchArticle).sort(byDate);

  const countAll = ideas.filter((i) => i.status === "approved").length + articles.length;

  const writeBtn = "inline-flex items-center gap-1.5 rounded-lg bg-ecco-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ecco-navy-light";
  const iconBtn = "rounded-md p-1.5 text-ecco-error transition-colors hover:bg-red-50";

  const empty = (msg: string) => <p className="col-span-full py-10 text-center text-sm text-ecco-muted">{msg}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ecco-primary">
          <Lightbulb className="h-6 w-6 text-ecco-accent" /> Idea Vault
        </h1>
        <p className="text-ecco-tertiary">
          Every idea worth writing, in one place. Saved posts, AI ideas from your pillars, saved articles, and your own notes.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ecco-muted" />
          <Input placeholder="Search ideas…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 pl-8" />
        </div>
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className={selectCls}>
          <option value="all">All tags</option>
          {pillars.map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}
          <option value="untagged">Untagged</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} className={selectCls}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <span className="ml-auto text-sm text-ecco-tertiary">{countAll} saved</span>
      </div>

      {loading || articlesLoading ? (
        <div className="flex items-center justify-center py-20 text-ecco-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <Tabs defaultValue="posts">
          <TabsList className="mb-5 bg-ecco-off-white">
            <TabsTrigger value="posts" className={tabTrigger}><Bookmark className="mr-2 h-4 w-4" />Saved Posts</TabsTrigger>
            <TabsTrigger value="ai" className={tabTrigger}><Sparkles className="mr-2 h-4 w-4" />AI Ideas</TabsTrigger>
            <TabsTrigger value="articles" className={tabTrigger}><Rss className="mr-2 h-4 w-4" />Saved Articles</TabsTrigger>
            <TabsTrigger value="manual" className={tabTrigger}><Lightbulb className="mr-2 h-4 w-4" />My Ideas</TabsTrigger>
          </TabsList>

          {/* Saved Posts */}
          <TabsContent value="posts" className="m-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {savedPosts.length === 0 ? empty("No saved posts yet. Save posts from Popular Posts to build your vault.") : savedPosts.map((i) => (
                <div key={i.id} className="flex flex-col rounded-xl border border-ecco-light bg-white p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <Avatar src={i.source_avatar} name={i.source_author} />
                    <p className="flex-1 text-sm font-semibold text-ecco-primary break-words">{i.source_author || "LinkedIn author"}</p>
                    <TagControl pillarId={i.pillar_id} tag={i.tag} pillars={pillars} onSet={(v) => setIdeaTag(i.id, v)} />
                  </div>
                  <ExpandableText text={i.source_content || ""} clampClass="line-clamp-[10]" threshold={400} className="text-sm leading-relaxed text-ecco-secondary" />
                  <div className="mt-3 flex items-center gap-2 border-t border-ecco-light pt-3">
                    <button onClick={() => writeFromIdea(i.id)} className={writeBtn}><PenLine className="h-3.5 w-3.5" />Write my take</button>
                    {i.source_url && (
                      <a href={i.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-ecco-accent hover:underline"><ExternalLink className="h-3 w-3" />Original</a>
                    )}
                    <button onClick={() => removeIdea(i.id)} className={`${iconBtn} ml-auto`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* AI Ideas */}
          <TabsContent value="ai" className="m-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {aiIdeas.length === 0 ? empty("No AI ideas yet. Generating ideas from your content pillars is coming in the next step.") : aiIdeas.map((i) => (
                <div key={i.id} className="flex flex-col rounded-xl border border-ecco-light bg-white p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ecco-primary break-words">{i.title || "Idea"}</p>
                    <TagControl pillarId={i.pillar_id} tag={i.tag} pillars={pillars} onSet={(v) => setIdeaTag(i.id, v)} />
                  </div>
                  {i.body && <p className="whitespace-pre-wrap text-sm leading-relaxed text-ecco-secondary">{i.body}</p>}
                  <div className="mt-3 flex items-center gap-2 border-t border-ecco-light pt-3">
                    <button onClick={() => writeFromIdea(i.id)} className={writeBtn}><PenLine className="h-3.5 w-3.5" />Write my take</button>
                    <button onClick={() => removeIdea(i.id)} className={`${iconBtn} ml-auto`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Saved Articles */}
          <TabsContent value="articles" className="m-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {savedArticles.length === 0 ? empty("No saved articles yet. Save articles from your Feeds to keep them here.") : savedArticles.map((a) => (
                <div key={a.id} className="flex flex-col rounded-xl border border-ecco-light bg-white p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ecco-primary break-words">{a.title}</p>
                    <TagControl pillarId={a.pillar_id} tag={a.tag} pillars={pillars} onSet={(v) => setArticleTag(a.id, v)} />
                  </div>
                  {a.snippet && <p className="line-clamp-4 text-sm leading-relaxed text-ecco-secondary">{a.snippet}</p>}
                  {a.author && <p className="mt-1 text-[11px] text-ecco-muted">{a.author}</p>}
                  <div className="mt-3 flex items-center gap-2 border-t border-ecco-light pt-3">
                    <button onClick={() => writeFromArticle(a)} className={writeBtn}><PenLine className="h-3.5 w-3.5" />Write my take</button>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-ecco-accent hover:underline"><ExternalLink className="h-3 w-3" />Read</a>
                    )}
                    <button onClick={() => removeArticle(a.id)} className={`${iconBtn} ml-auto`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* My Ideas */}
          <TabsContent value="manual" className="m-0 space-y-4">
            <Card className="border-ecco">
              <CardContent className="space-y-2 p-4">
                <Input placeholder="Idea title (optional)" value={newIdeaTitle} onChange={(e) => setNewIdeaTitle(e.target.value)} />
                <textarea
                  placeholder="Jot an idea…"
                  value={newIdeaBody}
                  onChange={(e) => setNewIdeaBody(e.target.value)}
                  className="min-h-[70px] w-full resize-none rounded-lg border border-ecco bg-white px-3 py-2 text-sm text-ecco-primary"
                />
                <button onClick={addManualIdea} className={writeBtn}><Plus className="h-3.5 w-3.5" />Add to vault</button>
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {manualIdeas.length === 0 ? empty("No notes yet. Add your own ideas above.") : manualIdeas.map((i) => (
                <div key={i.id} className="flex flex-col rounded-xl border border-ecco-light bg-white p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ecco-primary break-words">{i.title || "Idea"}</p>
                    <TagControl pillarId={i.pillar_id} tag={i.tag} pillars={pillars} onSet={(v) => setIdeaTag(i.id, v)} />
                  </div>
                  {i.body && <p className="whitespace-pre-wrap text-sm leading-relaxed text-ecco-secondary">{i.body}</p>}
                  <div className="mt-3 flex items-center gap-2 border-t border-ecco-light pt-3">
                    <button onClick={() => writeFromIdea(i.id)} className={writeBtn}><PenLine className="h-3.5 w-3.5" />Write my take</button>
                    <button onClick={() => removeIdea(i.id)} className={`${iconBtn} ml-auto`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
