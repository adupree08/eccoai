import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EccoAI/1.0; +https://eccoai.vercel.app)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract text content from HTML
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

    // Extract title
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract meta description
    const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                      text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : "";

    // Extract og:description as fallback
    const ogDescMatch = text.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                        text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i);
    const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : "";

    // Extract article content - look for article or main tags first
    let articleContent = "";
    const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                         text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    if (articleMatch) {
      articleContent = articleMatch[1];
    } else {
      // Fallback to body content
      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        articleContent = bodyMatch[1];
      }
    }

    // Remove remaining HTML tags and clean up
    articleContent = articleContent.replace(/<[^>]+>/g, " ");
    articleContent = articleContent.replace(/&nbsp;/g, " ");
    articleContent = articleContent.replace(/&amp;/g, "&");
    articleContent = articleContent.replace(/&lt;/g, "<");
    articleContent = articleContent.replace(/&gt;/g, ">");
    articleContent = articleContent.replace(/&quot;/g, '"');
    articleContent = articleContent.replace(/&#39;/g, "'");
    articleContent = articleContent.replace(/\s+/g, " ");
    articleContent = articleContent.trim();

    // Limit content length (for AI context)
    const maxLength = 5000;
    if (articleContent.length > maxLength) {
      articleContent = articleContent.substring(0, maxLength) + "...";
    }

    return NextResponse.json({
      success: true,
      title,
      description: description || ogDescription,
      content: articleContent,
    });
  } catch (error) {
    console.error("URL fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch URL";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
