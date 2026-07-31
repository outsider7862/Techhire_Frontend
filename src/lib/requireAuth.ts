import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Call at the top of any API route that should only be reachable by a
 * logged-in recruiter. Uses getUser() (not getSession()) deliberately —
 * getUser() revalidates the token against Supabase's auth server;
 * getSession() only reads local cookie data, which is not sufficient
 * for a real security check.
 */
export async function requireAuth() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { user, error: null };
}
