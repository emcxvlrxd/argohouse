import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin, isOwner } from "@/lib/permissions";
import { sendRconCommand } from "@/lib/rcon";

async function syncAdminToServer(steamid64: string, action: "add" | "remove", group?: string, immunity?: number) {
  try {
    if (action === "add") {
      const user = await prisma.user.findUnique({ where: { steamid64 } });
      const name = user?.username || user?.name || "Unknown";
      const flags = group === "owner" ? "@" : "@";
      await sendRconCommand(`css_addadmin ${steamid64} "${name}" ${flags} ${immunity ?? 50} 0`);
    } else {
      await sendRconCommand(`css_removeadmin ${steamid64}`);
    }
  } catch {
    // RCON sync failure — log but don't block
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { steamid64, flags } = await req.json();
    if (!steamid64) {
      return NextResponse.json({ error: "steamid64 required" }, { status: 400 });
    }

    // Parse flags to determine AdminPlus group + immunity
    let group = "admin";
    let immunity = 50;
    if (flags) {
      try {
        const parsed = JSON.parse(flags);
        if (parsed.flags?.includes("root")) group = "owner";
        if (parsed.immunity) immunity = parsed.immunity;
      } catch {
        // legacy string flag format
      }
    }

    let user = await prisma.user.findUnique({ where: { steamid64 } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          steamid: steamid64,
          steamid64,
          username: null,
          role: "admin",
          adminFlags: flags || "@@",
        },
      });
    } else {
      user = await prisma.user.update({
        where: { steamid64 },
        data: {
          role: "admin",
          adminFlags: flags || user.adminFlags || "@@",
        },
      });
    }

    // Sync to AdminPlusMYSQL + SimpleAdmin via RCON
    await syncAdminToServer(steamid64, "add", group, immunity);

    const adminSteamid = (session.user as any).steamid;
    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `Added admin ${steamid64} with flags "${flags || "@@"}" (group: ${group}, immunity: ${immunity})`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isOwner((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { steamid64 } = await req.json();
    if (!steamid64) {
      return NextResponse.json({ error: "steamid64 required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { steamid64 } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "owner") {
      return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 });
    }

    await prisma.user.update({
      where: { steamid64 },
      data: { role: "user", adminFlags: null },
    });

    // Sync remove to AdminPlusMYSQL + SimpleAdmin via RCON
    await syncAdminToServer(steamid64, "remove");

    const adminSteamid = (session.user as any).steamid;
    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `Removed admin ${steamid64}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
