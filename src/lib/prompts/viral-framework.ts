// Viral Post Framework - Patterns and principles for high-engagement LinkedIn content
// Based on analysis of 50+ viral posts (50-4,300+ likes) from FemTech, Founders, Building in Public

// =============================================================================
// VIRAL SYSTEM PROMPT - Core principles for engagement-optimized content
// =============================================================================

export const VIRAL_SYSTEM_PROMPT = `VIRAL CONTENT PRINCIPLES:

HOOK MASTERY (First 1-2 lines determine 90% of engagement):
- The hook must create an "information gap" - promise value the reader must scroll to receive
- Use specific numbers, counterintuitive claims, or emotional triggers
- Maximum 15 words in the opening line
- Never start with context-setting. Start mid-story or with the payoff
- Pattern interrupt: say something unexpected that breaks the reader's scroll

HIGH-ENGAGEMENT PATTERNS:
1. CONTRARIAN CREDIBILITY: Challenge conventional wisdom, but back it up
   - "Maven Clinic stopped saying 'empowering women.' Then they hit $1.7 billion."
   - The claim must be surprising AND defensible

2. SPECIFIC VULNERABILITY: Share struggles with concrete details
   - Generic: "I struggled early in my career"
   - Viral: "Five years ago, I was a 'successful' prosecutor crying in the shower before work"

3. DATA AS EMOTION: Numbers that make people feel something
   - "210+ women have faced criminal charges related to pregnancy outcomes since Dobbs"
   - "100 million women track their cycles on apps. Most of that data sits in silos."

4. STATUS PLAY: Content that makes sharing reflect well on the sharer
   - Resource lists (makes sharer look helpful)
   - Contrarian takes (makes sharer look smart)
   - Industry callouts (makes sharer look brave)

5. TRIBAL IDENTITY: Content that signals belonging to a group
   - "Women are not a niche"
   - "Femtech is filling real gaps. But good intentions do NOT replace governance."

STRUCTURAL PATTERNS THAT DRIVE ENGAGEMENT:

THE CONTRARIAN STRUCTURE:
[Counterintuitive claim - 1 line]
[Line break]
[Brief context - why this matters]
[Line break]
Here's what [example] did differently:
1/ [Key insight with supporting detail]
2/ [Key insight with supporting detail]
3/ [Key insight with supporting detail]
[Line break]
Why this matters for you:
[Application/takeaway]
[Line break]
[Thought-provoking close or question]

THE RESOURCE LIST STRUCTURE:
[Clear value promise - who this helps]
[Line break]
[Brief credibility/why you're sharing]
[Line break]
Here are [number] [resources]:
1. [Resource] - [1-line value]
2. [Resource] - [1-line value]
[Continue...]
[Line break]
💡 [Pro tip]
[Line break]
Save this. Share with someone who needs it.

THE PERSONAL STORY STRUCTURE:
[Vulnerable hook - specific moment/admission]
[Line break]
[The struggle - 2-3 sentences]
[Line break]
[The turning point]
[Line break]
Here's what I learned:
→ [Lesson 1]
→ [Lesson 2]
→ [Lesson 3]
[Line break]
[Universal application]
[Line break]
[Reflective question]

THE MILESTONE STRUCTURE:
[Specific number + what it represents]
[Line break]
[Humble acknowledgment]
[Line break]
What this really means:
→ [Deeper meaning 1]
→ [Deeper meaning 2]
→ [Deeper meaning 3]
[Line break]
[Gratitude to specific people]
[Line break]
Here's what's next: [Forward-looking statement]

ENGAGEMENT MECHANICS:
- Posts that get comments: Ask genuine questions, not "Thoughts? 👇"
- Posts that get shares: Provide save-worthy value (lists, frameworks, data)
- Posts that get likes: Create emotional resonance (pride, indignation, hope)
- Posts that go viral: Combine all three

SOFT CTA PATTERNS (Hard sells kill engagement):
- "What do you think?"
- "Drop [emoji] if you agree"
- "What does [topic] mean to you?"
- "Share with someone who needs to hear this"
- "What did I miss?"
- [No CTA - just end strong]

HASHTAG STRATEGY:
- 3-7 hashtags maximum
- Mix broad (#leadership) with niche (#femtech)
- Place at end, not throughout
- Never start a post with hashtags

LINE BREAK RULES:
- One thought per visual line
- Use line breaks to create rhythm and pacing
- White space makes content scannable
- Key statements get their own line for emphasis`;

