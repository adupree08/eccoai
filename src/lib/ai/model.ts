// Single source of truth for the Claude model used across the app. Keeping it
// here means a model change (or a retirement like claude-sonnet-4-20250514) is
// a one-line edit, not a hunt across routes.
//
// Sonnet 5 is the current, cost-appropriate default for high-volume post
// generation. Switch to "claude-opus-5" for maximum quality at higher cost.
export const CLAUDE_MODEL = "claude-sonnet-5";
