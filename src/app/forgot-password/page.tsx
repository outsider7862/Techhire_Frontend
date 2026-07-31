"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
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
                <p className="text-sm text-foreground">Check your email for a password reset link.</p>
            </main>
        );
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
            <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Sending…" : "Send reset link"}
                </button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                    Back to sign in
                </Link>
            </p>
        </main>
    );
}
