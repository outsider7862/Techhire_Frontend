"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Couldn't create account");
            setLoading(false);
            return;
        }

        await signIn("credentials", { email, password, redirect: false });
        router.push("/roles");
        router.refresh();
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
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
                <input
                    type="password"
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
