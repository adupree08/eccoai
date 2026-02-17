"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const periods = ["7 days", "30 days", "90 days", "All time"];

// Mock stats data
const stats = [
  {
    label: "Total Impressions",
    value: "24,832",
    change: "+18%",
    changeType: "positive" as const,
    icon: Eye,
  },
  {
    label: "Total Engagements",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: ThumbsUp,
  },
  {
    label: "Comments",
    value: "89",
    change: "+24%",
    changeType: "positive" as const,
    icon: MessageSquare,
  },
  {
    label: "Shares",
    value: "34",
    change: "-8%",
    changeType: "negative" as const,
    icon: Share2,
  },
];

// Production stats
const productionStats = {
  total: 48,
  breakdown: [
    { label: "From Idea", count: 22, percentage: 46, color: "bg-ecco-navy" },
    { label: "From URL", count: 15, percentage: 31, color: "bg-ecco-purple" },
    { label: "From RSS", count: 11, percentage: 23, color: "bg-ecco-blue-soft" },
  ],
};

// Top posts
const topPosts = [
  {
    id: 1,
    content: "The best advice I ever received wasn't about working harder. It was about working smarter. Here's what changed everything for me...",
    impressions: 4832,
    engagements: 156,
    comments: 23,
  },
  {
    id: 2,
    content: "5 leadership lessons I learned from my first year as a founder. Lesson 1: Listen more than you speak...",
    impressions: 3921,
    engagements: 134,
    comments: 18,
  },
  {
    id: 3,
    content: "Stop trying to be productive 24/7. I know, it sounds counterintuitive. But here's the truth...",
    impressions: 3456,
    engagements: 112,
    comments: 15,
  },
  {
    id: 4,
    content: "The future of remote work isn't about choosing between office or home. It's about flexibility...",
    impressions: 2987,
    engagements: 98,
    comments: 12,
  },
  {
    id: 5,
    content: "Why I stopped chasing viral content and focused on building genuine connections instead...",
    impressions: 2654,
    engagements: 87,
    comments: 10,
  },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30 days");

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
        {stats.map((stat) => (
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
              <p
                className={cn(
                  "mt-1 flex items-center text-xs",
                  stat.changeType === "positive"
                    ? "text-ecco-success"
                    : "text-ecco-error"
                )}
              >
                {stat.changeType === "positive" ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {stat.change} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Placeholder */}
      <Card className="border-ecco">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-ecco-primary">
            Engagement Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-ecco-tertiary text-sm">
            <p>Chart visualization would go here</p>
            {/* In production, use a charting library like Recharts */}
          </div>
        </CardContent>
      </Card>

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
              {productionStats.total} posts
            </p>

            {productionStats.breakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.label === "From Idea" && (
                      <Lightbulb className="h-4 w-4 text-ecco-muted" />
                    )}
                    {item.label === "From URL" && (
                      <Link2 className="h-4 w-4 text-ecco-muted" />
                    )}
                    {item.label === "From RSS" && (
                      <Rss className="h-4 w-4 text-ecco-muted" />
                    )}
                    <span className="text-ecco-secondary">{item.label}</span>
                  </div>
                  <span className="text-ecco-tertiary">{item.count} posts</span>
                </div>
                <div className="h-6 bg-ecco-off-white rounded overflow-hidden">
                  <div
                    className={cn("h-full rounded flex items-center pl-2", item.color)}
                    style={{ width: `${item.percentage}%` }}
                  >
                    <span className="text-[10px] font-semibold text-white">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className={cn(
                  "flex gap-4 py-4",
                  index !== topPosts.length - 1 && "border-b border-ecco-light"
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
                      {post.engagements}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
