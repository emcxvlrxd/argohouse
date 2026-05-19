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

    const complaints = await prisma.complaint.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const enriched = await Promise.all(
      complaints.map(async (c) => {
        const user = await prisma.user.findUnique({ where: { steamid: c.steamid }, select: { username: true, avatar: true } });
        return { ...c, username: user?.username || c.steamid, avatar: user?.avatar || null };
      })
    );

    return NextResponse.json({ complaints: enriched });
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

    await prisma.complaint.update({ where: { id }, data: { status } });

    const adminSteamid = (session.user as any).steamid;
    await prisma.adminLog.create({
      data: { steamid: adminSteamid, action: `${status} complaint #${id}` },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
