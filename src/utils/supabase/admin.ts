import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using the service role key — server-only, NEVER expose
 * to the browser. Used exclusively for operations the regular client
 * can't do, like deleting an auth user outright (auth.admin.*).
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}
