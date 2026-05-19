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

    const reports = await prisma.report.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const enriched = await Promise.all(
      reports.map(async (r) => {
        const [reporter, targetUser] = await Promise.all([
          prisma.user.findUnique({ where: { steamid: r.steamid }, select: { username: true } }),
          prisma.user.findUnique({ where: { steamid: r.target }, select: { username: true } }),
        ]);
        return { ...r, reporterName: reporter?.username || r.steamid, targetName: targetUser?.username || r.target };
      })
    );

    return NextResponse.json({ reports: enriched });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json();
    const valid = ["open", "resolved", "dismissed"];
    if (!id || !valid.includes(status)) {
      return NextResponse.json({ error: "id and valid status required" }, { status: 400 });
    }

    await prisma.report.update({ where: { id }, data: { status } });

    const adminSteamid = (session.user as any).steamid;
    await prisma.adminLog.create({
      data: { steamid: adminSteamid, action: `${status} report #${id}` },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
