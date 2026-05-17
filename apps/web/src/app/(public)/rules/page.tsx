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
import { t } from "@/lib/i18n";

const rules = [
  {
    icon: Shield,
    title: "Hile & Korsan Yazılım",
    description:
      "Her türlü hile, korsan yazılım veya haksız avantaj sağlayan üçüncü parti yazılım kullanımı kesinlikle yasaktır. Wallhack, aimbot ve triggerbot dahildir.",
    penalty: "Kalıcı yasaklama",
    severity: "critical",
  },
  {
    icon: Mic,
    title: "Ses & Sohbet Kötüye Kullanımı",
    description:
      "Aşırı bağırma, mikrofon spam'i, ırkçı ifadeler, taciz veya sesli/yazılı sohbette her türlü toksik davranış tolere edilmeyecektir.",
    penalty: "Uyarı → 24s susturma → 7g yasak",
    severity: "moderate",
  },
  {
    icon: Users,
    title: "Takım Öldürme & Griefing",
    description:
      "Kasti takım öldürme, takım flaşlama, takım arkadaşını engelleme veya her türlü griefing yasaktır.",
    penalty: "Atılma → 24s yasak → 7g yasak",
    severity: "moderate",
  },
  {
    icon: AlertTriangle,
    title: "Reklam & Spam",
    description:
      "Diğer sunucuların, web sitelerinin veya ürünlerin reklamını yapmak yasaktır. Spam mesajlar ve tekrarlanan duyurular dahildir.",
    penalty: "Uyarı → 24s susturma → kalıcı yasak",
    severity: "moderate",
  },
  {
    icon: Ban,
    title: "Uygunsuz İsimler",
    description:
      "Hakaret içeren, ırkçı veya cinsel içerikli isim ve avatarlara izin verilmez. Bu hem Steam isimleri hem de oyun içi etiketler için geçerlidir.",
    penalty: "İsim değiştirme talebi → atılma → yasak",
    severity: "low",
  },
  {
    icon: Swords,
    title: "Rekabetçi Dürüstlük",
    description:
      "Maç fixleme, boosting, hesap paylaşımı veya rekabetçi bütünlüğü bozan her türlü davranış yasaktır.",
    penalty: "Sezon yasağı → kalıcı yasak",
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
                <h1 className="text-2xl font-bold font-display">{t("Server Rules")}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("Violations result in warnings, kicks, or bans")}
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
