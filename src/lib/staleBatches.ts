import { prisma } from "@/lib/prisma";

const STALE_BATCH_TIMEOUT_MINUTES = 10;

/**
 * Marks a batch as resolved (failing out any still-PENDING candidates)
 * if it's been "processing" longer than a reasonable window with no
 * completion. This is what stops a dead FastAPI connection — or any
 * other silent failure — from leaving candidates stuck on "Processing…"
 * forever, as happened during local testing when uvicorn wasn't
 * running. Self-heals the next time this batch is polled or its role's
 * page is loaded, rather than needing a background job.
 */
export async function resolveIfStale(batchId: string) {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch || batch.status !== "processing") return;

    const ageMinutes = (Date.now() - batch.createdAt.getTime()) / 60000;
    if (ageMinutes < STALE_BATCH_TIMEOUT_MINUTES) return;

    await prisma.candidate.updateMany({
        where: { batchId: batch.id, status: "PENDING" },
        data: {
            status: "FAILED",
            errorMessage:
                "Processing timed out — the parsing service may have been unreachable.",
        },
    });

    await prisma.batch.update({
        where: { id: batch.id },
        data: { status: "complete" },
    });
}

/**
 * Same check applied to every currently-"processing" batch for a role —
 * used when loading a role page, so a stuck batch resolves even if
 * nobody was actively polling it at the time.
 */
export async function resolveStaleBatchesForRole(roleId: string) {
    const staleBatches = await prisma.batch.findMany({
        where: { roleId, status: "processing" },
        select: { id: true },
    });
    await Promise.all(staleBatches.map((b) => resolveIfStale(b.id)));
}