import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";
import { getCandidateForTeam } from "@/lib/teamScoped";
import { deleteStoredFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { candidateId } = await params;
  const { error: candErr } = await getCandidateForTeam(candidateId, teamId);
  if (candErr) return candErr;

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      role: true,
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json(candidate);
}

/**
 * PATCH /api/candidates/:candidateId
 * Body: { stage: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED" | "HIRED" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { user, teamId, error } = await requireTeam();
  if (error) return error;

  const { candidateId } = await params;
  const { candidate: existing, error: candErr } = await getCandidateForTeam(candidateId, teamId);
  if (candErr) return candErr;

  const { stage } = await req.json();
  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { stage },
  });

  if (stage && stage !== existing.stage) {
    const actor = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { name: true },
    });
    const pretty = stage.charAt(0) + stage.slice(1).toLowerCase();
    await logActivity(teamId, candidateId, actor?.name ?? "Someone", `moved to ${pretty}`);
  }

  return NextResponse.json(candidate);
}

/**
 * DELETE /api/candidates/:candidateId
 * Removes the candidate along with their notes and events (both cascade in
 * the schema) and best-effort-deletes the stored resume file.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { candidateId } = await params;
  const { candidate, error: candErr } = await getCandidateForTeam(candidateId, teamId);
  if (candErr) return candErr;

  await deleteStoredFile(candidate.fileUrl);
  await prisma.candidate.delete({ where: { id: candidateId } });

  return NextResponse.json({ ok: true });
}
