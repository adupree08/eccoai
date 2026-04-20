"use client";

const AVATAR_PHOTOS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces&auto=format&q=80",
];

function Avatar({ seed, size = 44 }: { seed: number; size?: number }) {
  const src = AVATAR_PHOTOS[seed % AVATAR_PHOTOS.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: "1px solid var(--line-strong)",
        flexShrink: 0,
        background: "var(--bg-2)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

const EXAMPLE_POSTS = [
  {
    who: "Maya Okafor",
    role: "Leadership coach · ex-Stripe",
    tag: "Story",
    body: `A client asked me to help her "sound more confident" on LinkedIn.

We worked for an hour.
She left with nothing.

Because the problem wasn't her voice.
It was that she didn't believe what she was writing.

You can polish a sentence forever.
If you don't mean it, it'll read like paper.

Confidence isn't a tone.
It's what happens when you stop hedging.`,
    stats: "1.2k · 84 · 31",
  },
  {
    who: "Dan Weatherall",
    role: "Fractional CMO",
    tag: "Bold",
    body: `"Thought leadership" is the most dishonest phrase in B2B.

No one is leading anyone.
We're all reposting the same four frameworks in slightly different fonts.

The posts that actually move people:
— a specific client story
— a thing you changed your mind on
— a number you're embarrassed by

The rest is just content.`,
    stats: "3.4k · 211 · 72",
  },
  {
    who: "Priya Rao",
    role: "Ops consultant · scale-ups",
    tag: "List",
    body: `Five ops audits. Same five findings.

1. Nobody knows who owns the handoff.
2. The "weekly sync" has been monthly since March.
3. The SOP exists. It's in someone's Notion.
4. The tool is fine. The naming is chaos.
5. The team doesn't need software. They need a decision.

You don't have a tooling problem.
You have a clarity problem.`,
    stats: "892 · 47 · 19",
  },
  {
    who: "Jules Hartwell",
    role: "Brand consultant",
    tag: "Story",
    body: `I charged $2,000 for my first brand audit.

Client loved it.
I spent 40 hours on it.

$50/hr, minus taxes, minus the weekend I lost.

The lesson wasn't "charge more".
It was that I was selling a document when they wanted a decision.

Now I sell the decision.
The document is free.`,
    stats: "2.1k · 156 · 44",
  },
];

function PostCard({ p, i }: { p: (typeof EXAMPLE_POSTS)[0]; i: number }) {
  return (
    <article
      style={{
        background: "var(--card)",
        border: "1px solid var(--line-strong)",
        borderRadius: "var(--radius-lg)",
        padding: 26,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        breakInside: "avoid",
        marginBottom: 20,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Avatar seed={i} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{p.who}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.3 }}>
              {p.role}
            </div>
          </div>
        </div>
        <span
          className="mono"
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: ".14em",
            color: "var(--ink-3)",
            padding: "4px 10px",
            border: "1px solid var(--line-strong)",
            borderRadius: 999,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {p.tag}
        </span>
      </header>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          color: "var(--ink-2)",
        }}
      >
        {p.body}
      </div>
      <footer
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--ink-3)",
          paddingTop: 12,
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{p.stats}</span>
        <span>echoed · 3 mo ago</span>
      </footer>
    </article>
  );
}

export function Gallery() {
  return (
    <div className="landing-gallery-cols" style={{ columnCount: 2, columnGap: 20 }}>
      {EXAMPLE_POSTS.map((p, i) => (
        <PostCard key={i} p={p} i={i} />
      ))}
      <style>{`
        @media (max-width: 820px) {
          .landing-gallery-cols { column-count: 1 !important; }
        }
      `}</style>
    </div>
  );
}
