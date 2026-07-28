import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ roleId: string }> }
) {
    const { roleId } = await params;
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    return NextResponse.json(role);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ roleId: string }> }
) {
    const { roleId } = await params;
    const body = await req.json();
    const { title, description, requiredSkills, minYearsExperience } = body;

    const role = await prisma.role.update({
        where: { id: roleId },
        data: {
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(requiredSkills !== undefined ? { requiredSkills } : {}),
            ...(minYearsExperience !== undefined ? { minYearsExperience } : {}),
        },
    });

    return NextResponse.json(role);
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ roleId: string }> }
) {
    const { roleId } = await params;
    // Cascades to that role's Candidate and Batch rows automatically —
    // see onDelete: Cascade on those relations in schema.prisma.
    await prisma.role.delete({ where: { id: roleId } });
    return NextResponse.json({ ok: true });
}