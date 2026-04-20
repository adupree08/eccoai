"use client";

import { useState, useRef } from "react";
import { Waveform } from "./Waveform";

const BLUE = "var(--accent)";

const labelTiny: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".18em",
  color: "var(--ink-3)",
  width: 40,
  display: "inline-block",
};

export function LandingHero() {
  const [typing, setTyping] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  function bump() {
    setTyping(1);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(0), 700);
  }

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "64px 28px 48px",
        textAlign: "center",
      }}
    >
      {/* Beta badge */}
      <div
        className="mono"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          padding: "6px 14px",
          border: "1px solid var(--line-strong)",
          borderRadius: 999,
          color: "var(--ink-2)",
          marginBottom: 32,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: BLUE,
          }}
        />
        Now in Beta — Early Access Available
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: "clamp(44px, 7.5vw, 96px)",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          fontWeight: 600,
          margin: 0,
          maxWidth: 1000,
          marginInline: "auto",
        }}
      >
        LinkedIn content that
        <br />
        <span style={{ color: BLUE, fontStyle: "italic", fontWeight: 500 }}>echoes you</span>
        <span style={{ color: "var(--ink-3)" }}>, not generic AI</span>
      </h1>

      {/* Waveform pair */}
      <div
        style={{
          marginTop: 48,
          marginInline: "auto",
          maxWidth: 900,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="mono" style={labelTiny}>
            you
          </span>
          <div style={{ flex: 1, opacity: 0.85 }}>
            <Waveform intensity={typing} bars={90} height={72} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingLeft: 40 }}>
          <div style={{ flex: 1 }}>
            <Waveform intensity={typing * 0.95} bars={90} height={72} accent delay={200} />
          </div>
          <span className="mono" style={{ ...labelTiny, color: BLUE }}>
            echo
          </span>
        </div>
      </div>

      {/* Sub-headline */}
      <p
        style={{
          marginTop: 36,
          maxWidth: 640,
          marginInline: "auto",
          fontSize: 19,
          lineHeight: 1.5,
          color: "var(--ink-2)",
        }}
      >
        Train your brand voice, curate your own RSS feeds for fresh ideas, and create authentic
        LinkedIn posts that sound like you wrote them.
      </p>

      {/* CTA buttons */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <a
          href="#signup"
          onMouseEnter={bump}
          onFocus={bump}
          style={{
            background: BLUE,
            color: "#fff",
            padding: "16px 28px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          Request Early Access →
        </a>
        <a
          href="#demo"
          onMouseEnter={bump}
          style={{
            padding: "16px 28px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
            border: "1px solid var(--line-strong)",
            color: "var(--ink)",
          }}
        >
          Watch Demo
        </a>
      </div>

      {/* Trust signals */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 22,
          flexWrap: "wrap",
          fontSize: 13,
          color: "var(--ink-3)",
        }}
      >
        <span>· Free during beta</span>
        <span>· No credit card</span>
        <span>· Cancel anytime</span>
      </div>
    </section>
  );
}
