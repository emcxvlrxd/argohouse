"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Swords,
  HandMetal,
  Crosshair,
  Music,
  Users,
  Sparkles,
} from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon: any;
  count?: number;
}

const categories: Category[] = [
  { id: "knives", label: "Knives", icon: Swords },
  { id: "gloves", label: "Gloves", icon: HandMetal },
  { id: "rifles", label: "Rifles", icon: Crosshair },
  { id: "pistols", label: "Pistols", icon: Crosshair },
  { id: "agents", label: "Agents", icon: Users },
  { id: "music", label: "Music Kits", icon: Music },
];

interface CategoryNavProps {
  active: string;
  onSelect: (id: string) => void;
}

export function CategoryNav({ active, onSelect }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative",
              isActive
                ? "text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="category-bg"
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-xl border border-purple-500/20"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{cat.label}</span>
            {cat.count !== undefined && (
              <span className="relative z-10 text-xs text-muted-foreground">
                ({cat.count})
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
