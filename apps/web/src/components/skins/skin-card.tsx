"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Shuffle, Droplets, Heart, Sword, Crosshair } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

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
  weaponName?: string;
  rarity?: string;
  paintId?: number;
  weaponDefindex?: number;
  image?: string;
  cdnImage?: string;
  selected?: boolean;
  onSelect?: () => void;
  onEquip?: (paintId: number, defindex: number, seed: number, wear: number, extra?: { stattrak?: boolean; nametag?: string; team?: number }) => void;
  hideSeedWear?: boolean;
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

const WEAR_TIERS = [
  { label: "Factory New", min: 0, max: 0.07, color: "text-green-400" },
  { label: "Minimal Wear", min: 0.07, max: 0.15, color: "text-lime-400" },
  { label: "Field-Tested", min: 0.15, max: 0.38, color: "text-yellow-400" },
  { label: "Well-Worn", min: 0.38, max: 0.45, color: "text-orange-400" },
  { label: "Battle-Scarred", min: 0.45, max: 1.0, color: "text-red-400" },
];

const SEED_MAX = 999;
const SEED_MARKERS = [
  { value: 0, label: "0" },
  { value: 270, label: "270 (Mavi)", highlight: true },
  { value: 500, label: "500" },
  { value: SEED_MAX, label: String(SEED_MAX) },
];

export function SkinCard({
  paintName,
  weaponName = "",
  rarity = "0",
  paintId,
  weaponDefindex,
  image,
  cdnImage,
  selected,
  onSelect,
  onEquip,
  hideSeedWear,
  favorite,
  onToggleFavorite,
}: SkinCardProps) {
  const colorClass = rarityColors[rarity] || rarityColors["0"];
  const [seed, setSeed] = useState(0);
  const [wear, setWear] = useState(0.1);
  const [stattrak, setStattrak] = useState(false);
  const [nametag, setNametag] = useState("");
  const [team, setTeam] = useState<number>(0); // 0=Both, 2=T, 3=CT

  const fallbackSrc = genPlaceholder(paintName);
  const primarySrc = image ? toAbsoluteUrl(image) : "";
  const cdnSrc = cdnImage || "";
  const realSrc = primarySrc || cdnSrc;
  const [useFallback, setUseFallback] = useState(!realSrc);

  const wearPct = Math.round(wear * 100);
  const activeTier = WEAR_TIERS.find((t) => wear >= t.min && wear < t.max);

  return (
    <div className={cn(
      "relative rounded-xl border transition-all duration-300 bg-gradient-to-b backdrop-blur-sm overflow-hidden",
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
          className={cn(
            "flex items-center justify-center rounded-lg overflow-hidden bg-cover bg-center mx-1.5",
            selected ? "mt-1.5 h-36" : "mt-1.5 h-28"
          )}
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
        <p className={cn(
          "text-xs font-medium leading-tight truncate text-center px-1",
          selected ? "pt-1.5 pb-0" : "py-1.5"
        )}>
          {paintName}
        </p>
      </motion.button>

      {selected && onEquip && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-white/5"
        >
          <div className="p-2 space-y-2">
            {/* Seed / Wear */}
            {!hideSeedWear && (
              <>
                {/* Seed */}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Shuffle className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="text-[10px] text-muted-foreground flex-1">{t("Seed")}</span>
                    <span className="font-mono text-[10px] text-purple-300">{seed}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={SEED_MAX}
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-purple-500 cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <div className="flex justify-between px-0.5 mt-0.5">
                    {SEED_MARKERS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setSeed(m.value)}
                        className={cn(
                          "text-[8px] leading-none px-1 py-0.5 rounded transition-colors",
                          seed === m.value
                            ? "bg-purple-500/20 text-purple-300"
                            : m.highlight
                              ? "text-amber-400 hover:text-amber-300"
                              : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wear */}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-[10px] text-muted-foreground flex-1">{t("Wear")}</span>
                    <span className="font-mono text-[10px] text-cyan-300">{wear.toFixed(4)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={wearPct}
                    onChange={(e) => setWear(Number(e.target.value) / 100)}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-cyan-500 cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <div className="flex gap-1 mt-1">
                    {WEAR_TIERS.map((tier) => (
                      <button
                        key={tier.label}
                        onClick={() => setWear(tier.min + (tier.max - tier.min) * 0.1)}
                        className={cn(
                          "flex-1 py-1 rounded border text-[8px] text-center transition-all leading-tight",
                          wear >= tier.min && wear < tier.max
                            ? "border-white/20 bg-white/5 " + tier.color
                            : "border-transparent text-muted-foreground hover:border-white/10"
                        )}
                      >
                        {t(tier.label)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-white/5" />

            {/* StatTrak */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStattrak(!stattrak)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] transition-all",
                  stattrak
                    ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                    : "border-white/10 text-muted-foreground hover:border-white/20"
                )}
              >
                <Sword className={cn("w-3 h-3", stattrak && "fill-yellow-400/20")} />
                StatTrak™
                {stattrak && <span className="text-[8px] opacity-60">Açık</span>}
              </button>
            </div>

            {/* Nametag */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-0.5">Nametag</label>
              <input
                type="text"
                value={nametag}
                onChange={(e) => setNametag(e.target.value.slice(0, 20))}
                placeholder="... isim ver"
                maxLength={20}
                className="w-full h-7 px-2 rounded-md border border-white/10 bg-black/30 text-[10px]
                  text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {/* Team selector */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">{t("Team")}</label>
              <div className="flex gap-1">
                {[
                  { value: 0, label: "Both", color: "text-purple-400 border-purple-500/30" },
                  { value: 2, label: "T", color: "text-yellow-400 border-yellow-500/30" },
                  { value: 3, label: "CT", color: "text-blue-400 border-blue-500/30" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTeam(opt.value)}
                    className={cn(
                      "flex-1 py-1 rounded-md border text-[10px] font-medium transition-all",
                      team === opt.value
                        ? `bg-white/5 ${opt.color}`
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              variant="glow"
              className="w-full h-7 text-[10px]"
              onClick={(e) => {
                e.stopPropagation();
                onEquip(paintId || 0, weaponDefindex || 0, seed, wear, {
                  stattrak,
                  nametag,
                  team,
                });
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Kuşan
            </Button>
          </div>
        </motion.div>
      )}

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
