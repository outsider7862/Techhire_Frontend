"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "HIRED",
] as const;

export default function StageSelect({
  candidateId,
  currentStage,
}: {
  candidateId: string;
  currentStage: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState(currentStage);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStage: string) {
    const previousStage = stage;
    setStage(newStage);
    setSaving(true);

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      router.refresh();
    } catch {
      setStage(previousStage);
      alert("Couldn't update the stage — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={stage}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
