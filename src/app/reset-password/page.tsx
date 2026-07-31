"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/roles");
        router.refresh();
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
            <h1 className="text-xl font-semibold text-foreground">Set a new password</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (8+ characters)"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Saving…" : "Save new password"}
                </button>
            </form>
        </main>
    );
}
