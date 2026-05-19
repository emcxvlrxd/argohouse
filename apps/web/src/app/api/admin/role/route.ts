import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin, isOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminRole = (session.user as any).role;
    const { steamid64, newRole } = await req.json();

    if (!steamid64 || !newRole) {
      return NextResponse.json({ error: "steamid64 and newRole required" }, { status: 400 });
    }

    const validRoles = ["user", "moderator", "admin", "owner"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Only owner can assign owner role
    if (newRole === "owner" && !isOwner(adminRole)) {
      return NextResponse.json({ error: "Only owners can assign owner role" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { steamid64 } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { steamid64 },
      data: { role: newRole },
    });

    await prisma.adminLog.create({
      data: {
        steamid: (session.user as any).steamid,
        action: `Changed role for ${target.username || target.steamid}: ${target.role} → ${newRole}`,
      },
    });

    return NextResponse.json({ success: true, user: { steamid: updated.steamid, role: updated.role } });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
