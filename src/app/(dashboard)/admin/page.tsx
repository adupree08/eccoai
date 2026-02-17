"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Rss,
  TrendingUp,
  Search,
  Loader2,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";

// Admin email whitelist
const ADMIN_EMAILS = ["aujena.dpree@gmail.com"];

interface UserStats {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  postsCount: number;
  feedsCount: number;
  brandVoicesCount: number;
}

interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalFeeds: number;
  postsThisWeek: number;
  activeUsers: number;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const checkAdminAccess = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (!ADMIN_EMAILS.includes(user.email || "")) {
      router.push("/dashboard");
      return;
    }

    setIsAdmin(true);
    await fetchData();
  }, [supabase, router]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch all posts count
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      // Fetch all feeds count
      const { count: feedsCount } = await supabase
        .from("feeds")
        .select("*", { count: "exact", head: true });

      // Fetch posts this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: postsThisWeek } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Get unique users from posts (active users)
      const { data: activePosts } = await supabase
        .from("posts")
        .select("user_id")
        .gte("created_at", weekAgo.toISOString());

      const activeUserIds = new Set(activePosts?.map((p: { user_id: string }) => p.user_id) || []);

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch posts per user
      const { data: userPosts } = await supabase
        .from("posts")
        .select("user_id");

      // Fetch feeds per user
      const { data: userFeeds } = await supabase
        .from("feeds")
        .select("user_id");

      // Fetch brand voices per user
      const { data: userVoices } = await supabase
        .from("brand_voices")
        .select("user_id");

      // Count posts per user
      const postsPerUser: Record<string, number> = {};
      userPosts?.forEach((p: { user_id: string }) => {
        postsPerUser[p.user_id] = (postsPerUser[p.user_id] || 0) + 1;
      });

      // Count feeds per user
      const feedsPerUser: Record<string, number> = {};
      userFeeds?.forEach((f: { user_id: string }) => {
        feedsPerUser[f.user_id] = (feedsPerUser[f.user_id] || 0) + 1;
      });

      // Count brand voices per user
      const voicesPerUser: Record<string, number> = {};
      userVoices?.forEach((v: { user_id: string }) => {
        voicesPerUser[v.user_id] = (voicesPerUser[v.user_id] || 0) + 1;
      });

      // Build user stats
      const userStats: UserStats[] = (profiles || []).map((profile: { id: string; email: string | null; created_at: string; updated_at: string | null }) => ({
        id: profile.id,
        email: profile.email || "Unknown",
        created_at: profile.created_at,
        last_sign_in_at: profile.updated_at,
        postsCount: postsPerUser[profile.id] || 0,
        feedsCount: feedsPerUser[profile.id] || 0,
        brandVoicesCount: voicesPerUser[profile.id] || 0,
      }));

      setPlatformStats({
        totalUsers: profiles?.length || 0,
        totalPosts: postsCount || 0,
        totalFeeds: feedsCount || 0,
        postsThisWeek: postsThisWeek || 0,
        activeUsers: activeUserIds.size,
      });

      setUsers(userStats);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return formatDistanceToNow(new Date(dateString));
    } catch {
      return "Unknown";
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-ecco-tertiary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-ecco-navy" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
              Admin Dashboard
            </h1>
            <p className="text-sm text-ecco-tertiary">
              Platform overview and user management
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
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-ecco-navy" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
            Admin Dashboard
          </h1>
          <p className="text-sm text-ecco-tertiary">
            Platform overview and user management
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      {platformStats && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-ecco">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ecco-accent-light">
                  <Users className="h-5 w-5 text-ecco-accent" />
                </div>
                <div>
                  <p className="text-sm text-ecco-tertiary">Total Users</p>
                  <p className="text-2xl font-bold text-ecco-primary">
                    {platformStats.totalUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-ecco">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-ecco-tertiary">Active This Week</p>
                  <p className="text-2xl font-bold text-ecco-primary">
                    {platformStats.activeUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-ecco">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-ecco-tertiary">Total Posts</p>
                  <p className="text-2xl font-bold text-ecco-primary">
                    {platformStats.totalPosts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-ecco">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-ecco-tertiary">Posts This Week</p>
                  <p className="text-2xl font-bold text-ecco-primary">
                    {platformStats.postsThisWeek}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-ecco">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Rss className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-ecco-tertiary">Total Feeds</p>
                  <p className="text-2xl font-bold text-ecco-primary">
                    {platformStats.totalFeeds}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management */}
      <Card className="border-ecco">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-ecco-primary">
              User Management
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ecco-muted" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ecco-light">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ecco-tertiary uppercase">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ecco-tertiary uppercase">
                    Joined
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-ecco-tertiary uppercase">
                    Posts
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-ecco-tertiary uppercase">
                    Feeds
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-ecco-tertiary uppercase">
                    Voices
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-ecco-tertiary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-ecco-light hover:bg-ecco-off-white">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ecco-accent-light">
                          <Mail className="h-4 w-4 text-ecco-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ecco-primary">
                            {user.email}
                          </p>
                          <p className="text-xs text-ecco-muted">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                        </div>
                        {ADMIN_EMAILS.includes(user.email) && (
                          <Badge variant="secondary" className="text-xs bg-ecco-navy text-white">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-ecco-tertiary">
                        {formatDate(user.created_at)}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline" className="text-xs">
                        {user.postsCount}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline" className="text-xs">
                        {user.feedsCount}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="outline" className="text-xs">
                        {user.brandVoicesCount}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-ecco-tertiary">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
