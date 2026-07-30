import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    const { error } = await requireAuth();
    if (error) return error;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    const { error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { title, startTime, endTime, candidateId, notes, force } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (notes !== undefined) data.notes = notes;
    if (candidateId !== undefined) data.candidateId = candidateId;

    let start: Date | undefined;
    let end: Date | undefined;
    if (startTime !== undefined) start = new Date(startTime);
    if (endTime !== undefined) end = new Date(endTime);

    if ((start || end) && !force) {
        const existing = await prisma.event.findUnique({ where: { id: eventId } });
        if (!existing) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        const checkStart = start ?? existing.startTime;
        const checkEnd = end ?? existing.endTime;

        const conflicts = await prisma.event.findMany({
            where: {
                id: { not: eventId },
                startTime: { lt: checkEnd },
                endTime: { gt: checkStart },
            },
            select: { id: true, title: true, startTime: true, endTime: true },
        });
        if (conflicts.length > 0) {
            return NextResponse.json({ conflicts }, { status: 409 });
        }
    }

    if (start) data.startTime = start;
    if (end) data.endTime = end;

    const event = await prisma.event.update({ where: { id: eventId }, data });
    return NextResponse.json(event);
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    const { error } = await requireAuth();
    if (error) return error;

    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ ok: true });
}