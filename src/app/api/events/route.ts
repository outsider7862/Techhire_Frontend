import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
    const { error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const events = await prisma.event.findMany({
        where: {
            ...(start && end
                ? { startTime: { lt: new Date(end) }, endTime: { gt: new Date(start) } }
                : {}),
        },
        include: {
            candidate: { select: { fileName: true, role: { select: { title: true } } } },
        },
        orderBy: { startTime: "asc" },
    });

    return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
    const { error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { title, startTime, endTime, candidateId, notes, force } = body;

    if (!title || !startTime || !endTime || !candidateId) {
        return NextResponse.json(
            { error: "title, startTime, endTime, and candidateId are required" },
            { status: 400 }
        );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!force) {
        const conflicts = await prisma.event.findMany({
            where: { startTime: { lt: end }, endTime: { gt: start } },
            select: { id: true, title: true, startTime: true, endTime: true },
        });
        if (conflicts.length > 0) {
            return NextResponse.json({ conflicts }, { status: 409 });
        }
    }

    const event = await prisma.event.create({
        data: { title, startTime: start, endTime: end, notes: notes ?? null, candidateId },
    });

    return NextResponse.json(event);
}