"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRolePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [minYears, setMinYears] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        requiredSkills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        minYearsExperience: minYears,
      }),
    });

    const role = await res.json();
    router.push(`/roles/${role.id}`);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-xl font-semibold text-slate-900">New role</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Backend Engineer"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Required skills (comma separated)
          </label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Python, PostgreSQL, FastAPI"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Minimum years of experience
          </label>
          <input
            type="number"
            min={0}
            value={minYears}
            onChange={(e) => setMinYears(Number(e.target.value))}
            className="mt-1 w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create role"}
        </button>
      </form>
    </main>
  );
}
