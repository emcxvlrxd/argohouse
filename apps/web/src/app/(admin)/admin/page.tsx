"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AdminLogs } from "@/components/admin/admin-logs";
import Link from "next/link";
import {
  Users,
  Palette,
  Ban,
  Terminal,
  Wifi,
  Server,
  Activity,
  AlertCircle,
} from "lucide-react";
import { t } from "@/lib/i18n";

interface AdminStats {
  users: number;
  skins: number;
  knives: number;
  gloves: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [rconError, setRconError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, serverRes] = await Promise.all([
          fetch("/api/admin?type=stats"),
          fetch("/api/admin/rcon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: "status" }),
          }),
        ]);
        const statsData = await statsRes.json();
        setStats(statsData);

        const serverData = await serverRes.json();
        if (serverData.success) {
          const lines = serverData.output.split("\n");
          let map = "N/A", name = "FENA CS2", players = "0";
          for (const line of lines) {
            const m = line.match(/map\s*:\s*(\S+)/i);
            if (m) map = m[1];
            const h = line.match(/hostname\s*:\s*(.+)/i);
            if (h) name = h[1];
            const p = line.match(/players\s*:\s*(\d+)/i);
            if (p) players = p[1];
          }
          setServerInfo({ name, map, players });
          setRconError("");
        } else {
          setRconError(serverData.error || t("Connection failed"));
        }
      } catch (e: any) {
        setRconError(e.message || t("Connection failed"));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { icon: Users, label: t("Total Users"), value: stats?.users || 0, color: "from-blue-500 to-indigo-600" },
    { icon: Palette, label: t("Total Skins"), value: stats?.skins || 0, color: "from-purple-500 to-violet-600" },
    { icon: Ban, label: t("Knives Set"), value: stats?.knives || 0, color: "from-rose-500 to-pink-600" },
    { icon: Terminal, label: t("Gloves Set"), value: stats?.gloves || 0, color: "from-cyan-500 to-teal-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">{t("Admin Panel")}</h1>
        <p className="text-sm text-muted-foreground">{t("Server management overview")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <GlassCard key={i} glow="none"><Skeleton className="h-20" /></GlassCard>
            ))
          : statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard glow="none" className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                        <p className="text-xl font-bold">{card.value}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard glow="none">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${rconError ? "text-red-400" : "text-green-400"}`} />
              <h3 className="font-semibold text-sm">{t("Server Status")}</h3>
            </div>
            <Badge variant={rconError ? "destructive" : "purple"} className="text-[10px]">
              {rconError ? t("Offline") : t("Online")}
            </Badge>
          </div>
          {loading ? (
            <Skeleton className="h-12" />
          ) : rconError ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3 text-red-400" />
              {rconError}
            </div>
          ) : (
            <div className="flex items-center gap-6 text-sm">
              <div><span className="text-muted-foreground text-xs">{t("Host")}:</span> <span className="font-mono">{serverInfo?.name || "?"}</span></div>
              <div><span className="text-muted-foreground text-xs">{t("Map")}:</span> <span className="font-mono text-cyan-300">{serverInfo?.map || "?"}</span></div>
              <div><span className="text-muted-foreground text-xs">{t("Players")}:</span> <span className="font-mono">{serverInfo?.players || "?"}</span></div>
            </div>
          )}
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
            <Link href="/admin/live">
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Activity className="w-3 h-3 mr-1" /> {t("Live Players")}
              </Button>
            </Link>
            <Link href="/admin/server">
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Server className="w-3 h-3 mr-1" /> {t("Server")}
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      <AdminLogs />
    </div>
  );
}
