"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Palette, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SkinCardProps {
  paintName: string;
  weaponName: string;
  rarity?: string;
  paintId?: number;
  selected?: boolean;
  onSelect?: () => void;
}

const rarityColors: Record<string, string> = {
  "0": "from-gray-500/20 to-gray-600/20 border-gray-500/30",
  "1": "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  "2": "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30",
  "3": "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  "4": "from-pink-500/20 to-pink-600/20 border-pink-500/30",
  "5": "from-red-500/20 to-red-600/20 border-red-500/30",
  "6": "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
  "7": "from-orange-500/20 to-orange-600/20 border-orange-500/30",
};

const rarityBadge: Record<string, { label: string; variant: any }> = {
  "0": { label: "Common", variant: "secondary" as const },
  "1": { label: "Uncommon", variant: "info" as const },
  "2": { label: "Rare", variant: "default" as const },
  "3": { label: "Mythical", variant: "purple" as const },
  "4": { label: "Legendary", variant: "destructive" as const },
  "5": { label: "Ancient", variant: "destructive" as const },
  "6": { label: "Exceedingly Rare", variant: "warning" as const },
};

export function SkinCard({
  paintName,
  weaponName,
  rarity = "0",
  selected,
  onSelect,
}: SkinCardProps) {
  const colorClass = rarityColors[rarity] || rarityColors["0"];
  const badge = rarityBadge[rarity] || rarityBadge["0"];

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative w-full rounded-xl border p-3 text-left transition-all duration-300 bg-gradient-to-b backdrop-blur-sm",
        colorClass,
        selected && "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
      )}
    >
      <div className="flex items-center justify-center h-20 mb-3 rounded-lg bg-black/20">
        <Palette className="w-8 h-8 text-white/30" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-tight truncate">
          {paintName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{weaponName}</p>
        <Badge variant={badge.variant as any} className="text-[10px] px-1.5 py-0">
          {badge.label}
        </Badge>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
        >
          <Star className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}
