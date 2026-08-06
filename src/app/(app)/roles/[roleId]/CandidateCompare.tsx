"use client";

import { Fragment, useEffect } from "react";
import { getCandidateDisplayName } from "@/lib/displayName";

export type CompareCandidate = {
  id: string;
  fileName: string;
  name: string | null;
  score: number | null;
  scoreReasoning: string | null;
  skills: string[];
  techStack: string[];
  yearsExperience: number | null;
  summary: string | null;
};

const ROWS: { label: string; render: (c: CompareCandidate) => string }[] = [
  { label: "Experience", render: (c) => `${c.yearsExperience ?? 0} yrs` },
  { label: "Skills", render: (c) => (c.skills.length ? c.skills.join(", ") : "—") },
  { label: "Tech stack", render: (c) => (c.techStack.length ? c.techStack.join(", ") : "—") },
  { label: "Summary", render: (c) => c.summary || "—" },
  { label: "Why this score", render: (c) => c.scoreReasoning || "—" },
];

export default function CandidateCompare({
  candidates,
  onClose,
}: {
  candidates: CompareCandidate[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const bestScore = Math.max(...candidates.map((c) => c.score ?? 0));
  const cols = `140px repeat(${candidates.length}, minmax(200px, 1fr))`;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Compare candidates</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Close
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: cols, minWidth: "min-content" }}>
            {/* Header row: name + score per candidate */}
            <div />
            {candidates.map((c) => (
              <div key={c.id} className="px-3 pb-3">
                <p className="font-medium text-foreground">{getCandidateDisplayName(c)}</p>
                <p
                  className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
                    c.score === bestScore ? "text-accent" : "text-foreground"
                  }`}
                >
                  {c.score ?? 0}
                  {c.score === bestScore && candidates.length > 1 && (
                    <span className="ml-1.5 align-middle text-xs font-medium text-accent">top</span>
                  )}
                </p>
              </div>
            ))}

            {/* One row per attribute, aligned across candidates */}
            {ROWS.map((row) => (
              <Fragment key={row.label}>
                <div className="border-t border-border px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </div>
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className="border-t border-border px-3 py-3 text-sm text-foreground"
                  >
                    {row.render(c)}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
