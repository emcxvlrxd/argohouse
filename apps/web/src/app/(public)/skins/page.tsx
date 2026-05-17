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
import { t } from "@/lib/i18n";

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
          <main className="p-4 lg:p-6 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-8 h-8 text-neon-purple" />
              <div>
                <h1 className="text-2xl font-bold font-display">{t("Weapon Skins")}</h1>
                <p className="text-sm text-muted-foreground">{t("Customize your loadout")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
              <div className="lg:col-span-3 flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
                  <WeaponBrowser />
                </div>
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
