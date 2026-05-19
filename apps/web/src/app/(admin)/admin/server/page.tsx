"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Send, RotateCcw, Map, RefreshCw } from "lucide-react";

const quickMaps = ["de_dust2", "de_mirage", "de_inferno", "de_nuke", "de_anubis", "de_vertigo", "de_ancient", "de_overpass"];

export default function ServerPage() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCommand = async (cmd?: string) => {
    const c = cmd || command;
    if (!c.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rcon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: c }),
      });
      const d = await res.json();
      setOutput((prev) => `${new Date().toLocaleTimeString()} > ${c}\n${d.output || d.error || "OK"}\n\n${prev}`.slice(0, 10000));
    } catch (e: any) {
      setOutput(`${new Date().toLocaleTimeString()} > ${c}\nERROR: ${e.message}\n\n${output}`);
    } finally {
      setLoading(false);
      setCommand("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="w-6 h-6 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold font-display">{t("Server Mgmt")}</h1>
          <p className="text-xs text-muted-foreground">{t("RCON commands, map changes, broadcast")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard glow="none" className="lg:col-span-1">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Map className="w-4 h-4 text-cyan-400" /> {t("Quick Map Change")}</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickMaps.map((m) => (
              <Button key={m} variant="outline" size="sm" className="text-xs font-mono h-8" onClick={() => sendCommand(`changelevel ${m}`)} disabled={loading}>
                {m.replace("de_", "")}
              </Button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-semibold mb-2">{t("Broadcast")}</h3>
            <div className="flex gap-2">
              <Input placeholder={t("Message...")} className="text-xs h-8" id="broadcast-input"
                onKeyDown={(e) => { if (e.key === "Enter") sendCommand(`say ${(document.getElementById("broadcast-input") as HTMLInputElement)?.value}`); }}
              />
              <Button variant="outline" size="sm" className="h-8" onClick={() => sendCommand(`say ${(document.getElementById("broadcast-input") as HTMLInputElement)?.value}`)} disabled={loading}>
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <h3 className="text-sm font-semibold mb-2">{t("Actions")}</h3>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => sendCommand("sv_restart 1")} disabled={loading}>
              <RotateCcw className="w-3 h-3 mr-1" /> {t("Restart Round")}
            </Button>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => sendCommand("mp_restartgame 5")} disabled={loading}>
              <RefreshCw className="w-3 h-3 mr-1" /> {t("Restart Match")}
            </Button>
          </div>
        </GlassCard>

        <GlassCard glow="none" className="lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">{t("Console")}</h3>
          <div className="flex gap-2 mb-3">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendCommand(); }}
              placeholder={t("Enter command...")}
              className="text-xs h-8"
              disabled={loading}
            />
            <Button variant="outline" size="sm" className="h-8" onClick={() => sendCommand()} disabled={loading}>
              <Send className="w-3 h-3" />
            </Button>
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[300px] p-3 rounded-xl text-xs font-mono bg-black/50 border border-white/10 resize-none text-foreground"
          />
        </GlassCard>
      </div>
    </div>
  );
}
