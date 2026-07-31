import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
    const { session, error } = await requireAuth();
    if (error) return error;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { name } = await req.json();
    if (!name || !name.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() },
        select: { id: true, name: true, email: true },
    });
    return NextResponse.json(user);
}

export async function DELETE() {
    const { session, error } = await requireAuth();
    if (error) return error;

    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ ok: true });
}
