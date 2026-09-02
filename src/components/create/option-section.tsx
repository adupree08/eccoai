"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// A collapsible row for the create-page options. Collapsed by default,
// showing the title and a summary of the current selection so the whole
// panel stays short and scannable.
export function OptionSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ecco-light last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ecco-primary shrink-0">{title}</span>
        <span className="flex min-w-0 items-center gap-2">
          {summary && (
            <span className="truncate text-xs text-ecco-tertiary">{summary}</span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-ecco-muted transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}
