"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Link2,
  Rss,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";

// Stats data (will come from Supabase later)
const stats = [
  {
    label: "Posts This Month",
    value: "12",
    change: "+3",
    changeType: "positive" as const,
  },
  {
    label: "Total Impressions",
    value: "4,832",
    change: "+18%",
    changeType: "positive" as const,
  },
  {
    label: "Engagement Rate",
    value: "3.2%",
    change: "-0.4%",
    changeType: "negative" as const,
  },
  {
    label: "Drafts",
    value: "5",
    change: "",
    changeType: "neutral" as const,
  },
];

// Quick actions (removed Viral Posts as per user request)
const quickActions = [
  {
    title: "Create from Idea",
    description: "Turn your thoughts into engaging posts",
    icon: Lightbulb,
    href: "/create?tab=idea",
  },
  {
    title: "Create from URL",
    description: "Transform any article into content",
    icon: Link2,
    href: "/create?tab=url",
  },
  {
    title: "Create from RSS",
    description: "Generate posts from your news feeds",
    icon: Rss,
    href: "/create?tab=rss",
  },
  {
    title: "View Calendar",
    description: "Schedule and manage your content",
    icon: Calendar,
    href: "/calendar",
  },
];

// Recent drafts (will come from Supabase later)
const recentDrafts = [
  {
    id: 1,
    content: "Just discovered an incredible productivity hack that has transformed my morning routine. Here's what I learned about...",
    updatedAt: "2 hours ago",
  },
  {
    id: 2,
    content: "The future of AI in content creation is here. After testing 15 different tools, these are my top 3 picks for...",
    updatedAt: "Yesterday",
  },
  {
    id: 3,
    content: "Why I stopped chasing viral content and focused on building genuine connections instead. The results surprised me...",
    updatedAt: "3 days ago",
  },
];

// Scheduled posts (will come from Supabase later)
const scheduledPosts = [
  {
    id: 1,
    content: "5 leadership lessons I learned from my first year as a founder...",
    scheduledDate: new Date(2025, 1, 20),
    time: "9:00 AM",
  },
  {
    id: 2,
    content: "The one question that changed how I approach networking events...",
    scheduledDate: new Date(2025, 1, 22),
    time: "12:00 PM",
  },
  {
    id: 3,
    content: "Remote work isn't the future—it's the present. Here's how our team...",
    scheduledDate: new Date(2025, 1, 25),
    time: "8:30 AM",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
          Dashboard
        </h1>
        <p className="text-sm text-ecco-tertiary">
          Welcome back! Here's an overview of your content.
        </p>
      </div>

      {/* Setup Banner (show when brand voice not configured) */}
      <div className="rounded-xl bg-ecco-gradient p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Complete Your Setup
            </h3>
            <p className="text-sm text-white/80">
              Configure your brand voice to generate content that sounds like you.
            </p>
          </div>
          <Button
            asChild
            className="bg-white text-ecco-primary hover:bg-white/90"
          >
            <Link href="/settings">
              Set Up Brand Voice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-ecco">
            <CardContent className="p-5">
              <p className="text-sm text-ecco-tertiary">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-ecco-primary">
                {stat.value}
              </p>
              {stat.change && (
                <p
                  className={`mt-1 flex items-center text-xs ${
                    stat.changeType === "positive"
                      ? "text-ecco-success"
                      : stat.changeType === "negative"
                      ? "text-ecco-error"
                      : "text-ecco-muted"
                  }`}
                >
                  {stat.changeType === "positive" && (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  )}
                  {stat.changeType === "negative" && (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="h-full cursor-pointer border-ecco transition-all hover:-translate-y-0.5 hover:border-ecco-accent hover:shadow-md">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ecco-accent-light">
                  <action.icon className="h-6 w-6 text-ecco-accent" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-ecco-primary">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs text-ecco-tertiary">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Drafts */}
        <Card className="border-ecco">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-ecco-primary">
              Recent Drafts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library?filter=drafts" className="text-ecco-accent">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentDrafts.map((draft, index) => (
              <div
                key={draft.id}
                className={`py-4 ${
                  index !== recentDrafts.length - 1 ? "border-b border-ecco-light" : ""
                }`}
              >
                <p className="line-clamp-2 text-sm text-ecco-primary">
                  {draft.content}
                </p>
                <p className="mt-2 text-xs text-ecco-tertiary">
                  {draft.updatedAt}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scheduled Posts */}
        <Card className="border-ecco">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-ecco-primary">
              Upcoming Posts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calendar" className="text-ecco-accent">
                View Calendar
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0">
            {scheduledPosts.map((post, index) => (
              <div
                key={post.id}
                className={`flex items-center gap-4 py-4 ${
                  index !== scheduledPosts.length - 1 ? "border-b border-ecco-light" : ""
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-xl font-bold text-ecco-primary">
                    {post.scheduledDate.getDate()}
                  </span>
                  <span className="text-[10px] uppercase text-ecco-tertiary">
                    {post.scheduledDate.toLocaleString("default", { month: "short" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-sm text-ecco-primary">
                    {post.content}
                  </p>
                  <p className="mt-1 text-xs text-ecco-tertiary">{post.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
