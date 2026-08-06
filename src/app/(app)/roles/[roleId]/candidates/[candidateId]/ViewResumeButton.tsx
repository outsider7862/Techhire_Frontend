"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function ViewResumeButton({ candidateId }: { candidateId: string }) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    async function handleClick() {
        setLoading(true);
        try {
            const res = await fetch(`/api/candidates/${candidateId}/resume-url`);
            if (!res.ok) throw new Error("Failed to get resume link");
            const { url } = await res.json();
            window.open(url, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("Couldn't open the resume — please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
            {loading ? "Opening…" : "View resume"}
        </button>
    );
}
