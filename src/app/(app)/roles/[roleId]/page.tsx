import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UploadWidget from "./UploadWidget";
import StageSelect from "./StageSelect";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveStaleBatchesForRole } from "@/lib/staleBatches";

const STATUS_STYLES: Record<string, string> = {
  FAILED: "bg-destructive/10 text-destructive",
  PENDING: "bg-muted text-muted-foreground",
};

const STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "HIRED",
] as const;

export default async function RolePage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const { roleId } = await params;
  const { stage: stageFilter } = await searchParams;

  await resolveStaleBatchesForRole(roleId);

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      candidates: {
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!role) notFound();

  const stageCounts = Object.fromEntries(
    STAGES.map((s) => [s, role.candidates.filter((c) => c.stage === s).length])
  );
  const visibleCandidates = stageFilter
    ? role.candidates.filter((c) => c.stage === stageFilter)
    : role.candidates;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Breadcrumbs
        items={[{ label: "Roles", href: "/roles" }, { label: role.title }]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {role.title}
        </h1>
        <Link
          href={`/roles/${role.id}/edit`}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          Edit role
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {role.requiredSkills.join(", ")}
        {role.minYearsExperience > 0
          ? ` · ${role.minYearsExperience}+ years`
          : ""}
      </p>

      <div className="mt-8">
        <UploadWidget roleId={role.id} />
      </div>

      {role.candidates.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={`/roles/${role.id}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!stageFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
          >
            All ({role.candidates.length})
          </Link>
          {STAGES.map((s) => (
            <Link
              key={s}
              href={`/roles/${role.id}?stage=${s}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${stageFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()} ({stageCounts[s]})
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        {visibleCandidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {role.candidates.length === 0
              ? "No candidates yet — upload resumes above to get started."
              : "No candidates in this stage."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Candidate</th>
                  <th className="px-4 py-2.5 font-medium">Score</th>
                  <th className="px-4 py-2.5 font-medium">Skills</th>
                  <th className="px-4 py-2.5 font-medium">Stage</th>
                </tr>
              </thead>
              <tbody>
                {visibleCandidates.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/roles/${role.id}/candidates/${c.id}`}
                        className="font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        {c.fileName}
                      </Link>
                      {(c.status === "FAILED" || c.status === "PENDING") && (
                        <div
                          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[c.status]}`}
                        >
                          {c.status === "FAILED"
                            ? c.errorMessage ?? "Failed to parse"
                            : "Processing…"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.score !== null ? (
                        <span className="font-mono text-base font-semibold text-foreground">
                          {c.score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.skills.slice(0, 5).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <StageSelect candidateId={c.id} currentStage={c.stage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}