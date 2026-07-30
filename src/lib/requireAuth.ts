import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Call at the top of any API route that should only be reachable by a
 * logged-in recruiter. This is the real enforcement boundary — checked
 * explicitly per-route, not relied on via middleware alone (see
 * CVE-2025-29927: middleware-only session checks in Next.js have a
 * known bypass).
 *
 * Deliberately NOT used on the two webhook routes FastAPI calls back
 * into (candidate-result, batch complete) — those aren't reachable by
 * a logged-in browser at all, and already have their own
 * PARSING_SERVICE_TOKEN check, which is the correct mechanism for
 * service-to-service calls.
 */
export async function requireAuth() {
    const session = await auth();
    if (!session?.user) {
        return {
            session: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { session, error: null };
}