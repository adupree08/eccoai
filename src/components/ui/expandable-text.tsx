"use client";

import { useState } from "react";

/**
 * Post body that shows a tall preview capped with line-clamp, then a
 * "Show more" / "Show less" toggle when the text is long enough to be clipped.
 * The toggle only appears past `threshold` chars so short posts stay clean.
 */
export function ExpandableText({
  text,
  clampClass,
  threshold = 500,
  className = "",
}: {
  text: string;
  clampClass: string; // e.g. "line-clamp-[20]"
  threshold?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > threshold;

  return (
    <div>
      <p className={`whitespace-pre-wrap ${className} ${expanded || !canExpand ? "" : clampClass}`}>
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-semibold text-ecco-accent hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
