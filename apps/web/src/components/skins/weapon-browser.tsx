"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { CategoryNav } from "./category-nav";
import { SkinCard } from "./skin-card";
import { SkinItem, PlayerEquipment } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Loader2,
  X,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useSession } from "next-auth/react";
import { WEAPON_DISPLAY_NAMES } from "@/lib/weapon-categories";

const SUB_CATEGORIES: Record<string, number[]> = {
  knives: [
    500, 503, 505, 506, 507,
    508, 509, 512, 514, 515,
    516, 517, 518, 519, 520,
    521, 522, 523, 525, 526,
  ],
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
  const [equipment, setEquipment] =
    useState<PlayerEquipment | null>(null);

  const [loading, setLoading] = useState(true);

  const [selectedSkin, setSelectedSkin] =
    useState<SkinItem | null>(null);

  const [equipping, setEquipping] = useState(false);

  const [equipMsg, setEquipMsg] = useState("");

  const [subFilter, setSubFilter] =
    useState<number | null>(null);

  const [subMenuOpen, setSubMenuOpen] =
    useState(false);

  // =========================================
  // FETCH SKINS
  // =========================================

  const fetchSkins = useCallback(async (category: string) => {

    setLoading(true);
    setSelectedSkin(null);
    setSubFilter(null);

    try {

      const res = await fetch(
        `/api/skins?type=${category}`
      );

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
  }, [activeCategory, fetchSkins]);

  // =========================================
  // FETCH EQUIPMENT
  // =========================================

  useEffect(() => {

    const fetchEquipment = async () => {

      try {

        const res = await fetch(
          "/api/skins?type=equipped"
        );

        const data = await res.json();

        setEquipment(data);

      } catch { }

    };

    fetchEquipment();

  }, []);

  // =========================================
  // WEAPON TYPES
  // =========================================

  const weaponTypes = useMemo(() => {

    const map = new Map<number, string>();

    skins.forEach((s) => {

      if (
        s.weapon_defindex &&
        !map.has(s.weapon_defindex)
      ) {

        const label =
          WEAPON_DISPLAY_NAMES[s.weapon_name] ||
          s.weapon_name
            .replace("weapon_", "")
            .replace(/_/g, " ");

        map.set(s.weapon_defindex, label);

      }

    });

    return Array
      .from(map.entries())
      .sort((a, b) => a[0] - b[0]);

  }, [skins]);

  // =========================================
  // EQUIP
  // =========================================

  const handleEquip = async (
    paintId: number,
    defindex: number,
    seed: number,
    wear: number,
    skin: SkinItem
  ) => {

    if (!session) return;

    setEquipping(true);
    setEquipMsg("");

    try {

      let payload;

      // =====================================
      // KNIVES
      // =====================================

      if (activeCategory === "knives") {

        const KNIFE_MAP: Record<number, string> = {
          500: "weapon_knife_bayonet",
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

        payload = {
          type: "knife",
          data: {
            knife: KNIFE_MAP[defindex] || "weapon_knife",
            paintId: Number(paintId),
            seed: Number(seed),
            wear: Number(wear),
            team: 2,
          },
        };

      }
      // =====================================
      // GLOVES
      // =====================================

      else if (activeCategory === "gloves") {

        payload = {
          type: "gloves",
          data: {
            defindex: Number(defindex),
            team: 2,
          },
        };

      }

      // =====================================
      // NORMAL WEAPON SKINS
      // =====================================

      else {

        payload = {
          type: "skin",
          data: {
            weapon: skin.weapon_name,
            paintId: Number(paintId),
            seed: Number(seed),
            wear: Number(wear),
            team: 2,
          },
        };

      }

      const res = await fetch(
        "/api/skins/equip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (result.success) {

        setEquipMsg("Kuşanıldı!");

        setTimeout(() => {
          setEquipMsg("");
        }, 2000);

      } else {

        setEquipMsg(
          "Hata: " +
          (result.message || "Bilinmeyen hata")
        );

      }

    } catch {

      setEquipMsg("Bağlantı hatası");

    } finally {

      setEquipping(false);

    }

  };

  // =========================================
  // FILTERS
  // =========================================

  const filteredBySub = useMemo(() => {

    if (!subFilter) return skins;

    return skins.filter(
      (s) => s.weapon_defindex === subFilter
    );

  }, [skins, subFilter]);

  const filteredSkins = filteredBySub.filter((s) =>
    (s.paint_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const currentSubOptions =
    activeCategory === "knives"
      ? SUB_CATEGORIES.knives.map((d) => ({
        defindex: d,
        label:
          KNIFE_LABELS[d] ||
          `Knife ${d}`,
      }))
      : weaponTypes.map(([d, l]) => ({
        defindex: d,
        label: l,
      }));

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="flex flex-col h-full">

      <div className="flex-shrink-0 pt-1 pb-2">

        <div className="flex items-center gap-2 mb-2">

          <div className="relative flex-1 max-w-xs">

            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />

            <Input
              placeholder={t("Search skins...")}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="pl-8 h-8 text-xs"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}

          </div>

          {activeCategory === "agents" ? (
            <div className="flex gap-1">
              {[
                { label: "Tümü", value: null },
                { label: "T Terrorist", value: 2 },
                { label: "CT Counter-Terrorist", value: 3 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSubFilter(opt.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs border transition-colors whitespace-nowrap",
                    subFilter === opt.value
                      ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                      : "border-white/10 hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : currentSubOptions.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setSubMenuOpen(!subMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                {subFilter
                  ? currentSubOptions.find((o) => o.defindex === subFilter)?.label || "Tümü"
                  : activeCategory === "knives" ? "Tüm Bıçaklar" : activeCategory === "gloves" ? "Tüm Eldivenler" : "Tüm Silahlar"}
                <ChevronDown className="w-3 h-3" />
              </button>
              {subMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSubMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 z-20 w-44 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-1">
                    <button
                      onClick={() => { setSubFilter(null); setSubMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors"
                    >
                      {activeCategory === "knives" ? "Tüm Bıçaklar" : activeCategory === "gloves" ? "Tüm Eldivenler" : "Tümü"}
                    </button>
                    {currentSubOptions.map((opt) => (
                      <button
                        key={opt.defindex}
                        onClick={() => { setSubFilter(opt.defindex); setSubMenuOpen(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {equipMsg && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {equipMsg}
            </div>
          )}

        </div>

        <CategoryNav
          active={activeCategory}
          onSelect={setActiveCategory}
        />

      </div>

      <div className="flex-1 overflow-y-auto min-h-0">

        {loading ? (

          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
          </div>

        ) : filteredSkins.length === 0 ? (

          <GlassCard glow="none">
            <p className="text-center text-muted-foreground py-12">
              {t("No skins found")}
            </p>
          </GlassCard>

        ) : (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
          >

            {filteredSkins.map((skin, index) => (

              <motion.div
                key={`${skin.paint_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >

                <SkinCard
                  paintName={skin.paint_name}
                  weaponName={skin.weapon_name}
                  rarity={skin.rarity}
                  paintId={skin.paint_id}
                  weaponDefindex={skin.weapon_defindex}
                  image={skin.image}
                  cdnImage={skin.cdnImage}
                  selected={
                    selectedSkin?.paint_id === skin.paint_id &&
                    selectedSkin?.weapon_defindex ===
                    skin.weapon_defindex
                  }
                  onSelect={() =>
                    setSelectedSkin(
                      selectedSkin?.paint_id === skin.paint_id &&
                        selectedSkin?.weapon_defindex ===
                        skin.weapon_defindex
                        ? null
                        : skin
                    )
                  }
                  onEquip={(
                    paintId,
                    defindex,
                    seed,
                    wear
                  ) =>
                    handleEquip(
                      paintId,
                      defindex,
                      seed,
                      wear,
                      skin
                    )
                  }
                />

              </motion.div>

            ))}

          </motion.div>

        )}

      </div>

    </div>
  );
}