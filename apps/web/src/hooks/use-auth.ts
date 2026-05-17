"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user as any,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin:
      status === "authenticated" &&
      (session?.user as any)?.role === "admin",
    isOwner:
      status === "authenticated" &&
      (session?.user as any)?.role === "owner",
  };
}
