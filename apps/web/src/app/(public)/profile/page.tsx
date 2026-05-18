"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
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
  Clock,
  Swords,
  HandMetal,
  ExternalLink,
  Crosshair,
  Music,
  Medal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

function toAbsoluteUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("http")) return url;
  return `https://raw.githubusercontent.com/Nereziel/cs2-WeaponPaints/main/website/img/skins/${url}`;
}

function ProfileContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const viewSteamid = searchParams.get("steamid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipment, setEquipment] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mySteamid = (session?.user as any)?.steamid;
  const targetSteamid = viewSteamid || mySteamid;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [equipRes, statsRes] = await Promise.all([
          fetch(`/api/skins?type=equipped&steamid=${targetSteamid}`),
          fetch(`/api/players?type=stats&steamid=${targetSteamid}`),
        ]);
        const equip = await equipRes.json();
        const statsData = await statsRes.json();

        setEquipment(equip);
        setStats(statsData);

        if (targetSteamid && targetSteamid !== mySteamid) {
          const userRes = await fetch(`/api/players?steamid=${targetSteamid}`);
          const userData = await userRes.json();
          setProfileUser(userData.user || userData);
        } else {
          setProfileUser(session?.user);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    if (session) fetchProfile();
  }, [session, targetSteamid, mySteamid]);

  if (!session) redirect("/");

  const displayUser = profileUser || session?.user;
  const equipItems: { icon: any; label: string; items: any[] }[] = [];

  if (equipment?.skins?.length) {
    equipItems.push({ icon: Crosshair, label: t("Skin"), items: equipment.skins });
  }
  if (equipment?.knife?.length) {
    equipItems.push({ icon: Swords, label: t("Knife"), items: equipment.knife });
  }
  if (equipment?.gloves?.length) {
    equipItems.push({ icon: HandMetal, label: t("Glove"), items: equipment.gloves });
  }
  if (equipment?.agents?.length) {
    equipItems.push({ icon: Users, label: t("Agent"), items: equipment.agents });
  }
  if (equipment?.music?.length) {
    equipItems.push({ icon: Music, label: t("Music"), items: equipment.music });
  }
  if (equipment?.pins?.length) {
    equipItems.push({ icon: Medal, label: t("Pin"), items: equipment.pins });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-50" />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-screen lg:pl-64">
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
                      <AvatarImage src={displayUser?.avatarfull || displayUser?.avatar} alt={displayUser?.username} />
                      <AvatarFallback><User className="w-8 h-8" /></AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl font-bold font-display">{displayUser?.username || "Unknown"}</h1>
                      <p className="text-sm text-muted-foreground font-mono">{targetSteamid}</p>
                      <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                        <Badge variant="purple">{displayUser?.role || "user"}</Badge>
                        <a
                          href={`https://steamcommunity.com/profiles/${displayUser?.steamid64 || targetSteamid}`}
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
                    { icon: Swords, label: t("Total Kills"), value: stats?.totalKills?.toLocaleString() || "0", color: "from-rose-500 to-pink-600" },
                    { icon: Clock, label: t("Playtime"), value: `${Math.floor((stats?.totalPlaytime || 0) / 3600)}h`, color: "from-cyan-500 to-blue-600" },
                    { icon: Crosshair, label: t("K/D"), value: (stats?.kd || 0).toFixed(2), color: "from-amber-500 to-orange-600" },
                    { icon: Palette, label: t("Skins Set"), value: `${equipment?.skins?.length || 0}`, color: "from-purple-500 to-violet-600" },
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

                {equipItems.length > 0 && (
                  <GlassCard glow="none">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t("Equipment")}</h3>
                        <p className="text-xs text-muted-foreground">{t("Current loadout")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {equipItems.map((section) => {
                        // Deduplicate: agents keep both T/CT, others show unique by item key
                        const seenKeys = new Set<string>();
                        const dedupedItems = section.label === t("Agent") ? section.items : section.items.filter((item: any) => {
                          const key = item.knife || item.weapon || item.music_id || item.id || item.weapon_defindex || "";
                          if (!key || seenKeys.has(String(key))) return false;
                          seenKeys.add(String(key));
                          return true;
                        });
                        return (
                        <div key={section.label} className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 uppercase tracking-wider border-b border-white/5 pb-2">
                            <section.icon className="w-4 h-4 text-neon-purple" />
                            <span className="font-semibold">{section.label}</span>
                          </div>
                          <div className="space-y-1.5">
                            {dedupedItems.length === 0 && (
                              <p className="text-[10px] text-muted-foreground/40 text-center py-3">Yok</p>
                            )}
                            {dedupedItems.map((item: any, i: number) => {
                              const itemName = item.paint_name || item.name || item.weapon || item.knife || "Unknown";
                              let itemImg = item.cdnImage || toAbsoluteUrl(item.image || "");
                              const isAgent = section.label === t("Agent");
                              const isMusic = section.label === t("Music");
                              const isPin = section.label === t("Pin");
                              if (isAgent) itemImg = item.image || "";
                              if (isMusic) itemImg = item.image || "";
                              if (isPin) itemImg = item.image || "";
                              const sublabel = isAgent ? (item.team === 2 ? "T" : item.team === 3 ? "CT" : "") : (item.weapon?.replace("weapon_", "") || item.knife?.replace("weapon_", "") || "");
                              return (
                                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-2 border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                                  <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white/5">
                                    {itemImg ? (
                                      <img src={itemImg} alt={itemName} className="w-full h-full object-contain" loading="lazy" />
                                    ) : (
                                      <section.icon className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate leading-tight text-white/90">{itemName}</p>
                                    {sublabel && (
                                      <p className="text-[10px] text-muted-foreground/60 truncate leading-tight mt-0.5">{sublabel}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                )}

                {equipItems.length === 0 && (
                  <GlassCard glow="none">
                    <p className="text-center text-muted-foreground py-8">{t("No equipment data available")}</p>
                  </GlassCard>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-48 w-96" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
