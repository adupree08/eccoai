"use client";

import { useState, useRef } from "react";
import { Waveform } from "./Waveform";

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
  const [input, setInput] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setTyping(1);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(0), 700);
  }

  return (
    <section
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "72px 28px 40px",
        position: "relative",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: ".18em",
          color: "var(--ink-3)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            animation: "beat 2s ease-in-out infinite",
          }}
        />
        <span>Beta · now writing for 412 people</span>
        <style>{`@keyframes beat { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--display-weight)",
          letterSpacing: "var(--display-tracking)",
          fontSize: "clamp(48px, 9vw, 128px)",
          lineHeight: 0.95,
          margin: 0,
          maxWidth: 1100,
        }}
      >
        LinkedIn posts
        <br />
        <span style={{ color: "var(--ink-3)" }}>that actually </span>
        <em style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>sound</em>
        <span style={{ color: "var(--ink-3)" }}> like you.</span>
      </h1>

      {/* waveforms */}
      <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="mono" style={labelTiny}>
            you
          </span>
          <div style={{ flex: 1, opacity: 0.85 }}>
            <Waveform intensity={typing} bars={96} height={80} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingLeft: 40,
          }}
        >
          <div style={{ flex: 1 }}>
            <Waveform intensity={typing * 0.9} bars={96} height={80} accent delay={180} />
          </div>
          <span className="mono" style={{ ...labelTiny, color: "var(--accent)" }}>
            echo
          </span>
        </div>
      </div>

      {/* inline try-it */}
      <div
        style={{
          marginTop: 36,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          gap: 12,
          maxWidth: 760,
        }}
      >
        <input
          value={input}
          onChange={onChange}
          placeholder="Try it — type anything and watch the echo react"
          style={{
            background: "var(--card)",
            border: "1px solid var(--line-strong)",
            borderRadius: "var(--radius)",
            padding: "18px 22px",
            fontSize: 17,
            color: "var(--ink)",
            width: "100%",
          }}
        />
        <a
          href="#demo"
          style={{
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "0 26px",
            display: "flex",
            alignItems: "center",
            borderRadius: "var(--radius)",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Open the demo →
        </a>
      </div>

      {/* sub headline */}
      <p
        style={{
          marginTop: 40,
          maxWidth: 640,
          fontSize: 19,
          lineHeight: 1.5,
          color: "var(--ink-2)",
        }}
      >
        eccoai learns your voice from a short conversation, pulls fresh ideas from feeds you care
        about, and drafts posts that read like you on a good morning. Not a template. Not an AI
        puddle.
      </p>

      <div
        className="mono"
        style={{
          marginTop: 28,
          display: "flex",
          gap: 22,
          flexWrap: "wrap",
          fontSize: 13,
          color: "var(--ink-3)",
        }}
      >
        <span>— free during beta</span>
        <span>— no card</span>
        <span>— cancel anytime</span>
      </div>
    </section>
  );
}
