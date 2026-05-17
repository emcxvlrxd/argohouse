"use client";

import { RconConsole } from "@/components/admin/rcon-console";
import { Terminal } from "lucide-react";

export default function ConsolePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Terminal className="w-8 h-8 text-neon-cyan" />
        <div>
          <h1 className="text-2xl font-bold font-display">Server Console</h1>
          <p className="text-sm text-muted-foreground">Real-time RCON terminal</p>
        </div>
      </div>
      <RconConsole />
    </div>
  );
}
