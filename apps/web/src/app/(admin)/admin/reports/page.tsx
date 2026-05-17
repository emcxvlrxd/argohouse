"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Flag className="w-8 h-8 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold font-display">Reports</h1>
          <p className="text-sm text-muted-foreground">Player reports management</p>
        </div>
      </div>
      <GlassCard glow="none">
        <p className="text-center text-muted-foreground py-12">
          No reports pending review
        </p>
      </GlassCard>
    </div>
  );
}
