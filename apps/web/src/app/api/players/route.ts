import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type");

    switch (type) {
      case "stats": {
        const totalKills = await prisma.weeklyStat.aggregate({
          _sum: { kills: true },
        });
        const totalPlaytime = await prisma.weeklyStat.aggregate({
          _sum: { playtime: true },
        });

        // Weekly stats (current week)
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weeklyStats = await prisma.weeklyStat.findMany({
          where: { week_start: { gte: weekStart } },
        });
        const weeklyKills = weeklyStats.reduce(
          (sum, s) => sum + s.kills,
          0
        );

        const topKD =
          weeklyStats.length > 0
            ? Math.max(
                ...weeklyStats.map((s) =>
                  s.deaths > 0
                    ? parseFloat((s.kills / s.deaths).toFixed(2))
                    : s.kills
                )
              )
            : 0;

        return NextResponse.json({
          totalPlayers: await prisma.user.count(),
          totalKills: totalKills._sum.kills || 0,
          totalPlaytime: totalPlaytime._sum.playtime || 0,
          weeklyKills,
          topKD,
        });
      }

      case "leaderboard": {
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weeklyStats = await prisma.weeklyStat.findMany({
          where: { week_start: { gte: weekStart } },
          include: { user: true },
          orderBy: { kills: "desc" },
          take: 5,
        });

        const topKills = weeklyStats.map((s) => ({
          steamid: s.steamid,
          username: s.user.username || "Unknown",
          avatar: s.user.avatar || "",
          kills: s.kills,
          deaths: s.deaths,
          playtime: s.playtime,
          kd: s.deaths > 0 ? parseFloat((s.kills / s.deaths).toFixed(2)) : s.kills,
        }));

        const topPlaytime = await prisma.weeklyStat.findMany({
          where: { week_start: { gte: weekStart } },
          include: { user: true },
          orderBy: { playtime: "desc" },
          take: 5,
        });

        const formattedPlaytime = topPlaytime.map((s) => ({
          steamid: s.steamid,
          username: s.user.username || "Unknown",
          avatar: s.user.avatar || "",
          kills: s.kills,
          deaths: s.deaths,
          playtime: s.playtime,
          kd: s.deaths > 0 ? parseFloat((s.kills / s.deaths).toFixed(2)) : s.kills,
        }));

        return NextResponse.json({
          topKills,
          topPlaytime: formattedPlaytime,
        });
      }

      case "activity": {
        const activities = await prisma.adminLog.findMany({
          orderBy: { created_at: "desc" },
          take: 20,
        });

        // Enrich with usernames
        const enriched = await Promise.all(
          activities.map(async (a) => {
            const user = await prisma.user.findUnique({
              where: { steamid: a.steamid },
              select: { username: true, avatar: true },
            });
            return {
              ...a,
              username: user?.username || a.steamid,
              avatar: user?.avatar,
            };
          })
        );

        return NextResponse.json({ activities: enriched });
      }

      default: {
        const players = await prisma.user.findMany({
          orderBy: { last_login: "desc" },
          take: 50,
          select: {
            steamid: true,
            username: true,
            avatar: true,
            role: true,
            last_login: true,
            isBanned: true,
          },
        });

        return NextResponse.json({ players });
      }
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}
