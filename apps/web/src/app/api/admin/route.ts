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
            username: true,
            avatar: true,
            role: true,
            isBanned: true,
            last_login: true,
            _count: { select: { skins: true } },
          },
        });

        return NextResponse.json({
          players: players.map((p) => ({
            id: p.id,
            steamid: p.steamid,
            username: p.username,
            avatar: p.avatar,
            role: p.role,
            isBanned: p.isBanned,
            last_login: p.last_login.toISOString(),
            skinCount: p._count.skins,
          })),
        });
      }

      case "admins": {
        const admins = await prisma.user.findMany({
          where: {
            role: { in: ["admin", "owner"] },
          },
          select: {
            steamid: true,
            username: true,
            avatar: true,
            role: true,
            last_login: true,
          },
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
