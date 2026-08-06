"use client";

import { useState } from "react";
import Link from "next/link";
import { getCandidateDisplayName } from "@/lib/displayName";
import CountUp from "@/components/CountUp";
import CandidateCompare from "./CandidateCompare";

type Candidate = {
  id: string;
  fileName: string;
  name: string | null;
  score: number | null;
  scoreReasoning: string | null;
  skills: string[];
  techStack: string[];
  yearsExperience: number | null;
  summary: string | null;
  status: string;
  errorMessage: string | null;
};

const MAX_COMPARE = 3;

export default function LeaderboardView({
  roleId,
  candidates,
}: {
  roleId: string;
  candidates: Candidate[];
}) {
  const [comparisons, setComparisons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const scored = candidates.filter((c) => c.status === "SCORED");
  const unscored = candidates.filter((c) => c.status !== "SCORED");

  function toggleSelected(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id]
    );
  }

  function toggleCompareMode() {
    setCompareMode((on) => !on);
    setSelected([]);
  }

  async function handleExplain() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/roles/${roleId}/explain-leaderboard`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate comparison");
      }
      const explanations: { candidate_id: string; comparison: string }[] = await res.json();
      setComparisons(Object.fromEntries(explanations.map((e) => [e.candidate_id, e.comparison])));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Ranked by score, {scored.length} scored
          {unscored.length > 0 ? `, ${unscored.length} still processing` : ""}.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCompareMode}
            disabled={scored.length < 2}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
              compareMode
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
            title={scored.length < 2 ? "Needs at least 2 scored candidates to compare" : undefined}
          >
            {compareMode ? "Done comparing" : "Compare"}
          </button>
          <button
            onClick={handleExplain}
            disabled={loading || scored.length < 2}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            title={scored.length < 2 ? "Needs at least 2 scored candidates to compare" : undefined}
          >
            {loading ? "Comparing…" : "Explain this leaderboard"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {compareMode && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-accent/30 bg-accent/5 px-3 py-2">
          <p className="text-sm text-muted-foreground">
            Select 2–{MAX_COMPARE} candidates to compare
            {selected.length > 0 ? ` · ${selected.length} selected` : ""}.
          </p>
          <button
            onClick={() => setShowCompare(true)}
            disabled={selected.length < 2}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            Compare {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        </div>
      )}

      <ol className="mt-4 space-y-3">
        {scored.map((c, i) => (
          <li
            key={c.id}
            style={{ animationDelay: `${i * 70}ms` }}
            className={`animate-rise hover-lift rounded-lg border bg-card p-4 ${
              selected.includes(c.id)
                ? "border-accent ring-2 ring-accent/40"
                : i === 0
                  ? "border-accent/50 ring-1 ring-accent/30"
                  : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-baseline gap-3">
                {compareMode && (
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggleSelected(c.id)}
                    disabled={!selected.includes(c.id) && selected.length >= MAX_COMPARE}
                    className="h-4 w-4 shrink-0 self-center [accent-color:var(--accent)] disabled:opacity-40"
                    aria-label={`Select ${getCandidateDisplayName(c)} to compare`}
                  />
                )}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${i === 0
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {i + 1}
                </span>
                <Link
                  href={`/roles/${roleId}/candidates/${c.id}`}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {getCandidateDisplayName(c)}
                </Link>
              </div>
              <CountUp
                value={c.score ?? 0}
                className={`font-mono text-2xl font-semibold tabular-nums ${i === 0 ? "text-accent" : "text-foreground"
                  }`}
              />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.skills.slice(0, 6).join(", ")}</p>
            <p className="mt-2 text-sm text-foreground">{c.scoreReasoning}</p>
            {comparisons[c.id] && (
              <p className="mt-2 rounded-md bg-accent/5 px-3 py-2 text-sm text-foreground">
                <span className="font-medium text-accent">Vs. the field: </span>
                {comparisons[c.id]}
              </p>
            )}
          </li>
        ))}
      </ol>

      {unscored.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Still processing or failed
          </p>
          <ul className="mt-2 space-y-2">
            {unscored.map((c) => (
              <li key={c.id} className="text-sm text-muted-foreground">
                {getCandidateDisplayName(c)} —{" "}
                {c.status === "FAILED" ? c.errorMessage ?? "Failed to parse" : "Processing…"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCompare && (
        <CandidateCompare
          candidates={scored.filter((c) => selected.includes(c.id))}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
