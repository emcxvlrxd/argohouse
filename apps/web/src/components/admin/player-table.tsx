"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { User, Search, Shield, Eye, Ban } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  id: string;
  steamid: string;
  steamid64: string;
  username: string | null;
  avatar: string | null;
  role: string;
  isBanned: boolean;
  last_login: string;
  skinCount: number;
  knifeCount: number;
  gloveCount: number;
  agentCount: number;
  musicCount: number;
}

const roleColor: Record<string, "purple" | "info" | "secondary" | "destructive"> = {
  owner: "purple",
  admin: "purple",
  moderator: "info",
  user: "secondary",
};

export function PlayerTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [equipment, setEquipment] = useState<any>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/admin?type=players");
        const data = await res.json();
        setPlayers(data.players || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(
    (p) =>
      p.username?.toLowerCase().includes(search.toLowerCase()) ||
      p.steamid?.toLowerCase().includes(search.toLowerCase()) ||
      p.steamid64?.toLowerCase().includes(search.toLowerCase())
  );

  const changeRole = async (steamid64: string, newRole: string) => {
    const res = await fetch("/api/admin/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamid64, newRole }),
    });
    if (res.ok) {
      setPlayers((prev) => prev.map((p) => (p.steamid64 === steamid64 ? { ...p, role: newRole } : p)));
    }
  };

  const toggleBan = async (steamid64: string, currentlyBanned: boolean) => {
    if (currentlyBanned) {
      const res = await fetch("/api/admin/bans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamid64 }),
      });
      if (res.ok) {
        setPlayers((prev) => prev.map((p) => (p.steamid64 === steamid64 ? { ...p, isBanned: false } : p)));
      }
    } else {
      const reason = prompt("Ban reason:");
      if (!reason) return;
      const res = await fetch("/api/admin/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamid64, reason, duration: 0 }),
      });
      if (res.ok) {
        setPlayers((prev) => prev.map((p) => (p.steamid64 === steamid64 ? { ...p, isBanned: true } : p)));
      }
    }
  };

  const viewEquipment = async (player: Player) => {
    setSelectedPlayer(player);
    setEquipment(null);
    try {
      const res = await fetch(`/api/admin/equipment?steamid64=${player.steamid64}`);
      const data = await res.json();
      setEquipment(data);
    } catch {}
  };

  return (
    <>
      <GlassCard glow="none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("Search players...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Badge variant="purple" className="text-xs">
            {filteredPlayers.length} {t("players")}
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Avatar className="h-10 w-10 ring-2 ring-white/10 flex-shrink-0">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.username || ""} className="rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{player.username || t("Unknown")}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{player.steamid64 || player.steamid}</p>
                </div>

                {/* Role dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium">
                    <Badge variant={roleColor[player.role] || "secondary"} className="text-[10px] px-2 py-0.5">
                      {player.role}
                    </Badge>
                    <Shield className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-32 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 hidden group-hover:block z-50 shadow-2xl">
                    {["user", "moderator", "admin"].map((role) => (
                      <button
                        key={role}
                        onClick={() => changeRole(player.steamid64, role)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors",
                          player.role === role ? "bg-cyan-500/20 text-cyan-300" : "hover:bg-white/10"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => viewEquipment(player)} title={t("View Equipment")}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-7 w-7 p-0", player.isBanned ? "text-red-400" : "text-muted-foreground")}
                    onClick={() => toggleBan(player.steamid64, player.isBanned)}
                    title={player.isBanned ? "Unban" : t("Ban")}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground ml-1 font-mono">{player.skinCount}s {player.knifeCount}k {player.gloveCount}g</span>
                </div>
              </motion.div>
            ))}
            {filteredPlayers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t("No players found")}</p>
            )}
          </div>
        )}
      </GlassCard>

      {/* Equipment modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)}>
          <div onClick={(e) => e.stopPropagation()}>
          <GlassCard glow="none" className="w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 ring-2 ring-white/10">
                {selectedPlayer.avatar ? (
                  <img src={selectedPlayer.avatar} alt="" className="rounded-full" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedPlayer.username || t("Unknown")}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedPlayer.steamid64 || selectedPlayer.steamid}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={() => setSelectedPlayer(null)}>×</Button>
            </div>
            {equipment ? (
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: t("Skins"), value: equipment.equipment?.skins || 0, color: "text-cyan-400" },
                  { label: t("Knives"), value: equipment.equipment?.knife || 0, color: "text-purple-400" },
                  { label: t("Gloves"), value: equipment.equipment?.gloves || 0, color: "text-yellow-400" },
                  { label: t("Agents"), value: equipment.equipment?.agents || 0, color: "text-green-400" },
                  { label: t("Music"), value: equipment.equipment?.music || 0, color: "text-pink-400" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/5">
                    <p className={cn("text-lg font-bold font-display", item.color)}>{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">{t("Loading equipment...")}</p>
            )}
          </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}
