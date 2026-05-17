"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ServerStatusCard } from "@/components/dashboard/server-status-card";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TopPlayers } from "@/components/dashboard/top-players";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, Crosshair, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-50" />
      <div className="flex">
        <Sidebar
          isAdmin={(session.user as any)?.role === "admin"}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <MobileNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isAdmin={(session.user as any)?.role === "admin"}
        />
        <div className="flex-1 min-h-screen">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {(session.user as any)?.username}
                </p>
              </div>
              <Link href="/skins">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 h-10 px-5 py-2 bg-gradient-to-r from-neon-purple via-violet-500 to-neon-cyan text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Customize Skins
                </button>
              </Link>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ServerStatusCard />
            </motion.div>
            <StatsGrid />
            <TopPlayers />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <GlassCard glow="none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Crosshair className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Actions</h3>
                    <p className="text-xs text-muted-foreground">Server management</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { href: "/skins", label: "Browse Weapon Skins", icon: Sparkles },
                    { href: "/leaderboard", label: "View Leaderboard", icon: Shield },
                    { href: "/players", label: "Player List", icon: Crosshair },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-neon-purple" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
