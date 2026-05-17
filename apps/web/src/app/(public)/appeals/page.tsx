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
import { AlertTriangle, Send } from "lucide-react";

export default function AppealsPage() {
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
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <div>
                <h1 className="text-2xl font-bold font-display">Appeals</h1>
                <p className="text-sm text-muted-foreground">
                  Appeal bans, mutes, or other penalties
                </p>
              </div>
            </div>

            <GlassCard glow="none" className="max-w-2xl">
              <h3 className="font-semibold mb-4">Submit an Appeal</h3>
              <form className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Appeal Type
                  </label>
                  <select className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50">
                    <option value="ban">Ban Appeal</option>
                    <option value="mute">Mute Appeal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Reason for Penalty
                  </label>
                  <Input placeholder="Why were you banned/muted?" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Your Message
                  </label>
                  <textarea
                    className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 min-h-[150px]"
                    placeholder="Explain your situation and why the penalty should be lifted..."
                  />
                </div>
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Appeal
                </Button>
              </form>
            </GlassCard>
          </main>
        </div>
      </div>
    </div>
  );
}
