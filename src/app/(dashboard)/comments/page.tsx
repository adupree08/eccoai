"use client";

import { useState } from "react";
import { useCommentQueue, type QueueItem } from "@/hooks/use-comment-queue";
import { AudiencePanel } from "@/components/comments/audience-panel";
import { Button } from "@/components/ui/button";
import { ExpandableText } from "@/components/ui/expandable-text";
import { MessageSquare, Search, Loader2, Copy, Check, ExternalLink, CheckCircle2, X, Trash2, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";

function initials(name: string | null): string {
  if (!name) return "IN";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase() || "IN";
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

export default function CommentsPage() {
  const { items, loading, updateItem, removeItem, refetch } = useCommentQueue();
  const [audienceId, setAudienceId] = useState<string | null>(null);
  const [finding, setFinding] = useState(false);
  const [view, setView] = useState<"pending" | "done" | "skipped">("pending");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reviseText, setReviseText] = useState<Record<string, string>>({});
  const [revisingId, setRevisingId] = useState<string | null>(null);

  // Regenerate (no instruction) or revise (with instruction) one comment.
  const revise = async (item: QueueItem, instruction = "") => {
    setRevisingId(item.id);
    try {
      const res = await fetch("/api/comments/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, instruction, currentDraft: drafts[item.id] ?? item.draft_comment ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Could not revise");
      setDrafts((d) => ({ ...d, [item.id]: data.comment }));
      await updateItem(item.id, { draft_comment: data.comment });
      setReviseText((t) => ({ ...t, [item.id]: "" }));
      toast.success(instruction ? "Comment revised" : "New comment drafted");
    } catch {
      toast.error("Could not revise");
    } finally {
      setRevisingId(null);
    }
  };

  const find = async () => {
    if (!audienceId) return toast.error("Set up an audience first");
    setFinding(true);
    try {
      const res = await fetch("/api/comments/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceId }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Discovery failed");
      else {
        toast.success(data.added > 0 ? `Added ${data.added} posts to your queue` : (data.note || "Nothing new found"));
        refetch();
      }
    } catch {
      toast.error("Discovery request failed");
    } finally {
      setFinding(false);
    }
  };

  const copy = async (item: QueueItem) => {
    const text = drafts[item.id] ?? item.draft_comment ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      toast.success("Comment copied");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const saveDraft = async (item: QueueItem) => {
    const text = drafts[item.id];
    if (text === undefined || text === item.draft_comment) return;
    await updateItem(item.id, { draft_comment: text });
  };

  const setStatus = async (item: QueueItem, status: "done" | "skipped" | "pending") => {
    const { error } = await updateItem(item.id, { status });
    if (error) toast.error("Could not update");
  };

  const shown = items.filter((i) => i.status === view);
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const tab = (v: typeof view, label: string, n?: number) => (
    <button
      onClick={() => setView(v)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === v ? "bg-ecco-navy text-white" : "text-ecco-tertiary hover:text-ecco-primary"}`}
    >
      {label}{typeof n === "number" && n > 0 ? ` (${n})` : ""}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ecco-primary">
          <MessageSquare className="h-6 w-6 text-ecco-accent" /> Comments
        </h1>
        <p className="text-ecco-tertiary">
          Find posts from the people you want as customers, get a comment drafted in your voice, review it, and post it yourself.
        </p>
      </div>

      {/* Audience (who + what) */}
      <AudiencePanel selectedId={audienceId} onSelect={setAudienceId} />

      {/* Find posts */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ecco-muted">Pulls this week&apos;s posts on your watch words, keeps only your customers, and drafts a comment for each.</p>
        <Button onClick={find} disabled={finding || !audienceId} className="shrink-0 bg-ecco-navy hover:bg-ecco-navy-light text-white">
          {finding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Find posts
        </Button>
      </div>

      {/* Queue */}
      <div className="flex items-center gap-2">
        {tab("pending", "To comment", pendingCount)}
        {tab("done", "Done")}
        {tab("skipped", "Skipped")}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-ecco-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-ecco-muted">
          {view === "pending" ? "Nothing to comment on yet. Run Find posts above to build your queue." : `No ${view} items.`}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((item) => (
            <div key={item.id} className="flex flex-col rounded-xl border border-ecco-light bg-white p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <Avatar src={item.author_avatar} name={item.author_name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ecco-primary break-words">{item.author_name || "LinkedIn author"}</p>
                  {item.author_headline && <p className="text-[11px] leading-snug text-ecco-tertiary line-clamp-1">{item.author_headline}</p>}
                </div>
                {item.topic && <span className="shrink-0 rounded-full border border-ecco px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-ecco-tertiary">{item.topic.split(",")[0]}</span>}
              </div>

              <ExpandableText text={item.post_content || ""} clampClass="line-clamp-[6]" threshold={300} className="text-[13px] leading-relaxed text-ecco-secondary" />

              <div className="mt-3 rounded-lg border border-ecco-light bg-ecco-off-white p-2.5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ecco-accent">Your comment</p>
                <textarea
                  value={drafts[item.id] ?? item.draft_comment ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
                  onBlur={() => saveDraft(item)}
                  placeholder="No draft yet. Write your comment here."
                  className="min-h-[64px] w-full resize-none rounded-md border border-ecco bg-white px-2.5 py-2 text-sm text-ecco-primary"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => revise(item)}
                    disabled={revisingId === item.id}
                    className="inline-flex items-center gap-1 rounded-md border border-ecco bg-white px-2 py-1 text-[11px] font-medium text-ecco-secondary hover:bg-ecco-off-white disabled:opacity-60"
                    title="Draft a fresh comment with a different angle"
                  >
                    {revisingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Regenerate
                  </button>
                  {["Shorter", "Add a question", "More direct", "Warmer"].map((q) => (
                    <button
                      key={q}
                      onClick={() => revise(item, q)}
                      disabled={revisingId === item.id}
                      className="rounded-md border border-ecco bg-white px-2 py-1 text-[11px] text-ecco-tertiary hover:bg-ecco-off-white disabled:opacity-60"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    value={reviseText[item.id] ?? ""}
                    onChange={(e) => setReviseText((t) => ({ ...t, [item.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter" && (reviseText[item.id] ?? "").trim()) revise(item, reviseText[item.id]); }}
                    placeholder="Ask for a change, e.g. mention my clinic, cut the second sentence"
                    className="min-w-0 flex-1 rounded-md border border-ecco bg-white px-2 py-1 text-[11px] text-ecco-primary"
                  />
                  <button
                    onClick={() => revise(item, reviseText[item.id])}
                    disabled={revisingId === item.id || !(reviseText[item.id] ?? "").trim()}
                    className="inline-flex items-center gap-1 rounded-md bg-ecco-navy px-2 py-1 text-[11px] font-semibold text-white hover:bg-ecco-navy-light disabled:opacity-50"
                  >
                    <Wand2 className="h-3 w-3" /> Revise
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ecco-light pt-3">
                <button onClick={() => copy(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-ecco-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-ecco-navy-light">
                  {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === item.id ? "Copied" : "Copy comment"}
                </button>
                {item.post_url && (
                  <a href={item.post_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-ecco px-3 py-1.5 text-xs font-medium text-ecco-secondary hover:bg-ecco-off-white">
                    <ExternalLink className="h-3.5 w-3.5" /> Open post
                  </a>
                )}
                {view !== "done" && (
                  <button onClick={() => setStatus(item, "done")} className="inline-flex items-center gap-1 text-xs text-ecco-success hover:underline" title="Mark as posted">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done
                  </button>
                )}
                {view === "pending" && (
                  <button onClick={() => setStatus(item, "skipped")} className="inline-flex items-center gap-1 text-xs text-ecco-tertiary hover:underline" title="Skip">
                    <X className="h-3.5 w-3.5" /> Skip
                  </button>
                )}
                <button onClick={() => removeItem(item.id)} className="ml-auto rounded-md p-1.5 text-ecco-error hover:bg-red-50" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
