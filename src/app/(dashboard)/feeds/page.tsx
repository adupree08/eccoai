"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

interface Feed {
  id: string;
  name: string;
  url: string;
  articlesCount: number;
  lastFetched: string;
  isActive: boolean;
}

interface Article {
  id: string;
  feedId: string;
  title: string;
  snippet: string;
  source: string;
  publishedAt: string;
  url: string;
}

// Mock data (will come from Supabase later)
const initialFeeds: Feed[] = [
  {
    id: "1",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    articlesCount: 24,
    lastFetched: "10 minutes ago",
    isActive: true,
  },
  {
    id: "2",
    name: "Harvard Business Review",
    url: "https://hbr.org/feed",
    articlesCount: 18,
    lastFetched: "1 hour ago",
    isActive: true,
  },
  {
    id: "3",
    name: "First Round Review",
    url: "https://review.firstround.com/feed",
    articlesCount: 12,
    lastFetched: "3 hours ago",
    isActive: false,
  },
];

const mockArticles: Article[] = [
  {
    id: "a1",
    feedId: "1",
    title: "The Future of AI in Enterprise Software",
    snippet: "As artificial intelligence continues to evolve, enterprise software companies are racing to integrate new capabilities that promise to transform how businesses operate...",
    source: "TechCrunch",
    publishedAt: "2 hours ago",
    url: "#",
  },
  {
    id: "a2",
    feedId: "1",
    title: "Startup Funding Trends in 2025",
    snippet: "Despite economic uncertainties, venture capital continues to flow into innovative startups, with particular focus on sustainability and healthcare tech...",
    source: "TechCrunch",
    publishedAt: "5 hours ago",
    url: "#",
  },
  {
    id: "a3",
    feedId: "2",
    title: "How Leaders Build Trust in Remote Teams",
    snippet: "Building trust when you cannot see your team every day requires intentional effort and new leadership strategies...",
    source: "Harvard Business Review",
    publishedAt: "1 day ago",
    url: "#",
  },
  {
    id: "a4",
    feedId: "2",
    title: "The Art of Strategic Decision-Making",
    snippet: "In a world of increasing complexity, the ability to make clear, strategic decisions has become a critical leadership skill...",
    source: "Harvard Business Review",
    publishedAt: "2 days ago",
    url: "#",
  },
];

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>(initialFeeds);
  const [expandedFeeds, setExpandedFeeds] = useState<Set<string>>(new Set(["1"]));
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [isAddingFeed, setIsAddingFeed] = useState(false);

  const toggleFeed = (feedId: string) => {
    const newExpanded = new Set(expandedFeeds);
    if (newExpanded.has(feedId)) {
      newExpanded.delete(feedId);
    } else {
      newExpanded.add(feedId);
    }
    setExpandedFeeds(newExpanded);
  };

  const toggleFeedActive = (feedId: string) => {
    setFeeds(feeds.map(feed =>
      feed.id === feedId ? { ...feed, isActive: !feed.isActive } : feed
    ));
  };

  const deleteFeed = (feedId: string) => {
    setFeeds(feeds.filter(feed => feed.id !== feedId));
    const newExpanded = new Set(expandedFeeds);
    newExpanded.delete(feedId);
    setExpandedFeeds(newExpanded);
  };

  const getArticlesForFeed = (feedId: string) => {
    return mockArticles.filter(article => article.feedId === feedId);
  };

  const handleAddFeed = () => {
    if (newFeedUrl.trim()) {
      const newFeed: Feed = {
        id: Date.now().toString(),
        name: "New Feed",
        url: newFeedUrl,
        articlesCount: 0,
        lastFetched: "Just added",
        isActive: true,
      };
      setFeeds([...feeds, newFeed]);
      setNewFeedUrl("");
      setIsAddingFeed(false);
    }
  };

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
          <CardContent className="flex items-center gap-4 p-4">
            <Input
              placeholder="Enter RSS feed URL..."
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddFeed} className="bg-ecco-navy hover:bg-ecco-navy-light">
              Add
            </Button>
            <Button variant="ghost" onClick={() => setIsAddingFeed(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feeds List */}
      <div className="space-y-3">
        {feeds.map((feed) => (
          <Collapsible
            key={feed.id}
            open={expandedFeeds.has(feed.id)}
            onOpenChange={() => toggleFeed(feed.id)}
          >
            <Card className={`border-ecco transition-all ${!feed.isActive ? "opacity-60" : ""}`}>
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
                    <h3 className="font-semibold text-ecco-primary truncate">
                      {feed.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {feed.articlesCount} articles
                    </Badge>
                  </div>
                  <p className="text-xs text-ecco-tertiary truncate">
                    {feed.url}
                  </p>
                  <p className="text-xs text-ecco-muted mt-0.5">
                    Last fetched: {feed.lastFetched}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={feed.isActive}
                    onCheckedChange={() => toggleFeedActive(feed.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-ecco-muted hover:text-ecco-error hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFeed(feed.id);
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
                    {getArticlesForFeed(feed.id).map((article) => (
                      <div
                        key={article.id}
                        className="rounded-lg border border-ecco-light p-4"
                      >
                        <p className="text-xs font-semibold text-ecco-accent mb-2">
                          {article.source}
                        </p>
                        <h4 className="text-sm font-semibold text-ecco-primary mb-2 line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-xs text-ecco-tertiary mb-3 line-clamp-2">
                          {article.snippet}
                        </p>
                        <p className="text-xs text-ecco-muted mb-3">
                          {article.publishedAt}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Read
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-ecco-navy hover:bg-ecco-navy-light"
                          >
                            <Sparkles className="mr-1 h-3 w-3" />
                            Create Post
                          </Button>
                        </div>
                      </div>
                    ))}
                    {getArticlesForFeed(feed.id).length === 0 && (
                      <div className="col-span-2 py-8 flex flex-col items-center text-center">
                        <p className="text-sm text-ecco-muted mb-4">
                          No articles yet. Click refresh to fetch articles.
                        </p>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Refresh Feed
                        </Button>
                      </div>
                    )}
                  </div>

                  {getArticlesForFeed(feed.id).length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-3 w-3" />
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
              <Plus className="h-6 w-6 text-ecco-accent" />
            </div>
            <h3 className="text-base font-semibold text-ecco-primary">
              No feeds yet
            </h3>
            <p className="mt-1 text-sm text-ecco-tertiary">
              Add your first RSS feed to get started with content ideas
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
