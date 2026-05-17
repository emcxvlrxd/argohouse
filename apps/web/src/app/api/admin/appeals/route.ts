import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appeals = await prisma.appeal.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json({ appeals });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, action } = await req.json();
    const adminSteamid = (session.user as any).steamid;

    const appeal = await prisma.appeal.findUnique({ where: { id } });
    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Unban the user
      await prisma.user.update({
        where: { steamid: appeal.steamid },
        data: { isBanned: false, banReason: null, banExpires: null },
      });
    }

    const newStatus = action === "approve" ? "approved" : "denied";
    await prisma.appeal.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `${newStatus} appeal for ${appeal.steamid}`,
        target: appeal.steamid,
        details: `Appeal ID: ${id}, Type: ${appeal.type}`,
      },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process appeal" }, { status: 500 });
  }
}
