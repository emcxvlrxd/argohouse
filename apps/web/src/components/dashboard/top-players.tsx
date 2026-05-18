"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trophy, Swords, Clock, Crown, User } from "lucide-react";
import { t } from "@/lib/i18n";

interface PlayerEntry {
  steamid: string;
  username: string;
  avatar: string;
  kills: number;
  deaths: number;
  playtime: number;
  kd: number;
}

export function TopPlayers() {
  const [topKills, setTopKills] = useState<PlayerEntry[]>([]);
  const [topPlaytime, setTopPlaytime] = useState<PlayerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <GlassCard key={i} glow="none">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LeaderboardCard
        title={t("Top Kills")}
        icon={Swords}
        color="from-rose-500 to-pink-600"
        data={topKills}
        valueLabel={t("Kills")}
        valueKey="kills"
      />
      <LeaderboardCard
        title={t("Top Playtime")}
        icon={Clock}
        color="from-cyan-500 to-blue-600"
        data={topPlaytime}
        valueLabel={t("Time")}
        valueKey="playtime"
        format="time"
      />
    </div>
  );
}

function LeaderboardCard({
  title,
  icon: Icon,
  color,
  data,
  valueLabel,
  valueKey,
  format,
}: {
  title: string;
  icon: any;
  color: string;
  data: PlayerEntry[];
  valueLabel: string;
  valueKey: string;
  format?: string;
}) {
  return (
    <GlassCard glow="none">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("No data available yet")}
          </p>
        )}
        {data.map((player, index) => (
          <motion.div
            key={player.steamid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 text-center">
              {index < 3 ? (
                <Trophy
                  className={`w-4 h-4 mx-auto ${
                    index === 0
                      ? "text-amber-400"
                      : index === 1
                      ? "text-gray-300"
                      : "text-amber-600"
                  }`}
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  #{index + 1}
                </span>
              )}
            </div>
            <Avatar className="h-8 w-8 ring-1 ring-white/10">
              <AvatarImage
                src={player.avatar}
                alt={player.username}
              />
              <AvatarFallback>
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {player.username || t("Unknown")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("K/D")}: {player.kd.toFixed(2)}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {format === "time"
                ? `${Math.floor(player.playtime / 3600)}h`
                : player.kills.toLocaleString()}
            </Badge>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
