"use client";

import { LiveDemo } from "./LiveDemo";
import { Gallery } from "./Gallery";

const BLUE = "var(--accent)";

const sectionStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "72px 28px",
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".18em",
  color: BLUE,
  marginBottom: 16,
};

const h2Style: React.CSSProperties = {
  fontSize: "clamp(32px, 4.6vw, 56px)",
  lineHeight: 1.05,
  letterSpacing: "-0.025em",
  fontWeight: 600,
  margin: 0,
};

const leadP: React.CSSProperties = {
  marginTop: 16,
  fontSize: 18,
  lineHeight: 1.5,
  color: "var(--ink-2)",
  maxWidth: 640,
};

/* ---- How It Works ---- */

export function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: "Train your voice",
      body: "Share examples or chat with AI to capture your unique style. Done once, applied forever.",
    },
    {
      n: 2,
      title: "Pick your source",
      body: "Start from an idea, your RSS feeds, a URL, or browse viral posts for inspiration.",
    },
    {
      n: 3,
      title: "Generate & refine",
      body: "Get multiple variations in your voice. Edit inline or use AI to polish until perfect.",
    },
    {
      n: 4,
      title: "Publish or schedule",
      body: "Copy to LinkedIn, save for later, or add to your calendar. Track what resonates.",
    },
  ];

  return (
    <section id="how" style={sectionStyle}>
      <div style={{ maxWidth: 720, marginBottom: 48 }}>
        <div className="mono" style={eyebrow}>
          How It Works
        </div>
        <h2 style={h2Style}>From blank page to brilliant post</h2>
        <p style={leadP}>
          A simple workflow that saves hours every week while making your content more authentic and
          engaging.
        </p>
      </div>
      <div
        className="landing-how-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 16,
        }}
      >
        {steps.map((s) => (
          <div
            key={s.n}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "28px 24px",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 16 }}>
              {String(s.n).padStart(2, "0")}
            </div>
            <div
              style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.01em" }}
            >
              {s.title}
            </div>
            <div style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5 }}>{s.body}</div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 960px) { .landing-how-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 520px) { .landing-how-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ---- Features (2x2 bordered grid) ---- */

export function FeaturesSection() {
  const features = [
    {
      title: "AI Content Generation",
      body: "Transform ideas, URLs, or news feeds into polished posts. Multiple variations with different styles and angles.",
    },
    {
      title: "Brand Voice Training",
      body: "Teach AI your unique style through guided conversation or by sharing examples. Posts sound like you, not a template.",
    },
    {
      title: "Custom RSS Feeds",
      body: "Build your own content pipeline. Add industry news, competitor blogs, or any source. Never run out of fresh ideas.",
    },
    {
      title: "Content Calendar",
      body: "Plan and organize your posts visually. Schedule ahead and maintain consistency without the daily scramble.",
    },
  ];

  return (
    <section id="features" style={{ ...sectionStyle, background: "var(--bg-2)" }}>
      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "0 28px" }}>
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <div className="mono" style={eyebrow}>
            Features
          </div>
          <h2 style={h2Style}>Everything you need for LinkedIn growth</h2>
          <p style={leadP}>
            From personalized content creation to strategic engagement, build your presence without
            the time drain.
          </p>
        </div>
        <div
          className="landing-feat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 1,
            background: "var(--line-strong)",
            border: "1px solid var(--line-strong)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "var(--card)",
                padding: "36px 32px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "color-mix(in oklab, rgb(10,102,194) 15%, transparent)",
                  color: BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                  fontWeight: 700,
                }}
              >
                ✦
              </div>
              <h3
                style={{
                  fontSize: 19,
                  margin: "0 0 8px",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {f.title}
              </h3>
              <p style={{ margin: 0, color: "var(--ink-2)", lineHeight: 1.55, fontSize: 15 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 820px) { .landing-feat-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}

/* ---- Demo Block ---- */

export function DemoSection({ audienceKey }: { audienceKey: string }) {
  return (
    <section id="demo" style={sectionStyle}>
      <div
        style={{
          maxWidth: 900,
          marginBottom: 40,
          textAlign: "center",
          marginInline: "auto",
        }}
      >
        <div className="mono" style={eyebrow}>
          Live demo — real AI
        </div>
        <h2 style={h2Style}>
          Idea in. <em style={{ fontStyle: "italic", color: BLUE }}>You</em> out.
        </h2>
        <p style={{ ...leadP, maxWidth: 640, marginInline: "auto" }}>
          Type a half-formed thought. Pick a tone. Get a draft that actually reads like someone
          wrote it.
        </p>
      </div>
      <LiveDemo audienceKey={audienceKey} />
    </section>
  );
}

/* ---- Gallery Block ---- */

export function GallerySection() {
  return (
    <section id="gallery" style={{ ...sectionStyle, background: "var(--bg-2)" }}>
      <div style={{ maxWidth: 1200, marginInline: "auto", padding: "0 28px" }}>
        <div
          style={{
            maxWidth: 720,
            marginBottom: 40,
            textAlign: "center",
            marginInline: "auto",
          }}
        >
          <div className="mono" style={eyebrow}>
            In the wild
          </div>
          <h2 style={h2Style}>Posts that don&apos;t sound like AI.</h2>
          <p style={{ ...leadP, marginInline: "auto" }}>
            A sample of drafts written through eccoai by real consultants. None have been edited for
            this page.
          </p>
        </div>
        <Gallery />
      </div>
    </section>
  );
}

/* ---- Use Cases ---- */

export function UseCasesSection() {
  const rows: [string, string][] = [
    [
      "Founders & Executives",
      "Share insights and build thought leadership in your authentic voice",
    ],
    [
      "Consultants & Coaches",
      "Attract clients by consistently sharing valuable content in your niche",
    ],
    ["Marketing Teams", "Scale personal branding across your team with consistent quality"],
    ["Sales Professionals", "Stay top of mind with prospects through regular, engaging posts"],
  ];

  return (
    <section id="use-cases" style={sectionStyle}>
      <div style={{ maxWidth: 720, marginBottom: 44 }}>
        <div className="mono" style={eyebrow}>
          Use Cases
        </div>
        <h2 style={h2Style}>Built for busy professionals</h2>
        <p style={leadP}>
          Whether you&apos;re a founder, consultant, or marketer, eccoai helps you maintain a
          consistent presence without sacrificing your day.
        </p>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {rows.map(([t, b], i) => (
          <li
            key={i}
            className="landing-uc-row"
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: 28,
              padding: "22px 0",
              borderTop: i === 0 ? "1px solid var(--line-strong)" : "1px solid var(--line)",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>{t}</div>
            <div style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.5 }}>{b}</div>
          </li>
        ))}
      </ul>
      <style>{`@media (max-width: 680px) { .landing-uc-row { grid-template-columns: 1fr !important; gap: 6px !important; } }`}</style>
    </section>
  );
}
