import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";
import { getCandidateForTeam } from "@/lib/teamScoped";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { user, teamId, error } = await requireTeam();
  if (error) return error;

  const { candidateId } = await params;
  const { error: candErr } = await getCandidateForTeam(candidateId, teamId);
  if (candErr) return candErr;

  const { body } = await req.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }

  // The author relation is included so the client can render the new note's
  // byline straight from this response — NotesSection holds its list in
  // local state, so a refresh alone wouldn't fill it in.
  const note = await prisma.note.create({
    data: { candidateId, body: body.trim(), authorId: user.id },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(note);
}
