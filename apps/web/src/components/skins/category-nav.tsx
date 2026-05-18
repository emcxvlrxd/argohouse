"use client";

import { motion } from "framer-motion";
import {
  Swords,
  HandMetal,
  Crosshair,
  Music,
  Users,
  Target,
  Gauge,
  Shield,
  Circle,
  Medal,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
  icon: any;
}

const categories: Category[] = [
  { id: "knives", label: t("Knives"), icon: Swords },
  { id: "gloves", label: t("Gloves"), icon: HandMetal },
  { id: "rifles", label: t("Rifles"), icon: Crosshair },
  { id: "snipers", label: t("Snipers"), icon: Target },
  { id: "smgs", label: t("SMGs"), icon: Gauge },
  { id: "heavys", label: t("Heavys"), icon: Shield },
  { id: "pistols", label: t("Pistols"), icon: Circle },
  { id: "agents", label: t("Agents"), icon: Users },
  { id: "music", label: t("Music Kits"), icon: Music },
  { id: "pins", label: t("Pins"), icon: Medal },
];

interface CategoryNavProps {
  active: string;
  onSelect: (id: string) => void;
}

export function CategoryNav({ active, onSelect }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 relative",
              isActive
                ? "text-white bg-purple-500/15 border border-purple-500/25"
                : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
