"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import PasswordInput from "@/components/ui/PasswordInput";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }, // becomes raw_user_meta_data.name — read by the trigger in Part E
                emailRedirectTo: `${window.location.origin}/auth/confirm?next=/roles`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSent(true);
        setLoading(false);
    }

    if (sent) {
        return (
            <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 text-center">
                <p className="text-sm text-foreground">
                    Check your email to confirm your account before signing in.
                </p>
            </main>
        );
    }

    return (
        <main className="animate-rise mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
            <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground shadow-sm">
                    TH
                </span>
                <span className="font-semibold text-foreground">TechHire</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Create an account</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                <PasswordInput
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (8+ characters)"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Creating…" : "Create account"}
                </button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </main>
    );
}
