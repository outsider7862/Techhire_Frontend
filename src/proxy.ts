import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Next 16 renamed the `middleware` file convention to `proxy` (the old name
// is deprecated). This only refreshes the Supabase auth session cookie — it
// is not the security boundary; that stays in (app)/layout.tsx and
// requireAuth(), both calling getUser() explicitly.
export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
