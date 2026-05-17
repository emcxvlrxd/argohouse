import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    {
      id: "steam",
      name: "Steam",
      type: "oauth",
      version: "2.0" as const,
      authorization: {
        url: "https://steamcommunity.com/openid/login",
        params: {
          "openid.ns": "http://specs.openid.net/auth/2.0",
          "openid.mode": "checkid_setup",
          "openid.return_to": `${NEXTAUTH_URL}/api/auth/callback/steam?code=openid_response`,
          "openid.realm": NEXTAUTH_URL,
          "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
          "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        },
      },
      token: {
        async request({ params }: any) {
          return { tokens: params };
        },
      },
      userinfo: {
        async request({ tokens }: any): Promise<any> {
          const claimedId =
            tokens?.["openid.claimed_id"] ||
            tokens?.params?.["openid.claimed_id"] ||
            "";
          const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1];
          if (!steamId) throw new Error("Invalid Steam ID");

          const res = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
          );
          const data = await res.json();
          const player = data.response?.players?.[0];
          if (!player) throw new Error("Failed to fetch Steam profile");

          const sid = `STEAM_0:${parseInt(steamId) % 2}:${Math.floor(parseInt(steamId) / 2)}`;

          return {
            sub: steamId,
            id: steamId,
            steamid: sid,
            steamid64: steamId,
            username: player.personaname,
            avatar: player.avatar,
            avatarfull: player.avatarfull,
            role: "user",
          };
        },
      },
      profile(profile: any) {
        return {
          id: profile.steamid,
          steamid: profile.steamid,
          steamid64: profile.steamid64,
          username: profile.username,
          avatar: profile.avatar,
          avatarfull: profile.avatarfull,
          role: profile.role || "user",
        };
      },
      clientId: process.env.STEAM_API_KEY || "",
      clientSecret: process.env.STEAM_API_KEY || "",
      checks: [],
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.steamid = (user as any).steamid;
        token.role = (user as any).role || "user";
        token.username = (user as any).username;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).steamid = token.steamid;
        (session.user as any).steamid64 = token.steamid64;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "steam" && user) {
        const existing = await prisma.user.findUnique({
          where: { steamid: (user as any).steamid },
        });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              username: (user as any).username,
              avatar: (user as any).avatar,
              avatarfull: (user as any).avatarfull,
              last_login: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
