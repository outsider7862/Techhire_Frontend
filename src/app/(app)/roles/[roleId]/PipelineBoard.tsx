"use client";

import { getCandidateDisplayName } from "@/lib/displayName";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useDraggable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

type Candidate = {
    id: string;
    fileName: string;
    name: string | null;
    score: number | null;
    skills: string[];
    status: string;
    errorMessage: string | null;
    stage: string;
};

const STAGES = [
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "HIRED",
] as const;

const STAGE_LABELS: Record<string, string> = {
    APPLIED: "Applied",
    SCREENING: "Screening",
    INTERVIEW: "Interview",
    OFFER: "Offer",
    REJECTED: "Rejected",
    HIRED: "Hired",
};

function CardBody({ candidate }: { candidate: Candidate }) {
    return (
        <>
            <p className="truncate text-sm font-medium text-foreground">
                {getCandidateDisplayName(candidate)}
            </p>
            <div className="mt-1 flex items-center justify-between">
                {candidate.score !== null ? (
                    <span className="font-mono text-sm font-semibold text-foreground">
                        {candidate.score}
                    </span>
                ) : candidate.status === "FAILED" ? (
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                        Failed
                    </span>
                ) : (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        Processing…
                    </span>
                )}
            </div>
            {candidate.skills.length > 0 && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                    {candidate.skills.slice(0, 3).join(", ")}
                </p>
            )}
        </>
    );
}

function DraggableCard({
    candidate,
    roleId,
    onDelete,
}: {
    candidate: Candidate;
    roleId: string;
    onDelete: (id: string) => void;
}) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: candidate.id });

    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => {
                // Card is a div, not an <a> — deliberate, so it isn't a
                // draggable element nested inside a second interactive
                // element (bad for keyboard/screen-reader tab order).
                if (!isDragging) {
                    router.push(`/roles/${roleId}/candidates/${candidate.id}`);
                }
            }}
            className={`group relative cursor-pointer rounded-md border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${isDragging ? "opacity-50" : ""
                }`}
        >
            {/* stopPropagation so deleting doesn't start a drag or open the card */}
            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(candidate.id);
                }}
                aria-label="Delete candidate"
                className="absolute right-1.5 top-1.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M10 11v6M14 11v6" />
                </svg>
            </button>
            <CardBody candidate={candidate} />
        </div>
    );
}

function Column({
    stage,
    candidates,
    roleId,
    onDelete,
}: {
    stage: string;
    candidates: Candidate[];
    roleId: string;
    onDelete: (id: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: stage });

    return (
        <div
            ref={setNodeRef}
            className={`flex w-64 shrink-0 flex-col rounded-lg border p-2 transition-colors ${isOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                }`}
        >
            <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {STAGE_LABELS[stage]}
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {candidates.length}
                </span>
            </div>
            <div className="flex min-h-16 flex-col gap-2">
                {candidates.map((c) => (
                    <DraggableCard key={c.id} candidate={c} roleId={roleId} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
}

export default function PipelineBoard({
    roleId,
    initialCandidates,
}: {
    roleId: string;
    initialCandidates: Candidate[];
}) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [candidates, setCandidates] = useState(initialCandidates);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const candidateId = active.id as string;
        const newStage = over.id as string;
        const candidate = candidates.find((c) => c.id === candidateId);
        if (!candidate || candidate.stage === newStage) return;

        const previous = candidates;
        setCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
        );

        try {
            const res = await fetch(`/api/candidates/${candidateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stage: newStage }),
            });
            if (!res.ok) throw new Error("Failed to update stage");
            router.refresh();
        } catch {
            setCandidates(previous);
            toast.error("Couldn't move the candidate — please try again.");
        }
    }

    async function handleDelete(candidateId: string) {
        const ok = await confirm({
            title: "Delete candidate?",
            body: "Their resume, notes, and scheduled interviews are removed too. This can't be undone.",
            confirmText: "Delete",
            destructive: true,
        });
        if (!ok) return;

        const previous = candidates;
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
        try {
            const res = await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Candidate deleted.");
            router.refresh();
        } catch {
            setCandidates(previous);
            toast.error("Couldn't delete the candidate — please try again.");
        }
    }

    const activeCandidate = candidates.find((c) => c.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-3 overflow-x-auto pb-4">
                {STAGES.map((stage) => (
                    <Column
                        key={stage}
                        stage={stage}
                        candidates={candidates.filter((c) => c.stage === stage)}
                        roleId={roleId}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeCandidate ? (
                    <div className="w-60 rounded-md border border-primary bg-card p-3 shadow-lg">
                        <CardBody candidate={activeCandidate} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}