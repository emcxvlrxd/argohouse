import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const claimedId = searchParams.get("openid.claimed_id") || "";
    const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];

    if (!steamId) {
      return NextResponse.redirect(
        new URL("/?error=InvalidSteamID", req.url)
      );
    }

    const steam64Id = steamId;

    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steam64Id}`
    );
    const data = await res.json();
    const player = data.response?.players?.[0];

    if (!player) {
      return NextResponse.redirect(
        new URL("/?error=SteamAPIFailed", req.url)
      );
    }

    await prisma.user.upsert({
      where: { steamid64: steam64Id },
      update: {
        username: player.personaname,
        avatar: player.avatar,
        avatarfull: player.avatarfull,
        last_login: new Date(),
      },
      create: {
        steamid: "",
        steamid64: steam64Id,
        username: player.personaname,
        avatar: player.avatar,
        avatarfull: player.avatarfull,
        role: "user",
      },
    });

    const sig = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
      .update(steam64Id)
      .digest("hex");

    const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

    return NextResponse.redirect(
      `${NEXTAUTH_URL}/?steam_login=${encodeURIComponent(steam64Id)}&sig=${sig}`
    );
  } catch (error: any) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error?.message || "Unknown")}`, req.url)
    );
  }
}
