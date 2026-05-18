import { prisma } from "./prisma";

export async function resetWeeklyStats() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Delete all stats from previous weeks (keep current week's data intact)
  await prisma.weeklyStat.deleteMany({
    where: { week_start: { lt: weekStart } },
  });

  // Create fresh weekly stats for all users
  const users = await prisma.user.findMany();
  for (const user of users) {
    const existing = await prisma.weeklyStat.findFirst({
      where: {
        steamid: user.steamid,
        week_start: { gte: weekStart },
      },
    });
    if (!existing) {
      await prisma.weeklyStat.create({
        data: {
          steamid: user.steamid,
          week_start: weekStart,
          week_end: weekEnd,
        },
      });
    }
  }
}

export async function setDailyPlayer() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyPlayer.findFirst({
    where: {
      date: {
        gte: now,
        lt: new Date(now.getTime() + 86400000),
      },
    },
  });

  if (existing) return existing;

  const topPlayer = await prisma.weeklyStat.findFirst({
    orderBy: { playtime: "desc" },
    include: { user: true },
    where: {
      week_start: {
        gte: new Date(now.getTime() - 7 * 86400000),
      },
    },
  });

  if (!topPlayer) return null;

  return prisma.dailyPlayer.upsert({
    where: { steamid: topPlayer.steamid },
    update: { date: now, reason: "Top playtime this week" },
    create: {
      steamid: topPlayer.steamid,
      date: now,
      reason: "Top playtime this week",
    },
  });
}
