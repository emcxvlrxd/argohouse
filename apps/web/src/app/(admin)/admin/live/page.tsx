"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Users, RefreshCw, Wifi, Ban, UserX } from "lucide-react";

interface LivePlayer {
  id: number;
  name: string;
  steamid: string;
  connected: string;
  ping: number;
  loss: number;
  state: string;
}

export default function LivePage() {
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState({ name: "", map: "", players: "0/32" });

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rcon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "status" }),
      });
      const data = await res.json();
      if (data.success) {
        parseStatus(data.output);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLive(); }, []);

  function parseStatus(output: string) {
    const lines = output.split("\n");
    const parsed: LivePlayer[] = [];
    let map = "";
    let name = "";

    for (const line of lines) {
      if (line.includes("map")) {
        const m = line.match(/map\s*:\s*(\S+)/i);
        if (m) map = m[1];
      }
      if (line.includes("hostname")) {
        const h = line.match(/hostname\s*:\s*(.+)/i);
        if (h) name = h[1];
      }
      const playerMatch = line.match(/^#\s*(\d+)\s+"(.+?)"\s+(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\w+)/);
      if (playerMatch) {
        parsed.push({
          id: parseInt(playerMatch[1]),
          name: playerMatch[2],
          steamid: playerMatch[3],
          connected: playerMatch[4],
          ping: parseInt(playerMatch[5]),
          loss: parseInt(playerMatch[6]),
          state: playerMatch[7],
        });
      }
    }

    setPlayers(parsed);
    setServerInfo({ name, map, players: `${parsed.length}/32` });
  }

  const handleKick = async (steamid: string) => {
    const res = await fetch("/api/admin/rcon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `kick "${steamid}"` }),
    });
    const data = await res.json();
    if (data.success) fetchLive();
  };

  const handleBan = async (steamid: string) => {
    const res = await fetch("/api/admin/rcon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `banid 0 "${steamid}"` }),
    });
    const data = await res.json();
    if (data.success) {
      await fetch("/api/admin/rcon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: `kick "${steamid}"` }),
      });
      fetchLive();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold font-display">{t("Live Players")}</h1>
            <p className="text-xs text-muted-foreground">{serverInfo.name || "FENA CS2"} — {serverInfo.map || "?"} — {serverInfo.players}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLive} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} />
          {t("Refresh")}
        </Button>
      </div>

      <GlassCard glow="none">
        {loading && players.length === 0 ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{t("No players online")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {players.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {p.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{p.steamid}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={cn("font-mono", p.ping < 60 ? "text-green-400" : p.ping < 120 ? "text-yellow-400" : "text-red-400")}>
                    {p.ping}ms
                  </span>
                  <span className="hidden sm:inline">{p.connected}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => handleKick(p.steamid)}>
                    <UserX className="w-3 h-3 mr-1" />
                    {t("Kick")}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-red-400 hover:text-red-300" onClick={() => handleBan(p.steamid)}>
                    <Ban className="w-3 h-3 mr-1" />
                    {t("Ban")}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
