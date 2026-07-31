"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Avatar from "@/components/Avatar";

type User = { id: string; name: string; email: string; createdAt: string | Date };

export default function ProfileForm({ user }: { user: User }) {
    const router = useRouter();
    const [name, setName] = useState(user.name);
    const [savingName, setSavingName] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [deleting, setDeleting] = useState(false);

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault();
        setSavingName(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error();
            router.refresh();
        } catch {
            alert("Couldn't save your name — please try again.");
        } finally {
            setSavingName(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setSavingPassword(true);
        setPasswordError("");
        setPasswordSuccess(false);

        const res = await fetch("/api/profile/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!res.ok) {
            const data = await res.json();
            setPasswordError(data.error ?? "Couldn't change password");
            setSavingPassword(false);
            return;
        }

        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setSavingPassword(false);
    }

    async function handleDelete() {
        if (
            !confirm(
                "Delete your account permanently? This can't be undone. Your notes will remain but show no author."
            )
        ) {
            return;
        }
        setDeleting(true);
        await fetch("/api/profile", { method: "DELETE" });
        await signOut({ callbackUrl: "/login" });
    }

    return (
        <div className="mt-8 space-y-8">
            <section className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="lg" />
                    <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSaveName} className="mt-4 flex gap-2">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <button
                        type="submit"
                        disabled={savingName || !name.trim()}
                        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {savingName ? "Saving…" : "Save name"}
                    </button>
                </form>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-medium text-muted-foreground">Change password</h2>
                <form onSubmit={handleChangePassword} className="mt-3 space-y-3">
                    <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <input
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (8+ characters)"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-primary">Password updated.</p>}
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {savingPassword ? "Updating…" : "Update password"}
                    </button>
                </form>
            </section>

            <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <h2 className="text-sm font-medium text-destructive">Danger zone</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Permanently delete your account. This cannot be undone.
                </p>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="mt-3 rounded-md border border-destructive px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                    {deleting ? "Deleting…" : "Delete my account"}
                </button>
            </section>
        </div>
    );
}
