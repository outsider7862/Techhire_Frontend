import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function PATCH(req: NextRequest) {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return NextResponse.json(
            { error: "Current password and a new 8+ character password are required" },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
}
