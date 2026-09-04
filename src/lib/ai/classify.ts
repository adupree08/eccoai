import Anthropic from "@anthropic-ai/sdk";

// The fixed set of post archetypes shown as the pill label on Popular Posts.
// Keep this list small and stable so the pills stay consistent.
export const ARCHETYPES = [
  "Story",
  "List",
  "Contrarian",
  "How-To",
  "Question",
  "Case Study",
  "Announcement",
  "Personal",
  "Insight",
] as const;

/**
 * Classify each post into exactly one archetype using a single Claude call.
 * Returns an array aligned to the input; entries default to null on any failure
 * so callers can save posts even if tagging fails.
 */
export async function classifyArchetypes(contents: string[]): Promise<(string | null)[]> {
  const out: (string | null)[] = contents.map(() => null);
  if (contents.length === 0 || !process.env.ANTHROPIC_API_KEY) return out;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Trim each post so the prompt stays bounded for large batches.
  const numbered = contents
    .map((c, i) => `[${i}] ${c.replace(/\s+/g, " ").slice(0, 400)}`)
    .join("\n\n");

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You label LinkedIn posts by their structural archetype. Choose EXACTLY ONE label per post from this list: ${ARCHETYPES.join(", ")}. Return ONLY a JSON array of objects like [{"i":0,"label":"Story"}], one per post, using the post's index.`,
      messages: [{ role: "user", content: numbered }],
    });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return out;
    let json = text.text.trim();
    const m = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) json = m[1].trim();
    const parsed = JSON.parse(json) as { i: number; label: string }[];
    const allowed = new Set<string>(ARCHETYPES);
    for (const { i, label } of parsed) {
      if (typeof i === "number" && i >= 0 && i < out.length && allowed.has(label)) {
        out[i] = label;
      }
    }
  } catch {
    // Leave as null; tagging is best-effort.
  }
  return out;
}
