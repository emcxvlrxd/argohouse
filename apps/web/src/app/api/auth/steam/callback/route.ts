import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const claimedId = searchParams.get("openid.claimed_id") || "";
  const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];

  if (!steamId) {
    return NextResponse.redirect(
      new URL("/?error=InvalidSteamID", req.url)
    );
  }

  const steam64Id = steamId;
  const sid = `STEAM_0:${parseInt(steamId) % 2}:${Math.floor(parseInt(steamId) / 2)}`;

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

  const user = await prisma.user.upsert({
    where: { steamid: sid },
    update: {
      username: player.personaname,
      avatar: player.avatar,
      avatarfull: player.avatarfull,
      last_login: new Date(),
    },
    create: {
      steamid: sid,
      steamid64: steam64Id,
      username: player.personaname,
      avatar: player.avatar,
      avatarfull: player.avatarfull,
      role: "user",
    },
  });

  const sessionToken = await encode({
    secret: process.env.NEXTAUTH_SECRET!,
    token: {
      sub: steam64Id,
      id: user.id,
      steamid: sid,
      steamid64: steam64Id,
      role: "user",
      username: player.personaname,
      avatar: player.avatar,
    },
    maxAge: 30 * 24 * 60 * 60,
  });

  const isSecure = req.url.startsWith("https");
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const response = NextResponse.redirect(new URL("/dashboard", req.url));

  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