// =============================================================================
// VIRAL ANGLE TAGS - High-performing post types from viral analysis
// =============================================================================

export const VIRAL_ANGLE_TAGS: Record<string, string> = {
  "Pattern-Interrupt": `Open with something that breaks expectations. Say the opposite of what the industry usually says. Challenge a sacred cow. Name the elephant in the room. The first line should make the reader think "wait, what?" and stop scrolling. The rest of the post delivers on the promise of that interruption with substance.

Examples of pattern-interrupt hooks:
- "[Company] stopped [expected behavior]. Then they [unexpected result]."
- "The biggest lie in [industry] is [common belief]."
- "I [controversial action]. Here's why."
- "Everyone is doing [X]. That's exactly the problem."`,

  "Credible-Contrarian": `Take a position that challenges popular opinion, BUT back it with evidence, examples, or hard-won experience. Pure contrarianism is annoying. Credible contrarianism is compelling. Structure: [State the common belief] → [Present counter-evidence] → [Explain the better alternative] → [Show proof it works]. The reader should think "I never thought of it that way, and now I can't unsee it."`,

  "Curated-Value": `Compile genuinely useful resources, tools, frameworks, or contacts into a single save-worthy post. The value is in the curation - you did the work so they don't have to. Include specific names, links, and brief context for each item. Lists of 5-15 items perform best. End with an invitation to add to the list. These posts get saved, shared, and referenced.`,

  "Vulnerable-Authority": `Share a genuine struggle, failure, or difficult moment, but from a position of having learned something valuable. The vulnerability creates connection; the insight creates value. Be specific about the struggle (not generic "hard times"). Include what you learned that the reader can apply. The balance is: enough vulnerability to be human, enough wisdom to be worth following.`,

  "Data-Driven-Emotion": `Lead with a statistic or data point that creates an emotional response - shock, anger, hope, or recognition. The number should be specific and surprising. Then contextualize it: what does this number mean for real people? Numbers alone don't go viral. Numbers that make people FEEL something do.

Examples:
- "80% of autoimmune patients are women" (shocking disparity)
- "210+ women have faced criminal charges since Dobbs" (outrage)
- "75,000 followers. All organic." (aspirational)`,

  "Industry-Callout": `Name a problem, hypocrisy, or dysfunction in your industry that others won't say publicly. This requires courage and specificity. Don't vaguebook - name the pattern clearly. Frame it as wanting to improve the industry, not tear it down. These posts resonate because they say what everyone is thinking but no one is posting.`,

  "Milestone-Gratitude": `Celebrate an achievement with genuine reflection, specific numbers, and generous credit-sharing. Avoid humble-bragging. Include: the specific milestone, what it means (not just what it is), who helped, and what's next. The best milestone posts make the reader feel included in the win, not envious of it.`,

  "Behind-The-Curtain": `Reveal how something actually works - the real process, the honest numbers, the unglamorous truth. Share the thing your industry doesn't usually talk about publicly. This could be pricing, hiring decisions, failures, or actual workflows. Transparency builds trust and engagement.`,

  "Hot-Take-With-Receipts": `Make a bold claim about your industry, then immediately back it with evidence. Not just opinion - proof. The structure is: [Bold statement] → [Here's the evidence] → [Here's why this matters]. This combines the engagement of a hot take with the credibility of research.`,

  "Building-In-Public": `Share real updates from your journey - wins, losses, numbers, decisions, pivots. Be specific: "We just hit 100 customers" or "I almost quit last Tuesday." Include what you learned. The appeal is authenticity and letting people follow along. Frame progress honestly, including setbacks.`,
};

