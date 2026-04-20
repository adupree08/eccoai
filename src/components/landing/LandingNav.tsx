"use client";

import Link from "next/link";

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "var(--ink-2)",
  fontSize: 14,
  fontWeight: 500,
};

export function LandingNav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in oklab, var(--bg) 92%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
        >
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
        </Link>
        <div
          className="landing-nav-links"
          style={{ display: "flex", alignItems: "center", gap: 28 }}
        >
          <a href="#features" style={navLink}>
            Features
          </a>
          <a href="#how" style={navLink}>
            How It Works
          </a>
          <a href="#use-cases" style={navLink}>
            Use Cases
          </a>
          <Link href="/login" style={navLink}>
            Login
          </Link>
          <a
            href="#signup"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 999,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Join Beta
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .landing-nav-links a:not([href="#signup"]) { display: none; }
        }
      `}</style>
    </nav>
  );
}
