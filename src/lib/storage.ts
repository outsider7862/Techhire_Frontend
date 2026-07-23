import { createClient } from "@supabase/supabase-js";

const RESUME_BUCKET = "resumes";

// Service-role client: server-only, bypasses RLS. Since Prisma (not the
// Supabase client) owns all authorization logic in this project, RLS
// policies aren't the access-control layer here — never expose this
// client or the service role key to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Creates a short-lived signed URL the browser can upload a single file
 * to directly, bypassing this Next.js server (and Vercel's 4.5MB function
 * body limit) entirely for the actual file bytes.
 */
export async function createSignedUploadUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;

  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}

/**
 * Server-side signed *read* URL, used when handing a stored resume off
 * to the FastAPI service for parsing (also time-limited, not public).
 */
export async function createSignedReadUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}
