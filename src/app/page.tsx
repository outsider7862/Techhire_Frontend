import Link from "next/link";

const STEPS = [
  {
    title: "Create a role",
    body: "Define required skills, experience level, and a short description for the position you're hiring for.",
  },
  {
    title: "Upload resumes",
    body: "Drop in resumes one at a time or in bulk — up to 100 at once, parsed and scored in the background.",
  },
  {
    title: "Review ranked candidates",
    body: "Each resume is parsed and semantically scored against the role, then ranked so you review the strongest matches first.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          TechHire Copilot
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          AI-powered resume screening for technical hiring. Parses and
          semantically scores every resume against a role&apos;s actual
          requirements — not just keyword matches — so you spend your time
          on the candidates who are genuinely worth a look.
        </p>
        <Link
          href="/roles"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View roles
        </Link>
      </div>

      <div className="mt-20 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-lg border border-border bg-card p-5"
          >
            <span className="font-mono text-xs font-medium text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-2 font-medium text-foreground">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}