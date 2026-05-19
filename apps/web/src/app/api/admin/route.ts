import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = req.nextUrl.searchParams.get("type");

    switch (type) {
      case "players": {
        const players = await prisma.user.findMany({
          orderBy: { last_login: "desc" },
          select: {
            id: true,
            steamid: true,
            steamid64: true,
            username: true,
            avatar: true,
            role: true,
            isBanned: true,
            last_login: true,
            _count: { select: { skins: true, knives: true, gloves: true, agents: true, music: true } },
          },
        });

        return NextResponse.json({
          players: players.map((p) => ({
            id: p.id,
            steamid: p.steamid,
            steamid64: p.steamid64,
            username: p.username,
            avatar: p.avatar,
            role: p.role,
            isBanned: p.isBanned,
            last_login: p.last_login.toISOString(),
            skinCount: p._count.skins,
            knifeCount: p._count.knives,
            gloveCount: p._count.gloves,
            agentCount: p._count.agents,
            musicCount: p._count.music,
          })),
        });
      }

      case "admins": {
        const admins = await prisma.user.findMany({
          where: {
            role: { in: ["admin", "owner"] },
          },
          select: {
            id: true,
            steamid: true,
            steamid64: true,
            username: true,
            avatar: true,
            role: true,
            adminFlags: true,
            last_login: true,
          },
          orderBy: { last_login: "desc" },
        });
        return NextResponse.json({ admins });
      }

      case "logs": {
        const logs = await prisma.adminLog.findMany({
          orderBy: { created_at: "desc" },
          take: 50,
        });

        const enriched = await Promise.all(
          logs.map(async (log) => {
            const user = await prisma.user.findUnique({
              where: { steamid: log.steamid },
              select: { username: true },
            });
            return { ...log, username: user?.username || log.steamid };
          })
        );

        return NextResponse.json({ logs: enriched });
      }

      case "stats": {
        const [userCount, skinCount, knifeCount, gloveCount] =
          await Promise.all([
            prisma.user.count(),
            prisma.playerSkin.count(),
            prisma.playerKnife.count(),
            prisma.playerGlove.count(),
          ]);

        return NextResponse.json({
          users: userCount,
          skins: skinCount,
          knives: knifeCount,
          gloves: gloveCount,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
