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
  // Build team-split equipment data
  const tKnife = equipment?.knife?.filter((k: any) => k.weapon_team !== 3) || [];
  const ctKnife = equipment?.knife?.filter((k: any) => k.weapon_team === 3) || [];
  const tGloves = equipment?.gloves?.filter((g: any) => g.weapon_team !== 3) || [];
  const ctGloves = equipment?.gloves?.filter((g: any) => g.weapon_team === 3) || [];
  const tSkins = equipment?.skins?.filter((s: any) => s.weapon_team !== 3) || [];
  const ctSkins = equipment?.skins?.filter((s: any) => s.weapon_team === 3) || [];
  const tAgent = equipment?.agents?.find((a: any) => a.agent_t) || null;
  const ctAgent = equipment?.agents?.find((a: any) => a.agent_ct) || null;

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

                {(() => {
                  const hasAnyEquipment = tKnife.length || ctKnife.length || tGloves.length || ctGloves.length || tAgent || ctAgent || tSkins.length || ctSkins.length || equipment?.music?.length || equipment?.pins?.length;
                  if (!hasAnyEquipment) return (
                    <GlassCard glow="none">
                      <p className="text-center text-muted-foreground py-8">{t("No equipment data available")}</p>
                    </GlassCard>
                  );
                  const teamColumns = [
                    { key: "t", badge: "T", badgeColor: "bg-yellow-500 text-black", label: "TERRORIST", knife: tKnife, gloves: tGloves, agent: tAgent, agentField: "agent_t", skins: tSkins },
                    { key: "ct", badge: "CT", badgeColor: "bg-blue-500 text-white", label: "COUNTER TERRORIST", knife: ctKnife, gloves: ctGloves, agent: ctAgent, agentField: "agent_ct", skins: ctSkins },
                  ];
                  return (
                  <GlassCard glow="none">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Palette className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{t("Equipment")}</h3>
                        <p className="text-[10px] text-muted-foreground">{t("Current loadout")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {teamColumns.map((col) => {
                        const agentItem = col.agent;
                        const agentModel = agentItem?.[col.agentField as keyof typeof agentItem] as string || "";
                        return (
                        <div key={col.key} className={`rounded-lg ${col.key === "t" ? "bg-yellow-500/5 border-yellow-500/10" : "bg-blue-500/5 border-blue-500/10"} border p-3`}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[10px] font-bold ${col.badgeColor} px-1.5 py-0.5 rounded`}>{col.badge}</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">{col.label}</span>
                          </div>
                          {col.knife.length > 0 && (
                            <div className="mb-2.5">
                              <div className="flex items-center gap-1 mb-1">
                                <Swords className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{t("Knife")}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {col.knife.map((item: any, i: number) => {
                                  const name = item.paint_name || item.knife || "Unknown";
                                  const img = item.cdnImage || toAbsoluteUrl(item.image || "");
                                  return (
                                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1 border border-white/[0.06]">
                                      <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                                        {img ? <img src={img} alt={name} className="w-full h-full object-contain" loading="lazy" /> : <Swords className="w-3.5 h-3.5 text-muted-foreground" />}
                                      </div>
                                      <span className="text-[11px] font-medium truncate max-w-[110px] text-white/80">{name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {col.gloves.length > 0 && (
                            <div className="mb-2.5">
                              <div className="flex items-center gap-1 mb-1">
                                <HandMetal className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{t("Glove")}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {col.gloves.map((item: any, i: number) => {
                                  const name = item.paint_name || item.gloves || "Unknown";
                                  const img = item.cdnImage || toAbsoluteUrl(item.image || "");
                                  return (
                                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1 border border-white/[0.06]">
                                      <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                                        {img ? <img src={img} alt={name} className="w-full h-full object-contain" loading="lazy" /> : <HandMetal className="w-3.5 h-3.5 text-muted-foreground" />}
                                      </div>
                                      <span className="text-[11px] font-medium truncate max-w-[110px] text-white/80">{name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {agentItem && agentModel && (
                            <div className="mb-2.5">
                              <div className="flex items-center gap-1 mb-1">
                                <Users className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{t("Agent")}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1 border border-white/[0.06]">
                                  <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                                    {agentItem.image ? <img src={agentItem.image} alt={agentItem.paint_name || "Agent"} className="w-full h-full object-contain" loading="lazy" /> : <Users className="w-3.5 h-3.5 text-muted-foreground" />}
                                  </div>
                                  <span className="text-[11px] font-medium truncate max-w-[110px] text-white/80">{agentItem.paint_name || "Agent"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {col.skins.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Crosshair className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{t("Skin")}</span>
                                <span className="text-[9px] text-muted-foreground/30">({col.skins.length})</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {col.skins.map((item: any, i: number) => {
                                  const name = item.paint_name || item.weapon || "Unknown";
                                  const img = item.cdnImage || toAbsoluteUrl(item.image || "");
                                  return (
                                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1 border border-white/[0.06]">
                                      <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                                        {img ? <img src={img} alt={name} className="w-full h-full object-contain" loading="lazy" /> : <Crosshair className="w-3.5 h-3.5 text-muted-foreground" />}
                                      </div>
                                      <span className="text-[11px] font-medium truncate max-w-[110px] text-white/80">{name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                    {(equipment?.music?.length > 0 || equipment?.pins?.length > 0) && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-4">
                        {equipment?.music?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Music className="w-3 h-3 text-muted-foreground/60" />
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{t("Music")}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {equipment.music.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1 border border-white/[0.06]">
                                  <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.image ? <img src={item.image} alt={item.paint_name || "Music"} className="w-full h-full object-contain" loading="lazy" /> : <Music className="w-3.5 h-3.5 text-muted-foreground" />}
                                  </div>
                                  <span className="text-[11px] font-medium truncate max-w-[130px] text-white/80">{item.paint_name || `Music Kit #${item.music_id}`}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {equipment?.pins?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Medal className="w-3 h-3 text-muted-foreground/60" />
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">{t("Pin")}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {equipment.pins.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1 border border-white/[0.06]">
                                  <div className="w-7 h-7 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.image ? <img src={item.image} alt={item.paint_name || "Pin"} className="w-full h-full object-contain" loading="lazy" /> : <Medal className="w-3.5 h-3.5 text-muted-foreground" />}
                                  </div>
                                  <span className="text-[11px] font-medium truncate max-w-[130px] text-white/80">{item.paint_name || `Pin #${item.pin}`}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>
                  );
                })()}
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
