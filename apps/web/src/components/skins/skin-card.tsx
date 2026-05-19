"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Heart } from "lucide-react";
import { useState } from "react";

function genPlaceholder(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  const label = name.replace(/^.*\|\s*/, "").substring(0, 20);
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1},40%,20%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},50%,15%)"/>
    </linearGradient></defs>
    <rect fill="url(#g)" width="200" height="120" rx="8"/>
    <text x="100" y="60" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.6)" font-size="11" font-family="sans-serif">${label}</text>
  </svg>`)}`;
}

function toAbsoluteUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("http")) return url;
  return `https://raw.githubusercontent.com/Nereziel/cs2-WeaponPaints/main/website/img/skins/${url}`;
}

interface SkinCardProps {
  paintName: string;
  rarity?: string;
  paintId?: number;
  weaponDefindex?: number;
  image?: string;
  cdnImage?: string;
  selected?: boolean;
  onSelect?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}

const rarityColors: Record<string, string> = {
  "0": "from-gray-500/10 to-transparent",
  "1": "from-blue-500/10 to-transparent",
  "2": "from-indigo-500/10 to-transparent",
  "3": "from-purple-500/10 to-transparent",
  "4": "from-pink-500/10 to-transparent",
  "5": "from-red-500/10 to-transparent",
  "6": "from-yellow-500/10 to-transparent",
  "7": "from-orange-500/10 to-transparent",
};

export function SkinCard({
  paintName,
  rarity = "0",
  paintId,
  weaponDefindex,
  image,
  cdnImage,
  selected,
  onSelect,
  favorite,
  onToggleFavorite,
}: SkinCardProps) {
  const colorClass = rarityColors[rarity] || rarityColors["0"];
  const fallbackSrc = genPlaceholder(paintName);
  const primarySrc = image ? toAbsoluteUrl(image) : "";
  const cdnSrc = cdnImage || "";
  const realSrc = primarySrc || cdnSrc;
  const [useFallback, setUseFallback] = useState(!realSrc);

  return (
    <div className={cn(
      "relative rounded-xl border transition-all duration-300 bg-gradient-to-b backdrop-blur-sm overflow-hidden cursor-pointer",
      colorClass,
      selected
        ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20 border-purple-500/30"
        : "border-white/5 hover:border-white/20"
    )}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        className="w-full text-left"
      >
        <div
          className="flex items-center justify-center rounded-lg overflow-hidden bg-cover bg-center mx-1.5 mt-1.5 h-28"
          style={{ backgroundImage: `url(${fallbackSrc})` }}
        >
          {useFallback ? null : (
            <img
              src={realSrc}
              alt={paintName}
              className="w-full h-full object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src !== cdnSrc && cdnSrc) {
                  img.src = cdnSrc;
                } else {
                  setUseFallback(true);
                }
              }}
              loading="lazy"
            />
          )}
        </div>
        <p className="text-xs font-medium leading-tight truncate text-center px-1 py-1.5">
          {paintName}
        </p>
      </motion.button>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
        className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-white/10 transition-colors z-20"
      >
        <Heart className={cn("w-3.5 h-3.5 transition-colors", favorite ? "text-pink-400 fill-pink-400" : "text-white/30 hover:text-white/60")} />
      </button>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </div>
  );
}
