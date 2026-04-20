"use client";

import { useState, useRef, useEffect } from "react";

const TONES = [
  { id: "story", label: "Story", hint: "Narrative, first-person, a lesson" },
  { id: "bold", label: "Bold", hint: "Contrarian, punchy, a take" },
  { id: "list", label: "List", hint: "Listicle, scannable, practical" },
];

function Spinner() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        className="landing-spin"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--accent)",
          display: "inline-block",
        }}
      />
      <style>{`.landing-spin { animation: landing-pulse 1s ease-in-out infinite; }
        @keyframes landing-pulse { 0%,100%{ opacity:.3; transform:scale(.8);} 50%{opacity:1; transform:scale(1.1);} }`}</style>
    </span>
  );
}

const chipBtn: React.CSSProperties = {
  border: "1px solid var(--line-strong)",
  borderRadius: 999,
  padding: "8px 14px",
  fontSize: 12,
  color: "var(--ink)",
  background: "transparent",
  cursor: "pointer",
};

interface LiveDemoProps {
  audienceKey: string;
}

export function LiveDemo({ audienceKey }: LiveDemoProps) {
  const [idea, setIdea] = useState("Why I fired my biggest client");
  const [tone, setTone] = useState("story");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");
  const typingRef = useRef<NodeJS.Timeout>(undefined);

  // typewriter reveal
  useEffect(() => {
    clearTimeout(typingRef.current);
    if (!post) {
      setTyped("");
      return;
    }
    setTyped("");
    let i = 0;
    const tick = () => {
      i += Math.max(1, Math.floor(Math.random() * 4));
      setTyped(post.slice(0, i));
      if (i < post.length) typingRef.current = setTimeout(tick, 8);
    };
    tick();
    return () => clearTimeout(typingRef.current);
  }, [post]);

  async function onGenerate() {
    if (!idea.trim() || loading) return;
    setLoading(true);
    setPost("");
    try {
      const res = await fetch("/api/demo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, tone, audienceKey }),
      });
      const data = await res.json();
      setPost(data.post || "Could not generate. Try again.");
    } catch {
      setPost(
        "Could not reach the model just now. But here's the shape: one hook, three beats, one question. Write what you wish you'd read a year ago."
      );
    }
    setLoading(false);
  }

  return (
    <div
      className="landing-demo-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)",
        gap: 32,
        alignItems: "stretch",
      }}
    >
      {/* LEFT: controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".14em",
              color: "var(--ink-3)",
              marginBottom: 10,
            }}
          >
            01 — your idea
          </div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A half-formed thought. A client story. A take."
            rows={3}
            style={{
              width: "100%",
              background: "var(--card)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--radius)",
              padding: "16px 18px",
              fontFamily: "var(--font-body)",
              fontSize: 17,
              lineHeight: 1.45,
              color: "var(--ink)",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".14em",
              color: "var(--ink-3)",
              marginBottom: 10,
            }}
          >
            02 — pick a tone
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                style={{
                  border: "1px solid " + (tone === t.id ? "var(--ink)" : "var(--line-strong)"),
                  background: tone === t.id ? "var(--ink)" : "transparent",
                  color: tone === t.id ? "var(--bg)" : "var(--ink)",
                  padding: "14px 14px",
                  borderRadius: "var(--radius)",
                  textAlign: "left" as const,
                  transition: "all .2s",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15 }}>{t.label}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, lineHeight: 1.35 }}>
                  {t.hint}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || !idea.trim()}
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
            padding: "18px 22px",
            borderRadius: "var(--radius)",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            opacity: loading || !idea.trim() ? 0.55 : 1,
            transition: "transform .15s, opacity .2s",
            cursor: "pointer",
            border: "none",
          }}
        >
          <span>{loading ? "Generating in your voice" : "Echo it back"}</span>
          <span>{loading ? <Spinner /> : "→"}</span>
        </button>

        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
          <span className="mono" style={{ fontSize: 11 }}>
            note —{" "}
          </span>
          this demo uses a shared default voice. In the product, eccoai trains a private voice
          model on your writing.
        </div>
      </div>

      {/* RIGHT: post preview */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--line-strong)",
          borderRadius: "var(--radius-lg)",
          padding: 28,
          display: "flex",
          flexDirection: "column",
          minHeight: 380,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-ink)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              YV
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Your Voice</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                draft · 1 of 3
              </div>
            </div>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: ".14em",
            }}
          >
            {loading ? "echoing…" : post ? "ready" : "preview"}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            fontSize: 16,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            color: "var(--ink-2)",
            fontFamily: "var(--font-body)",
          }}
        >
          {typed ||
            (!loading && (
              <span style={{ color: "var(--ink-3)" }}>
                Your post will appear here. Type an idea on the left, pick a tone, and hit echo.
              </span>
            ))}
          {loading && !typed && <Spinner />}
          {loading && typed && <span style={{ opacity: 0.4 }}>▍</span>}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid var(--line)",
          }}
        >
          <div
            className="mono"
            style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--ink-3)" }}
          >
            <span>{post ? post.split(/\s+/).length : 0} words</span>
            <span>·</span>
            <span>{post ? Math.ceil((post.length / 5 / 230) * 60) : 0}s read</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onGenerate} style={chipBtn}>
              regenerate
            </button>
            <button
              onClick={() => post && navigator.clipboard.writeText(post)}
              style={{
                ...chipBtn,
                borderColor: "var(--ink)",
                background: "var(--ink)",
                color: "var(--bg)",
              }}
            >
              copy
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .landing-demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
