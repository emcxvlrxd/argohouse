"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";
import { GlassCard } from "@/components/ui/glass-card";
import { BanForm } from "@/components/admin/ban-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Ban, Shield } from "lucide-react";

interface BanEntry {
  steamid: string;
  username: string | null;
  avatar: string | null;
  banReason: string | null;
  banExpires: string | null;
  updated_at: string;
}

export default function BansPage() {
  const [bans, setBans] = useState<BanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBans = async () => {
    try {
      const res = await fetch("/api/admin/bans");
      const data = await res.json();
      setBans(data.bans || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Ban className="w-8 h-8 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold font-display">{t("Bans")}</h1>
          <p className="text-sm text-muted-foreground">{t("Manage player bans")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard glow="none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("Active Bans")} ({bans.length})</h3>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : bans.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t("No active bans")}</p>
            ) : (
              <div className="space-y-2">
                {bans.map((ban, i) => (
                  <motion.div
                    key={ban.steamid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {ban.username || ban.steamid}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ban.banReason} {ban.banExpires ? `- Bitiş: ${new Date(ban.banExpires).toLocaleDateString()}` : `- ${t("Permanent")}`}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-[10px]">
                      {t("Banned")}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
        <div>
          <BanForm onBanCreated={fetchBans} />
        </div>
      </div>
    </div>
  );
}
