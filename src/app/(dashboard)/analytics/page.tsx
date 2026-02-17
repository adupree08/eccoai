"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Lightbulb,
  Link2,
  Rss,
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";
import Link from "next/link";

const periods = ["7 days", "30 days", "90 days", "All time"];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30 days");
  const { stats, loading, hasData } = useAnalytics(selectedPeriod);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
            Analytics
          </h1>
          <p className="text-sm text-ecco-tertiary">
            Track your content performance and engagement
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-ecco-tertiary">Loading analytics...</div>
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
            Analytics
          </h1>
          <p className="text-sm text-ecco-tertiary">
            Track your content performance and engagement
          </p>
        </div>

        <Card className="border-ecco border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ecco-accent-light">
              <BarChart3 className="h-8 w-8 text-ecco-accent" />
            </div>
            <h3 className="text-xl font-semibold text-ecco-primary mb-2">
              No analytics yet
            </h3>
            <p className="text-sm text-ecco-tertiary text-center max-w-md mb-6">
              Start creating and publishing posts to see your content performance analytics here.
              We&apos;ll track your drafts, scheduled posts, and published content.
            </p>
            <Link href="/create">
              <Button className="bg-ecco-navy hover:bg-ecco-navy-light">
                Create Your First Post
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* What you'll see section */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-ecco opacity-60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-ecco-off-white">
                  <FileText className="h-4 w-4 text-ecco-muted" />
                </div>
                <p className="text-sm text-ecco-tertiary">Total Posts</p>
              </div>
              <p className="text-2xl font-bold text-ecco-muted">--</p>
            </CardContent>
          </Card>
          <Card className="border-ecco opacity-60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-ecco-off-white">
                  <Clock className="h-4 w-4 text-ecco-muted" />
                </div>
                <p className="text-sm text-ecco-tertiary">Scheduled</p>
              </div>
              <p className="text-2xl font-bold text-ecco-muted">--</p>
            </CardContent>
          </Card>
          <Card className="border-ecco opacity-60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-ecco-off-white">
                  <CheckCircle2 className="h-4 w-4 text-ecco-muted" />
                </div>
                <p className="text-sm text-ecco-tertiary">Published</p>
              </div>
              <p className="text-2xl font-bold text-ecco-muted">--</p>
            </CardContent>
          </Card>
          <Card className="border-ecco opacity-60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-ecco-off-white">
                  <ThumbsUp className="h-4 w-4 text-ecco-muted" />
                </div>
                <p className="text-sm text-ecco-tertiary">Engagements</p>
              </div>
              <p className="text-2xl font-bold text-ecco-muted">--</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Stats is guaranteed to be non-null here because of the hasData check above
  const safeStats = stats!;

  // Stats cards data
  const statCards = [
    {
      label: "Total Posts",
      value: safeStats.totalPosts.toLocaleString(),
      icon: FileText,
    },
    {
      label: "Drafts",
      value: safeStats.drafts.toLocaleString(),
      icon: FileText,
    },
    {
      label: "Scheduled",
      value: safeStats.scheduled.toLocaleString(),
      icon: Clock,
    },
    {
      label: "Published",
      value: safeStats.published.toLocaleString(),
      icon: CheckCircle2,
    },
  ];

  // Calculate percentages for source breakdown
  const totalBySource = safeStats.bySourceType.idea + safeStats.bySourceType.url + safeStats.bySourceType.rss;
  const productionBreakdown = [
    {
      label: "From Idea",
      count: safeStats.bySourceType.idea,
      percentage: totalBySource > 0 ? Math.round((safeStats.bySourceType.idea / totalBySource) * 100) : 0,
      color: "bg-ecco-navy",
      icon: Lightbulb,
    },
    {
      label: "From URL",
      count: safeStats.bySourceType.url,
      percentage: totalBySource > 0 ? Math.round((safeStats.bySourceType.url / totalBySource) * 100) : 0,
      color: "bg-ecco-purple",
      icon: Link2,
    },
    {
      label: "From RSS",
      count: safeStats.bySourceType.rss,
      percentage: totalBySource > 0 ? Math.round((safeStats.bySourceType.rss / totalBySource) * 100) : 0,
      color: "bg-ecco-blue-soft",
      icon: Rss,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
          Analytics
        </h1>
        <p className="text-sm text-ecco-tertiary">
          Track your content performance and engagement
        </p>
      </div>

      {/* Period Selection */}
      <div className="flex gap-2">
        {periods.map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              selectedPeriod === period && "bg-ecco-navy hover:bg-ecco-navy-light"
            )}
          >
            {period}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-ecco">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-ecco-tertiary">{stat.label}</p>
                <div className="p-2 rounded-lg bg-ecco-off-white">
                  <stat.icon className="h-4 w-4 text-ecco-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold text-ecco-primary">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Stats */}
        <Card className="border-ecco">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-ecco-primary">
              Content Production
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-3xl font-bold text-ecco-primary">
              {safeStats.totalPosts} posts
            </p>

            {totalBySource > 0 ? (
              productionBreakdown.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-ecco-muted" />
                      <span className="text-ecco-secondary">{item.label}</span>
                    </div>
                    <span className="text-ecco-tertiary">{item.count} posts</span>
                  </div>
                  <div className="h-6 bg-ecco-off-white rounded overflow-hidden">
                    <div
                      className={cn("h-full rounded flex items-center pl-2", item.color)}
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    >
                      <span className="text-[10px] font-semibold text-white">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ecco-tertiary">
                No posts created yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card className="border-ecco">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-ecco-primary">
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {safeStats.topPosts.length > 0 ? (
              safeStats.topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className={cn(
                    "flex gap-4 py-4",
                    index !== safeStats.topPosts.length - 1 && "border-b border-ecco-light"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ecco-accent-light text-sm font-semibold text-ecco-primary flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ecco-primary line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex gap-4 text-xs text-ecco-tertiary">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.impressions.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-ecco-tertiary">
                  No published posts yet. Publish your first post to see performance data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
