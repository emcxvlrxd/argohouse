"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { AlertTriangle, Check, X, Eye, ImageIcon } from "lucide-react";

interface Appeal {
  id: number;
  steamid: string;
  type: string;
  reason: string;
  message: string;
  evidence: string | null;
  status: string;
  created_at: string;
}

export function AppealsList() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

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

  const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    approved: "Onaylandı",
    denied: "Reddedildi",
  };

  const parseEvidence = (evidence: string | null): string[] => {
    if (!evidence) return [];
    try { return JSON.parse(evidence); } catch { return []; }
  };

  if (loading) {
    return (
      <GlassCard glow="none">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </GlassCard>
    );
  }

  const pendingCount = appeals.filter((a) => a.status === "pending").length;

  return (
    <>
      <GlassCard glow="none">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{t("Appeals")}</h3>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0
                ? `${pendingCount} bekleyen itiraz`
                : "Bekleyen itiraz yok"}
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="warning" className="ml-auto text-xs">
              {pendingCount} bekliyor
            </Badge>
          )}
        </div>

        {appeals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t("No appeals")}</p>
        ) : (
          <div className="space-y-3">
            {appeals.map((appeal, index) => {
              const images = parseEvidence(appeal.evidence);
              return (
                <motion.div
                  key={appeal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl p-4 border ${
                    appeal.status === "pending"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {appeal.status === "pending" && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                        <p className="text-sm font-medium">{appeal.steamid}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {appeal.type === "ban" ? "Yasak" : appeal.type === "mute" ? "Susturma" : appeal.type} — {appeal.reason}
                      </p>
                    </div>
                    <Badge
                      variant={statusColors[appeal.status]}
                      className="text-[10px]"
                    >
                      {statusLabels[appeal.status] || appeal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {appeal.message}
                  </p>
                  {images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {images.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg bg-black/30 overflow-hidden cursor-pointer border border-white/10"
                          onClick={() => setSelectedAppeal(appeal)}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {images.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-black/30 flex items-center justify-center text-xs text-muted-foreground border border-white/10">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {appeal.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-xs h-8"
                          onClick={() => handleAction(appeal.id, "approve")}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {t("Approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs h-8"
                          onClick={() => handleAction(appeal.id, "deny")}
                        >
                          <X className="w-3 h-3 mr-1" />
                          {t("Deny")}
                        </Button>
                      </>
                    )}
                    {images.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 ml-auto"
                        onClick={() => setSelectedAppeal(appeal)}
                      >
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {images.length} dosya
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Evidence viewer modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAppeal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl mx-4">
            <GlassCard glow="none" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">İtiraz #{selectedAppeal.id} — {selectedAppeal.steamid}</h3>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedAppeal(null)}>×</Button>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{selectedAppeal.type} — {selectedAppeal.reason}</p>
              <p className="text-sm mb-4">{selectedAppeal.message}</p>
              <div className="grid grid-cols-2 gap-3">
                {parseEvidence(selectedAppeal.evidence).map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-black/50">
                    <img src={img} alt="" className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}
