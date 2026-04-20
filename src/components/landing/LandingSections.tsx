"use client";

interface SectionHeaderProps {
  num: string;
  kicker: string;
  title: React.ReactNode;
  sub?: string;
}

export function SectionHeader({ num, kicker, title, sub }: SectionHeaderProps) {
  return (
    <div style={{ maxWidth: 900, marginBottom: 44 }}>
      <div
        className="mono"
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: ".18em",
          color: "var(--ink-3)",
          marginBottom: 18,
          display: "flex",
          gap: 14,
          alignItems: "baseline",
        }}
      >
        <span>{num}</span>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <span>{kicker}</span>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--display-weight)",
          letterSpacing: "var(--display-tracking)",
          fontSize: "clamp(36px, 5.2vw, 64px)",
          lineHeight: 1.02,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            marginTop: 18,
            maxWidth: 620,
            fontSize: 18,
            lineHeight: 1.5,
            color: "var(--ink-2)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export const sectionStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "88px 28px",
};

import { LiveDemo } from "./LiveDemo";
import { Gallery } from "./Gallery";

export function DemoSection({ audienceKey }: { audienceKey: string }) {
  return (
    <section id="demo" style={sectionStyle}>
      <SectionHeader
        num="01"
        kicker="live demo — uses real AI"
        title={
          <>
            Idea in.{" "}
            <em style={{ fontFamily: "var(--font-display)" }}>You</em> out.
          </>
        }
        sub="Type a half-formed thought. Pick a tone. Get a draft that actually reads like someone wrote it — because in the product, someone did: you, once, and we learned."
      />
      <LiveDemo audienceKey={audienceKey} />
    </section>
  );
}

export function GallerySection() {
  return (
    <section id="examples" style={sectionStyle}>
      <SectionHeader
        num="02"
        kicker="in the wild"
        title="Posts that don't sound like AI."
        sub="A sample of drafts written through eccoai by real consultants. None have been edited for this page."
      />
      <Gallery />
    </section>
  );
}
