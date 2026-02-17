"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Calendar,
  Copy,
  Trash2,
  Edit3,
  X,
  Check,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";
import { cn, formatDistanceToNow } from "@/lib/utils";
import { usePosts } from "@/hooks/use-posts";

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilter = searchParams.get("filter") || "all";

  const { posts, loading, updatePost, deletePost, schedulePost } = usePosts();

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by status
    if (activeFilter === "drafts") {
      result = result.filter((p) => p.status === "draft");
    } else if (activeFilter === "scheduled") {
      result = result.filter((p) => p.status === "scheduled");
    } else if (activeFilter === "published") {
      result = result.filter((p) => p.status === "published");
    }

    // Filter by search
    if (searchQuery) {
      result = result.filter((p) =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [posts, activeFilter, searchQuery]);

  const toggleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="bg-ecco-accent-light text-ecco-accent border-0 text-[10px] font-semibold">
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-semibold">
            Scheduled
          </Badge>
        );
      case "published":
        return (
          <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-semibold">
            Published
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleEdit = (post: { id: string; content: string }) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setExpandedPostId(post.id);
  };

  const handleSaveEdit = async () => {
    if (!editingPostId) return;

    setSavingPostId(editingPostId);
    try {
      await updatePost(editingPostId, { content: editContent });
      setEditingPostId(null);
      setEditContent("");
    } catch {
      alert("Failed to save changes");
    } finally {
      setSavingPostId(null);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeletingPostId(postId);
    try {
      await deletePost(postId);
      setExpandedPostId(null);
    } catch {
      alert("Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleSchedule = async (postId: string) => {
    setSavingPostId(postId);
    try {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1);
      scheduledAt.setHours(9, 0, 0, 0);

      await schedulePost(postId, scheduledAt);
    } catch {
      alert("Failed to schedule post");
    } finally {
      setSavingPostId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString));
    } catch {
      return "";
    }
  };

  const formatScheduledDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
              Library
            </h1>
            <p className="text-sm text-ecco-tertiary">
              All your saved posts in one place
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ecco-tertiary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
            Library
          </h1>
          <p className="text-sm text-ecco-tertiary">
            All your saved posts in one place
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ecco-muted" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-transparent border-b border-ecco w-full justify-start rounded-none h-auto p-0 gap-6">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              All Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              Drafts ({posts.filter(p => p.status === "draft").length})
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              Scheduled ({posts.filter(p => p.status === "scheduled").length})
            </TabsTrigger>
            <TabsTrigger
              value="published"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              Published ({posts.filter(p => p.status === "published").length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.size > 0 && (
          <div className="flex items-center gap-4 mt-4 p-3 bg-white border border-ecco rounded-lg">
            <label className="flex items-center gap-2 text-sm font-medium text-ecco-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPosts.size === filteredPosts.length}
                onChange={toggleSelectAll}
                className="accent-ecco-accent w-4 h-4"
              />
              {selectedPosts.size} selected
            </label>
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" size="sm">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                Schedule All
              </Button>
              <Button variant="secondary" size="sm" className="text-ecco-error hover:text-ecco-error">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className={cn(
                "border-ecco transition-all cursor-pointer",
                expandedPostId === post.id && "col-span-full cursor-default",
                selectedPosts.has(post.id) && "ring-2 ring-ecco-accent"
              )}
              onClick={() => {
                if (!editingPostId && expandedPostId !== post.id) {
                  setExpandedPostId(expandedPostId === post.id ? null : post.id);
                }
              }}
            >
              <CardContent className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedPosts.has(post.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectPost(post.id);
                    }}
                    className="accent-ecco-accent w-4 h-4 mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {getStatusBadge(post.status)}
                </div>

                {/* Content */}
                {expandedPostId === post.id ? (
                  /* Expanded View */
                  editingPostId === post.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[200px] resize-y"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPostId(null);
                            setEditContent("");
                          }}
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={savingPostId === post.id}
                          className="bg-ecco-navy hover:bg-ecco-navy-light"
                        >
                          {savingPostId === post.id ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-ecco-primary whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(post);
                          }}
                        >
                          <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(post.content, post.id);
                          }}
                        >
                          {copiedId === post.id ? (
                            <Check className="mr-1.5 h-3.5 w-3.5 text-ecco-success" />
                          ) : (
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {copiedId === post.id ? "Copied" : "Copy"}
                        </Button>
                        {post.status === "draft" && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSchedule(post.id);
                              }}
                              disabled={savingPostId === post.id}
                            >
                              {savingPostId === post.id ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Schedule
                            </Button>
                            <Button
                              size="sm"
                              className="bg-ecco-navy hover:bg-ecco-navy-light"
                            >
                              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                              Regenerate
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                          disabled={deletingPostId === post.id}
                          className="text-ecco-error hover:text-ecco-error"
                        >
                          {deletingPostId === post.id ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPostId(null);
                          }}
                          className="ml-auto"
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Close
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  /* Collapsed View */
                  <p className="text-sm text-ecco-primary line-clamp-4 leading-relaxed mb-4">
                    {post.content}
                  </p>
                )}

                {/* Meta Footer */}
                {expandedPostId !== post.id && (
                  <div className="flex items-center justify-between pt-3 border-t border-ecco-light">
                    <span className="text-xs text-ecco-tertiary">
                      {formatDate(post.created_at)}
                    </span>
                    {post.status === "published" && post.impressions && (
                      <span className="text-xs text-ecco-tertiary">
                        {post.impressions.toLocaleString()} views
                      </span>
                    )}
                    {post.status === "scheduled" && post.scheduled_at && (
                      <span className="text-xs text-ecco-tertiary">
                        {formatScheduledDate(post.scheduled_at)}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <Card className="border-ecco border-dashed mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ecco-accent-light">
                <FileText className="h-6 w-6 text-ecco-accent" />
              </div>
              <h3 className="text-base font-semibold text-ecco-primary">
                {searchQuery ? "No posts found" : "No posts yet"}
              </h3>
              <p className="mt-1 text-sm text-ecco-tertiary text-center max-w-md">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first post to see it here"}
              </p>
              {!searchQuery && (
                <Link href="/create">
                  <Button className="mt-4 bg-ecco-navy hover:bg-ecco-navy-light">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
