"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";

export default function RemoveMemberButton({
    memberId,
    memberName,
}: {
    memberId: string;
    memberName: string;
}) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [busy, setBusy] = useState(false);

    async function handleRemove() {
        const ok = await confirm({
            title: `Remove ${memberName}?`,
            body: "They'll lose access to this team's roles and candidates.",
            confirmText: "Remove",
            destructive: true,
        });
        if (!ok) return;

        setBusy(true);
        try {
            const res = await fetch("/api/team/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId }),
            });
            if (!res.ok) throw new Error();
            toast.success(`Removed ${memberName}.`);
            router.refresh();
        } catch {
            toast.error("Couldn't remove the member — please try again.");
            setBusy(false);
        }
    }

    return (
        <button
            onClick={handleRemove}
            disabled={busy}
            aria-label={`Remove ${memberName}`}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
            {busy ? "Removing…" : "Remove"}
        </button>
    );
}
