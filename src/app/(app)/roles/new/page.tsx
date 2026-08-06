"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/components/ui/toast";
import ScoringEmphasisSlider from "@/components/ScoringEmphasisSlider";

export default function NewRolePage() {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [minYears, setMinYears] = useState(0);
  const [skillsWeight, setSkillsWeight] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
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
          skillsWeight,
        }),
      });
      if (!res.ok) throw new Error("Failed to create role");
      const role = await res.json();
      router.push(`/roles/${role.id}`);
    } catch {
      toast.error("Couldn't create the role — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Breadcrumbs
        items={[{ label: "Roles", href: "/roles" }, { label: "New role" }]}
      />
      <h1 className="text-xl font-semibold text-foreground">New role</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Backend Engineer"
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Required skills (comma separated)
          </label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Python, PostgreSQL, FastAPI"
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Minimum years of experience
          </label>
          <input
            type="number"
            min={0}
            value={minYears}
            onChange={(e) => setMinYears(Number(e.target.value))}
            className="mt-1 w-32 rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <ScoringEmphasisSlider value={skillsWeight} onChange={setSkillsWeight} />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create role"}
        </button>
      </form>
    </main>
  );
}
