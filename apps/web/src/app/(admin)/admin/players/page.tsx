"use client";

import { PlayerTable } from "@/components/admin/player-table";
import { t } from "@/lib/i18n";
import { Users } from "lucide-react";

export default function AdminPlayersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-neon-purple" />
        <div>
          <h1 className="text-2xl font-bold font-display">{t("Player Management")}</h1>
          <p className="text-sm text-muted-foreground">{t("View and manage players")}</p>
        </div>
      </div>
      <PlayerTable />
    </div>
  );
}
