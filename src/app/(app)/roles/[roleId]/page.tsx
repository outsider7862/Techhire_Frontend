import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UploadWidget from "./UploadWidget";
import PipelineBoard from "./PipelineBoard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveStaleBatchesForRole } from "@/lib/staleBatches";

export default async function RolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;

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

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
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

      <div className="mt-8">
        {role.candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No candidates yet — upload resumes above to get started.
          </div>
        ) : (
          <PipelineBoard roleId={role.id} initialCandidates={role.candidates} />
        )}
      </div>
    </main>
  );
}