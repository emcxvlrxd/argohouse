"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  User,
  Palette,
  Knife,
  Hand,
  Clock,
  Swords,
  ExternalLink,
  Crosshair,
} from "lucide-react";
import Link from "next/link";

interface ProfileData {
  user: any;
  equipment: {
    skins: number;
    knife: number;
    gloves: number;
    agents: any;
  };
  stats: {
    totalKills: number;
    totalPlaytime: number;
    kd: number;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [equipRes, statsRes] = await Promise.all([
          fetch("/api/skins?type=equipped"),
          fetch("/api/players?type=stats"),
        ]);
        const equip = await equipRes.json();
        const stats = await statsRes.json();

        const equipment = {
          skins: equip.skins?.length || 0,
          knife: equip.knife?.length || 0,
          gloves: equip.gloves?.length || 0,
          agents: equip.agents,
        };

        setProfile({ user: session?.user, equipment, stats });
      } catch {} finally {
        setLoading(false);
      }
    };
    if (session) fetchProfile();
  }, [session]);

  if (!session) redirect("/");

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-50" />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-screen">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6 space-y-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <GlassCard glow="purple" className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="w-24 h-24 ring-4 ring-purple-500/30">
                      <AvatarImage src={user.avatarfull || user.avatar} alt={user.username} />
                      <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl font-bold font-display">{user.username}</h1>
                      <p className="text-sm text-muted-foreground font-mono">{user.steamid}</p>
                      <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                        <Badge variant="purple">{user.role}</Badge>
                        <a
                          href={`https://steamcommunity.com/profiles/${user.steamid64 || user.steamid}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Steam Profile
                        </a>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Swords, label: "Total Kills", value: profile?.stats.totalKills.toLocaleString() || "0", color: "from-rose-500 to-pink-600" },
                    { icon: Clock, label: "Playtime", value: `${Math.floor((profile?.stats.totalPlaytime || 0) / 3600)}h`, color: "from-cyan-500 to-blue-600" },
                    { icon: Crosshair, label: "K/D", value: (profile?.stats.kd || 0).toFixed(2), color: "from-amber-500 to-orange-600" },
                    { icon: Palette, label: "Skins Set", value: profile?.equipment.skins.toString() || "0", color: "from-purple-500 to-violet-600" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <GlassCard glow="none" className="p-4 text-center">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>

                <GlassCard glow="none">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Equipment Summary</h3>
                        <p className="text-xs text-muted-foreground">Your current loadout</p>
                      </div>
                    </div>
                    <Link href="/skins">
                      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 h-9 rounded-lg px-3 text-xs bg-gradient-to-r from-neon-purple to-purple-600 text-white shadow-lg">
                        Customize
                      </button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Knife, label: "Knives", value: `${profile?.equipment.knife} equipped` },
                      { icon: Hand, label: "Gloves", value: `${profile?.equipment.gloves} equipped` },
                      { icon: User, label: "Agents", value: profile?.equipment.agents ? "Custom" : "Default" },
                      { icon: Palette, label: "Skins", value: `${profile?.equipment.skins} items` },
                    ].map((item) => (
                      <div key={item.label} className="glass rounded-xl p-3 text-center">
                        <item.icon className="w-5 h-5 mx-auto mb-1 text-neon-cyan" />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
