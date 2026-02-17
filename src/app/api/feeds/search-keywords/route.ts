import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Use Google News RSS as a keyword search source
// Format: https://news.google.com/rss/search?q=KEYWORDS&hl=en-US&gl=US&ceid=US:en
function buildGoogleNewsUrl(keywords: string): string {
  const encodedKeywords = encodeURIComponent(keywords);
  return `https://news.google.com/rss/search?q=${encodedKeywords}&hl=en-US&gl=US&ceid=US:en`;
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { feedId } = body;

    if (!feedId) {
      return NextResponse.json(
        { error: "Feed ID is required" },
        { status: 400 }
      );
    }

    // Get the feed to verify ownership and get keywords
    const { data: feed, error: feedError } = await supabase
      .from("feeds")
      .select("*")
      .eq("id", feedId)
      .eq("user_id", user.id)
      .single();

    if (feedError || !feed) {
      return NextResponse.json(
        { error: "Feed not found" },
        { status: 404 }
      );
    }

    if (feed.feed_type !== "keyword" || !feed.keywords) {
      return NextResponse.json(
        { error: "This feed is not a keyword-based feed" },
        { status: 400 }
      );
    }

    // Build Google News RSS URL from keywords
    const googleNewsUrl = buildGoogleNewsUrl(feed.keywords);

    // Dynamically import rss-parser to parse the feed
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser({
      timeout: 10000,
      customFields: {
        item: ["media:content", "content:encoded", "description", "source"],
      },
    });

    let rssFeed;
    try {
      rssFeed = await parser.parseURL(googleNewsUrl);
    } catch (parseError) {
      console.error("RSS parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to fetch articles for these keywords. Please try different keywords." },
        { status: 400 }
      );
    }

    // Prepare articles for insertion
    const articles = (rssFeed.items || []).slice(0, 20).map((item) => ({
      feed_id: feedId,
      title: item.title || "Untitled",
      snippet: item.contentSnippet || item.description?.substring(0, 500) || "",
      url: item.link || "",
      author: item.creator || (item as { author?: string; source?: { _: string } }).author || (item as { source?: { _: string } }).source?._ || null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    }));

    // Delete old articles for this feed (to refresh)
    await supabase
      .from("articles")
      .delete()
      .eq("feed_id", feedId);

    // Insert new articles
    const { error: insertError } = await supabase
      .from("articles")
      .insert(articles);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save articles" },
        { status: 500 }
      );
    }

    // Update feed with last fetched time
    await supabase
      .from("feeds")
      .update({
        last_fetched_at: new Date().toISOString(),
      })
      .eq("id", feedId);

    return NextResponse.json({
      success: true,
      articlesCount: articles.length,
      feedTitle: feed.name,
    });
  } catch (error) {
    console.error("Keyword feed search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to search for articles";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
