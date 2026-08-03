import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { joinCode } = await req.json();
    if (!joinCode || !joinCode.trim()) {
        return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    const existing = await prisma.profile.findUnique({ where: { id: user.id } });
    if (existing?.teamId) {
        return NextResponse.json({ error: "You're already on a team" }, { status: 409 });
    }

    const team = await prisma.team.findUnique({
        where: { joinCode: joinCode.trim().toUpperCase() },
    });
    if (!team) {
        return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
    }

    await prisma.profile.update({
        where: { id: user.id },
        data: { teamId: team.id },
    });

    return NextResponse.json(team);
}
