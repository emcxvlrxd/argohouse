"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { CategoryNav } from "./category-nav";
import { SkinCard } from "./skin-card";
import { SkinItem, WeaponCategory, PlayerEquipment } from "@/types";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

export function WeaponBrowser() {
  const [activeCategory, setActiveCategory] = useState("knives");
  const [search, setSearch] = useState("");
  const [skins, setSkins] = useState<SkinItem[]>([]);
  const [weapons, setWeapons] = useState<WeaponCategory[]>([]);
  const [equipment, setEquipment] = useState<PlayerEquipment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSkins = useCallback(async (category: string) => {
    setLoading(true);
    try {
      let endpoint = "";
      switch (category) {
        case "knives":
          endpoint = "/api/skins?type=knives";
          break;
        case "gloves":
          endpoint = "/api/skins?type=gloves";
          break;
        case "agents":
          endpoint = "/api/skins?type=agents";
          break;
        case "music":
          endpoint = "/api/skins?type=music";
          break;
        default:
          endpoint = "/api/skins?type=weapon&name=" + category;
      }
      const res = await fetch(endpoint);
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

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const res = await fetch("/api/skins?type=weapons");
        const data = await res.json();
        setWeapons(data.weapons || []);
      } catch {}
    };
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/skins?type=equipped");
        const data = await res.json();
        setEquipment(data);
      } catch {}
    };
    fetchWeapons();
    fetchEquipment();
  }, []);

  const filteredSkins = skins.filter((s) =>
    s.paint_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <GlassCard glow="none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search skins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
        <CategoryNav active={activeCategory} onSelect={setActiveCategory} />
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
        </div>
      ) : filteredSkins.length === 0 ? (
        <GlassCard glow="none">
          <p className="text-center text-muted-foreground py-12">
            No skins found
          </p>
        </GlassCard>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
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
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
