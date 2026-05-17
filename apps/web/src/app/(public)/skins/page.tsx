"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WeaponBrowser } from "@/components/skins/weapon-browser";
import { EquippedPanel } from "@/components/skins/equipped-panel";
import { Palette } from "lucide-react";

export default function SkinsPage() {
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
              <Palette className="w-8 h-8 text-neon-purple" />
              <div>
                <h1 className="text-2xl font-bold font-display">Weapon Skins</h1>
                <p className="text-sm text-muted-foreground">Customize your loadout</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <WeaponBrowser />
              </div>
              <div className="lg:col-span-1">
                <div className="space-y-6 sticky top-24">
                  <EquippedPanel />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
