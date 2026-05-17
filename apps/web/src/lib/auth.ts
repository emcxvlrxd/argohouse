import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createHmac } from "node:crypto";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {

  providers: [

    CredentialsProvider({

      id: "steam-credentials",

      name: "Steam",

      credentials: {
        steamid: {
          label: "SteamID",
          type: "text",
        },
        sig: {
          label: "Signature",
          type: "text",
        },
      },

      async authorize(credentials) {

        if (
          !credentials?.steamid ||
          !credentials?.sig
        ) {
          return null;
        }

        const expectedSig = createHmac(
          "sha256",
          process.env.NEXTAUTH_SECRET!
        )
          .update(credentials.steamid)
          .digest("hex");

        if (credentials.sig !== expectedSig) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            steamid: credentials.steamid,
          },
        });

        if (!user) {
          return null;
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            last_login: new Date(),
          },
        });

        // =====================================
        // FORCE STEAM64
        // =====================================

        const fixedSteamId =
          user.steamid64 ||
          credentials.steamid;

        return {

          id: user.id,

          // IMPORTANT
          steamid: fixedSteamId,

          steamid64: fixedSteamId,

          username: user.username,

          avatar: user.avatar,

          avatarfull: user.avatarfull,

          role: user.role,

        };

      },

    }),

  ],

  callbacks: {

    async jwt({ token, user }) {

      if (user) {

        token.id = user.id;

        // IMPORTANT
        token.steamid =
          (user as any).steamid64 ||
          (user as any).steamid;

        token.steamid64 =
          (user as any).steamid64 ||
          (user as any).steamid;

        token.role =
          (user as any).role || "user";

        token.username =
          (user as any).username;

        token.avatar =
          (user as any).avatar;

        token.avatarfull =
          (user as any).avatarfull;

      }

      return token;

    },

    async session({ session, token }) {

      if (session.user) {

        (session.user as any).id =
          token.id;

        // IMPORTANT
        (session.user as any).steamid =
          token.steamid64;

        (session.user as any).steamid64 =
          token.steamid64;

        (session.user as any).role =
          token.role;

        (session.user as any).username =
          token.username;

        (session.user as any).avatar =
          token.avatar;

        (session.user as any).avatarfull =
          token.avatarfull;

      }

      return session;

    },

  },

  pages: {
    signIn: "/",
    error: "/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

};