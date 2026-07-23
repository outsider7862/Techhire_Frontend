import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UploadWidget from "./UploadWidget";
import StageSelect from "./StageSelect";

export default async function RolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;

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
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {role.title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {role.requiredSkills.join(", ")}
        {role.minYearsExperience > 0
          ? ` · ${role.minYearsExperience}+ years`
          : ""}
      </p>

      <div className="mt-8">
        <UploadWidget roleId={role.id} />
      </div>

      <div className="mt-10">
        {role.candidates.length === 0 ? (
          <p className="text-sm text-slate-500">
            No candidates yet — upload resumes above to get started.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-medium">Candidate</th>
                <th className="py-2 font-medium">Score</th>
                <th className="py-2 font-medium">Skills</th>
                <th className="py-2 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {role.candidates.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-3">
                    <div className="font-medium text-slate-900">
                      {c.fileName}
                    </div>
                    {c.status === "FAILED" && (
                      <div className="text-xs text-red-600">
                        {c.errorMessage ?? "Failed to parse"}
                      </div>
                    )}
                    {c.status === "PENDING" && (
                      <div className="text-xs text-slate-400">
                        Processing…
                      </div>
                    )}
                  </td>
                  <td className="py-3">
                    {c.score !== null ? (
                      <span className="font-semibold text-slate-900">
                        {c.score}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-600">
                    {c.skills.slice(0, 5).join(", ")}
                  </td>
                  <td className="py-3">
                    <StageSelect candidateId={c.id} currentStage={c.stage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
