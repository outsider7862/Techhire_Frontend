"use client";

import { useState } from "react";
import Link from "next/link";
import { getCandidateDisplayName } from "@/lib/displayName";

type Candidate = {
  id: string;
  fileName: string;
  name: string | null;
  score: number | null;
  scoreReasoning: string | null;
  skills: string[];
  status: string;
  errorMessage: string | null;
};

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

  const scored = candidates.filter((c) => c.status === "SCORED");
  const unscored = candidates.filter((c) => c.status !== "SCORED");

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
        <button
          onClick={handleExplain}
          disabled={loading || scored.length < 2}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          title={scored.length < 2 ? "Needs at least 2 scored candidates to compare" : undefined}
        >
          {loading ? "Comparing…" : "Explain this leaderboard"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <ol className="mt-4 space-y-3">
        {scored.map((c, i) => (
          <li key={c.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-muted-foreground">#{i + 1}</span>
                <Link
                  href={`/roles/${roleId}/candidates/${c.id}`}
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {getCandidateDisplayName(c)}
                </Link>
              </div>
              <span className="font-mono text-lg font-semibold text-foreground">{c.score}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.skills.slice(0, 6).join(", ")}</p>
            <p className="mt-2 text-sm text-foreground">{c.scoreReasoning}</p>
            {comparisons[c.id] && (
              <p className="mt-2 rounded-md bg-primary/5 px-3 py-2 text-sm text-foreground">
                <span className="font-medium text-primary">Vs. the field: </span>
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
    </div>
  );
}
