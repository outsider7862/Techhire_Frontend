import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/candidates/:candidateId/notes
 * Body: { body: string }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ candidateId: string }> }
) {
    const { candidateId } = await params;
    const { body } = await req.json();

    if (!body || !body.trim()) {
        return NextResponse.json({ error: "Note body is required" }, { status: 400 });
    }

    const note = await prisma.note.create({
        data: { candidateId, body: body.trim() },
    });

    return NextResponse.json(note);
}