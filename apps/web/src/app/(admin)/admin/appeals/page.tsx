"use client";

import { AppealsList } from "@/components/admin/appeals-list";
import { t } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";

export default function AdminAppealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold font-display">{t("Appeals Management")}</h1>
          <p className="text-sm text-muted-foreground">{t("Review and process appeals")}</p>
        </div>
      </div>
      <AppealsList />
    </div>
  );
}
