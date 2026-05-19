"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CategoryNav } from "./category-nav";
import { SkinCard } from "./skin-card";
import { SkinPreview } from "./skin-preview";
import { SkinItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Loader2,
  X,
  CheckCircle,
  ChevronDown,
  Heart,
} from "lucide-react";

import { t } from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { WEAPON_DISPLAY_NAMES } from "@/lib/weapon-categories";

const FAVORITES_KEY = "fena_fav_skins";

function sanitizeNumber(value: any, fallback = 0): number {
  const n = parseInt(String(value ?? "0").replace(/,/g, "").trim(), 10);
  return isNaN(n) ? fallback : n;
}

function sanitizeFloat(value: any, fallback = 0.000001): number {
  const n = parseFloat(String(value ?? "0").replace(/,/g, ".").trim());
  return isNaN(n) ? fallback : n;
}

function loadFavorites(): Set<number> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<number>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
}

const SUB_CATEGORIES: Record<string, number[]> = {
  knives: [
    500, 503, 505, 506, 507, 508, 509, 512, 514, 515,
    516, 517, 518, 519, 520, 521, 522, 523, 525, 526,
  ],
};

const KNIFE_MAP: Record<number, string> = {
  500: "weapon_bayonet",
  503: "weapon_knife_css",
  505: "weapon_knife_flip",
  506: "weapon_knife_gut",
  507: "weapon_knife_karambit",
  508: "weapon_knife_m9_bayonet",
  509: "weapon_knife_tactical",
  512: "weapon_knife_falchion",
  514: "weapon_knife_survival_bowie",
  515: "weapon_knife_butterfly",
  516: "weapon_knife_push",
  517: "weapon_knife_cord",
  518: "weapon_knife_canis",
  519: "weapon_knife_ursus",
  520: "weapon_knife_gypsy_jackknife",
  521: "weapon_knife_outdoor",
  522: "weapon_knife_stiletto",
  523: "weapon_knife_widowmaker",
  525: "weapon_knife_skeleton",
  526: "weapon_knife_kukri",
};

const KNIFE_LABELS: Record<number, string> = {
  500: "Bayonet",
  503: "Classic Knife",
  505: "Flip Knife",
  506: "Gut Knife",
  507: "Karambit",
  508: "M9 Bayonet",
  509: "Huntsman Knife",
  512: "Falchion Knife",
  514: "Bowie Knife",
  515: "Butterfly Knife",
  516: "Shadow Daggers",
  517: "Paracord Knife",
  518: "Survival Knife",
  519: "Ursus Knife",
  520: "Navaja Knife",
  521: "Nomad Knife",
  522: "Stiletto Knife",
  523: "Talon Knife",
  525: "Skeleton Knife",
  526: "Kukri Knife",
};

