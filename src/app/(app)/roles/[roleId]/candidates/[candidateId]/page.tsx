import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NotesSection from "./NotesSection";
import StageSelect from "../../StageSelect";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function CandidatePage({
    params,
}: {
    params: Promise<{ roleId: string; candidateId: string }>;
}) {
    const { roleId, candidateId } = await params;

    const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { role: true, notes: { orderBy: { createdAt: "desc" } } },
    });

    if (!candidate || candidate.roleId !== roleId) notFound();

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <Breadcrumbs
                items={[
                    { label: "Roles", href: "/roles" },
                    { label: candidate.role.title, href: `/roles/${roleId}` },
                    { label: candidate.fileName },
                ]}
            />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        {candidate.fileName}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {candidate.status === "SCORED"
                            ? `Score: ${candidate.score}`
                            : candidate.status === "FAILED"
                                ? "Failed to parse"
                                : "Processing…"}
                    </p>
                </div>
                <StageSelect candidateId={candidate.id} currentStage={candidate.stage} />
            </div>

            {candidate.status === "FAILED" && (
                <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
                    {candidate.errorMessage}
                </div>
            )}

            {candidate.status === "SCORED" && (
                <div className="mt-8 space-y-6">
                    <section>
                        <h2 className="text-sm font-medium text-slate-500">Score reasoning</h2>
                        <p className="mt-1 text-sm text-slate-800">{candidate.scoreReasoning}</p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-slate-500">Summary</h2>
                        <p className="mt-1 text-sm text-slate-800">{candidate.summary}</p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-slate-500">Skills</h2>
                        <p className="mt-1 text-sm text-slate-800">
                            {candidate.skills.join(", ") || "—"}
                        </p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-slate-500">Tech stack</h2>
                        <p className="mt-1 text-sm text-slate-800">
                            {candidate.techStack.join(", ") || "—"}
                        </p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-slate-500">
                            Years of experience
                        </h2>
                        <p className="mt-1 text-sm text-slate-800">
                            {candidate.yearsExperience ?? "—"}
                        </p>
                    </section>
                </div>
            )}

            <div className="mt-10">
                <NotesSection candidateId={candidate.id} initialNotes={candidate.notes} />
            </div>
        </main>
    );
}