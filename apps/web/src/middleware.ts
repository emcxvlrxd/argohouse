import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin")) {
      const role = token?.role as string;
      if (role !== "admin" && role !== "owner") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Protected routes
    const protectedPaths = [
      "/dashboard",
      "/profile",
      "/skins",
      "/players",
      "/complaints",
      "/appeals",
    ];

    const isProtected = protectedPaths.some((p) => path.startsWith(p));
    if (isProtected && !token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/skins/:path*",
    "/players/:path*",
    "/complaints/:path*",
    "/appeals/:path*",
    "/admin/:path*",
  ],
};
