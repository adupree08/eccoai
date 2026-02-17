"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Loader2,
  Edit2,
  Check,
  X,
  Rss,
} from "lucide-react";
import { useFeeds } from "@/hooks/use-feeds";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";

interface Article {
  id: string;
  feed_id: string;
  title: string;
  snippet: string | null;
  url: string;
  author: string | null;
  published_at: string | null;
}

export default function FeedsPage() {
  const router = useRouter();
  const { feeds, loading, createFeed, updateFeed, deleteFeed, toggleFeedActive, refetch } = useFeeds();
  const [expandedFeeds, setExpandedFeeds] = useState<Set<string>>(new Set());
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [addingFeedLoading, setAddingFeedLoading] = useState(false);
  const [refreshingFeeds, setRefreshingFeeds] = useState<Set<string>>(new Set());
  const [feedArticles, setFeedArticles] = useState<Record<string, Article[]>>({});
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [editingFeedName, setEditingFeedName] = useState("");
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});

  const supabase = createClient();

  // Fetch article counts for all feeds
  const fetchArticleCounts = useCallback(async () => {
    if (feeds.length === 0) return;

    const counts: Record<string, number> = {};
    for (const feed of feeds) {
      const { count } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("feed_id", feed.id);
      counts[feed.id] = count || 0;
    }
    setArticleCounts(counts);
  }, [feeds, supabase]);

  useEffect(() => {
    fetchArticleCounts();
  }, [fetchArticleCounts]);

  const toggleFeedExpand = async (feedId: string) => {
    const newExpanded = new Set(expandedFeeds);
    if (newExpanded.has(feedId)) {
      newExpanded.delete(feedId);
    } else {
      newExpanded.add(feedId);
      // Fetch articles for this feed if not already loaded
      if (!feedArticles[feedId]) {
        await fetchArticlesForFeed(feedId);
      }
    }
    setExpandedFeeds(newExpanded);
  };

  const fetchArticlesForFeed = async (feedId: string) => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("feed_id", feedId)
      .order("published_at", { ascending: false })
      .limit(20);

    if (data) {
      setFeedArticles(prev => ({ ...prev, [feedId]: data }));
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    await deleteFeed(feedId);
    const newExpanded = new Set(expandedFeeds);
    newExpanded.delete(feedId);
    setExpandedFeeds(newExpanded);
  };

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;

    setAddingFeedLoading(true);

    // Create the feed first
    const result = await createFeed({
      name: newFeedName.trim() || "New Feed",
      url: newFeedUrl.trim(),
      is_active: true,
    });

    if (result.error) {
      alert("Failed to add feed: " + result.error);
      setAddingFeedLoading(false);
      return;
    }

    // Now refresh the feed to fetch articles
    if (result.data) {
      await refreshFeed(result.data.id);
    }

    setNewFeedUrl("");
    setNewFeedName("");
    setIsAddingFeed(false);
    setAddingFeedLoading(false);
  };

  const refreshFeed = async (feedId: string) => {
    setRefreshingFeeds(prev => new Set(prev).add(feedId));

    try {
      const response = await fetch("/api/feeds/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Failed to refresh feed: " + data.error);
      } else {
        // Refetch feeds to get updated name/timestamp
        await refetch();
        // Refetch articles for this feed
        await fetchArticlesForFeed(feedId);
        // Update article count
        const { count } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("feed_id", feedId);
        setArticleCounts(prev => ({ ...prev, [feedId]: count || 0 }));
      }
    } catch {
      alert("Failed to refresh feed");
    } finally {
      setRefreshingFeeds(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedId);
        return newSet;
      });
    }
  };

  const handleEditFeedName = (feedId: string, currentName: string) => {
    setEditingFeedId(feedId);
    setEditingFeedName(currentName);
  };

  const handleSaveFeedName = async (feedId: string) => {
    if (editingFeedName.trim()) {
      await updateFeed(feedId, { name: editingFeedName.trim() });
    }
    setEditingFeedId(null);
    setEditingFeedName("");
  };

  const handleCancelEditName = () => {
    setEditingFeedId(null);
    setEditingFeedName("");
  };

  const handleCreatePost = (article: Article, feedName: string) => {
    // Navigate to create page with article data
    const params = new URLSearchParams({
      source: "rss",
      title: article.title,
      url: article.url,
      content: article.snippet || "",
      feedName,
    });
    router.push(`/create?${params.toString()}`);
  };

  const formatLastFetched = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    try {
      return formatDistanceToNow(new Date(timestamp));
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
              RSS Feeds
            </h1>
            <p className="text-sm text-ecco-tertiary">
              Manage your content sources for fresh inspiration
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
            RSS Feeds
          </h1>
          <p className="text-sm text-ecco-tertiary">
            Manage your content sources for fresh inspiration
          </p>
        </div>
        <Button
          onClick={() => setIsAddingFeed(true)}
          className="bg-ecco-navy hover:bg-ecco-navy-light"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Feed
        </Button>
      </div>

      {/* Add Feed Form */}
      {isAddingFeed && (
        <Card className="border-ecco border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Feed name (optional, will auto-detect)"
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Enter RSS feed URL..."
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddFeed}
                className="bg-ecco-navy hover:bg-ecco-navy-light"
                disabled={addingFeedLoading || !newFeedUrl.trim()}
              >
                {addingFeedLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button variant="ghost" onClick={() => setIsAddingFeed(false)} disabled={addingFeedLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feeds List */}
      <div className="space-y-3">
        {feeds.map((feed) => (
          <Collapsible
            key={feed.id}
            open={expandedFeeds.has(feed.id)}
            onOpenChange={() => toggleFeedExpand(feed.id)}
          >
            <Card className={`border-ecco transition-all ${!feed.is_active ? "opacity-60" : ""}`}>
              {/* Feed Header */}
              <div className="flex items-center gap-4 p-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    {expandedFeeds.has(feed.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {editingFeedId === feed.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingFeedName}
                          onChange={(e) => setEditingFeedName(e.target.value)}
                          className="h-7 w-48"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveFeedName(feed.id);
                            if (e.key === "Escape") handleCancelEditName();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSaveFeedName(feed.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleCancelEditName}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-ecco-primary truncate">
                          {feed.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFeedName(feed.id, feed.name);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {articleCounts[feed.id] || 0} articles
                    </Badge>
                  </div>
                  <p className="text-xs text-ecco-tertiary truncate">
                    {feed.url}
                  </p>
                  <p className="text-xs text-ecco-muted mt-0.5">
                    Last fetched: {formatLastFetched(feed.last_fetched_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshFeed(feed.id);
                    }}
                    disabled={refreshingFeeds.has(feed.id)}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshingFeeds.has(feed.id) ? "animate-spin" : ""}`} />
                  </Button>
                  <Switch
                    checked={feed.is_active}
                    onCheckedChange={() => toggleFeedActive(feed.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-ecco-muted hover:text-ecco-error hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFeed(feed.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Content - Articles */}
              <CollapsibleContent>
                <div className="border-t border-ecco-light px-4 pb-4">
                  <div className="grid gap-4 pt-4 sm:grid-cols-2">
                    {(feedArticles[feed.id] || []).map((article) => (
                      <div
                        key={article.id}
                        className="rounded-lg border border-ecco-light p-4"
                      >
                        <h4 className="text-sm font-semibold text-ecco-primary mb-2 line-clamp-2">
                          {article.title}
                        </h4>
                        {article.snippet && (
                          <p className="text-xs text-ecco-tertiary mb-3 line-clamp-2">
                            {article.snippet}
                          </p>
                        )}
                        {article.published_at && (
                          <p className="text-xs text-ecco-muted mb-3">
                            {formatLastFetched(article.published_at)}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                            onClick={() => window.open(article.url, "_blank")}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Read
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-ecco-navy hover:bg-ecco-navy-light"
                            onClick={() => handleCreatePost(article, feed.name)}
                          >
                            <Sparkles className="mr-1 h-3 w-3" />
                            Create Post
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!feedArticles[feed.id] || feedArticles[feed.id].length === 0) && (
                      <div className="col-span-2 py-8 flex flex-col items-center text-center">
                        <p className="text-sm text-ecco-muted mb-4">
                          No articles yet. Click refresh to fetch articles.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshFeed(feed.id)}
                          disabled={refreshingFeeds.has(feed.id)}
                        >
                          {refreshingFeeds.has(feed.id) ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-3 w-3" />
                          )}
                          Refresh Feed
                        </Button>
                      </div>
                    )}
                  </div>

                  {feedArticles[feed.id] && feedArticles[feed.id].length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshFeed(feed.id)}
                        disabled={refreshingFeeds.has(feed.id)}
                      >
                        {refreshingFeeds.has(feed.id) ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-3 w-3" />
                        )}
                        Refresh Feed
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Empty State */}
      {feeds.length === 0 && (
        <Card className="border-ecco border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ecco-accent-light">
              <Rss className="h-6 w-6 text-ecco-accent" />
            </div>
            <h3 className="text-base font-semibold text-ecco-primary">
              No feeds yet
            </h3>
            <p className="mt-1 text-sm text-ecco-tertiary text-center max-w-md">
              Add your first RSS feed to get started with content ideas. We&apos;ll fetch articles that you can use as inspiration for LinkedIn posts.
            </p>
            <Button
              onClick={() => setIsAddingFeed(true)}
              className="mt-4 bg-ecco-navy hover:bg-ecco-navy-light"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Feed
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
