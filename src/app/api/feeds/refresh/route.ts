import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ["media:content", "content:encoded", "description"],
  },
});

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

    // Get the feed to verify ownership and get URL
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

    // Parse the RSS feed
    let rssFeed;
    try {
      rssFeed = await parser.parseURL(feed.url);
    } catch (parseError) {
      console.error("RSS parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse RSS feed. Please check the URL is valid." },
        { status: 400 }
      );
    }

    // Get the feed title if available (for updating feed name)
    const feedTitle = rssFeed.title || feed.name;

    // Prepare articles for insertion
    const articles = (rssFeed.items || []).slice(0, 20).map((item) => ({
      feed_id: feedId,
      title: item.title || "Untitled",
      snippet: item.contentSnippet || item.description?.substring(0, 500) || "",
      url: item.link || "",
      author: item.creator || (item as { author?: string }).author || null,
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

    // Update feed with last fetched time and title if it was auto-detected
    const updateData: { last_fetched_at: string; name?: string } = {
      last_fetched_at: new Date().toISOString(),
    };

    // If the feed name is still the URL or "New Feed", update it with the RSS title
    if (feed.name === "New Feed" || feed.name === feed.url) {
      updateData.name = feedTitle;
    }

    await supabase
      .from("feeds")
      .update(updateData)
      .eq("id", feedId);

    return NextResponse.json({
      success: true,
      articlesCount: articles.length,
      feedTitle,
    });
  } catch (error) {
    console.error("Feed refresh error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to refresh feed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
