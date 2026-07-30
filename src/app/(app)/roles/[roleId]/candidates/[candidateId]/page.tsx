import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NotesSection from "./NotesSection";
import EmailDraftPanel from "./EmailDraftPanel";
import ViewResumeButton from "./ViewResumeButton";
import StageSelect from "../../StageSelect";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCandidateDisplayName } from "@/lib/displayName";

export default async function CandidatePage({
    params,
}: {
    params: Promise<{ roleId: string; candidateId: string }>;
}) {
    const { roleId, candidateId } = await params;

    const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
            role: true,
            notes: {
                orderBy: { createdAt: "desc" },
                include: { author: { select: { name: true } } },
            },
            events: { orderBy: { startTime: "asc" } },
        },
    });

    if (!candidate || candidate.roleId !== roleId) notFound();

    const displayName = getCandidateDisplayName(candidate);
    const upcomingEvents = candidate.events.filter((e) => e.startTime >= new Date());

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <Breadcrumbs
                items={[
                    { label: "Roles", href: "/roles" },
                    { label: candidate.role.title, href: `/roles/${roleId}` },
                    { label: displayName },
                ]}
            />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">{displayName}</h1>
                    <p className="mt-0.5 text-xs text-muted-foreground">{candidate.fileName}</p>
                    {(candidate.email || candidate.phone) && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {[candidate.email, candidate.phone].filter(Boolean).join(" · ")}
                        </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                        {candidate.status === "SCORED"
                            ? `Score: ${candidate.score}`
                            : candidate.status === "FAILED"
                                ? "Failed to parse"
                                : "Processing…"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ViewResumeButton candidateId={candidate.id} />
                    <StageSelect candidateId={candidate.id} currentStage={candidate.stage} />
                </div>
            </div>

            {candidate.status === "FAILED" && (
                <div className="mt-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                    {candidate.errorMessage}
                </div>
            )}

            {candidate.status === "SCORED" && (
                <div className="mt-8 space-y-6">
                    <section>
                        <h2 className="text-sm font-medium text-muted-foreground">Score reasoning</h2>
                        <p className="mt-1 text-sm text-foreground">{candidate.scoreReasoning}</p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-muted-foreground">Summary</h2>
                        <p className="mt-1 text-sm text-foreground">{candidate.summary}</p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-muted-foreground">Skills</h2>
                        <p className="mt-1 text-sm text-foreground">
                            {candidate.skills.join(", ") || "—"}
                        </p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-muted-foreground">Tech stack</h2>
                        <p className="mt-1 text-sm text-foreground">
                            {candidate.techStack.join(", ") || "—"}
                        </p>
                    </section>
                    <section>
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Years of experience
                        </h2>
                        <p className="mt-1 text-sm text-foreground">
                            {candidate.yearsExperience ?? "—"}
                        </p>
                    </section>
                </div>
            )}

            <div className="mt-10 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">
                        Upcoming interviews
                    </h2>
                    <Link
                        href={`/calendar?candidateId=${candidate.id}`}
                        className="text-sm text-primary hover:underline"
                    >
                        + Schedule
                    </Link>
                </div>
                {upcomingEvents.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">Nothing scheduled.</p>
                ) : (
                    <ul className="mt-2 space-y-2">
                        {upcomingEvents.map((event) => (
                            <li key={event.id} className="text-sm text-foreground">
                                <span className="font-medium">{event.title}</span>{" "}
                                <span className="text-muted-foreground">
                                    —{" "}
                                    {new Date(event.startTime).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-10">
                <EmailDraftPanel candidateId={candidate.id} candidateEmail={candidate.email} />
            </div>

            <div className="mt-10">
                <NotesSection candidateId={candidate.id} initialNotes={candidate.notes} />
            </div>
        </main>
    );
}
