import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const steamid64 = req.nextUrl.searchParams.get("steamid64");
    if (!steamid64) {
      return NextResponse.json({ error: "steamid64 required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { steamid64 } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const steamid = user.steamid || steamid64;

    const [skins, knife, gloves, agents, music] = await Promise.all([
      prisma.playerSkin.findMany({ where: { steamid } }),
      prisma.playerKnife.findMany({ where: { steamid } }),
      prisma.playerGlove.findMany({ where: { steamid } }),
      prisma.playerAgent.findMany({ where: { steamid } }),
      prisma.playerMusic.findMany({ where: { steamid } }),
    ]);

    return NextResponse.json({
      username: user.username,
      steamid: user.steamid,
      steamid64: user.steamid64,
      role: user.role,
      equipment: {
        skins: skins.length,
        knife: knife.length,
        gloves: gloves.length,
        agents: agents.length,
        music: music.length,
      },
      isBanned: user.isBanned,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
