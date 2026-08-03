"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamOnboarding() {
    const router = useRouter();
    const [mode, setMode] = useState<"create" | "join">("create");
    const [teamName, setTeamName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/team/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: teamName }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Couldn't create team");
            setLoading(false);
            return;
        }

        router.refresh();
    }

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/team/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ joinCode }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Couldn't join team");
            setLoading(false);
            return;
        }

        router.refresh();
    }

    return (
        <div className="mt-8">
            <div className="flex gap-2">
                <button
                    onClick={() => setMode("create")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "create" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                >
                    Create a team
                </button>
                <button
                    onClick={() => setMode("join")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${mode === "join" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                >
                    Join with a code
                </button>
            </div>

            {mode === "create" ? (
                <form onSubmit={handleCreate} className="mt-4 space-y-3">
                    <input
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Team name"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? "Creating…" : "Create team"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleJoin} className="mt-4 space-y-3">
                    <input
                        required
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="Join code (e.g. TQ7K9X2)"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono text-foreground"
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? "Joining…" : "Join team"}
                    </button>
                </form>
            )}
        </div>
    );
}
