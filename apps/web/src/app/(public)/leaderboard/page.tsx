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
import { motion } from "framer-motion";
import { Trophy, Swords, Clock, Crown } from "lucide-react";
import { t } from "@/lib/i18n";

interface LeaderboardEntry {
  steamid: string;
  username: string;
  avatar: string;
  kills: number;
  deaths: number;
  playtime: number;
  kd: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topKills, setTopKills] = useState<LeaderboardEntry[]>([]);
  const [topPlaytime, setTopPlaytime] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/players?type=leaderboard");
        const data = await res.json();
        if (!data.error) {
          setTopKills(data.topKills || []);
          setTopPlaytime(data.topPlaytime || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (!session) redirect("/");

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
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-amber-400" />
              <div>
                <h1 className="text-2xl font-bold font-display">{t("Leaderboard")}</h1>
                <p className="text-sm text-muted-foreground">{t("Weekly rankings")}</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <GlassCard key={i} glow="none">
                    <Skeleton className="h-6 w-32 mb-4" />
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-14 w-full mb-2" />
                    ))}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaderboardTable
                  title="Top Kills"
                  icon={Swords}
                  color="from-rose-500 to-pink-600"
                  data={topKills}
                  valueKey="kills"
                  valueLabel="Kills"
                />
                <LeaderboardTable
                  title="Top Playtime"
                  icon={Clock}
                  color="from-cyan-500 to-blue-600"
                  data={topPlaytime}
                  valueKey="playtime"
                  valueLabel="Playtime"
                  format="time"
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function LeaderboardTable({
  title,
  icon: Icon,
  color,
  data,
  valueKey,
  valueLabel,
  format,
}: {
  title: string;
  icon: any;
  color: string;
  data: LeaderboardEntry[];
  valueKey: string;
  valueLabel: string;
  format?: string;
}) {
  return (
    <GlassCard glow="none">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {data.map((entry, i) => (
          <motion.div
            key={entry.steamid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 text-center">
              {i === 0 && <Crown className="w-5 h-5 mx-auto text-amber-400" />}
              {i === 1 && <Trophy className="w-4 h-4 mx-auto text-gray-300" />}
              {i === 2 && <Trophy className="w-4 h-4 mx-auto text-amber-600" />}
              {i > 2 && <span className="text-sm text-muted-foreground">#{i + 1}</span>}
            </div>
            <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full ring-1 ring-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.username || "Unknown"}</p>
              <p className="text-xs text-muted-foreground">K/D: {entry.kd.toFixed(2)}</p>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {format === "time"
                ? `${Math.floor(entry.playtime / 3600)}h`
                : entry.kills.toLocaleString()}
            </Badge>
          </motion.div>
        ))}
        {data.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No data yet</p>
        )}
      </div>
    </GlassCard>
  );
}
