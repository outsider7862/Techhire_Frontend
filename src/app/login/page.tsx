"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/roles");
        router.refresh();
    }

    return (
        <main className="animate-rise mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
            <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground shadow-sm">
                    TH
                </span>
                <span className="font-semibold text-foreground">TechHire</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
            <p className="mt-4 flex justify-between text-sm text-muted-foreground">
                <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                </Link>
                <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                </Link>
            </p>
        </main>
    );
}
