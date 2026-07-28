"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Note = { id: string; body: string; createdAt: string | Date };

export default function NotesSection({
    candidateId,
    initialNotes,
}: {
    candidateId: string;
    initialNotes: Note[];
}) {
    const router = useRouter();
    const [notes, setNotes] = useState(initialNotes);
    const [draft, setDraft] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleAdd() {
        if (!draft.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch(`/api/candidates/${candidateId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: draft }),
            });
            if (!res.ok) throw new Error("Failed to add note");
            const note = await res.json();

            setNotes([note, ...notes]);
            setDraft("");
            router.refresh();
        } catch {
            alert("Couldn't add the note — please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section>
            <h2 className="text-sm font-medium text-slate-500">Notes</h2>
            <div className="mt-2 flex gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Add a note…"
                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                    onClick={handleAdd}
                    disabled={submitting}
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    Add
                </button>
            </div>
            <ul className="mt-4 space-y-3">
                {notes.length === 0 && (
                    <li className="text-sm text-slate-400">No notes yet.</li>
                )}
                {notes.map((note) => (
                    <li key={note.id} className="text-sm text-slate-700">
                        {note.body}
                        <span className="ml-2 text-xs text-slate-400">
                            {new Date(note.createdAt).toLocaleString()}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}