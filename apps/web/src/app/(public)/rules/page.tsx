"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Shield, Ban, AlertTriangle, Users, Mic, Swords } from "lucide-react";

const rules = [
  {
    icon: Shield,
    title: "Cheating & Hacking",
    description:
      "Any form of cheating, hacking, or using third-party software to gain an unfair advantage is strictly prohibited. This includes wallhacks, aimbots, and triggerbots.",
    penalty: "Permanent ban",
    severity: "critical",
  },
  {
    icon: Mic,
    title: "Voice & Chat Abuse",
    description:
      "Excessive screaming, mic spamming, racial slurs, harassment, or any form of toxic behavior in voice or text chat will not be tolerated.",
    penalty: "Warning → 24h mute → 7d ban",
    severity: "moderate",
  },
  {
    icon: Users,
    title: "Team Killing & Griefing",
    description:
      "Intentional team killing, team flashing, blocking teammates, or any form of griefing is forbidden.",
    penalty: "Kick → 24h ban → 7d ban",
    severity: "moderate",
  },
  {
    icon: AlertTriangle,
    title: "Advertising & Spam",
    description:
      "Advertising other servers, websites, or products is not allowed. This includes spam messages and repeated announcements.",
    penalty: "Warning → 24h mute → permanent ban",
    severity: "moderate",
  },
  {
    icon: Ban,
    title: "Inappropriate Names",
    description:
      "Offensive, racist, or sexually explicit names and avatars are not permitted. This applies to both Steam names and in-game tags.",
    penalty: "Rename request → kick → ban",
    severity: "low",
  },
  {
    icon: Swords,
    title: "Competitive Integrity",
    description:
      "Match fixing, boosting, account sharing, or any behavior that compromises competitive integrity is prohibited.",
    penalty: "Season ban → permanent ban",
    severity: "critical",
  },
];

export default function RulesPage() {
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
              <ScrollText className="w-8 h-8 text-neon-purple" />
              <div>
                <h1 className="text-2xl font-bold font-display">Server Rules</h1>
                <p className="text-sm text-muted-foreground">
                  Violations result in warnings, kicks, or bans
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <GlassCard key={i} glow="none">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          rule.severity === "critical"
                            ? "bg-red-500/10 text-red-400"
                            : rule.severity === "moderate"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{rule.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rule.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              rule.severity === "critical"
                                ? "destructive"
                                : rule.severity === "moderate"
                                ? "warning"
                                : "info"
                            }
                            className="text-[10px]"
                          >
                            {rule.penalty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
