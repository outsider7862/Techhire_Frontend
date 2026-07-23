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
    setStage(newStage);
    setSaving(true);
    await fetch(`/api/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={stage}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
