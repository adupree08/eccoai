"use client";

import Link from "next/link";

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "var(--ink-2)",
  fontSize: 14,
  fontWeight: 500,
};

interface LandingNavProps {
  theme: string;
  onCycleTheme: () => void;
}

const themeLabels: Record<string, string> = {
  signal: "Signal",
  chorus: "Chorus",
  broadsheet: "Broadsheet",
};

export function LandingNav({ theme, onCycleTheme }: LandingNavProps) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "color-mix(in oklab, var(--bg) 88%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "14px 28px",
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
          <a href="#demo" style={navLink}>
            Try it
          </a>
          <a href="#examples" style={navLink}>
            Examples
          </a>
          <a href="#waitlist" style={navLink}>
            Waitlist
          </a>
          <button
            onClick={onCycleTheme}
            title="Cycle aesthetic"
            style={{
              ...navLink,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".14em",
              border: "1px solid var(--line-strong)",
              padding: "7px 12px",
              borderRadius: 999,
              cursor: "pointer",
              background: "none",
            }}
          >
            ◐ {themeLabels[theme] || "Signal"}
          </button>
          <Link
            href="/login"
            style={{ ...navLink, marginRight: -8 }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "10px 16px",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Join beta
          </Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .landing-nav-links a:not(:last-child):not([href="#waitlist"]) { display: none; }
          .landing-nav-links button { display: none; }
        }
      `}</style>
    </nav>
  );
}
