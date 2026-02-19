import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/prompts/system-prompt";

// Lazy initialization to avoid build-time errors
function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
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
    const {
      sourceType,
      content,
      url,
      userAngle,
      format,
      tones,
      angles,
      brandVoiceId,
      length = "Medium",
      // Viral mode options
      viralMode = false,
      viralAngle = null,
      engagementGoal = null,
      // Edit mode options
      editAction = null,
      customInstruction = null,
    } = body;

    // Fetch brand voice if provided
    let brandVoice = null;
    if (brandVoiceId && brandVoiceId !== "none") {
      const { data } = await supabase
        .from("brand_voices")
        .select("*")
        .eq("id", brandVoiceId)
        .single();

      if (data) {
        brandVoice = {
          name: data.name,
          description: data.description,
          guidelines: data.guidelines || [],
          excludedTerms: data.excluded_terms || [],
          preferredTerms: data.preferred_terms || [],
          samples: data.samples || [],
        };
      }
    }

    // Build the complete system prompt with humanization guide + tags + brand voice + viral mode
    const systemPrompt = buildSystemPrompt({
      format: format || null,
      tones: tones || [],
      angles: angles || [],
      brandVoice,
      // Viral mode options
      viralMode: viralMode || false,
      viralAngle: viralAngle || null,
      engagementGoal: engagementGoal || undefined,
    });

    // Build the user prompt based on source type
    let sourceContext = "";
    let isComment = false;

    if (sourceType === "idea") {
      sourceContext = `Create a LinkedIn post based on this idea:\n\n"${content}"`;
    } else if (sourceType === "url") {
      sourceContext = `Create a LinkedIn post inspired by this article:\nURL: ${url}\nContent/Summary: ${content}`;
      if (userAngle && userAngle.trim()) {
        sourceContext += `\n\nIMPORTANT - The user wants to incorporate this personal angle or perspective:\n"${userAngle}"\n\nMake sure to weave their perspective into the post.`;
      }
    } else if (sourceType === "rss") {
      sourceContext = `Create a LinkedIn post based on this article:\n\n"${content}"`;
      if (userAngle && userAngle.trim()) {
        sourceContext += `\n\nIMPORTANT - The user wants to incorporate this personal angle or perspective:\n"${userAngle}"\n\nMake sure to weave their perspective into the post.`;
      }
    } else if (sourceType === "comment") {
      isComment = true;
      sourceContext = `Generate a thoughtful, engaging LinkedIn comment to respond to this post:\n\n--- ORIGINAL POST ---\n${content}\n--- END OF POST ---`;
      if (userAngle && userAngle.trim()) {
        sourceContext += `\n\nThe user wants to make this point or take this angle in their comment:\n"${userAngle}"`;
      }
    } else if (sourceType === "edit") {
      // Handle AI-assisted editing of existing content
      const editActionPrompts: Record<string, string> = {
        shorten: "Make this post more concise while keeping the key message. Remove filler words and unnecessary sentences.",
        add_hook: "Add a compelling, attention-grabbing opening hook to this post. The hook should stop the scroll and make people want to read more.",
        professional: "Rewrite this post to sound more professional and authoritative while keeping the core message.",
        emojis: "Add relevant emojis throughout the post to make it more engaging and visually appealing. Don't overdo it - use them strategically.",
        add_cta: "Add a clear call-to-action at the end of this post. It could be a question to spark discussion, an invitation to connect, or asking for people's thoughts.",
        custom: customInstruction || "Improve this post.",
      };

      const editInstruction = editActionPrompts[editAction] || editActionPrompts.custom;
      sourceContext = `Edit and improve this existing LinkedIn post based on the following instruction:\n\nINSTRUCTION: ${editInstruction}\n\n--- ORIGINAL POST ---\n${content}\n--- END OF POST ---\n\nReturn ONLY the edited post content. Keep the same general structure and message unless the instruction specifically asks for changes.`;
    }

    // Length guidance
    let lengthGuidance = "";
    if (isComment) {
      lengthGuidance = "CRITICAL: Keep each comment CONCISE - between 300-500 characters total (not words). Comments should be punchy and add value quickly. No filler text.";
    } else {
      const lengthMap: Record<string, string> = {
        "Short": "Keep the post around 100 words or less.",
        "Medium": "Aim for around 150-200 words.",
        "Long": "Write an extended post of 250-350 words.",
      };
      lengthGuidance = lengthMap[length] || "Aim for around 150-200 words.";
    }

    let userPrompt = "";
    const isEdit = sourceType === "edit";

    if (isEdit) {
      userPrompt = `${sourceContext}

IMPORTANT: Return your response as valid JSON in this exact format:
{
  "posts": [
    {
      "content": "The edited post content here",
      "hook": "The opening line",
      "approach": "Edited version"
    }
  ]
}`;
    } else if (isComment) {
      userPrompt = `${sourceContext}

${lengthGuidance}

Generate 2 different comment variations. Each should:
- Add genuine value to the conversation
- Be concise and punchy (300-500 characters max each)
- Avoid generic phrases like "Great post!" or "Thanks for sharing!"
- Share a unique insight, ask a thoughtful question, or add a relevant personal experience
- Sound natural and conversational, not salesy or self-promotional

IMPORTANT: Return your response as valid JSON in this exact format:
{
  "posts": [
    {
      "content": "The full comment text here (300-500 chars)",
      "hook": "The opening phrase",
      "approach": "Brief 5-10 word description of the approach"
    },
    {
      "content": "The second comment variation here (300-500 chars)",
      "hook": "The opening phrase",
      "approach": "Brief 5-10 word description"
    }
  ]
}`;
    } else {
      userPrompt = `${sourceContext}

${lengthGuidance}

Generate 2 different LinkedIn post variations. Each should take a unique approach while maintaining the core message.

IMPORTANT: Return your response as valid JSON in this exact format:
{
  "posts": [
    {
      "content": "The full post content here",
      "hook": "The opening line/hook used",
      "approach": "Brief 5-10 word description of the approach taken"
    },
    {
      "content": "The second post variation here",
      "hook": "The opening line/hook for this version",
      "approach": "Brief 5-10 word description"
    }
  ]
}`;
    }

    const anthropic = getAnthropic();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt },
      ],
    });

    // Extract text content from response
    const textContent = message.content.find(block => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    // Parse the JSON response
    let generatedPosts;
    try {
      // Try to extract JSON from the response (Claude might wrap it in markdown code blocks)
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      generatedPosts = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, try to create a structured response from the raw text
      generatedPosts = {
        posts: [{
          content: textContent.text,
          hook: textContent.text.split("\n")[0],
          approach: "Generated content",
        }],
      };
    }

    return NextResponse.json({
      success: true,
      posts: generatedPosts.posts || [],
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
