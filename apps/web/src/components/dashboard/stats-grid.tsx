"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Crosshair,
  Clock,
  Swords,
  Calendar,
} from "lucide-react";
import { t } from "@/lib/i18n";

interface Stats {
  totalPlayers: number;
  totalKills: number;
  totalPlaytime: number;
  weeklyKills: number;
  topKD: number;
  resetIn?: string;
}

export function StatsGrid() {
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    totalKills: 0,
    totalPlaytime: 0,
    weeklyKills: 0,
    topKD: 0,
    resetIn: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/players?type=stats");
        const data = await res.json();
        if (!data.error) {
          // Calculate time until next Sunday midnight
          const now = new Date();
          const nextSunday = new Date(now);
          nextSunday.setHours(24, 0, 0, 0);
          nextSunday.setDate(now.getDate() + (7 - now.getDay()));
          const diffMs = nextSunday.getTime() - now.getTime();
          const days = Math.floor(diffMs / 86400000);
          const hours = Math.floor((diffMs % 86400000) / 3600000);
          data.resetIn = days > 0 ? `${days}g ${hours}s` : `${hours}s`;
          setStats(data);
        }
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      icon: Crosshair,
      label: t("Total Kills"),
      value: stats.totalKills.toLocaleString(),
      color: "from-purple-500 to-purple-600",
      delay: 0,
    },
    {
      icon: Clock,
      label: t("Total Playtime"),
      value: `${Math.floor(stats.totalPlaytime / 3600)}h`,
      color: "from-cyan-500 to-cyan-600",
      delay: 0.1,
    },
    {
      icon: Swords,
      label: t("Weekly Kills"),
      value: stats.weeklyKills.toLocaleString(),
      color: "from-pink-500 to-pink-600",
      delay: 0.2,
    },
    {
      icon: Calendar,
      label: t("Sıfırlanma"),
      value: stats.resetIn || "...",
      color: "from-amber-500 to-amber-600",
      delay: 0.3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay, duration: 0.5 }}
          >
            <GlassCard glow="none" className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
