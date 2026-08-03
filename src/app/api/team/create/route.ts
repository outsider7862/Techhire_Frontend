import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

function generateJoinCode(): string {
    // Excludes 0/O/1/I to avoid ambiguity when someone reads the code aloud.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

export async function POST(req: NextRequest) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { name } = await req.json();
    if (!name || !name.trim()) {
        return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const existing = await prisma.profile.findUnique({ where: { id: user.id } });
    if (existing?.teamId) {
        return NextResponse.json({ error: "You're already on a team" }, { status: 409 });
    }

    let team;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            team = await prisma.team.create({
                data: { name: name.trim(), joinCode: generateJoinCode(), ownerId: user.id },
            });
            break;
        } catch (e) {
            if (attempt === 4) throw e; // extremely unlikely join-code collision, retried a few times
        }
    }

    await prisma.profile.update({
        where: { id: user.id },
        data: { teamId: team!.id },
    });

    return NextResponse.json(team);
}
