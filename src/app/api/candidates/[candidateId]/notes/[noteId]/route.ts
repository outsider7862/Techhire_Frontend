import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";
import { getCandidateForTeam } from "@/lib/teamScoped";

/** Loads a note, verifying it belongs to the candidate (which the caller's
 *  team owns) and was written by the caller. Only the author edits/deletes. */
async function getOwnNote(candidateId: string, noteId: string, teamId: string, userId: string) {
    const { error } = await getCandidateForTeam(candidateId, teamId);
    if (error) return { note: null, error };

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.candidateId !== candidateId) {
        return {
            note: null,
            error: NextResponse.json({ error: "Note not found" }, { status: 404 }),
        };
    }
    if (note.authorId !== userId) {
        return {
            note: null,
            error: NextResponse.json(
                { error: "You can only edit your own notes" },
                { status: 403 }
            ),
        };
    }
    return { note, error: null };
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ candidateId: string; noteId: string }> }
) {
    const { user, teamId, error } = await requireTeam();
    if (error) return error;

    const { candidateId, noteId } = await params;
    const { error: noteErr } = await getOwnNote(candidateId, noteId, teamId, user.id);
    if (noteErr) return noteErr;

    const { body } = await req.json();
    if (!body || !body.trim()) {
        return NextResponse.json({ error: "Note body is required" }, { status: 400 });
    }

    const note = await prisma.note.update({
        where: { id: noteId },
        data: { body: body.trim() },
        include: { author: { select: { name: true } } },
    });
    return NextResponse.json(note);
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ candidateId: string; noteId: string }> }
) {
    const { user, teamId, error } = await requireTeam();
    if (error) return error;

    const { candidateId, noteId } = await params;
    const { error: noteErr } = await getOwnNote(candidateId, noteId, teamId, user.id);
    if (noteErr) return noteErr;

    await prisma.note.delete({ where: { id: noteId } });
    return NextResponse.json({ ok: true });
}
