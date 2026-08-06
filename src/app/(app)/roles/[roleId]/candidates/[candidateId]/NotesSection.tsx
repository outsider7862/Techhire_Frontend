"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";

type Note = {
    id: string;
    body: string;
    createdAt: string | Date;
    authorId: string | null;
    author: { name: string } | null;
};

export default function NotesSection({
    candidateId,
    initialNotes,
    currentUserId,
}: {
    candidateId: string;
    initialNotes: Note[];
    currentUserId: string;
}) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [notes, setNotes] = useState(initialNotes);
    const [draft, setDraft] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState("");

    async function handleAdd() {
        if (!draft.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/candidates/${candidateId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: draft }),
            });
            if (!res.ok) throw new Error();
            const note = await res.json();
            setNotes([note, ...notes]);
            setDraft("");
            router.refresh();
        } catch {
            toast.error("Couldn't add the note — please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSaveEdit(id: string) {
        if (!editDraft.trim()) return;
        try {
            const res = await fetch(`/api/candidates/${candidateId}/notes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: editDraft }),
            });
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, body: updated.body } : n)));
            setEditingId(null);
            router.refresh();
        } catch {
            toast.error("Couldn't save the note — please try again.");
        }
    }

    async function handleDelete(id: string) {
        const ok = await confirm({
            title: "Delete note?",
            confirmText: "Delete",
            destructive: true,
        });
        if (!ok) return;
        const previous = notes;
        setNotes((prev) => prev.filter((n) => n.id !== id));
        try {
            const res = await fetch(`/api/candidates/${candidateId}/notes/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error();
            router.refresh();
        } catch {
            setNotes(previous);
            toast.error("Couldn't delete the note — please try again.");
        }
    }

    return (
        <section>
            <h2 className="text-sm font-medium text-muted-foreground">Notes</h2>
            <div className="mt-2 flex gap-2">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Add a note…"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <button
                    onClick={handleAdd}
                    disabled={submitting}
                    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    Add
                </button>
            </div>
            <ul className="mt-4 space-y-3">
                {notes.length === 0 && (
                    <li className="text-sm text-muted-foreground">No notes yet.</li>
                )}
                {notes.map((note) => {
                    const mine = note.authorId === currentUserId;
                    if (editingId === note.id) {
                        return (
                            <li key={note.id} className="flex gap-2">
                                <input
                                    value={editDraft}
                                    autoFocus
                                    onChange={(e) => setEditDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEdit(note.id);
                                        if (e.key === "Escape") setEditingId(null);
                                    }}
                                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                />
                                <button
                                    onClick={() => handleSaveEdit(note.id)}
                                    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                    Cancel
                                </button>
                            </li>
                        );
                    }
                    return (
                        <li key={note.id} className="group flex items-start justify-between gap-2 text-sm text-foreground">
                            <div className="min-w-0">
                                <span>{note.body}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {note.author ? `${note.author.name} · ` : ""}
                                    {new Date(note.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {mine && (
                                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => {
                                            setEditingId(note.id);
                                            setEditDraft(note.body);
                                        }}
                                        className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
