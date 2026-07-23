import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const { stage } = await req.json();

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { stage },
  });

  return NextResponse.json(candidate);
}