// =============================================================================
// VIRAL HOOK TEMPLATES - Proven opening line structures
// =============================================================================

export const VIRAL_HOOK_TEMPLATES: Record<string, string[]> = {
  "contrarian": [
    "[Company/Person] stopped [common practice]. Then they [unexpected positive result].",
    "The biggest myth in [industry] is [common belief].",
    "Everyone says [conventional wisdom]. They're wrong.",
    "[Common advice] is destroying [what it claims to help].",
    "I did the opposite of [common practice]. Here's what happened.",
  ],
  "vulnerable": [
    "[Time] ago, I was [vulnerable state]. Here's what changed.",
    "I finally [admit difficult truth].",
    "The hardest [time period] of my career taught me [lesson].",
    "I used to [old belief]. Not anymore.",
    "This is the post I wish someone had written when I [was struggling].",
  ],
  "data-driven": [
    "[Surprising statistic]. Let that sink in.",
    "[Number] [things] in [timeframe]. Here's what I learned.",
    "I analyzed [number] [items]. Here's what nobody talks about.",
    "[Percentage] of [group] are [surprising fact].",
    "The data is clear: [counterintuitive finding].",
  ],
  "value-forward": [
    "[Number] [resources/tips/lessons] for [specific audience].",
    "Everything I know about [topic] in one post.",
    "The complete [framework/guide/list] for [goal].",
    "I spent [time] learning this so you don't have to.",
    "Stop [common mistake]. Start [better approach].",
  ],
  "story": [
    "It was [specific time] and I was [specific situation].",
    "[Time ago], I made a decision that [impact].",
    "The moment I knew everything had changed: [scene].",
    "Nobody tells you about [hidden aspect of experience].",
    "[Quote from pivotal conversation].",
  ],
  "milestone": [
    "[Specific number]. That's [what it represents].",
    "This morning I realized [achievement].",
    "[Timeframe]. That's how long it took to [accomplishment].",
    "We just hit [milestone]. I'm still processing.",
    "From [starting point] to [current state] in [time].",
  ],
  "curiosity": [
    "What if [unexpected possibility]?",
    "Nobody is talking about [overlooked topic].",
    "Here's what [successful person/company] won't tell you.",
    "The real reason [outcome] isn't [obvious cause].",
    "I've been thinking about [topic]. Here's what I can't figure out.",
  ],
};

// =============================================================================
// VIRAL EXAMPLES - Real high-performing posts for reference
// =============================================================================

