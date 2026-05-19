"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Crosshair,
  Trophy,
  Palette,
  ScrollText,
  User,
  AlertTriangle,
  Shield,
  Users,
  MessageCircle,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: t("Dashboard"), icon: LayoutDashboard },
  { href: "/players", label: t("Players"), icon: Users },
  { href: "/leaderboard", label: t("Leaderboard"), icon: Trophy },
  { href: "/skins", label: t("Skins"), icon: Palette },
  { href: "/rules", label: t("Rules"), icon: ScrollText },
  { href: "/profile", label: t("Profile"), icon: User },
  { href: "/complaints", label: t("Complaints"), icon: MessageCircle },
  { href: "/appeals", label: t("Appeals"), icon: AlertTriangle },
];

const adminItems = [
  { href: "/admin", label: t("Admin"), icon: Shield },
];

interface SidebarProps {
  isAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isAdmin, isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const showAdmin = isAdmin || role === "admin" || role === "owner";
  const pathname = usePathname();
  const [server, setServer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/server")
      .then((r) => r.json())
      .then((d) => setServer(d))
      .catch(() => {});
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">FENA CS2</h2>
            <p className="text-xs text-muted-foreground">{t("Premium Network")}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-xl border border-purple-500/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-purple glow-purple relative z-10" />
                )}
              </Link>
            );
          })}

          {showAdmin && (
            <>
              <div className="my-3 border-t border-white/10" />
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("Administration")}
              </p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                      active
                        ? "text-white"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="admin-active"
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-xl border border-cyan-500/20"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-cyan glow-cyan relative z-10" />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-3">
          {server ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full shrink-0", server.online ? "bg-emerald-400 animate-pulse-glow" : "bg-red-400")} />
                <span className="text-xs font-semibold text-white/90 truncate">{server.name || "FENA CS2"}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-white/80">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/40 shrink-0">IP:</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-mono text-xs text-right text-white/90 truncate">{server.ip || "185.206.146.195:27015"}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(server.ip || "185.206.146.195:27015"); }}
                      className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                      title="Kopyala"
                    >
                      <svg className="w-3.5 h-3.5 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/40 shrink-0">Harita:</span>
                  <span className="text-right text-white/90 truncate font-medium">{server.map || "..."}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/40 shrink-0">Oyuncu:</span>
                  <span className="text-right text-white/90 font-medium">{server.players != null ? `${server.players}/32` : "..."}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/40 shrink-0">Ping:</span>
                  <span className="text-right text-white/90 font-mono font-medium">{server.ping != null ? `${server.ping}ms` : "..."}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center">Sunucu bilgisi alınıyor...</div>
          )}
        </div>
      </aside>
    </>
  );
}
