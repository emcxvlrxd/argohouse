"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { AdminLogs } from "@/components/admin/admin-logs";
import {
  Shield,
  Users,
  Palette,
  Ban,
  Terminal,
  Activity,
} from "lucide-react";

interface AdminStats {
  users: number;
  skins: number;
  knives: number;
  gloves: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin?type=stats");
        const data = await res.json();
        setStats(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.users || 0, color: "from-blue-500 to-indigo-600" },
    { icon: Palette, label: "Total Skins", value: stats?.skins || 0, color: "from-purple-500 to-violet-600" },
    { icon: Ban, label: "Knives Set", value: stats?.knives || 0, color: "from-rose-500 to-pink-600" },
    { icon: Terminal, label: "Gloves Set", value: stats?.gloves || 0, color: "from-cyan-500 to-teal-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Server management overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <GlassCard key={i} glow="none">
                <Skeleton className="h-20" />
              </GlassCard>
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
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {card.label}
                        </p>
                        <p className="text-xl font-bold">{card.value}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
      </div>

      <AdminLogs />
    </div>
  );
}
