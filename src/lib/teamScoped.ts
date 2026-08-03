import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Fetches a Role and verifies it belongs to the given team. */
export async function getRoleForTeam(roleId: string, teamId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role || role.teamId !== teamId) {
        return { role: null, error: NextResponse.json({ error: "Role not found" }, { status: 404 }) };
    }
    return { role, error: null };
}

/** Fetches a Candidate (with its Role) and verifies team ownership. */
export async function getCandidateForTeam(candidateId: string, teamId: string) {
    const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: { role: true },
    });
    if (!candidate || candidate.role.teamId !== teamId) {
        return {
            candidate: null,
            error: NextResponse.json({ error: "Candidate not found" }, { status: 404 }),
        };
    }
    return { candidate, error: null };
}

/** Fetches an Event (with its Candidate and Role) and verifies team ownership. */
export async function getEventForTeam(eventId: string, teamId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { candidate: { include: { role: true } } },
    });
    if (!event || event.candidate.role.teamId !== teamId) {
        return { event: null, error: NextResponse.json({ error: "Event not found" }, { status: 404 }) };
    }
    return { event, error: null };
}
