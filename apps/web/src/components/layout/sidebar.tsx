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
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/players", label: "Players", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/skins", label: "Skins", icon: Palette },
  { href: "/rules", label: "Rules", icon: ScrollText },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/complaints", label: "Complaints", icon: MessageCircle },
  { href: "/appeals", label: "Appeals", icon: AlertTriangle },
];

const adminItems = [
  { href: "/admin", label: "Admin", icon: Shield },
];

interface SidebarProps {
  isAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isAdmin, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

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
          "fixed top-0 left-0 z-50 h-full w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">FENA CS2</h2>
            <p className="text-xs text-muted-foreground">Premium Network</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
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

          {isAdmin && (
            <>
              <div className="my-3 border-t border-white/10" />
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
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
      </aside>
    </>
  );
}
