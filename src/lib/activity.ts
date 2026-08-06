import { prisma } from "@/lib/prisma";

/**
 * Best-effort append to a candidate's activity feed. Never throws — an audit
 * line failing must not break the action it's recording.
 */
export async function logActivity(
    teamId: string,
    candidateId: string,
    actorName: string,
    message: string
) {
    try {
        await prisma.activity.create({
            data: { teamId, candidateId, actorName, message },
        });
    } catch {
        // ignore — audit only
    }
}
