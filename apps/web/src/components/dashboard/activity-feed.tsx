"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, User, Shield, AlertTriangle } from "lucide-react";
import { t } from "@/lib/i18n";

interface ActivityItem {
  id: number;
  steamid: string;
  username?: string;
  action: string;
  target?: string;
  created_at: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/players?type=activity");
        const data = await res.json();
        if (!data.error) setActivities(data.activities || []);
      } catch {}
    };
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes("ban")) return Shield;
    if (action.toLowerCase().includes("report")) return AlertTriangle;
    return User;
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes("ban")) return "text-red-400 bg-red-500/10";
    if (action.toLowerCase().includes("admin")) return "text-cyan-400 bg-cyan-500/10";
    if (action.toLowerCase().includes("join")) return "text-emerald-400 bg-emerald-500/10";
    return "text-purple-400 bg-purple-500/10";
  };

  return (
    <GlassCard glow="none">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">{t("Recent Activity")}</h3>
          <p className="text-xs text-muted-foreground">{t("Live feed")}</p>
        </div>
        {activities.length > 0 && (
          <Badge variant="purple" className="ml-auto">
            {activities.length}
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        {activities.filter(a => !a.action.toLowerCase().includes("skin")).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("No recent activity")}
          </p>
        )}
        {activities.filter(a => !a.action.toLowerCase().includes("skin")).slice(0, 10).map((item, index) => {
          const Icon = getActionIcon(item.action);
          const color = getActionColor(item.action);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{item.username || item.steamid}</span>
                  {" "}{item.action}
                </p>
                {item.target && (
                  <p className="text-xs text-muted-foreground">
                    Target: {item.target}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo(item.created_at)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
