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

    const { steamid, steamid64, reason, duration } = await req.json();
    if ((!steamid && !steamid64) || !reason) {
      return NextResponse.json(
        { success: false, message: "steamid/steamid64 and reason required" },
        { status: 400 }
      );
    }

    const adminSteamid = (session.user as any).steamid;

    const user = steamid64
      ? await prisma.user.findUnique({ where: { steamid64 } })
      : await prisma.user.findUnique({ where: { steamid } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const banExpires = duration > 0
      ? new Date(Date.now() + duration * 3600000)
      : null;

    const where = steamid64 ? { steamid64 } : { steamid };
    await prisma.user.update({
      where,
      data: {
        isBanned: true,
        banReason: reason,
        banExpires,
      },
    });

    const targetId = steamid64 || steamid;
    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `Banned ${targetId}`,
        target: targetId,
        details: `Reason: ${reason}, Duration: ${duration > 0 ? `${duration}h` : "Permanent"}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Banned ${user.username || targetId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create ban" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { steamid64 } = await req.json();
    if (!steamid64) {
      return NextResponse.json({ success: false, message: "steamid64 required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { steamid64 } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!user.isBanned) {
      return NextResponse.json({ success: false, message: "User is not banned" }, { status: 400 });
    }

    await prisma.user.update({
      where: { steamid64 },
      data: { isBanned: false, banReason: null, banExpires: null },
    });

    const adminSteamid = (session.user as any).steamid;
    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `Unbanned ${user.steamid}`,
        target: user.steamid,
        details: "",
      },
    });

    return NextResponse.json({ success: true, message: `Unbanned ${user.username || user.steamid}` });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to unban" }, { status: 500 });
  }
}
