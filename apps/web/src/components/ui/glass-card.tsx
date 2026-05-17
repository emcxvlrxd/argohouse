"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "cyan" | "none";
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-500",
        glow === "purple" && "glow-purple",
        glow === "cyan" && "glow-cyan",
        hover && "glass-hover",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
