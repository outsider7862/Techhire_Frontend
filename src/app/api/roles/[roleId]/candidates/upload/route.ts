import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSignedUploadUrl } from "@/lib/storage";

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
  const { roleId } = await params;
  const body = await req.json();
  const files: { fileName: string }[] = body.files ?? [];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
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
