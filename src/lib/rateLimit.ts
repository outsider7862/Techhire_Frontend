import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fixed-window, per-team rate limit backed by Postgres (serverless-safe — no
 * in-memory state). Returns a 429 response if the team has exceeded `limit`
 * calls of `kind` within `windowMs`, otherwise null. Use it to cap
 * cost-bearing AI endpoints so a single team can't run up the OpenAI bill.
 */
export async function enforceRateLimit(
    teamId: string,
    kind: string,
    limit: number,
    windowMs: number
): Promise<NextResponse | null> {
    const now = Date.now();
    const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

    const row = await prisma.rateLimit.upsert({
        where: { teamId_kind_windowStart: { teamId, kind, windowStart } },
        create: { teamId, kind, windowStart, count: 1 },
        update: { count: { increment: 1 } },
    });

    // Best-effort prune of this team+kind's expired windows.
    prisma.rateLimit
        .deleteMany({
            where: { teamId, kind, windowStart: { lt: new Date(now - windowMs) } },
        })
        .catch(() => {});

    if (row.count > limit) {
        const retryAfter = Math.ceil((windowStart.getTime() + windowMs - now) / 1000);
        return NextResponse.json(
            { error: "You're doing that too often — please wait a moment and try again." },
            { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
    }
    return null;
}
