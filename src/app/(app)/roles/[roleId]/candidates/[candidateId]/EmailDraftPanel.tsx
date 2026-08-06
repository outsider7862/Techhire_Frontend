"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

type Draft = { subject: string; body: string };
type EmailType = "interview_invite" | "rejection" | "status_update" | "offer";

const EMAIL_TYPES: { value: EmailType; label: string }[] = [
    { value: "interview_invite", label: "Interview invite" },
    { value: "rejection", label: "Rejection" },
    { value: "status_update", label: "Status update" },
    { value: "offer", label: "Offer" },
];

export default function EmailDraftPanel({
    candidateId,
    candidateEmail,
}: {
    candidateId: string;
    candidateEmail?: string | null;
}) {
    const toast = useToast();
    const [emailType, setEmailType] = useState<EmailType>("interview_invite");
    const [draft, setDraft] = useState<Draft | null>(null);
    const [instruction, setInstruction] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    async function generate(isRevision: boolean) {
        setLoading(true);
        setCopied(false);
        try {
            const res = await fetch(`/api/candidates/${candidateId}/draft-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailType,
                    instruction: isRevision ? instruction : undefined,
                    previousDraft: isRevision ? draft : undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Couldn't draft the email — please try again.");
            }
            setDraft(await res.json());
            setInstruction("");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't draft the email — please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy() {
        if (!draft) return;
        await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Draft an email</h2>
            {candidateEmail ? (
                <p className="mt-1 text-xs text-muted-foreground">To: {candidateEmail}</p>
            ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                    No email extracted for this candidate — you&apos;ll need to add the recipient yourself.
                </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value as EmailType)}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground"
                >
                    {EMAIL_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => generate(false)}
                    disabled={loading}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Drafting…" : draft ? "Regenerate" : "Draft email"}
                </button>
            </div>

            {draft && (
                <div className="mt-4 space-y-3">
                    <input
                        value={draft.subject}
                        onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                    />
                    <textarea
                        value={draft.body}
                        onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                        rows={10}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && instruction && generate(true)}
                            placeholder="e.g. make it warmer, or shorten this"
                            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                        <button
                            onClick={() => generate(true)}
                            disabled={loading || !instruction.trim()}
                            className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                            Revise
                        </button>
                        <button
                            onClick={handleCopy}
                            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                        >
                            {copied ? "Copied!" : "Copy to clipboard"}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Review before sending — this is a draft, not an automatically sent email.
                    </p>
                </div>
            )}
        </section>
    );
}