"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb,
  Link2,
  Rss,
  Sparkles,
  Copy,
  Edit3,
  Save,
  Calendar,
  RefreshCw,
  X,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/use-posts";
import { useBrandVoices } from "@/hooks/use-brand-voices";

const formats = [
  "None",
  "Listicles",
  "Concise",
  "Long-form",
  "Emoji-free",
  "Numbers",
  "One-liner",
];

const tones = [
  "None",
  "Assertive",
  "Enthusiastic",
  "Irreverent",
  "Friendly",
  "Humorous",
  "Ironic",
  "Formal",
  "Serious",
  "Humble",
  "Persuasive",
  "Critical",
  "Straightforward",
  "Sarcastic",
  "Optimistic",
  "Pessimistic",
  "Celebratory",
  "Compassionate",
];

const angles = [
  "None",
  "Contrarian",
  "Inspirational",
  "Story",
  "Life Experience",
  "Easy Steps",
  "Comparison",
  "You're Doing It Wrong",
  "My Secret",
  "Tactical",
  "I Thought I Knew",
  "Promotional",
];

const lengths = [
  { label: "Short", description: "~100 words" },
  { label: "Medium", description: "~200 words" },
  { label: "Long", description: "~300 words" },
];

interface GeneratedPost {
  id: string;
  content: string;
  hook: string;
  approach: string;
  characterCount: number;
}

// AI quick actions for editing posts
const aiActions = [
  { label: "Make Shorter", action: "shorten" },
  { label: "Add Hook", action: "add_hook" },
  { label: "More Professional", action: "professional" },
  { label: "Add Emojis", action: "emojis" },
  { label: "Add CTA", action: "add_cta" },
];

function CreatePostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { createPost } = usePosts();
  const { brandVoices } = useBrandVoices();

  // Initialize from URL params (for RSS source)
  const sourceParam = searchParams.get("source");
  const titleParam = searchParams.get("title");
  const urlParam = searchParams.get("url");
  const contentParam = searchParams.get("content");

  const initialTab = sourceParam === "rss" ? "rss" : (searchParams.get("tab") || "idea");

  const [activeTab, setActiveTab] = useState(initialTab);
  const [ideaInput, setIdeaInput] = useState("");
  const [urlInput, setUrlInput] = useState(urlParam || "");
  const [urlAngle, setUrlAngle] = useState("");
  const [rssContent, setRssContent] = useState({
    title: titleParam || "",
    url: urlParam || "",
    content: contentParam || "",
  });
  const [rssAngle, setRssAngle] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("None");
  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [selectedLength, setSelectedLength] = useState("Medium");
  const [selectedBrandVoice, setSelectedBrandVoice] = useState<string>("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetched, setUrlFetched] = useState<{ title: string; content: string } | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [aiChatInput, setAiChatInput] = useState("");

  // Auto-fetch URL content when coming from RSS
  useEffect(() => {
    if (sourceParam === "rss" && urlParam && contentParam) {
      setUrlFetched({
        title: titleParam || "",
        content: contentParam,
      });
    }
  }, [sourceParam, urlParam, contentParam, titleParam]);

  const fetchUrlContent = async () => {
    if (!urlInput.trim()) return;

    setIsFetchingUrl(true);
    try {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();

      if (response.ok) {
        setUrlFetched({
          title: data.title,
          content: data.content,
        });
      } else {
        alert("Failed to fetch URL: " + data.error);
      }
    } catch {
      alert("Failed to fetch URL content");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      let sourceType = activeTab;
      let content = "";
      let url = "";
      let userAngle = "";

      if (activeTab === "idea") {
        sourceType = "idea";
        content = ideaInput;
      } else if (activeTab === "url") {
        sourceType = "url";
        url = urlInput;
        content = urlFetched?.content || "";
        userAngle = urlAngle;
      } else if (activeTab === "rss") {
        sourceType = "rss";
        url = rssContent.url;
        content = `Title: ${rssContent.title}\n\n${rssContent.content}`;
        userAngle = rssAngle;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          content,
          url,
          userAngle,
          format: selectedFormat !== "None" ? selectedFormat : null,
          tones: selectedTones.filter(t => t !== "None"),
          angles: selectedAngles.filter(a => a !== "None"),
          brandVoiceId: selectedBrandVoice !== "none" ? selectedBrandVoice : null,
          length: selectedLength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate posts");
      }

      const posts: GeneratedPost[] = (data.posts || []).map((post: { content: string; hook?: string; approach?: string }, index: number) => ({
        id: `${Date.now()}-${index}`,
        content: post.content,
        hook: post.hook || "",
        approach: post.approach || "",
        characterCount: post.content.length,
      }));

      setGeneratedPosts(posts);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate posts";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (post: GeneratedPost) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = () => {
    setGeneratedPosts(posts =>
      posts.map(p =>
        p.id === editingPostId
          ? { ...p, content: editContent, characterCount: editContent.length }
          : p
      )
    );
    setEditingPostId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const handleSaveDraft = async (post: GeneratedPost) => {
    setSavingPostId(post.id);
    try {
      const result = await createPost({
        content: post.content,
        source_type: activeTab as "idea" | "url" | "rss",
        source_url: activeTab === "url" ? urlInput : (activeTab === "rss" ? rssContent.url : null),
        brand_voice_id: selectedBrandVoice !== "none" ? selectedBrandVoice : null,
        formats: selectedFormat !== "None" ? [selectedFormat] : [],
        tones: selectedTones.filter(t => t !== "None"),
        angles: selectedAngles.filter(a => a !== "None"),
        status: "draft",
      });

      if (result.error) {
        alert("Failed to save draft: " + result.error);
      } else {
        setSavedPosts(prev => new Set(prev).add(post.id));
      }
    } catch {
      alert("Failed to save draft");
    } finally {
      setSavingPostId(null);
    }
  };

  const handleSchedule = async (post: GeneratedPost) => {
    // For now, just save as draft with scheduled status
    // In a full implementation, you'd show a date picker modal
    setSavingPostId(post.id);
    try {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1); // Schedule for tomorrow
      scheduledAt.setHours(9, 0, 0, 0); // 9 AM

      const result = await createPost({
        content: post.content,
        source_type: activeTab as "idea" | "url" | "rss",
        source_url: activeTab === "url" ? urlInput : (activeTab === "rss" ? rssContent.url : null),
        brand_voice_id: selectedBrandVoice !== "none" ? selectedBrandVoice : null,
        formats: selectedFormat !== "None" ? [selectedFormat] : [],
        tones: selectedTones.filter(t => t !== "None"),
        angles: selectedAngles.filter(a => a !== "None"),
        status: "scheduled",
        scheduled_at: scheduledAt.toISOString(),
      });

      if (result.error) {
        alert("Failed to schedule post: " + result.error);
      } else {
        setSavedPosts(prev => new Set(prev).add(post.id));
        router.push("/library?filter=scheduled");
      }
    } catch {
      alert("Failed to schedule post");
    } finally {
      setSavingPostId(null);
    }
  };

  const canGenerate = () => {
    if (activeTab === "idea") return ideaInput.trim().length > 0;
    if (activeTab === "url") return urlFetched !== null;
    if (activeTab === "rss") return rssContent.content.length > 0;
    return false;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ecco-primary">
          Create Post
        </h1>
        <p className="text-sm text-ecco-tertiary">
          Generate engaging LinkedIn content that echoes your voice
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-ecco p-1 h-auto">
          <TabsTrigger
            value="idea"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            From Idea
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <Link2 className="mr-2 h-4 w-4" />
            From URL
          </TabsTrigger>
          <TabsTrigger
            value="rss"
            className="data-[state=active]:bg-ecco-navy data-[state=active]:text-white px-5 py-2.5"
          >
            <Rss className="mr-2 h-4 w-4" />
            From RSS
          </TabsTrigger>
        </TabsList>

        {/* Content Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main Input Section */}
          <div className="space-y-6">
            <TabsContent value="idea" className="m-0">
              <Card className="border-ecco">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                      What&apos;s your idea?
                    </label>
                    <Textarea
                      placeholder="Share your thoughts, insights, or experiences you want to turn into a post..."
                      value={ideaInput}
                      onChange={(e) => setIdeaInput(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-ecco-light">
                    <p className="text-xs text-ecco-tertiary">
                      Generate 2 variations
                    </p>
                    <Button
                      onClick={handleGenerate}
                      disabled={!canGenerate() || isGenerating}
                      className="bg-ecco-navy hover:bg-ecco-navy-light"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Posts
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="url" className="m-0">
              <Card className="border-ecco">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                      Article URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste the URL of an article you want to transform..."
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          setUrlFetched(null);
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={fetchUrlContent}
                        disabled={!urlInput.trim() || isFetchingUrl}
                      >
                        {isFetchingUrl ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Fetch
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {urlFetched && (
                    <>
                      <div className="p-4 bg-ecco-off-white rounded-lg">
                        <h4 className="font-medium text-sm text-ecco-primary mb-2">
                          {urlFetched.title || "Article fetched"}
                        </h4>
                        <p className="text-xs text-ecco-tertiary line-clamp-3">
                          {urlFetched.content.substring(0, 300)}...
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                          Your angle or idea (optional)
                        </label>
                        <Textarea
                          placeholder="Add your personal take, experience, or the angle you want to highlight from this article..."
                          value={urlAngle}
                          onChange={(e) => setUrlAngle(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <p className="text-xs text-ecco-muted mt-1.5">
                          This helps the AI understand how you want to frame the post
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-ecco-light">
                    <p className="text-xs text-ecco-tertiary">
                      Generate 2 variations
                    </p>
                    <Button
                      onClick={handleGenerate}
                      disabled={!canGenerate() || isGenerating}
                      className="bg-ecco-navy hover:bg-ecco-navy-light"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Posts
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rss" className="m-0">
              <Card className="border-ecco">
                <CardContent className="p-6 space-y-4">
                  {rssContent.title ? (
                    <>
                      <div className="p-4 bg-ecco-off-white rounded-lg">
                        <h4 className="font-medium text-sm text-ecco-primary mb-2">
                          {rssContent.title}
                        </h4>
                        <p className="text-xs text-ecco-tertiary line-clamp-3">
                          {rssContent.content.substring(0, 300)}...
                        </p>
                        {rssContent.url && (
                          <a
                            href={rssContent.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-ecco-accent hover:underline mt-2 inline-flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read original
                          </a>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-ecco-secondary mb-2 block">
                          Your angle or idea (optional)
                        </label>
                        <Textarea
                          placeholder="Add your personal take, experience, or the angle you want to highlight from this article..."
                          value={rssAngle}
                          onChange={(e) => setRssAngle(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <p className="text-xs text-ecco-muted mt-1.5">
                          This helps the AI understand how you want to frame the post
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-ecco-light">
                        <p className="text-xs text-ecco-tertiary">
                          Generate 2 variations
                        </p>
                        <Button
                          onClick={handleGenerate}
                          disabled={!canGenerate() || isGenerating}
                          className="bg-ecco-navy hover:bg-ecco-navy-light"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Posts
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-ecco-tertiary mb-4">
                        Select an article from your RSS feeds to generate a post.
                      </p>
                      <Button variant="outline" asChild>
                        <a href="/feeds">
                          <Rss className="mr-2 h-4 w-4" />
                          Go to Feeds
                        </a>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Generated Posts */}
            {generatedPosts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-ecco-primary">
                  Generated Posts
                </h2>
                {generatedPosts.map((post) => (
                  <Card key={post.id} className="border-ecco">
                    <CardContent className="p-5">
                      {editingPostId === post.id ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[200px] resize-y"
                          />

                          {/* AI Quick Actions */}
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-ecco-tertiary">
                              AI Suggestions
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {aiActions.map((action) => (
                                <button
                                  key={action.action}
                                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-ecco-accent-light text-ecco-accent hover:bg-ecco-accent hover:text-white transition-colors"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AI Chat */}
                          <div className="space-y-2">
                            <Input
                              placeholder="Ask AI to make specific changes..."
                              value={aiChatInput}
                              onChange={(e) => setAiChatInput(e.target.value)}
                              className="text-sm"
                            />
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2.5 py-1 text-[10px] rounded-full bg-ecco-accent-light text-ecco-accent cursor-pointer hover:bg-ecco-accent hover:text-white">
                                Add a personal anecdote
                              </span>
                              <span className="px-2.5 py-1 text-[10px] rounded-full bg-ecco-accent-light text-ecco-accent cursor-pointer hover:bg-ecco-accent hover:text-white">
                                Make it more conversational
                              </span>
                              <span className="px-2.5 py-1 text-[10px] rounded-full bg-ecco-accent-light text-ecco-accent cursor-pointer hover:bg-ecco-accent hover:text-white">
                                Add statistics
                              </span>
                            </div>
                          </div>

                          {/* Edit Actions */}
                          <div className="flex justify-end gap-2 pt-4 border-t border-ecco-light">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
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
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <>
                          {post.approach && (
                            <p className="text-xs text-ecco-accent font-medium mb-2">
                              {post.approach}
                            </p>
                          )}
                          <p className="text-sm text-ecco-primary whitespace-pre-wrap leading-relaxed">
                            {post.content}
                          </p>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-ecco-light">
                            <span className="text-xs text-ecco-tertiary">
                              {post.characterCount} characters
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopy(post.content, post.id)}
                              >
                                {copiedId === post.id ? (
                                  <Check className="h-4 w-4 text-ecco-success" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEdit(post)}
                              >
                                <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSaveDraft(post)}
                                disabled={savingPostId === post.id || savedPosts.has(post.id)}
                              >
                                {savingPostId === post.id ? (
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : savedPosts.has(post.id) ? (
                                  <Check className="mr-1.5 h-3.5 w-3.5 text-ecco-success" />
                                ) : (
                                  <Save className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                {savedPosts.has(post.id) ? "Saved" : "Save Draft"}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSchedule(post)}
                                disabled={savingPostId === post.id || savedPosts.has(post.id)}
                              >
                                {savingPostId === post.id ? (
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                Schedule
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Side Panel - Format, Tone & Angle */}
          <div className="space-y-6">
            <Card className="border-ecco sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-ecco-primary">
                  Style Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Format Selection - Single Select */}
                <div>
                  <p className="text-sm font-semibold text-ecco-blue mb-1">
                    Format
                  </p>
                  <p className="text-[10px] text-ecco-muted mb-3">
                    Choose one format
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formats.map((format) => {
                      const isSelected = selectedFormat === format;
                      return (
                        <button
                          key={format}
                          onClick={() => setSelectedFormat(format)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                            isSelected
                              ? "bg-ecco-navy text-white border-ecco-navy"
                              : "bg-gray-100 text-ecco-tertiary border-gray-200 hover:border-ecco-navy"
                          )}
                        >
                          {format}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tone Selection - Multi Select */}
                <div>
                  <p className="text-sm font-semibold text-ecco-blue mb-1">
                    Tone
                  </p>
                  <p className="text-[10px] text-ecco-muted mb-3">
                    Select multiple tones (or None to skip)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((tone) => {
                      const isNone = tone === "None";
                      const isSelected = isNone
                        ? selectedTones.length === 0
                        : selectedTones.includes(tone);
                      return (
                        <button
                          key={tone}
                          onClick={() => {
                            if (isNone) {
                              setSelectedTones([]);
                            } else if (isSelected) {
                              setSelectedTones(selectedTones.filter(t => t !== tone));
                            } else {
                              setSelectedTones([...selectedTones, tone]);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                            isSelected
                              ? "bg-ecco-navy text-white border-ecco-navy"
                              : "bg-gray-100 text-ecco-tertiary border-gray-200 hover:border-ecco-navy"
                          )}
                        >
                          {tone}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Angle Selection - Multi Select */}
                <div>
                  <p className="text-sm font-semibold text-ecco-blue mb-1">
                    Angle
                  </p>
                  <p className="text-[10px] text-ecco-muted mb-3">
                    Select multiple angles (or None to skip)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {angles.map((angle) => {
                      const isNone = angle === "None";
                      const isSelected = isNone
                        ? selectedAngles.length === 0
                        : selectedAngles.includes(angle);
                      return (
                        <button
                          key={angle}
                          onClick={() => {
                            if (isNone) {
                              setSelectedAngles([]);
                            } else if (isSelected) {
                              setSelectedAngles(selectedAngles.filter(a => a !== angle));
                            } else {
                              setSelectedAngles([...selectedAngles, angle]);
                            }
                          }}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                            isSelected
                              ? "bg-ecco-navy text-white border-ecco-navy"
                              : "bg-gray-100 text-ecco-tertiary border-gray-200 hover:border-ecco-navy"
                          )}
                        >
                          {angle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Length Selection */}
                <div>
                  <p className="text-sm font-semibold text-ecco-blue mb-3">
                    Length
                  </p>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {lengths.map((length) => (
                      <button
                        key={length.label}
                        onClick={() => setSelectedLength(length.label)}
                        className={cn(
                          "flex-1 px-4 py-2 text-xs font-medium rounded-md transition-colors",
                          selectedLength === length.label
                            ? "bg-white text-ecco-navy shadow-sm"
                            : "text-ecco-tertiary hover:text-ecco-primary"
                        )}
                      >
                        {length.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Selection */}
                <div>
                  <p className="text-sm font-semibold text-ecco-blue mb-3">
                    Brand Voice
                  </p>
                  <select
                    value={selectedBrandVoice}
                    onChange={(e) => setSelectedBrandVoice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-ecco rounded-lg bg-white text-ecco-primary"
                  >
                    <option value="none">Default Voice</option>
                    {brandVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-ecco-muted mt-2 italic">
                    Configure your brand voice in Settings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePostContent />
    </Suspense>
  );
}
