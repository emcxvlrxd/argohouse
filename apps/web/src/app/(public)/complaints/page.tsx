"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";

export default function ComplaintsPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) redirect("/");

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
                <h1 className="text-2xl font-bold font-display">Complaints</h1>
                <p className="text-sm text-muted-foreground">Submit and track complaints</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassCard glow="none">
                  <h3 className="font-semibold mb-4">Submit a Complaint</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                      <Input placeholder="Brief title of your complaint" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Message
                      </label>
                      <textarea
                        className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 min-h-[150px]"
                        placeholder="Describe your complaint in detail..."
                      />
                    </div>
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Complaint
                    </Button>
                  </form>
                </GlassCard>
              </div>
              <div>
                <GlassCard glow="none">
                  <h3 className="font-semibold mb-4">Your Complaints</h3>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No complaints submitted yet
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
