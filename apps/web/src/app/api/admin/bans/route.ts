import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bannedUsers = await prisma.user.findMany({
      where: { isBanned: true },
      select: {
        steamid: true,
        username: true,
        avatar: true,
        banReason: true,
        banExpires: true,
        updated_at: true,
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({ bans: bannedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { steamid, reason, duration } = await req.json();
    if (!steamid || !reason) {
      return NextResponse.json(
        { success: false, message: "SteamID and reason required" },
        { status: 400 }
      );
    }

    const adminSteamid = (session.user as any).steamid;

    const user = await prisma.user.findUnique({ where: { steamid } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const banExpires = duration > 0
      ? new Date(Date.now() + duration * 3600000)
      : null;

    await prisma.user.update({
      where: { steamid },
      data: {
        isBanned: true,
        banReason: reason,
        banExpires,
      },
    });

    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `Banned ${steamid}`,
        target: steamid,
        details: `Reason: ${reason}, Duration: ${duration > 0 ? `${duration}h` : "Permanent"}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Banned ${user.username || steamid}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create ban" },
      { status: 500 }
    );
  }
}
