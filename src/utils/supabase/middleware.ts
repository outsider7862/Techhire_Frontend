import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refreshes the auth token if needed and syncs cookies. This is the
    // ONLY thing this middleware does — it does not redirect or gate
    // access. Deliberately not relying on middleware for the actual
    // security decision (see CVE-2025-29927 from the earlier auth
    // work) — that enforcement still lives in (app)/layout.tsx and
    // requireAuth(), both of which call getUser() explicitly.
    await supabase.auth.getUser();

    return supabaseResponse;
}
