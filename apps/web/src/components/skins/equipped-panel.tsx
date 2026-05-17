"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerEquipment } from "@/types";
import { Backpack, Knife, Hand, Music, Users } from "lucide-react";

export function EquippedPanel() {
  const [equipment, setEquipment] = useState<PlayerEquipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/skins?type=equipped");
        const data = await res.json();
        setEquipment(data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  if (loading) {
    return (
      <GlassCard glow="none">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
      </GlassCard>
    );
  }

  const hasItems =
    (equipment?.skins && equipment.skins.length > 0) ||
    (equipment?.knife && equipment.knife.length > 0) ||
    (equipment?.gloves && equipment.gloves.length > 0) ||
    equipment?.agents;

  return (
    <GlassCard glow="cyan">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Backpack className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Your Equipment</h3>
          <p className="text-xs text-muted-foreground">Currently equipped items</p>
        </div>
      </div>

      {!hasItems ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No equipment set. Browse skins to customize your loadout!
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {equipment?.knife && equipment.knife.length > 0 && (
            <EquipmentItem
              icon={Knife}
              label="Knife"
              value={equipment.knife[0]?.knife || "Default"}
            />
          )}
          {equipment?.gloves && equipment.gloves.length > 0 && (
            <EquipmentItem
              icon={Hand}
              label="Gloves"
              value={`Set (${equipment.gloves.length})`}
            />
          )}
          {equipment?.agents && (
            <EquipmentItem
              icon={Users}
              label="Agents"
              value="Custom"
            />
          )}
          {equipment?.skins && equipment.skins.length > 0 && (
            <EquipmentItem
              icon={Music}
              label="Skins"
              value={`${equipment.skins.length} armed`}
            />
          )}
        </div>
      )}
    </GlassCard>
  );
}

function EquipmentItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <Icon className="w-5 h-5 mx-auto mb-1 text-neon-cyan" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}
