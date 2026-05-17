"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, LogOut, User, Shield, Crosshair } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-2xl border-b border-white/10">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-sm text-emerald-400 font-medium">
              Server Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium leading-tight">
                      {(session.user as any).username}
                    </p>
                    <Badge variant="purple" className="text-[10px] px-1.5 py-0">
                      {(session.user as any).role}
                    </Badge>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
                    <AvatarImage
                      src={(session.user as any).avatar}
                      alt={(session.user as any).username}
                    />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-neon-purple" />
                    <span>FENA CS2</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {(session.user as any).role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-400 focus:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => window.location.href = "/api/auth/steam"}
              className="bg-gradient-to-r from-[#171a21] to-[#2a475e] hover:from-[#1b1f27] hover:to-[#2f526c] text-white shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 5.48 4.48 10 10 10s10-4.52 10-10S17.52 2 12 2zm-2 15l-5-3 5-3v6zm4-3V7l5 3-5 3z"/>
              </svg>
              Sign in with Steam
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
