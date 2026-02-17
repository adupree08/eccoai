"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Link2,
  Rss,
  ArrowRight,
  Calendar,
  FileText,
  Loader2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/hooks/use-posts";
import { useBrandVoices } from "@/hooks/use-brand-voices";
import { formatDistanceToNow } from "@/lib/utils";

// Quick actions
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

export default function DashboardPage() {
  const { posts, loading } = usePosts();
  const { brandVoices, loading: voicesLoading } = useBrandVoices();

  // Calculate stats from actual posts
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const postsThisMonth = posts.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
  const drafts = posts.filter(p => p.status === "draft");
  const scheduled = posts.filter(p => p.status === "scheduled");
  const published = posts.filter(p => p.status === "published");

  // Get total impressions from published posts
  const totalImpressions = published.reduce((sum, p) => sum + (p.impressions || 0), 0);

  // Get recent drafts (last 3)
  const recentDrafts = drafts
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 3);

  // Get upcoming scheduled posts (next 3)
  const upcomingPosts = scheduled
    .filter(p => p.scheduled_at && new Date(p.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 3);

  const stats = [
    {
      label: "Posts This Month",
      value: postsThisMonth.toString(),
    },
    {
      label: "Total Impressions",
      value: totalImpressions.toLocaleString(),
    },
    {
      label: "Scheduled",
      value: scheduled.length.toString(),
    },
    {
      label: "Drafts",
      value: drafts.length.toString(),
    },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString));
    } catch {
      return "";
    }
  };

  const formatScheduledDate = (dateString: string | null) => {
    if (!dateString) return { day: "--", month: "---", time: "--:--" };
    try {
      const date = new Date(dateString);
      return {
        day: date.getDate().toString(),
        month: date.toLocaleString("default", { month: "short" }),
        time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
    } catch {
      return { day: "--", month: "---", time: "--:--" };
    }
  };

  // Check if user has no custom brand voices set up
  const hasCustomVoice = brandVoices.length > 0;

  if (loading || voicesLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
            Dashboard
          </h1>
          <p className="text-sm text-ecco-tertiary">
            Welcome back! Here&apos;s an overview of your content.
          </p>
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
          Dashboard
        </h1>
        <p className="text-sm text-ecco-tertiary">
          Welcome back! Here&apos;s an overview of your content.
        </p>
      </div>

      {/* Setup Banner (show when no posts yet) */}
      {posts.length === 0 && (
        <div className="rounded-xl bg-ecco-gradient p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Get Started with ecco
              </h3>
              <p className="text-sm text-white/80">
                Create your first LinkedIn post using AI-powered content generation.
              </p>
            </div>
            <Button
              asChild
              className="bg-white text-ecco-primary hover:bg-white/90"
            >
              <Link href="/create">
                Create Your First Post
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Voice Setup Banner (show when no custom voice set up) */}
      {!hasCustomVoice && (
        <div className="rounded-xl bg-gradient-to-r from-ecco-blue to-ecco-accent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Set Up Your Custom Voice
                </h3>
                <p className="text-sm text-white/80">
                  Define your unique brand voice so AI-generated content sounds authentically like you.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="bg-white text-ecco-blue hover:bg-white/90"
            >
              <Link href="/settings?tab=brand-voice">
                Configure Voice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-ecco">
            <CardContent className="p-5">
              <p className="text-sm text-ecco-tertiary">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-ecco-primary">
                {stat.value}
              </p>
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
            {recentDrafts.length > 0 ? (
              recentDrafts.map((draft, index) => (
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
                    {formatDate(draft.updated_at || draft.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <FileText className="h-8 w-8 text-ecco-muted mx-auto mb-2" />
                <p className="text-sm text-ecco-tertiary">No drafts yet</p>
                <Link href="/create">
                  <Button variant="link" size="sm" className="mt-2 text-ecco-accent">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Create your first post
                  </Button>
                </Link>
              </div>
            )}
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
            {upcomingPosts.length > 0 ? (
              upcomingPosts.map((post, index) => {
                const scheduled = formatScheduledDate(post.scheduled_at);
                return (
                  <div
                    key={post.id}
                    className={`flex items-center gap-4 py-4 ${
                      index !== upcomingPosts.length - 1 ? "border-b border-ecco-light" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xl font-bold text-ecco-primary">
                        {scheduled.day}
                      </span>
                      <span className="text-[10px] uppercase text-ecco-tertiary">
                        {scheduled.month}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 text-sm text-ecco-primary">
                        {post.content}
                      </p>
                      <p className="mt-1 text-xs text-ecco-tertiary">{scheduled.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <Calendar className="h-8 w-8 text-ecco-muted mx-auto mb-2" />
                <p className="text-sm text-ecco-tertiary">No scheduled posts</p>
                <Link href="/library?filter=drafts">
                  <Button variant="link" size="sm" className="mt-2 text-ecco-accent">
                    Schedule a draft
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
