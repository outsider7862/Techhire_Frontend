import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Handles the link a user clicks in a Supabase email (signup confirmation and
 * password recovery). Supports both delivery formats so it works regardless of
 * how the project's email templates are configured:
 *
 *   - PKCE flow (default templates): the link returns with `?code=...`, which
 *     we exchange for a session via exchangeCodeForSession.
 *   - OTP flow (templates customized to send {{ .TokenHash }}): the link
 *     returns with `token_hash` + `type`, which we verify via verifyOtp.
 *
 * On success we redirect to `next` (e.g. /reset-password for recovery); on
 * failure, back to /login with an error.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/roles";

    const supabase = await createClient();

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            redirect(next);
        }
    } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });
        if (!error) {
            redirect(next);
        }
    }

    redirect("/login?error=Could not verify email — the link may have expired.");
}
