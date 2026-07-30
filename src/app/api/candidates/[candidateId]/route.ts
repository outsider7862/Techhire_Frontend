import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  const { error } = await requireAuth();
  if (error) return error;

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      role: true,
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

/**
 * PATCH /api/candidates/:candidateId
 * Body: { stage: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED" | "HIRED" }
 *
 * A dropdown-based stage change, deliberately simpler than a full
 * drag-and-drop Kanban board — the cut to make first if the timeline
 * gets tight, since it's the same underlying data model either way.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  const { error } = await requireAuth();
  if (error) return error;

  const { stage } = await req.json();

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { stage },
  });

  return NextResponse.json(candidate);
}