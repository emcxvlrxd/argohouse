"use client";

import { RconConsole } from "@/components/admin/rcon-console";
import { GlassCard } from "@/components/ui/glass-card";
import { Terminal, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { t } from "@/lib/i18n";

const quickCommands = [
  { label: "Status", cmd: "status" },
  { label: "Players", cmd: "listplayers" },
  { label: t("Restart Round"), cmd: "mp_restartgame 1" },
  { label: t("Kick Bots"), cmd: "bot_kick" },
  { label: t("Restart Match"), cmd: "mp_restartgame 5" },
  { label: t("End Warmup"), cmd: "mp_warmup_end" },
  { label: t("Say Hello"), cmd: `say "FENA CS2'ye Hoş Geldiniz!"` },
  { label: t("Reload Skins"), cmd: "wp_reload" },
];

export default function RconPage() {
  const [loadingCmd, setLoadingCmd] = useState<string | null>(null);

  const executeQuick = async (cmd: string) => {
    setLoadingCmd(cmd);
    try {
      await fetch("/api/admin/rcon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
    } catch {} finally {
      setLoadingCmd(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="w-8 h-8 text-neon-cyan" />
        <div>
          <h1 className="text-2xl font-bold font-display">{t("RCON Control")}</h1>
          <p className="text-sm text-muted-foreground">{t("Send server commands")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <RconConsole />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <GlassCard glow="none">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{t("Quick Commands")}</h3>
            </div>
            <div className="space-y-2">
              {quickCommands.map((q) => (
                <Button
                  key={q.label}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-mono"
                  onClick={() => executeQuick(q.cmd)}
                  disabled={loadingCmd !== null}
                >
                  {loadingCmd === q.cmd ? (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 mr-2" />
                  )}
                  {q.label}
                </Button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
