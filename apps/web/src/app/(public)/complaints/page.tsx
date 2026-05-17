"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { t } from "@/lib/i18n";

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!session) redirect("/");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: submit to API
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-aurora pointer-events-none opacity-50" />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-h-screen">
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
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      {t("Submit Complaint")}
                    </Button>
                  </form>
                </GlassCard>
              </div>
              <div>
                <GlassCard glow="none">
                  <h3 className="font-semibold mb-4">{t("Your Complaints")}</h3>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t("No complaints submitted yet")}
                  </p>
                </GlassCard>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
