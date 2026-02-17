"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Copy,
  Trash2,
  Edit3,
  X,
  Check,
  Sparkles,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  status: "draft" | "scheduled" | "published";
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  impressions?: number;
  engagements?: number;
}

// Mock data (will come from Supabase later)
const mockPosts: Post[] = [
  {
    id: "1",
    content: "The best advice I ever received wasn't about working harder.\n\nIt was about working smarter.\n\nHere's what changed everything for me:\n\n1. Focus on one thing at a time\n2. Take regular breaks to recharge\n3. Learn to say no to distractions\n4. Document your processes\n5. Automate repetitive tasks\n\nThe result? I got more done in 4 hours than I used to in 8.",
    status: "draft",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    content: "Stop trying to be productive 24/7.\n\nI know, it sounds counterintuitive.\n\nBut here's the truth:\n\nYour brain needs rest to perform at its best.",
    status: "scheduled",
    createdAt: "Yesterday",
    scheduledFor: "Feb 20, 2025 at 9:00 AM",
  },
  {
    id: "3",
    content: "5 leadership lessons I learned from my first year as a founder:\n\n1. Listen more than you speak\n2. Hire for culture fit, train for skills\n3. Celebrate small wins\n4. Be transparent with your team\n5. Take care of yourself first",
    status: "published",
    createdAt: "1 week ago",
    publishedAt: "Feb 10, 2025",
    impressions: 4832,
    engagements: 156,
  },
  {
    id: "4",
    content: "The future of remote work isn't about choosing between office or home.\n\nIt's about flexibility.\n\nThe companies winning the talent war understand this.",
    status: "published",
    createdAt: "2 weeks ago",
    publishedAt: "Feb 3, 2025",
    impressions: 3241,
    engagements: 89,
  },
  {
    id: "5",
    content: "Why I stopped chasing viral content and focused on building genuine connections instead.\n\nThe results surprised me:\n\n• More meaningful conversations\n• Better quality leads\n• Stronger network\n\nVanity metrics matter less than real impact.",
    status: "draft",
    createdAt: "3 days ago",
  },
];

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const getFilteredPosts = () => {
    let posts = mockPosts;

    // Filter by status
    if (activeFilter === "drafts") {
      posts = posts.filter((p) => p.status === "draft");
    } else if (activeFilter === "scheduled") {
      posts = posts.filter((p) => p.status === "scheduled");
    } else if (activeFilter === "published") {
      posts = posts.filter((p) => p.status === "published");
    }

    // Filter by search
    if (searchQuery) {
      posts = posts.filter((p) =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return posts;
  };

  const filteredPosts = getFilteredPosts();

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

  const getStatusBadge = (status: Post["status"]) => {
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
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setExpandedPostId(post.id);
  };

  const handleSaveEdit = () => {
    // In real app, update in Supabase
    setEditingPostId(null);
    setEditContent("");
  };

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
              All Posts
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              Drafts
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              Scheduled
            </TabsTrigger>
            <TabsTrigger
              value="published"
              className="data-[state=active]:border-b-2 data-[state=active]:border-ecco-navy data-[state=active]:text-ecco-navy data-[state=active]:shadow-none rounded-none pb-3 px-0 font-medium"
            >
              Published
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
                          className="bg-ecco-navy hover:bg-ecco-navy-light"
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5" />
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
                            navigator.clipboard.writeText(post.content);
                          }}
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy
                        </Button>
                        {post.status === "draft" && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                            >
                              <Calendar className="mr-1.5 h-3.5 w-3.5" />
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
                      {post.createdAt}
                    </span>
                    {post.status === "published" && post.impressions && (
                      <span className="text-xs text-ecco-tertiary">
                        {post.impressions.toLocaleString()} views
                      </span>
                    )}
                    {post.status === "scheduled" && post.scheduledFor && (
                      <span className="text-xs text-ecco-tertiary">
                        {post.scheduledFor}
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
          <div className="text-center py-12">
            <p className="text-ecco-tertiary">No posts found</p>
          </div>
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
