"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";

export default function LeaveTeamButton({
    teamName,
    soleOwner,
}: {
    teamName: string;
    soleOwner: boolean;
}) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [leaving, setLeaving] = useState(false);

    async function handleLeave() {
        const ok = await confirm(
            soleOwner
                ? {
                    title: "Leave and delete team?",
                    body: `You're the only member of ${teamName}. Leaving deletes the team and all its roles and candidates. This can't be undone.`,
                    confirmText: "Delete team",
                    destructive: true,
                }
                : {
                    title: `Leave ${teamName}?`,
                    body: "You'll lose access to its roles and candidates until you rejoin with a code.",
                    confirmText: "Leave team",
                    destructive: true,
                }
        );
        if (!ok) return;

        setLeaving(true);
        try {
            const res = await fetch("/api/team/leave", { method: "POST" });
            if (!res.ok) throw new Error();
            toast.success("You left the team.");
            router.refresh();
        } catch {
            toast.error("Couldn't leave the team — please try again.");
            setLeaving(false);
        }
    }

    return (
        <button
            onClick={handleLeave}
            disabled={leaving}
            className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
            {leaving ? "Leaving…" : "Leave team"}
        </button>
    );
}
