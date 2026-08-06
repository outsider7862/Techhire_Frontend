import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/**
 * The current user leaves their team.
 * - Ordinary member: just detach.
 * - Owner with other members: ownership auto-transfers to the oldest remaining
 *   member, then they detach.
 * - Owner who is the sole member: the (now-empty) team is deleted, which
 *   cascades to its roles/candidates — the client warns about this first.
 */
export async function POST() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { teamId: true },
    });
    if (!profile?.teamId) {
        return NextResponse.json({ error: "You're not on a team" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
        where: { id: profile.teamId },
        include: { members: { orderBy: { createdAt: "asc" }, select: { id: true } } },
    });
    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    await prisma.profile.update({ where: { id: user.id }, data: { teamId: null } });

    if (team.ownerId === user.id) {
        const remaining = team.members.filter((m) => m.id !== user.id);
        if (remaining.length === 0) {
            await prisma.team.delete({ where: { id: team.id } });
        } else {
            await prisma.team.update({
                where: { id: team.id },
                data: { ownerId: remaining[0].id },
            });
        }
    }

    return NextResponse.json({ ok: true });
}
