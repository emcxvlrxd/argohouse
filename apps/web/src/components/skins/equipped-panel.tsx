"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerEquipment } from "@/types";
import { Package, Swords, HandMetal, Users, Music } from "lucide-react";

function toAbsoluteUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("http")) return url;
  return `https://raw.githubusercontent.com/Nereziel/cs2-WeaponPaints/main/website/img/skins/${url}`;
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

  const items: { icon: any; label: string; data: any[]; render: (item: any) => { name: string; img: string } }[] = [
    { icon: Swords, label: "Skins", data: equipment?.skins || [], render: (s) => ({ name: s.paint_name || "Skin", img: s.cdnImage || toAbsoluteUrl(s.image || "") }) },
    { icon: HandMetal, label: "Knife", data: equipment?.knife || [], render: (k) => ({ name: k.paint_name || "Knife", img: k.cdnImage || toAbsoluteUrl(k.image || "") }) },
    { icon: HandMetal, label: "Gloves", data: equipment?.gloves || [], render: (g) => ({ name: g.paint_name || "Gloves", img: g.cdnImage || toAbsoluteUrl(g.image || "") }) },
    { icon: Music, label: "Music", data: equipment?.music || [], render: (m) => ({ name: `Kit #${m.music_id}`, img: "" }) },
  ];

  return (
    <GlassCard glow="cyan">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Your Equipment</h3>
          <p className="text-[10px] text-muted-foreground">Currently equipped items</p>
        </div>
      </div>

      <div className="space-y-2">
        {equipment?.agents && (
          <div className="flex gap-2">
            <EquipMini name="CT Agent" img="" icon={Users} />
            <EquipMini name="T Agent" img="" icon={Users} />
          </div>
        )}

        {items.map((section) =>
          section.data.length > 0 && (
            <div key={section.label}>
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">{section.label}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {section.data.map((item: any, i: number) => {
                  const { name, img } = section.render(item);
                  return <EquipMini key={i} name={name} img={img} />;
                })}
              </div>
            </div>
          )
        )}

        {!equipment?.skins?.length && !equipment?.knife?.length && !equipment?.gloves?.length && !equipment?.agents && (
          <p className="text-xs text-muted-foreground text-center py-4">No items equipped yet.</p>
        )}
      </div>
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
