import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

/**
 * Like requireAuth(), but also confirms the user has joined a team and
 * returns that teamId. Use this instead of requireAuth() alone on any
 * route that touches Roles/Candidates/Batches/Events/Notes, so results
 * are always scoped to the caller's own team.
 */
export async function requireTeam() {
    const { user, error: authError } = await requireAuth();
    if (authError) return { user: null, teamId: null, error: authError };

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { teamId: true },
    });

    if (!profile?.teamId) {
        return {
            user,
            teamId: null,
            error: NextResponse.json(
                { error: "You need to join or create a team first" },
                { status: 403 }
            ),
        };
    }

    return { user, teamId: profile.teamId, error: null };
}
