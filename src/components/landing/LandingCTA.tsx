"use client";

import { useState } from "react";
import Link from "next/link";

const BLUE = "var(--accent)";

export function LandingCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section id="signup" style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 28px", paddingBottom: 120 }}>
      <div
        style={{
          background: "var(--ink)",
          color: "#fff",
          borderRadius: 24,
          padding: "clamp(40px, 7vw, 88px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(36px, 5.5vw, 72px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            fontWeight: 600,
            margin: 0,
          }}
        >
          Ready to find
          <br />
          your LinkedIn voice?
        </h2>
        <p
          style={{
            marginTop: 22,
            fontSize: 17,
            opacity: 0.7,
            maxWidth: 560,
            marginInline: "auto",
          }}
        >
          Join our beta and start creating content that sounds like you. Limited spots available for
          early access.
        </p>

        {!sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setSent(true);
            }}
            style={{
              marginTop: 32,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 520,
              marginInline: "auto",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              style={{
                flex: 1,
                minWidth: 220,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 12,
                padding: "16px 20px",
                color: "#fff",
                fontSize: 15,
              }}
            />
            <button
              type="submit"
              style={{
                background: BLUE,
                color: "#fff",
                padding: "0 24px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
              }}
            >
              Request Early Access
            </button>
          </form>
        ) : (
          <div
            style={{
              marginTop: 32,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,.08)",
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }}
            />
            Got it — we&apos;ll be in touch.
          </div>
        )}

        <div style={{ marginTop: 18, fontSize: 13, opacity: 0.55 }}>
          Free during beta · No credit card required · Cancel anytime
        </div>

        {/* Decorative echo rings */}
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.12)",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}

export function LandingFooter() {
  const columns: [string, string[]][] = [
    ["Product", ["Features", "Pricing", "Roadmap"]],
    ["Resources", ["Blog", "Help Center", "Changelog"]],
    ["Company", ["About", "Privacy", "Terms"]],
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--line)" }}>
      <div
        className="landing-footer-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 28px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        {/* Brand column */}
        <div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "var(--ink)" }}>ecco</span>
            <span style={{ color: "var(--accent)" }}>ai</span>
          </span>
          <p
            style={{
              marginTop: 14,
              color: "var(--ink-2)",
              fontSize: 14,
              lineHeight: 1.55,
              maxWidth: 320,
            }}
          >
            AI-powered LinkedIn content that echoes your authentic voice. Build your presence without
            losing yourself.
          </p>
        </div>

        {/* Link columns */}
        {columns.map(([head, items]) => (
          <div key={head}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{head}</div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {items.map((x) => (
                <li key={x}>
                  <a
                    href="#"
                    style={{ color: "var(--ink-2)", textDecoration: "none", fontSize: 14 }}
                  >
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: "18px 28px",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 12,
          color: "var(--ink-3)",
        }}
      >
        <div>&copy; 2026 eccoai. All rights reserved.</div>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
            Privacy Policy
          </a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
            Terms of Service
          </a>
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .landing-footer-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}
