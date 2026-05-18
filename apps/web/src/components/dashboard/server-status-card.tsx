"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerStatus } from "@/types";
import { motion } from "framer-motion";
import {
  Server,
  Users,
  Map as MapIcon,
  Activity,
  Zap,
  Globe,
} from "lucide-react";
import { t } from "@/lib/i18n";

export function ServerStatusCard() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/server");
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({ online: false });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <GlassCard glow="purple">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow="purple" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{t("Server Status")}</h3>
              <p className="text-xs text-muted-foreground">{status?.name || "FENA CS2"}</p>
            </div>
          </div>
          <Badge
            variant={status?.online ? "success" : "destructive"}
            className="text-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
            {status?.online ? t("Online") : t("Offline")}
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatItem
            icon={Users}
            label={t("Players")}
            value={`${status?.players || 0} / ${status?.maxplayers || 0}`}
            delay={0}
          />
          <StatItem
            icon={MapIcon}
            label={t("Map")}
            value={status?.map || "..."}
            delay={0.1}
          />
          <StatItem
            icon={Activity}
            label={t("Ping")}
            value={status?.ping != null ? `${status.ping}ms` : "..."}
            delay={0.2}
          />
          <StatItem
            icon={Zap}
            label={t("Tickrate")}
            value={status?.tickrate ? `${status.tickrate}` : "64"}
            delay={0.3}
          />
        </motion.div>
      </div>
    </GlassCard>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-neon-purple" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </motion.div>
  );
}
