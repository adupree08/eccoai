"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Copy,
  Trash2,
  Edit3,
  X,
  Check,
  Sparkles,
  Loader2,
  GripVertical,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/use-posts";
import { Database } from "@/lib/supabase/types";
import { toast } from "sonner";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Status = Post["status"];

const COLUMNS: { key: Status; label: string; hint: string }[] = [
  { key: "idea", label: "Idea", hint: "Raw concepts" },
  { key: "draft", label: "Draft", hint: "In progress" },
  { key: "ready", label: "Ready", hint: "Approved to post" },
  { key: "revisions", label: "Revisions", hint: "Needs work" },
  { key: "scheduled", label: "Scheduled", hint: "Queued" },
  { key: "published", label: "Published", hint: "Live" },
];

const COLUMN_ACCENT: Record<Status, string> = {
  idea: "#94a3b8",
  draft: "#2563eb",
  ready: "#16a34a",
  revisions: "#d97706",
  scheduled: "#0a66c2",
  published: "#7c3aed",
};

export default function LibraryPage() {
  const { posts, loading, error, updatePost, deletePost, refetch } = usePosts();

  // Local board mirror so drag feels instant; reverts on server error.
  const [board, setBoard] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [refineFor, setRefineFor] = useState<string | null>(null);
  const [refineText, setRefineText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setBoard(posts);
  }, [posts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const visible = useMemo(() => {
    if (!search.trim()) return board;
    const q = search.toLowerCase();
    return board.filter((p) => p.content.toLowerCase().includes(q));
  }, [board, search]);

  const byColumn = (status: Status) => visible.filter((p) => p.status === status);

  const activePost = activeId ? board.find((p) => p.id === activeId) : null;

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const newStatus = String(over.id) as Status;
    const post = board.find((p) => p.id === id);
    if (!post || post.status === newStatus) return;

    const prevStatus = post.status;
    // Optimistic move.
    setBoard((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));

    const updates: Partial<Post> = { status: newStatus };
    if (newStatus === "scheduled" && !post.scheduled_at) {
      updates.scheduled_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    if (newStatus === "published" && !post.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { error: updErr } = await updatePost(id, updates);
    if (updErr) {
      // Revert on failure.
      setBoard((prev) => prev.map((p) => (p.id === id ? { ...p, status: prevStatus } : p)));
      toast.error("Could not move the post. Try again.");
    } else {
      toast.success(`Moved to ${COLUMNS.find((c) => c.key === newStatus)?.label}`);
    }
  };

  const startEdit = (p: Post) => {
    setEditingId(p.id);
    setEditText(p.content);
    setRefineFor(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingId(editingId);
    const { error: updErr } = await updatePost(editingId, { content: editText });
    setSavingId(null);
    if (updErr) {
      toast.error("Could not save your changes.");
      return;
    }
    toast.success("Saved");
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (id: string) => {
    const { error: delErr } = await deletePost(id);
    if (delErr) toast.error("Could not delete the post.");
    else toast.success("Post deleted");
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  // The AI refinement loop: ask the AI to revise a post in place.
  const runRefine = async (p: Post) => {
    if (!refineText.trim()) return;
    setRefiningId(p.id);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "edit",
          content: p.content,
          editAction: "custom",
          customInstruction: refineText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "The AI could not revise this post.");
        return;
      }
      const revised = data.posts?.[0]?.content;
      if (!revised) {
        toast.error("No revision was returned. Try rephrasing your request.");
        return;
      }
      const { error: updErr } = await updatePost(p.id, { content: revised, status: "revisions" });
      if (updErr) {
        toast.error("Revised, but could not save. Try again.");
        return;
      }
      toast.success("Revised by AI");
      setRefineFor(null);
      setRefineText("");
    } catch {
      toast.error("Something went wrong talking to the AI.");
    } finally {
      setRefiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">Library</h1>
          <p className="text-sm text-ecco-tertiary">
            Drag posts across the pipeline. Edit, refine with AI, or schedule.
          </p>
        </div>
        <div className="relative w-64 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ecco-muted" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Load error (never silently show an empty board) */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-ecco-error">
          <AlertCircle className="h-4 w-4" />
          Could not load your posts.
          <button onClick={() => refetch()} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ecco-tertiary" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.key}
                status={col.key}
                label={col.label}
                hint={col.hint}
                count={byColumn(col.key).length}
              >
                {byColumn(col.key).map((p) => (
                  <KanbanCard
                    key={p.id}
                    post={p}
                    isEditing={editingId === p.id}
                    editText={editText}
                    onEditTextChange={setEditText}
                    onStartEdit={() => startEdit(p)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={saveEdit}
                    saving={savingId === p.id}
                    onDelete={() => handleDelete(p.id)}
                    onCopy={() => handleCopy(p.id, p.content)}
                    copied={copiedId === p.id}
                    refineOpen={refineFor === p.id}
                    onToggleRefine={() => {
                      setRefineFor(refineFor === p.id ? null : p.id);
                      setRefineText("");
                    }}
                    refineText={refineText}
                    onRefineTextChange={setRefineText}
                    onRunRefine={() => runRefine(p)}
                    refining={refiningId === p.id}
                  />
                ))}
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activePost ? (
              <div className="w-72 rounded-lg border border-ecco bg-white p-3 shadow-lg">
                <p className="text-xs text-ecco-primary line-clamp-4 whitespace-pre-wrap">
                  {activePost.content}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  hint,
  count,
  children,
}: {
  status: Status;
  label: string;
  hint: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-ecco-off-white transition-colors",
        isOver ? "border-ecco-accent bg-ecco-blue-pale" : "border-ecco-light"
      )}
    >
      <div className="flex items-center justify-between border-b border-ecco-light px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLUMN_ACCENT[status] }} />
          <span className="text-sm font-semibold text-ecco-primary">{label}</span>
          <span className="text-xs text-ecco-muted">{count}</span>
        </div>
        <span className="text-[10px] text-ecco-muted">{hint}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2 min-h-32">
        {count === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-ecco-muted">Drop posts here</p>
        )}
        {children}
      </div>
    </div>
  );
}

function KanbanCard(props: {
  post: Post;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  saving: boolean;
  onDelete: () => void;
  onCopy: () => void;
  copied: boolean;
  refineOpen: boolean;
  onToggleRefine: () => void;
  refineText: string;
  onRefineTextChange: (v: string) => void;
  onRunRefine: () => void;
  refining: boolean;
}) {
  const { post } = props;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: post.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border border-ecco-light bg-white p-3 shadow-sm",
        isDragging && "opacity-40"
      )}
    >
      {props.isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={props.editText}
            onChange={(e) => props.onEditTextChange(e.target.value)}
            rows={6}
            className="text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={props.onCancelEdit} disabled={props.saving}>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              className="bg-ecco-navy text-white hover:bg-ecco-navy-light"
              onClick={props.onSaveEdit}
              disabled={props.saving}
            >
              {props.saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-1">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab text-ecco-muted hover:text-ecco-tertiary active:cursor-grabbing"
              aria-label="Drag post"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <p className="flex-1 text-xs text-ecco-primary whitespace-pre-wrap line-clamp-6">
              {post.content}
            </p>
          </div>

          <div className="mt-2 flex items-center justify-end gap-1 border-t border-ecco-light pt-2">
            <IconBtn label="Refine with AI" onClick={props.onToggleRefine}>
              <Sparkles className={cn("h-3.5 w-3.5", props.refineOpen && "text-ecco-accent")} />
            </IconBtn>
            <IconBtn label="Edit" onClick={props.onStartEdit}>
              <Edit3 className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label="Copy" onClick={props.onCopy}>
              {props.copied ? <Check className="h-3.5 w-3.5 text-ecco-success" /> : <Copy className="h-3.5 w-3.5" />}
            </IconBtn>
            <IconBtn label="Delete" onClick={props.onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-ecco-error" />
            </IconBtn>
          </div>

          {props.refineOpen && (
            <div className="mt-2 space-y-2 rounded-md bg-ecco-blue-pale p-2">
              <Textarea
                value={props.refineText}
                onChange={(e) => props.onRefineTextChange(e.target.value)}
                rows={2}
                placeholder="Tell the AI how to revise this (e.g. 'make it punchier, add a stat')"
                className="text-xs bg-white"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="bg-ecco-navy text-white hover:bg-ecco-navy-light"
                  onClick={props.onRunRefine}
                  disabled={props.refining || !props.refineText.trim()}
                >
                  {props.refining ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Revising</>
                  ) : (
                    <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Revise</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-ecco-tertiary hover:bg-ecco-off-white hover:text-ecco-primary"
    >
      {children}
    </button>
  );
}
