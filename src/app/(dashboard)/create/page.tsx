"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Link2,
  Rss,
  Sparkles,
  Copy,
  Edit3,
  Save,
  Calendar,
  Send,
  RefreshCw,
  Wand2,
  MessageSquare,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const initialTab = searchParams.get("tab") || "idea";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [ideaInput, setIdeaInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("None"); // Single select
  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [selectedLength, setSelectedLength] = useState("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiChatInput, setAiChatInput] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockPosts: GeneratedPost[] = [
        {
          id: "1",
          content: `The best advice I ever received wasn't about working harder.

It was about working smarter.

Here's what changed everything for me:

1. Focus on one thing at a time
2. Take regular breaks to recharge
3. Learn to say no to distractions
4. Document your processes
5. Automate repetitive tasks

The result? I got more done in 4 hours than I used to in 8.

What's the best productivity advice you've received?

Drop it in the comments. 👇`,
          characterCount: 412,
        },
        {
          id: "2",
          content: `Stop trying to be productive 24/7.

I know, it sounds counterintuitive.

But here's the truth:

Your brain needs rest to perform at its best.

When I stopped glorifying "the grind" and started prioritizing recovery:

• My focus improved dramatically
• My creativity skyrocketed
• My energy lasted all day

The most successful people I know aren't the ones who work the most hours.

They're the ones who work the RIGHT hours.

What's your take on work-life balance?`,
          characterCount: 478,
        },
      ];

      setGeneratedPosts(mockPosts);
      setIsGenerating(false);
    }, 2000);
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
                      What's your idea?
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
                      disabled={!ideaInput.trim() || isGenerating}
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
                    <Input
                      placeholder="Paste the URL of an article you want to transform..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-ecco-light">
                    <p className="text-xs text-ecco-tertiary">
                      Generate 2 variations
                    </p>
                    <Button
                      onClick={handleGenerate}
                      disabled={!urlInput.trim() || isGenerating}
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
                <CardContent className="p-6">
                  <p className="text-sm text-ecco-tertiary mb-4">
                    Select an article from your RSS feeds to generate a post.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/feeds">
                      <Rss className="mr-2 h-4 w-4" />
                      Go to Feeds
                    </a>
                  </Button>
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
                              >
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                Save Draft
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                              >
                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
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
                  <select className="w-full px-3 py-2 text-sm border border-ecco rounded-lg bg-white text-ecco-primary">
                    <option>Default Voice</option>
                    <option>Professional Thought Leader</option>
                    <option>Friendly Expert</option>
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
