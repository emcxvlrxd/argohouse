"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { MessageCircle, Check, X, Eye } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/complaints");
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    }
  };

  const statusBadge: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
    open: "warning",
    resolved: "success",
    dismissed: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold font-display">{t("Complaints")}</h1>
          <p className="text-xs text-muted-foreground">{t("Player reports management")}</p>
        </div>
      </div>

      <GlassCard glow="none">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">{t("No complaints submitted yet")}</p>
        ) : (
          <div className="space-y-2">
            {complaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.username} — {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={statusBadge[c.status]} className="text-[10px]">{c.status}</Badge>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(c)}><Eye className="w-3.5 h-3.5" /></Button>
                {c.status === "open" && (
                  <>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-400" onClick={() => updateStatus(c.id, "resolved")}><Check className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={() => updateStatus(c.id, "dismissed")}><X className="w-3.5 h-3.5" /></Button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()}>
          <GlassCard glow="none" className="w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{selected.title}</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(null)}>×</Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{selected.username} — {new Date(selected.created_at).toLocaleString()}</p>
            <p className="text-sm">{selected.message}</p>
          </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
