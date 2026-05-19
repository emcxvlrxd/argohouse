"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ScrollText, Shield, Ban, UserCog, Flag } from "lucide-react";
import { t } from "@/lib/i18n";
import { AdminLogEntry } from "@/types";

const actionColors: Record<string, string> = {
  ban: "text-red-400 bg-red-500/10",
  unban: "text-green-400 bg-green-500/10",
  kick: "text-amber-400 bg-amber-500/10",
  role: "text-purple-400 bg-purple-500/10",
  report: "text-cyan-400 bg-cyan-500/10",
  default: "text-gray-400 bg-gray-500/10",
};

export function AdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin?type=logs");
        const data = await res.json();
        setLogs(data.logs || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard glow="none">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">{t("Admin Logs")}</h3>
          <p className="text-xs text-muted-foreground">{t("Recent actions")}</p>
        </div>
        <Badge variant="purple" className="ml-auto">
          {logs.length}
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t("No logs yet")}</p>
      ) : (
        <div className="space-y-1">
          {logs.slice(0, 20).map((log, index) => {
            const actionType = log.action.toLowerCase().split(" ")[0];
            const colorClass = actionColors[actionType] || actionColors.default;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}
                >
                  {actionType === "ban" ? (
                    <Ban className="w-4 h-4" />
                  ) : actionType === "role" ? (
                    <UserCog className="w-4 h-4" />
                  ) : actionType === "report" ? (
                    <Flag className="w-4 h-4" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.username || log.steamid}</span>
                    {" "}{log.action}
                  </p>
                  {log.target && (
                    <p className="text-xs text-muted-foreground truncate">
                      {log.target}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(log.created_at)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / 1000
  );
  if (diff < 60) return "şimdi";
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
  return `${Math.floor(diff / 86400)}g`;
}