export const VIRAL_EXAMPLES: Record<string, {
  hook: string;
  engagement: string;
  category: string;
  whyItWorks: string;
  fullStructure: string;
}> = {
  "maven-positioning": {
    hook: "Maven Clinic stopped saying 'empowering women.' Then they hit $1.7 billion.",
    engagement: "457 likes",
    category: "Credible-Contrarian",
    whyItWorks: "Counterintuitive opening that challenges industry norm (empowerment messaging), backed by concrete result ($1.7B), promises insider knowledge about why",
    fullStructure: `[Contrarian hook with specific number]

[Context: Why most companies fail with this approach]

Here's what Maven did differently:

1/ THEY CREATED A CATEGORY INSTEAD OF COMPETING IN ONE
[2-3 sentences explaining with specific details]

2/ THEY POSITIONED ON A BUSINESS MODEL, NOT FEATURES
[2-3 sentences with proof point - "30% conceive without IVF"]

3/ THEY EVOLVED THEIR LANGUAGE AS THEY GREW
[Timeline showing evolution: "Virtual clinic" → "platform" → "operating system"]

Why this matters for YOUR company:
[Market context + specific application]

[Closing question or call to examine own positioning]`
  },

  "algorithmic-silencing": {
    hook: "Our ads are banned. Educating women is deemed 'inappropriate content.'",
    engagement: "4,300 likes",
    category: "Industry-Callout",
    whyItWorks: "Emotional injustice hook, tribal identity (us vs algorithms), specific examples of hypocrisy, call to action for solidarity",
    fullStructure: `[Provocative hook naming the injustice]

Women are being silenced. Not metaphorically, algorithmically.

[Platform examples with specific content being suppressed]

Here's some examples of why this is so infuriating:

✅ [Permitted content that seems worse]
✅ [Another permitted example]
❌ [Banned content that helps women]

[Call to action for community solidarity]

The algorithm can't silence all of us.

[Hashtags]`
  },

  "femtech-niches": {
    hook: "7 FemTech niches to build for in 2025",
    engagement: "1,000 likes",
    category: "Curated-Value",
    whyItWorks: "Clear value promise, specific number, actionable list format, each item has brief context explaining why it's an opportunity",
    fullStructure: `[Number] + [category] + [timeframe]

[1-2 sentences of context on market opportunity]

1. [Niche 1]
[Why it's an opportunity - 1-2 sentences]

2. [Niche 2]
[Why it's an opportunity]

[Continue through list...]

[Closing insight or question about which resonates]`
  },

  "stopped-calling-womens-health": {
    hook: "I built a health company for women. But I've stopped calling it 'women's health.'",
    engagement: "389 likes",
    category: "Pattern-Interrupt",
    whyItWorks: "Unexpected admission from founder, challenges category naming, backs up with data points about underserved conditions, ends with community invitation",
    fullStructure: `[Paradox hook - seems contradictory]

Not because I've changed direction. Because the term has been pigeonholed.

[The perception problem - what people assume]

But women's health is so much more than this.

Here's what's being missed:

[Holistic health connections with emojis as bullets]
👉 [Connection 1]
👉 [Connection 2]

[Data points on underserved conditions]
📊 [Statistic 1]
📊 [Statistic 2]

[What you built and who it's for]

[Invitation to join - soft CTA with emoji]

What does "women's health" mean to you?`
  },

  "75k-followers": {
    hook: "This morning I realized Femtech Insider has reached 75,000 followers across our channels on LinkedIn.",
    engagement: "499 likes",
    category: "Milestone-Gratitude",
    whyItWorks: "Specific number, humble framing ('realized' not 'achieved'), focuses on what it means not what it is, credits community, forward-looking close",
    fullStructure: `[Specific milestone with platform context]

[Humble acknowledgment - "I'm not usually one to focus on vanity metrics, but..."]

What this really means:
→ [Deeper meaning about community belief]

[How it was achieved - "All organic. No paid promotions."]

[Gratitude to community]

Here's to the next chapter: [Forward goal]

[Hashtags]`
  },
};

// =============================================================================
// ENGAGEMENT OPTIMIZATION RULES
// =============================================================================

export const ENGAGEMENT_RULES = `ENGAGEMENT OPTIMIZATION:

WHAT DRIVES COMMENTS:
- Asking genuine questions (not "Thoughts?")
- Controversial but defensible positions
- Inviting additions to lists ("What did I miss?")
- Relatable struggles that prompt "me too" responses
- Tagging relevant people who might respond

WHAT DRIVES SHARES:
- Save-worthy value (lists, frameworks, data)
- Content that makes the sharer look good
- Tribal identity content ("Finally someone said it")
- Timely takes on industry news
- Original research or data

WHAT DRIVES LIKES:
- Emotional resonance
- Relatable experiences
- Celebrating others' wins
- Vulnerable authenticity
- Clear, quotable statements

WHAT KILLS ENGAGEMENT:
- Generic hooks ("In today's world...")
- Obvious self-promotion
- Engagement bait ("Agree? 👇")
- No clear value or point
- Too much text without structure
- Starting with hashtags
- Emoji-as-bullet patterns (🔥✅💡)`;

// =============================================================================
// VIRAL CONFLICT RESOLUTIONS
// =============================================================================

