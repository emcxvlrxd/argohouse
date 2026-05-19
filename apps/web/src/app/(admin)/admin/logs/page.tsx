"use client";

import { AdminLogs } from "@/components/admin/admin-logs";
import { t } from "@/lib/i18n";
import { ScrollText } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-8 h-8 text-neon-purple" />
        <div>
          <h1 className="text-2xl font-bold font-display">{t("Admin Logs")}</h1>
          <p className="text-sm text-muted-foreground">{t("Complete action history")}</p>
        </div>
      </div>
      <AdminLogs />
    </div>
  );
}
