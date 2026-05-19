import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin, isOwner } from "@/lib/permissions";

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

    const adminSteamid = (session.user as any).steamid;
    await prisma.adminLog.create({
      data: {
        steamid: adminSteamid,
        action: `Added admin ${steamid64} with flags "${flags || "@@"}"`,
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
