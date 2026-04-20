"use client";

import { useRef, useEffect, useCallback } from "react";

function useRaf(cb: (t: number) => void, active = true) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!active) return;
    let id: number;
    const loop = (t: number) => {
      cbRef.current(t);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

interface WaveformProps {
  intensity?: number;
  bars?: number;
  height?: number;
  mirrored?: boolean;
  accent?: boolean;
  delay?: number;
}

export function Waveform({
  intensity = 0,
  bars = 84,
  height = 180,
  mirrored = true,
  accent = false,
  delay = 0,
}: WaveformProps) {
  const ref = useRef<SVGSVGElement>(null);
  const startRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const intensityRef = useRef(0);

  useRaf(() => {
    const now = performance.now();
    intensityRef.current += (intensity - intensityRef.current) * 0.08;
    const svg = ref.current;
    if (!svg) return;
    const rects = svg.querySelectorAll("rect");
    const phase = (now - startRef.current - delay) * 0.0035;
    const amp = 0.25 + intensityRef.current * 0.9;
    rects.forEach((r, i) => {
      const x = i / bars;
      const v =
        Math.sin(phase * 1.0 + x * 9) * 0.45 +
        Math.sin(phase * 1.7 + x * 17 + 1.3) * 0.35 +
        Math.sin(phase * 0.55 + x * 4 + 0.7) * 0.55;
      const env = Math.sin(x * Math.PI);
      const raw = Math.abs(v) * env * amp + 0.04;
      const h = Math.min(1, raw) * height * (mirrored ? 0.5 : 1);
      if (mirrored) {
        r.setAttribute("y", (height / 2 - h).toFixed(2));
        r.setAttribute("height", (h * 2).toFixed(2));
      } else {
        r.setAttribute("y", (height - h).toFixed(2));
        r.setAttribute("height", h.toFixed(2));
      }
    });
  });

  const barW = 3;
  const gap = 3;
  const totalW = bars * (barW + gap) - gap;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${totalW} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block", overflow: "visible" }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <rect
          key={i}
          x={i * (barW + gap)}
          y={height / 2 - 2}
          width={barW}
          height={4}
          rx={barW / 2}
          fill={accent ? "var(--accent)" : "var(--ink)"}
        />
      ))}
    </svg>
  );
}
