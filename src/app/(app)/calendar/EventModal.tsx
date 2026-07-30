"use client";

import { useEffect, useState } from "react";

import { getCandidateDisplayName } from "@/lib/displayName";

type Candidate = { id: string; fileName: string; name: string | null; role: { title: string } };

type ModalState =
    | { mode: "create"; start: Date; end: Date; candidateId?: string }
    | { mode: "edit"; eventId: string };

function toLocalInputValue(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
}

export default function EventModal({
    state,
    onClose,
}: {
    state: ModalState;
    onClose: (didChange: boolean) => void;
}) {
    // In create mode the form is seeded straight from props. Edit mode starts
    // blank and is filled in by the fetch below. CalendarView keys this
    // component on the event identity, so a different event remounts it and
    // these initializers run again.
    const [title, setTitle] = useState("");
    const [start, setStart] = useState(() =>
        state.mode === "create" ? toLocalInputValue(state.start) : ""
    );
    const [end, setEnd] = useState(() =>
        state.mode === "create" ? toLocalInputValue(state.end) : ""
    );
    const [notes, setNotes] = useState("");
    const [candidateId, setCandidateId] = useState(() =>
        state.mode === "create" ? state.candidateId ?? "" : ""
    );
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(state.mode === "edit");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/candidates/search")
            .then((res) => res.json())
            .then(setCandidates);
    }, []);

    // Edit mode only — create mode is already seeded from props above.
    useEffect(() => {
        if (state.mode !== "edit") return;
        fetch(`/api/events/${state.eventId}`)
            .then((res) => res.json())
            .then((event) => {
                setTitle(event.title);
                setStart(toLocalInputValue(new Date(event.startTime)));
                setEnd(toLocalInputValue(new Date(event.endTime)));
                setNotes(event.notes ?? "");
                setCandidateId(event.candidateId);
                setLoading(false);
            });
    }, [state]);

    async function handleSave() {
        setSaving(true);
        const body = {
            title,
            startTime: new Date(start).toISOString(),
            endTime: new Date(end).toISOString(),
            notes: notes || null,
            candidateId,
        };

        const url = state.mode === "create" ? "/api/events" : `/api/events/${state.eventId}`;
        const method = state.mode === "create" ? "POST" : "PATCH";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.status === 409) {
            const { conflicts } = await res.json();
            const names = conflicts.map((c: { title: string }) => c.title).join(", ");
            const proceed = confirm(`This overlaps with: ${names}. Save anyway?`);
            if (proceed) {
                await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...body, force: true }),
                });
                onClose(true);
            }
            setSaving(false);
            return;
        }

        if (!res.ok) {
            alert("Couldn't save the event — please try again.");
            setSaving(false);
            return;
        }

        onClose(true);
    }

    async function handleDelete() {
        if (state.mode !== "edit") return;
        if (!confirm("Delete this event?")) return;
        await fetch(`/api/events/${state.eventId}`, { method: "DELETE" });
        onClose(true);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl">
                <h2 className="text-lg font-semibold text-foreground">
                    {state.mode === "create" ? "New event" : "Edit event"}
                </h2>

                {loading ? (
                    <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Event title"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                            />
                            <input
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                            />
                        </div>
                        <select
                            value={candidateId}
                            onChange={(e) => setCandidateId(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        >
                            <option value="">Select a candidate…</option>
                            {candidates.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {getCandidateDisplayName(c)} — {c.role.title}
                                </option>
                            ))}
                        </select>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notes (optional)"
                            rows={3}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                    </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                    <div>
                        {state.mode === "edit" && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onClose(false)}
                            className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !title || !candidateId || loading}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}