export const VIRAL_CONFLICTS: Record<string, string> = {
  "Credible-Contrarian+Humble": `When being contrarian while maintaining humility: Lead with "I could be wrong, but here's what I've observed..." then present your contrarian take with evidence. Acknowledge the merit in the conventional view before explaining why you see it differently. The humility is in the framing; the substance is still bold.`,

  "Vulnerable-Authority+Assertive": `When combining vulnerability with assertiveness: Be specific about what you struggled with (vulnerability), then be direct about what you learned (assertive). Structure: "I failed at X. Here's why, and here's exactly what to do instead." The vulnerability earns the right to be assertive.`,

  "Data-Driven-Emotion+Humorous": `When combining data with humor: Use dry wit to highlight the absurdity the data reveals. Don't make jokes about the data itself - let the numbers speak, then add a wry observation about what they imply. "80% of autoimmune patients are women. But sure, let's fund another erectile dysfunction app."`,

  "Industry-Callout+Optimistic": `When calling out industry problems while staying optimistic: Name the problem specifically and honestly, then pivot to what's possible or who's doing it right. Structure: "Here's what's broken → Here's why it matters → But here's what gives me hope." The criticism is specific; the optimism is earned.`,

  "Pattern-Interrupt+Formal": `When using pattern interrupts in a formal voice: The contrast IS the effect. Use polished, professional language to deliver an unexpectedly provocative insight. Think: a buttoned-up executive calmly saying the thing no one expected. The formality makes the interruption hit harder.`,
};

// =============================================================================
// BUILD VIRAL PROMPT FUNCTION
// =============================================================================

export function buildViralPrompt(options: {
  viralAngle: string | null;
  engagementGoal?: "comments" | "shares" | "likes" | "viral";
  contentObjective?: string;
}): string {
  const parts: string[] = [VIRAL_SYSTEM_PROMPT];

  // Add viral angle if selected
  if (options.viralAngle && VIRAL_ANGLE_TAGS[options.viralAngle]) {
    parts.push(`\n\nVIRAL ANGLE INSTRUCTION:\n${VIRAL_ANGLE_TAGS[options.viralAngle]}`);
  }

  // Add engagement-specific guidance
  if (options.engagementGoal) {
    const engagementGuidance: Record<string, string> = {
      comments: `OPTIMIZE FOR COMMENTS: End with a genuine question. Make a claim that invites debate. Ask for additions to a list. Share something relatable that prompts "me too" responses.`,
      shares: `OPTIMIZE FOR SHARES: Provide save-worthy value. Create content that makes the sharer look knowledgeable. Include original data, frameworks, or curated resources.`,
      likes: `OPTIMIZE FOR LIKES: Create emotional resonance. Share relatable experiences. Use clear, quotable statements. Show authentic vulnerability or celebrate others.`,
      viral: `OPTIMIZE FOR VIRALITY: Combine all engagement drivers. Lead with emotion (likes), deliver value (shares), end with invitation (comments). Use a hook that creates information gap.`,
    };
    parts.push(`\n\n${engagementGuidance[options.engagementGoal]}`);
  }

  // Add content objective context
  if (options.contentObjective) {
    parts.push(`\n\nCONTENT OBJECTIVE: ${options.contentObjective}`);
  }

  parts.push(`\n\n${ENGAGEMENT_RULES}`);

  return parts.join("");
}

// =============================================================================
// EXPORTS FOR INTEGRATION
// =============================================================================

export const VIRAL_ANGLE_OPTIONS = Object.keys(VIRAL_ANGLE_TAGS);

export const VIRAL_HOOK_CATEGORIES = Object.keys(VIRAL_HOOK_TEMPLATES);

export function getViralHookExamples(category: string): string[] {
  return VIRAL_HOOK_TEMPLATES[category] || [];
}

export function getViralExample(key: string) {
  return VIRAL_EXAMPLES[key];
}

export function getAllViralExamples() {
  return VIRAL_EXAMPLES;
}
