"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerEquipment } from "@/types";
import { Package, Swords, HandMetal, Users, Music, Medal, Crosshair } from "lucide-react";

function toAbsoluteUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("http")) return url;
  return `https://raw.githubusercontent.com/Nereziel/cs2-WeaponPaints/main/website/img/skins/${url}`;
}

interface EquipItem {
  icon: any;
  label: string;
  name: string;
  img: string;
}

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
          <Skeleton className="h-48 w-full" />
        </div>
      </GlassCard>
    );
  }

  const items: EquipItem[] = [];

  if (equipment?.skins?.length) {
    for (const s of equipment.skins) {
      items.push({ icon: Crosshair, label: "Skin", name: s.paint_name || "Skin", img: s.cdnImage || toAbsoluteUrl(s.image || "") });
    }
  }
  if (equipment?.knife?.length) {
    for (const k of equipment.knife) {
      items.push({ icon: Swords, label: "Knife", name: k.paint_name || "Knife", img: k.cdnImage || toAbsoluteUrl(k.image || "") });
    }
  }
  if (equipment?.gloves?.length) {
    for (const g of equipment.gloves) {
      items.push({ icon: HandMetal, label: "Glove", name: g.paint_name || "Gloves", img: g.cdnImage || toAbsoluteUrl(g.image || "") });
    }
  }
  if (equipment?.agents?.length) {
    for (const a of equipment.agents) {
      items.push({ icon: Users, label: "Agent", name: a.paint_name || (a.team === 2 ? "T" : "CT") + " Agent", img: a.image || "" });
    }
  }
  if (equipment?.music?.length) {
    for (const m of equipment.music) {
      items.push({ icon: Music, label: "Music", name: m.paint_name || `Kit #${m.music_id}`, img: m.image || "" });
    }
  }
  if (equipment?.pins?.length) {
    for (const p of equipment.pins) {
      items.push({ icon: Medal, label: "Pin", name: p.paint_name || `Pin #${p.pin}`, img: p.image || "" });
    }
  }

  return (
    <GlassCard glow="none">
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No items equipped.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-1.5 border border-white/[0.06]">
              <div className="w-8 h-8 rounded-md bg-black/40 flex items-center justify-center shrink-0 overflow-hidden">
                {item.img ? (
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider leading-none mb-0.5">{item.label}</p>
                <p className="text-[11px] font-medium truncate leading-none">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function EquipMini({ name, img, icon: Icon }: { name: string; img?: string; icon?: any }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/5 p-1.5 border border-white/5">
      {img ? (
        <div className="w-8 h-8 rounded bg-black/30 flex items-center justify-center overflow-hidden shrink-0">
          <img src={img} alt={name} className="w-full h-full object-contain" loading="lazy" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded bg-black/30 flex items-center justify-center shrink-0">
          {Icon ? <Icon className="w-4 h-4 text-muted-foreground" /> : <Package className="w-4 h-4 text-muted-foreground" />}
        </div>
      )}
      <span className="text-[10px] truncate">{name}</span>
    </div>
  );
}
