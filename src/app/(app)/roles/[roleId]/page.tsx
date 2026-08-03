import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import UploadWidget from "./UploadWidget";
import PipelineBoard from "./PipelineBoard";
import LeaderboardView from "./LeaderboardView";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveStaleBatchesForRole } from "@/lib/staleBatches";

export default async function RolePage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { roleId } = await params;
  const { view } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const callerProfile = await prisma.profile.findUnique({ where: { id: user.id } });

  await resolveStaleBatchesForRole(roleId);

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      candidates: {
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!role || role.teamId !== callerProfile?.teamId) notFound();

  const activeView = view === "leaderboard" ? "leaderboard" : "pipeline";

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Breadcrumbs items={[{ label: "Roles", href: "/roles" }, { label: role.title }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{role.title}</h1>
        <Link
          href={`/roles/${role.id}/edit`}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          Edit role
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {role.requiredSkills.join(", ")}
        {role.minYearsExperience > 0 ? ` · ${role.minYearsExperience}+ years` : ""}
      </p>

      <div className="mt-8">
        <UploadWidget roleId={role.id} />
      </div>

      <div className="mt-8 flex gap-2">
        <Link
          href={`/roles/${role.id}`}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeView === "pipeline"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          Pipeline
        </Link>
        <Link
          href={`/roles/${role.id}?view=leaderboard`}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeView === "leaderboard"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          Leaderboard
        </Link>
      </div>

      <div className="mt-6">
        {role.candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No candidates yet — upload resumes above to get started.
          </div>
        ) : activeView === "leaderboard" ? (
          <LeaderboardView roleId={role.id} candidates={role.candidates} />
        ) : (
          <PipelineBoard roleId={role.id} initialCandidates={role.candidates} />
        )}
      </div>
    </main>
  );
}
