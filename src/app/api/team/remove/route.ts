import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * Owner-only: remove another member from the team (detaches them).
 * The owner can't remove themselves here — they use "leave" instead.
 */
export async function POST(req: NextRequest) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { memberId } = await req.json();
    if (!memberId) {
        return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const me = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { teamId: true },
    });
    if (!me?.teamId) {
        return NextResponse.json({ error: "You're not on a team" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({ where: { id: me.teamId } });
    if (!team || team.ownerId !== user.id) {
        return NextResponse.json(
            { error: "Only the team owner can remove members" },
            { status: 403 }
        );
    }
    if (memberId === user.id) {
        return NextResponse.json(
            { error: "Use 'leave team' to remove yourself" },
            { status: 400 }
        );
    }

    // Only detach a profile that's actually on this team (scopes the update).
    const result = await prisma.profile.updateMany({
        where: { id: memberId, teamId: me.teamId },
        data: { teamId: null },
    });
    if (result.count === 0) {
        return NextResponse.json({ error: "That person isn't on your team" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
