"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { MessageCircle, Send, Paperclip, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { t } from "@/lib/i18n";

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  if (!session) redirect("/");

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const res = await fetch("/api/complaints");
        const data = await res.json();
        setComplaints(data.complaints || []);
      } catch {} finally { setLoadingList(false); }
    };
    loadComplaints();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPreviews((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, message }) });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Şikayet gönderildi!");
        setTitle(""); setMessage(""); setFiles([]); setPreviews([]);
        setComplaints((prev) => [data.complaint, ...prev]);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toast message={successMsg || "Şikayet başarıyla gönderildi!"} type="success" visible={!!successMsg} onClose={() => setSuccessMsg("")} />
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-50" />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-screen lg:pl-64">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-8 h-8 text-neon-purple" />
              <div>
                <h1 className="text-2xl font-bold font-display">{t("Complaints")}</h1>
                <p className="text-sm text-muted-foreground">{t("Submit and track complaints")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard glow="none">
                  <h3 className="font-semibold mb-4">{t("Submit a Complaint")}</h3>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t("Title")}</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("Brief title of your complaint")}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t("Message")}</label>
                      <textarea
                        className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 min-h-[150px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("Describe your complaint in detail...")}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t("Evidence (screenshots, logs)")}</label>
                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt,.log"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileRef.current?.click()}
                        >
                          <Paperclip className="w-4 h-4 mr-1" />
                          {t("Add File")}
                        </Button>
                        {previews.map((p, i) => (
                          <div key={i} className="relative group">
                            {p.startsWith("data:image") ? (
                              <img src={p} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                            ) : (
                              <div className="w-16 h-16 rounded-lg border border-white/10 flex items-center justify-center bg-white/5">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                            <span className="absolute -bottom-4 left-0 right-0 text-[8px] text-muted-foreground text-center truncate">{files[i]?.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {t("Submit Complaint")}
                    </Button>
                  </form>
                </GlassCard>
              </div>
              <div>
                <GlassCard glow="none">
                  <h3 className="font-semibold mb-4">{t("Your Complaints")}</h3>
                  {loadingList ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                  ) : complaints.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("No complaints submitted yet")}</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {complaints.map((c) => (
                        <div key={c.id} className="rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.06]">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium truncate">{c.title}</p>
                            <Badge variant={c.status === "open" ? "info" : c.status === "resolved" ? "secondary" : "secondary"} className="text-[8px] px-1.5">{c.status}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{c.message}</p>
                          <p className="text-[8px] text-muted-foreground/50 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
