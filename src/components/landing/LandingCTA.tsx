"use client";

import { useState } from "react";
import Link from "next/link";

export function LandingCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="waitlist" style={{ maxWidth: 1240, margin: "0 auto", padding: "88px 28px", paddingBottom: 120 }}>
      <div
        style={{
          background: "var(--ink)",
          color: "var(--bg)",
          borderRadius: "var(--radius-lg)",
          padding: "clamp(40px, 7vw, 96px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: ".18em",
            opacity: 0.55,
            marginBottom: 24,
          }}
        >
          03 — join the beta
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--display-weight)",
            letterSpacing: "var(--display-tracking)",
            fontSize: "clamp(44px, 7vw, 96px)",
            lineHeight: 0.98,
            margin: 0,
            maxWidth: 900,
          }}
        >
          Sound like yourself.
          <br />
          <span style={{ opacity: 0.55 }}>On a good day.</span>
        </h2>

        <p
          style={{
            marginTop: 28,
            maxWidth: 560,
            fontSize: 18,
            lineHeight: 1.5,
            opacity: 0.75,
          }}
        >
          We&apos;re adding about 40 people a week. Drop your email — if you&apos;re a fit
          we&apos;ll send a calm, human note with access.
        </p>

        {!sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setSent(true);
            }}
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) auto",
              gap: 10,
              maxWidth: 540,
            }}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@domain.com"
              style={{
                background: "transparent",
                border: "1px solid color-mix(in oklab, var(--bg) 30%, transparent)",
                borderRadius: "var(--radius)",
                padding: "18px 22px",
                fontSize: 16,
                color: "var(--bg)",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
                padding: "0 26px",
                borderRadius: "var(--radius)",
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
              }}
            >
              Request access →
            </button>
          </form>
        ) : (
          <div
            style={{
              marginTop: 40,
              maxWidth: 540,
              padding: "22px 24px",
              border: "1px solid color-mix(in oklab, var(--bg) 30%, transparent)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }}
            />
            <span>Got it. We&apos;ll be in touch within a week.</span>
          </div>
        )}

        {/* decorative echo circles */}
        <div
          style={{
            position: "absolute",
            right: -40,
            bottom: -40,
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "1px solid color-mix(in oklab, var(--bg) 15%, transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "1px solid color-mix(in oklab, var(--bg) 25%, transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 110,
            bottom: 110,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--accent)",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--line)",
        padding: "36px 28px",
        maxWidth: 1240,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 18 }}>
        <span style={{ color: "var(--ink)" }}>ecco</span>
        <span style={{ color: "var(--accent)" }}>ai</span>
      </span>
      <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
        © 2026 eccoai — built to sound human
      </div>
    </footer>
  );
}
