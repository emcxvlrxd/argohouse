"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Shuffle, Droplets, Sword, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { SkinItem } from "@/types";

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
  { value: 270, label: "270", highlight: true },
  { value: 500, label: "500" },
  { value: SEED_MAX, label: String(SEED_MAX) },
];

function toAbsoluteUrl(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("http")) return url;
  return `https://raw.githubusercontent.com/Nereziel/cs2-WeaponPaints/main/website/img/skins/${url}`;
}

interface SkinPreviewProps {
  skin: SkinItem;
  onEquip: (paintId: number, defindex: number, seed: number, wear: number, extra: { stattrak?: boolean; nametag?: string; team?: number }) => void;
  onClose: () => void;
}

export function SkinPreview({ skin, onEquip, onClose }: SkinPreviewProps) {
  const [seed, setSeed] = useState(0);
  const [wear, setWear] = useState(0.1);
  const [stattrak, setStattrak] = useState(false);
  const [nametag, setNametag] = useState("");
  const [team, setTeam] = useState<number>(0);

  const imageUrl = skin.cdnImage || toAbsoluteUrl(skin.image || "");
  const paintId = skin.paint_id ?? 0;
  const defindex = skin.weapon_defindex ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="h-full flex flex-col gap-3"
      >
        {/* Kapat butonu */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{skin.paint_name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {skin.weapon_name?.replace("weapon_", "").replace(/_/g, " ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Büyük preview */}
        <div
          className="w-full aspect-[4/3] rounded-xl bg-cover bg-center overflow-hidden border border-white/5 shrink-0"
          style={{
            backgroundImage: `url(${imageUrl || ""})`,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt={skin.paint_name || ""}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Scrollable kontroller */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Seed */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shuffle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[11px] text-muted-foreground">{t("Seed")}</span>
              <div className="flex-1" />
              <input
                type="number"
                min="0"
                max={SEED_MAX}
                value={seed}
                onChange={(e) => setSeed(Math.max(0, Math.min(SEED_MAX, Number(e.target.value) || 0)))}
                className="w-16 h-6 px-1.5 rounded border border-white/10 bg-black/30 text-[10px] font-mono text-purple-300 text-right outline-none focus:border-purple-500/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <input
              type="range"
              min="0"
              max={SEED_MAX}
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-purple-500 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="flex justify-between px-0.5 mt-1">
              {SEED_MARKERS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setSeed(m.value)}
                  className={cn(
                    "text-[9px] leading-none px-1.5 py-0.5 rounded transition-colors",
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
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] text-muted-foreground">{t("Wear")}</span>
              <div className="flex-1" />
              <input
                type="number"
                min="0"
                max="1"
                step="0.0001"
                value={wear}
                onChange={(e) => setWear(Math.max(0, Math.min(1, Number(e.target.value) || 0)))}
                className="w-20 h-6 px-1.5 rounded border border-white/10 bg-black/30 text-[10px] font-mono text-cyan-300 text-right outline-none focus:border-cyan-500/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(wear * 100)}
              onChange={(e) => setWear(Number(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none bg-white/10 accent-cyan-500 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-md"
            />
            <div className="flex gap-1 mt-1.5">
              {WEAR_TIERS.map((tier) => (
                <button
                  key={tier.label}
                  onClick={() => setWear(tier.min + (tier.max - tier.min) * 0.1)}
                  className={cn(
                    "flex-1 py-1.5 rounded border text-[9px] text-center transition-all leading-tight",
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

          <div className="h-px bg-white/5" />

          {/* StatTrak */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStattrak(!stattrak)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] transition-all",
                stattrak
                  ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                  : "border-white/10 text-muted-foreground hover:border-white/20"
              )}
            >
              <Sword className={cn("w-3.5 h-3.5", stattrak && "fill-yellow-400/20")} />
              StatTrak™
              {stattrak && <span className="text-[9px] opacity-60 ml-1">Açık</span>}
            </button>
          </div>

          {/* Nametag */}
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Nametag</label>
            <input
              type="text"
              value={nametag}
              onChange={(e) => setNametag(e.target.value.slice(0, 20))}
              placeholder="... isim ver"
              maxLength={20}
              className="w-full h-8 px-2.5 rounded-md border border-white/10 bg-black/30 text-[11px]
                text-white placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Team */}
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">{t("Team")}</label>
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
                    "flex-1 py-1.5 rounded-md border text-[11px] font-medium transition-all",
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
            className="w-full h-9 text-xs"
            onClick={() => onEquip(paintId, defindex, seed, wear, { stattrak, nametag, team })}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Kuşan
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
