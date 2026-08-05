"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCandidateButton({
    candidateId,
    roleId,
}: {
    candidateId: string;
    roleId: string;
}) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (
            !confirm(
                "Delete this candidate? Their resume, notes, and scheduled interviews are removed too. This can't be undone."
            )
        ) {
            return;
        }
        setDeleting(true);
        try {
            const res = await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            router.push(`/roles/${roleId}`);
            router.refresh();
        } catch {
            alert("Couldn't delete the candidate — please try again.");
            setDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete candidate"
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
            <svg
                width="15"
                height="15"
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
            {deleting ? "Deleting…" : "Delete"}
        </button>
    );
}
