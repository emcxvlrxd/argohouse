"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Shield,
  Terminal,
  Ban,
  Users,
  UserCog,
  ScrollText,
  Flag,
  AlertTriangle,
  ChevronLeft,
  Crosshair,
  Wifi,
  Server,
  Gauge,
  MessageCircle,
} from "lucide-react";

type AdminSidebarProps = {
  webFlags?: string[];
};

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge, exact: true, webKey: "web_dashboard" },
  { href: "/admin/live", label: "Live Players", icon: Wifi, webKey: "web_live" },
  { href: "/admin/server", label: "Server", icon: Server, webKey: "web_server" },
  { href: "/admin/console", label: "Console", icon: Terminal, webKey: "web_console" },
  { href: "/admin/rcon", label: "RCON", icon: Terminal, webKey: "web_rcon" },
  { href: "/admin/players", label: "Players", icon: Users, webKey: "web_players" },
  { href: "/admin/bans", label: "Bans", icon: Ban, webKey: "web_bans" },
  { href: "/admin/admins", label: "Admins", icon: UserCog, webKey: "web_admins" },
  { href: "/admin/complaints", label: "Complaints", icon: MessageCircle, webKey: "web_complaints" },
  { href: "/admin/reports", label: "Reports", icon: Flag, webKey: "web_reports" },
  { href: "/admin/appeals", label: "Appeals", icon: AlertTriangle, webKey: "web_appeals" },
  { href: "/admin/logs", label: "Logs", icon: ScrollText, webKey: "web_logs" },
];

export function AdminSidebar({ webFlags }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-black/30 backdrop-blur-2xl border-r border-white/10 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">{t("Admin Panel")}</h2>
          <p className="text-xs text-muted-foreground">FENA CS2</p>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {adminNavItems.filter((item) => {
          if (!webFlags || webFlags.length === 0) return false;
          if (webFlags.includes("*")) return true;
          return webFlags.includes(item.webKey);
        }).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                active
                  ? "text-white"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-xl border border-cyan-500/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t(item.label)}</span>
              {active && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-cyan glow-cyan relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <Crosshair className="w-4 h-4" />
          {t("Back to Site")}
        </Link>
      </div>
    </aside>
  );
}
