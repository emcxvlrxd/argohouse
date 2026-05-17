"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Player {
  steamid: string;
  username: string | null;
  avatar: string | null;
  role: string;
  last_login: string;
  isBanned: boolean;
}

export default function PlayersPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("/api/players");
        const data = await res.json();
        setPlayers(data.players || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  if (!session) redirect("/");

  const filtered = players.filter(
    (p) =>
      p.username?.toLowerCase().includes(search.toLowerCase()) ||
      p.steamid?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-50" />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-screen">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display">{t("Players")}</h1>
                <p className="text-sm text-muted-foreground">{players.length} {t("total players")}</p>
              </div>
            </div>
            <GlassCard glow="none">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search players...")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((player, i) => (
                    <Link href={`/profile?steamid=${player.steamid}`}>
                      <motion.div
                        key={player.steamid}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <img
                          src={player.avatar || ""}
                          alt={player.username || ""}
                          className="w-10 h-10 rounded-full ring-2 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {player.username || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {player.steamid}
                          </p>
                        </div>
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
                          {timeAgo(player.last_login)}
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">{t("No players found")}</p>
                  )}
                </div>
              )}
            </GlassCard>
          </main>
        </div>
      </div>
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return t("now");
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