export function WeaponBrowser() {
  const { data: session } = useSession();

  const [activeCategory, setActiveCategory] = useState("knives");
  const [search, setSearch] = useState("");
  const [skins, setSkins] = useState<SkinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState<SkinItem | null>(null);
  const [equipping, setEquipping] = useState(false);
  const [equipMsg, setEquipMsg] = useState("");
  const [subFilter, setSubFilter] = useState<number | null>(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites);
  const [showFavorites, setShowFavorites] = useState(false);

  const [agentTeam, setAgentTeam] = useState<2 | 3>(3);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFavorite = useCallback((id?: number) => {
    if (!id) return;
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const fetchSkins = useCallback(async (category: string) => {
    setLoading(true);
    setSelectedSkin(null);
    setSubFilter(null);

    try {
      const res = await fetch(`/api/skins?type=${category}`);
      const data = await res.json();
      setSkins(data.skins || []);
    } catch {
      setSkins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkins(activeCategory);
  }, [activeCategory]);

  const weaponTypes = useMemo(() => {
    const map = new Map<number, string>();
    skins.forEach((s) => {
      if (s.weapon_defindex && !map.has(s.weapon_defindex)) {
        const label =
          WEAPON_DISPLAY_NAMES[s.weapon_name] ||
          s.weapon_name?.replace("weapon_", "").replace(/_/g, " ");
        map.set(s.weapon_defindex, label);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [skins]);

  const handleEquip = async (
    paintId: number,
    defindex: number,
    seed: number,
    wear: number,
    skin: SkinItem,
    stattrak?: boolean,
    nametag?: string,
    team?: number
  ) => {
    if (!session || equipping) return;

    setEquipping(true);
    setEquipMsg("");

    try {
      const cleanDefindex = sanitizeNumber(defindex);
      const cleanPaint =
        sanitizeNumber(paintId) ||
        sanitizeNumber((skin as any).paint_id) ||
        sanitizeNumber((skin as any).paint);

      const cleanSeed = sanitizeNumber(seed);
      const cleanWear = sanitizeFloat(wear);

      let payload: any = null;

      if (activeCategory === "knives") {
        payload = {
          type: "knife",
          data: {
            knife: KNIFE_MAP[cleanDefindex] || "weapon_knife",
            defindex: cleanDefindex,
            paintId: cleanPaint,
            seed: cleanSeed,
            wear: cleanWear,
            stattrak: stattrak ?? false,
            team: team,
          },
        };
      } else if (activeCategory === "gloves") {
        payload = {
          type: "gloves",
          data: {
            gloves: String(cleanPaint),
            defindex: cleanDefindex,
            seed: cleanSeed,
            wear: cleanWear,
          },
        };
      } else if (activeCategory === "agents") {
        payload = {
          type: "agent",
          data: {
            model: (skin as any).model || "",
            team: agentTeam,
          },
        };
      } else if (activeCategory === "music") {
        payload = { type: "music", data: { paintId: cleanPaint } };
      } else if (activeCategory === "pins") {
        payload = { type: "pin", data: { paintId: cleanPaint } };
      } else {
        payload = {
          type: "skin",
          data: {
            weapon: skin.weapon_name || "weapon_ak47",
            defindex: cleanDefindex,
            paintId: cleanPaint,
            seed: cleanSeed,
            wear: cleanWear,
            stattrak: stattrak ?? false,
            nametag: nametag ?? "",
            team: team,
          },
        };
      }

      const res = await fetch("/api/skins/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Equip failed");
      }

      setEquipMsg("Kuşanıldı!");
      setTimeout(() => setEquipMsg(""), 2000);
    } catch (err: any) {
      setEquipMsg("Hata: " + (err?.message || "Equip başarısız"));
    } finally {
      setEquipping(false);
    }
  };

  const filteredSkins = skins
    .filter((s) => (!subFilter ? true : s.weapon_defindex === subFilter))
    .filter((s) => !showFavorites || favorites.has(s.id ?? -1))
    .filter((s) =>
      (s.paint_name || "").toLowerCase().includes(search.toLowerCase())
    );

  const currentSubOptions =
    activeCategory === "knives"
      ? SUB_CATEGORIES.knives.map((d) => ({
        defindex: d,
        label: KNIFE_LABELS[d] || `Knife ${d}`,
      }))
      : weaponTypes.map(([d, l]) => ({
        defindex: d,
        label: l,
      }));

  const activeSubLabel = subFilter
    ? currentSubOptions.find((o) => o.defindex === subFilter)?.label
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Üst: arama + kategori + filtre */}
      <div className="flex-shrink-0 pt-1 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Skin ara..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              showFavorites
                ? "text-red-400 bg-red-400/10"
                : "text-muted-foreground hover:text-red-400"
            )}
          >
            <Heart className="w-4 h-4" />
          </button>

          {activeCategory === "agents" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAgentTeam(3)}
                className={cn(
                  "px-2.5 h-7 rounded-md text-xs border font-medium transition-colors",
                  agentTeam === 3
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                )}
              >
                CT
              </button>
              <button
                onClick={() => setAgentTeam(2)}
                className={cn(
                  "px-2.5 h-7 rounded-md text-xs border font-medium transition-colors",
                  agentTeam === 2
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                )}
              >
                T
              </button>
            </div>
          )}

          {equipMsg && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              {equipMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CategoryNav
            active={activeCategory}
            onSelect={(cat) => {
              setActiveCategory(cat);
              setSubMenuOpen(false);
            }}
          />

          {currentSubOptions.length > 0 && (
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                onClick={() => setSubMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 h-8 rounded-md border text-xs transition-colors",
                  subMenuOpen
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-border/80"
                )}
              >
                <span className="max-w-[120px] truncate">
                  {activeSubLabel ?? "Filtrele"}
                </span>
                {subFilter ? (
                  <X
                    className="w-3 h-3 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubFilter(null);
                      setSubMenuOpen(false);
                    }}
                  />
                ) : (
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 shrink-0 transition-transform",
                      subMenuOpen && "rotate-180"
                    )}
                  />
                )}
              </button>

              <AnimatePresence>
                {subMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 z-50 min-w-[160px] max-h-64 overflow-y-auto rounded-lg border border-border bg-background shadow-xl"
                  >
                    <button
                      onClick={() => {
                        setSubFilter(null);
                        setSubMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                        !subFilter && "text-primary font-medium"
                      )}
                    >
                      Tümü
                    </button>

                    <div className="h-px bg-border mx-2 mb-1" />

                    {currentSubOptions.map((opt) => (
                      <button
                        key={opt.defindex}
                        onClick={() => {
                          setSubFilter(opt.defindex);
                          setSubMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                          subFilter === opt.defindex &&
                          "text-primary font-medium bg-primary/5"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Alt: skin grid (sol) + preview/equipped (sağ) */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSkins.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
              Sonuç bulunamadı
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {filteredSkins.map((skin, i) => (
                <SkinCard
                  key={i}
                  paintName={skin.paint_name}
                  rarity={skin.rarity}
                  paintId={skin.paint_id}
                  weaponDefindex={skin.weapon_defindex}
                  image={skin.image}
                  cdnImage={skin.cdnImage}
                  selected={selectedSkin?.id === skin.id}
                  favorite={favorites.has(skin.id ?? -1)}
                  onToggleFavorite={() => toggleFavorite(skin.id)}
                  onSelect={() =>
                    setSelectedSkin(
                      selectedSkin?.id === skin.id ? null : skin
                    )
                  }
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Sağ panel: seçili skin varsa preview */}
        {selectedSkin && (
          <div className="w-72 lg:w-80 shrink-0 overflow-y-auto hidden md:block">
            <SkinPreview
              skin={selectedSkin}
              onClose={() => setSelectedSkin(null)}
              onEquip={(p, d, s, w, extra) =>
                handleEquip(p, d, s, w, selectedSkin, extra?.stattrak, extra?.nametag, extra?.team)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
