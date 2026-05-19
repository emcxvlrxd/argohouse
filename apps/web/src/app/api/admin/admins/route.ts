import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin, isOwner } from "@/lib/permissions";
import { sendRconCommand } from "@/lib/rcon";

async function syncAdminToServer(steamid64: string, action: "add" | "remove", _group?: string, immunity?: number) {
  try {
    if (action === "add") {
      const user = await prisma.user.findUnique({ where: { steamid64 } });
      const name = user?.username || user?.name || "Unknown";
      const imm = immunity ?? 100;

      // Remove old records for this steamid
      const old = await prisma.$queryRawUnsafe(`SELECT id FROM sa_admins WHERE player_steamid = ${steamid64}`);
      for (const r of old as any[]) {
        await prisma.$executeRawUnsafe(`DELETE FROM sa_admins_flags WHERE admin_id = ${r.id}`);
      }
      await prisma.$executeRawUnsafe(`DELETE FROM sa_admins WHERE player_steamid = ${steamid64}`);

      // Insert new admin record
      await prisma.$executeRawUnsafe(`INSERT INTO sa_admins (player_name, player_steamid, immunity, server_id) VALUES ('${name}', ${steamid64}, ${imm}, 1)`);

      const inserted = await prisma.$queryRawUnsafe("SELECT LAST_INSERT_ID() as id");
      const adminId = Number((inserted as any[])[0].id);

      // Insert all root flags
      const rootFlags = [
        "@css/root", "@css/generic", "@css/kick", "@css/ban",
        "@css/unban", "@css/vip", "@css/slay", "@css/changemap",
        "@css/cvar", "@css/config", "@css/chat", "@css/vote",
        "@css/password", "@css/rcon", "@css/cheats", "@css/reservation",
      ];
      const flagsStr = rootFlags.join(" ");
      await prisma.$executeRawUnsafe(`UPDATE sa_admins SET flags = '${flagsStr}' WHERE id = ${adminId}`);
      for (const f of rootFlags) {
        await prisma.$executeRawUnsafe(`INSERT INTO sa_admins_flags (admin_id, flag) VALUES (${adminId}, '${f}')`);
      }

      // Trigger plugin reload via RCON
      await sendRconCommand(`css_addadmin ${steamid64} "${name}" @css/root ${imm} 0`);
    } else {
      const old = await prisma.$queryRawUnsafe(`SELECT id FROM sa_admins WHERE player_steamid = ${steamid64}`);
      for (const r of old as any[]) {
        await prisma.$executeRawUnsafe(`DELETE FROM sa_admins_flags WHERE admin_id = ${r.id}`);
      }
      await prisma.$executeRawUnsafe(`DELETE FROM sa_admins WHERE player_steamid = ${steamid64}`);
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
