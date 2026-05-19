"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge, exact: true },
  { href: "/admin/live", label: "Live Players", icon: Wifi },
  { href: "/admin/server", label: "Server", icon: Server },
  { href: "/admin/console", label: "Console", icon: Terminal },
  { href: "/admin/rcon", label: "RCON", icon: Terminal },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/bans", label: "Bans", icon: Ban },
  { href: "/admin/admins", label: "Admins", icon: UserCog },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/appeals", label: "Appeals", icon: AlertTriangle },
];

export function AdminSidebar() {
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
          <h2 className="font-bold text-lg">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">FENA CS2</p>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {adminNavItems.map((item) => {
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
              <span className="relative z-10">{item.label}</span>
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
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
