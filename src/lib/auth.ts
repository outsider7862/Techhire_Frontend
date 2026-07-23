import { NextRequest, NextResponse } from "next/server";

/**
 * Verifies the shared-secret Bearer token FastAPI sends when calling
 * back into these webhook routes. Deliberately reuses the same
 * PARSING_SERVICE_TOKEN value Next.js sends *to* FastAPI (see
 * lib/parsingService.ts) — one shared secret checked in both
 * directions, rather than juggling two separate tokens across Vercel
 * and Render.
 *
 * Returns a 401/500 NextResponse if verification fails, or null if it
 * passed — the caller should continue as normal in that case.
 */
export function verifyParsingServiceToken(
    req: NextRequest
): NextResponse | null {
    const expected = process.env.PARSING_SERVICE_TOKEN;

    if (!expected) {
        return NextResponse.json(
            { error: "PARSING_SERVICE_TOKEN is not configured on this deployment" },
            { status: 500 }
        );
    }

    if (req.headers.get("authorization") !== `Bearer ${expected}`) {
        return NextResponse.json(
            { error: "Invalid or missing token" },
            { status: 401 }
        );
    }

    return null;
}