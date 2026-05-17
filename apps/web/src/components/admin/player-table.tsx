"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Search, Shield, Ban, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  id: string;
  steamid: string;
  username: string | null;
  avatar: string | null;
  role: string;
  isBanned: boolean;
  last_login: string;
  skinCount: number;
}

export function PlayerTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
      p.steamid?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GlassCard glow="none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Badge variant="purple" className="text-xs">
          {filteredPlayers.length} players
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
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
              <Avatar className="h-10 w-10 ring-2 ring-white/10">
                <img
                  src={player.avatar || ""}
                  alt={player.username || ""}
                  className="rounded-full"
                />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {player.username || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {player.steamid}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    player.role === "admin"
                      ? "purple"
                      : player.role === "moderator"
                      ? "info"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {player.role}
                </Badge>
                {player.isBanned && (
                  <Badge variant="destructive" className="text-[10px]">
                    Banned
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {player.skinCount} skins
                </span>
              </div>
            </motion.div>
          ))}
          {filteredPlayers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No players found
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
