import { createClient } from "@supabase/supabase-js";

// Browser-side client — anon key only, never the service role key. This
// is the client that actually PUTs file bytes to Supabase Storage using
// the signed token our API route generated, which is what lets a 100-file
// upload bypass Vercel's 4.5MB function payload limit entirely: the
// bytes go straight from the browser to storage, never through Next.js.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RESUME_BUCKET = "resumes";

export async function uploadResumeToSignedUrl(
  path: string,
  token: string,
  file: File
) {
  const { error } = await supabaseBrowser.storage
    .from(RESUME_BUCKET)
    .uploadToSignedUrl(path, token, file);

  if (error) throw error;
}
