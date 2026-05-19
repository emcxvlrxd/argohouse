"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { MessageCircle, Check, X, Eye, ImageIcon, FileText } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{ c: any; status: string } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/complaints");
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const updateStatus = async (id: number, status: string, note: string) => {
    const res = await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote: note.trim() || undefined }),
    });
    if (res.ok) {
      setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status, adminNote: note.trim() || c.adminNote } : c)));
      setActionModal(null);
      setAdminNote("");
    }
  };

  const statusBadge: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
    open: "warning",
    resolved: "success",
    dismissed: "destructive",
  };

  const statusLabels: Record<string, string> = {
    open: "Açık",
    resolved: "Çözüldü",
    dismissed: "Reddedildi",
  };

  const parseEvidence = (evidence: string | null): string[] => {
    if (!evidence) return [];
    try { return JSON.parse(evidence); } catch { return []; }
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
            {complaints.map((c, i) => {
              const images = parseEvidence(c.evidence);
              return (
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
                    {c.adminNote && (
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                        <FileText className="w-2.5 h-2.5 inline mr-0.5" />
                        {c.adminNote}
                      </p>
                    )}
                  </div>
                  {images.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <ImageIcon className="w-2.5 h-2.5" />
                      {images.length}
                    </Badge>
                  )}
                  <Badge variant={statusBadge[c.status]} className="text-[10px]">{statusLabels[c.status] || c.status}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(c)}><Eye className="w-3.5 h-3.5" /></Button>
                  {c.status === "open" && (
                    <>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-400"
                        onClick={() => { setActionModal({ c, status: "resolved" }); setAdminNote(""); }}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400"
                        onClick={() => { setActionModal({ c, status: "dismissed" }); setAdminNote(""); }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Action confirmation modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActionModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-md">
            <GlassCard glow="none" className="p-5">
              <h3 className="text-lg font-bold mb-2">
                {actionModal.status === "resolved" ? t("Resolved") : t("Dismissed")}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">{actionModal.c.title} — {actionModal.c.username}</p>
              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-muted-foreground">{t("Admin Note (reason for decision)")}</label>
                <textarea
                  placeholder={t("Enter note about resolution...")}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant={actionModal.status === "resolved" ? "default" : "destructive"}
                  onClick={() => updateStatus(actionModal.c.id, actionModal.status, adminNote)}
                >
                  {actionModal.status === "resolved" ? t("Resolved") : t("Dismissed")}
                </Button>
                <Button variant="outline" onClick={() => setActionModal(null)}>{t("Cancel")}</Button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-lg">
            <GlassCard glow="none" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{selected.title}</h3>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(null)}>×</Button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{selected.username} — {new Date(selected.created_at).toLocaleString()}</p>
              <Badge variant={statusBadge[selected.status]} className="text-[10px] mb-3">{statusLabels[selected.status] || selected.status}</Badge>
              <p className="text-sm mb-4">{selected.message}</p>
              {selected.adminNote && (
                <div className="mb-4 rounded-lg bg-white/[0.03] border border-white/5 p-3">
                  <p className="text-xs font-bold text-muted-foreground mb-1">{t("Admin Note")}</p>
                  <p className="text-sm">{selected.adminNote}</p>
                </div>
              )}
              {parseEvidence(selected.evidence).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-2">{t("Evidence")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {parseEvidence(selected.evidence).map((img: string, i: number) => (
                      <div key={i} className="rounded-xl overflow-hidden bg-black/50">
                        <img src={img} alt="" className="w-full h-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
