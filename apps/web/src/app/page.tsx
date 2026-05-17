"use client";

import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { ServerStatusCard } from "@/components/dashboard/server-status-card";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TopPlayers } from "@/components/dashboard/top-players";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";
import {
  Crosshair,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Github,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const steamid = params.get("steam_login");
    const sig = params.get("sig");
    if (steamid && sig) {
      window.history.replaceState({}, "", "/");
      signIn("steam-credentials", { steamid, sig, callbackUrl: "/dashboard" });
    }
  }, []);

  if (!session) {
    return <LandingPage />;
  }

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
                <h1 className="text-2xl font-bold font-display">{t("Dashboard")}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("Welcome back")}, {(session.user as any)?.username}
                </p>
              </div>
              <Link href="/skins">
                <Button variant="glow" size="sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  {t("Customize Skins")}
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ServerStatusCard />
            </motion.div>

            <StatsGrid />

            <TopPlayers />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <GlassCard glow="none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("Quick Actions")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("Server management")}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <ActionButton
                    href="/skins"
                    label={t("Browse Weapon Skins")}
                    icon={Sparkles}
                  />
                  <ActionButton
                    href="/leaderboard"
                    label={t("View Leaderboard")}
                    icon={Shield}
                  />
                  <ActionButton
                    href="/players"
                    label={t("Player List")}
                    icon={Crosshair}
                  />
                </div>
              </GlassCard>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-neon-purple" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
    </Link>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-30" />

      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl font-display">FENA CS2</span>
          </div>
          <Button
            onClick={() => window.location.href = "/api/auth/steam"}
            className="bg-gradient-to-r from-[#171a21] to-[#2a475e] hover:from-[#1b1f27] hover:to-[#2f526c]"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 5.48 4.48 10 10 10s10-4.52 10-10S17.52 2 12 2zm-2 15l-5-3 5-3v6zm4-3V7l5 3-5 3z"/>
            </svg>
            {t("Sign in with Steam")}
          </Button>
        </nav>

        <section className="px-6 py-24 max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Badge variant="purple" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {t("Premium CS2 Community Server")}
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black font-display leading-tight mb-6">
              {t("Welcome to")}{" "}
              <span className="text-gradient">FENA CS2</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Premium Counter-Strike 2 topluluk deneyimi. Özel silah kaplamaları,
              rekabetçi eşleştirme ve 7/24 aktif yönetim.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant="glow"
                onClick={() => window.location.href = "/api/auth/steam"}
              >
                <Crosshair className="w-5 h-5 mr-2" />
                {t("Get Started")}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">
                  {t("Learn More")}
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Palette, label: t("Weapon Paints"), value: "2000+ Kaplama" },
              { icon: Zap, label: t("Server"), value: "128 Tick" },
              { icon: Shield, label: t("Uptime"), value: "99.9%" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <GlassCard glow="none" className="p-4 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-neon-purple" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section id="features" className="px-6 py-20 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-display">
            Premium <span className="text-gradient">{t("Features")}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard glow="none" className="p-6 text-center h-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-neon-purple" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="px-6 py-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crosshair className="w-4 h-4 text-neon-purple" />
              FENA CS2 &copy; {new Date().getFullYear()}
            </div>
            <p className="text-xs text-muted-foreground">
              Valve Corporation ile bağlantılı değildir. Next.js ile güçlendirilmiştir.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Palette,
    title: t("Weapon Paints"),
    description:
      "Web panelimizden 2000+ silah kaplaması, bıçak, eldiven, ajan ve müzik kitine göz atın ve kuşanın.",
  },
  {
    icon: Shield,
    title: t("Anti-Cheat"),
    description:
      "7/24 aktif yönetim ve adil oyun denetimi ile gelişmiş hile koruması.",
  },
  {
    icon: Trophy,
    title: t("Competitive"),
    description:
      "Haftalık liderlik tabloları, K/D takibi ve performans istatistikleri ile sıralı eşleştirme.",
  },
  {
    icon: Users,
    title: t("Community"),
    description:
      "Etkinlikler, turnuvalar ve özel oyuncu destek sistemi ile aktif topluluk.",
  },
  {
    icon: Zap,
    title: t("Performance"),
    description:
      "En iyi rekabetçi deneyim için düşük gecikmeli ve yüksek performanslı 128 tickrate sunucular.",
  },
  {
    icon: Sparkles,
    title: t("Premium UI"),
    description:
      "Gerçek zamanlı sunucu durumu ve kapsamlı oyuncu istatistikleri ile modern, duyarlı panel.",
  },
];

function Palette(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.5a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M8 14c0 1.5 2 3 4 3s4-1.5 4-3"/></svg>;
}

function Trophy(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}

function Users(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
