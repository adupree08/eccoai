"use client";

interface TweaksPanelProps {
  visible: boolean;
  state: { theme: string; audience: string };
  onChange: (patch: Partial<{ theme: string; audience: string }>) => void;
}

const themes = [
  { id: "signal", label: "Signal", hint: "Tech-minimal, light" },
  { id: "chorus", label: "Chorus", hint: "Playful, warm" },
  { id: "broadsheet", label: "Broadsheet", hint: "Editorial, dark" },
];

const audiences = [
  { id: "consultants", label: "Consultants" },
  { id: "founders", label: "Founders/execs" },
  { id: "marketers", label: "Marketers" },
];

export function TweaksPanel({ visible, state, onChange }: TweaksPanelProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 100,
        background: "var(--card)",
        border: "1px solid var(--line-strong)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        width: 240,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: ".18em",
          color: "var(--ink-3)",
          marginBottom: 14,
        }}
      >
        Tweaks
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Theme</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ theme: t.id })}
              style={{
                textAlign: "left" as const,
                padding: "8px 10px",
                borderRadius: "var(--radius)",
                border:
                  state.theme === t.id
                    ? "1px solid var(--ink)"
                    : "1px solid var(--line)",
                background: state.theme === t.id ? "var(--ink)" : "transparent",
                color: state.theme === t.id ? "var(--bg)" : "var(--ink)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 500 }}>{t.label}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{t.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Voice demo</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {audiences.map((a) => (
            <button
              key={a.id}
              onClick={() => onChange({ audience: a.id })}
              style={{
                textAlign: "left" as const,
                padding: "8px 10px",
                borderRadius: "var(--radius)",
                border:
                  state.audience === a.id
                    ? "1px solid var(--ink)"
                    : "1px solid var(--line)",
                background: state.audience === a.id ? "var(--ink)" : "transparent",
                color: state.audience === a.id ? "var(--bg)" : "var(--ink)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
