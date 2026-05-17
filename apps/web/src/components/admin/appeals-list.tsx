"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  X,
  MessageCircle,
} from "lucide-react";

interface Appeal {
  id: number;
  steamid: string;
  type: string;
  reason: string;
  message: string;
  status: string;
  created_at: string;
}

export function AppealsList() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const res = await fetch("/api/admin/appeals");
        const data = await res.json();
        setAppeals(data.appeals || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchAppeals();
  }, []);

  const handleAction = async (id: number, action: "approve" | "deny") => {
    try {
      await fetch("/api/admin/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      setAppeals((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: action === "approve" ? "approved" : "denied" }
            : a
        )
      );
    } catch {}
  };

  const statusColors: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
    pending: "warning",
    approved: "success",
    denied: "destructive",
  };

  if (loading) {
    return (
      <GlassCard glow="none">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow="none">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold">Appeals</h3>
        <Badge variant="warning" className="ml-auto">
          {appeals.filter((a) => a.status === "pending").length} pending
        </Badge>
      </div>

      {appeals.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No appeals</p>
      ) : (
        <div className="space-y-3">
          {appeals.map((appeal, index) => (
            <motion.div
              key={appeal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{appeal.steamid}</p>
                  <p className="text-xs text-muted-foreground">
                    {appeal.type} - {appeal.reason}
                  </p>
                </div>
                <Badge
                  variant={statusColors[appeal.status]}
                  className="text-[10px]"
                >
                  {appeal.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {appeal.message}
              </p>
              {appeal.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAction(appeal.id, "approve")}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(appeal.id, "deny")}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Deny
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
