import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSignedUploadUrl } from "@/lib/storage";
import { requireTeam } from "@/lib/requireTeam";
import { getRoleForTeam } from "@/lib/teamScoped";

/**
 * POST /api/roles/:roleId/candidates/upload
 * Body: { files: [{ fileName: string }, ...] }
 *
 * This request is intentionally tiny — just filenames, never file bytes —
 * so it never comes close to Vercel's 4.5MB function payload limit, no
 * matter how many resumes are in the batch (tested up to 100). It creates
 * one pending Candidate row per file and a Batch row to track progress,
 * then hands back a signed upload URL per file. The browser uploads the
 * actual bytes directly to Supabase Storage from here — this route is
 * never involved in that part.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { roleId } = await params;
  // Confirms the target role belongs to the caller's team before anyone
  // can upload resumes into it (also covers the not-found case, as 404).
  const { error: roleError } = await getRoleForTeam(roleId, teamId);
  if (roleError) return roleError;

  const body = await req.json();
  const files: { fileName: string }[] = body.files ?? [];

  const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
  const MAX_BATCH_SIZE = 150; // keep in sync with backend's MAX_BATCH_SIZE

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  if (files.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Batch of ${files.length} exceeds the ${MAX_BATCH_SIZE}-file limit` },
      { status: 400 }
    );
  }

  const invalidFiles = files.filter((f) => {
    const ext = f.fileName.slice(f.fileName.lastIndexOf(".")).toLowerCase();
    return !ALLOWED_EXTENSIONS.includes(ext);
  });
  if (invalidFiles.length > 0) {
    return NextResponse.json(
      {
        error: `Unsupported file type(s): ${invalidFiles
          .map((f) => f.fileName)
          .join(", ")}`,
      },
      { status: 400 }
    );
  }

  const batch = await prisma.batch.create({
    data: { roleId, total: files.length },
  });

  const uploads = await Promise.all(
    files.map(async ({ fileName }) => {
      const candidate = await prisma.candidate.create({
        data: {
          roleId,
          batchId: batch.id,
          fileName,
          fileUrl: "", // filled in below once we know the storage path
        },
      });

      const storagePath = `${roleId}/${batch.id}/${candidate.id}-${fileName}`;
      const signed = await createSignedUploadUrl(storagePath);

      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { fileUrl: signed.path },
      });

      return {
        candidateId: candidate.id,
        fileName,
        path: signed.path,
        token: signed.token,
        signedUrl: signed.signedUrl,
      };
    })
  );

  return NextResponse.json({ batchId: batch.id, uploads });
}
