"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePopularPosts } from "@/hooks/use-popular-posts";
import { Heart, MessageCircle, Repeat2, ExternalLink, Copy, Check, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PopularPostsPage() {
  const { popular, loading } = usePopularPosts(60);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ecco-primary">Popular Posts</h1>
        <p className="text-ecco-tertiary">
          High-performing LinkedIn posts, hand-picked for inspiration. Study what works, then make it your own.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ecco-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : popular.length === 0 ? (
        <Card className="border-ecco">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <TrendingUp className="h-8 w-8 text-ecco-muted" />
            <p className="text-sm font-medium text-ecco-primary">No popular posts yet</p>
            <p className="text-sm text-ecco-tertiary">Check back soon. Fresh examples are added regularly.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {popular.map((p) => (
            <Card key={p.id} className="flex flex-col border-ecco">
              <CardContent className="flex flex-1 flex-col p-5">
                {(p.author_name || p.author_headline) && (
                  <div className="mb-3">
                    {p.author_name && <p className="text-sm font-semibold text-ecco-primary">{p.author_name}</p>}
                    {p.author_headline && <p className="text-xs text-ecco-tertiary line-clamp-1">{p.author_headline}</p>}
                  </div>
                )}

                <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-ecco-secondary line-clamp-[12]">
                  {p.content}
                </p>

                <div className="mt-4 flex items-center gap-4 border-t border-ecco-light pt-3 text-xs text-ecco-tertiary">
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{p.likes.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{p.comments.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" />{p.reposts.toLocaleString()}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => copy(p.id, p.content)}>
                    {copiedId === p.id ? <><Check className="mr-1.5 h-3.5 w-3.5 text-ecco-success" />Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>}
                  </Button>
                  {p.post_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={p.post_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
