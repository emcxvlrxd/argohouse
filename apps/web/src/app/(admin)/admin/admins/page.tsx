"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { UserCog, Shield } from "lucide-react";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch("/api/admin?type=admins");
        const data = await res.json();
        setAdmins(data.admins || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCog className="w-8 h-8 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold font-display">Administrators</h1>
          <p className="text-sm text-muted-foreground">Staff management</p>
        </div>
      </div>

      <GlassCard glow="none">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No admins found</p>
        ) : (
          <div className="space-y-2">
            {admins.map((admin: any, i: number) => (
              <motion.div
                key={admin.steamid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                <img
                  src={admin.avatar || ""}
                  alt={admin.username || ""}
                  className="w-12 h-12 rounded-full ring-2 ring-cyan-500/30"
                />
                <div className="flex-1">
                  <p className="font-semibold">{admin.username || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{admin.steamid}</p>
                </div>
                <Badge variant={admin.role === "owner" ? "warning" : "purple"}>
                  {admin.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Last seen: {timeAgo(admin.last_login)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
