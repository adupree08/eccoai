// Single source of truth for the Claude models used across the app. A model
// retirement (like claude-sonnet-4-20250514) is then a one-line edit here.
//
// CLAUDE_MODEL         - user-facing post generation. Opus 5 for best quality.
// CLAUDE_MODEL_UTILITY - background/utility calls (archetype tagging, structure
//                        extraction, landing demo). Sonnet 5: cheaper + faster,
//                        and these don't affect a user's post quality.
export const CLAUDE_MODEL = "claude-opus-5";
export const CLAUDE_MODEL_UTILITY = "claude-sonnet-5";
