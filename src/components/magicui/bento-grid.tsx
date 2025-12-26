"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  name: string;
  description: string;
  icon: ReactNode;
  className?: string;
  background?: ReactNode;
  color?: string;
  href?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  description,
  icon,
  className,
  background,
  color,
}: BentoCardProps) {
  const colorStyles: Record<string, { border: string; bg: string; title: string; iconBg: string }> = {
    blue: {
      border: "border-blue-500/20 hover:border-blue-500/40",
      bg: "from-blue-500/5 to-transparent",
      title: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
    },
    green: {
      border: "border-green-500/20 hover:border-green-500/40",
      bg: "from-green-500/5 to-transparent",
      title: "text-green-400",
      iconBg: "bg-green-500/10 border-green-500/20",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      bg: "from-amber-500/5 to-transparent",
      title: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    purple: {
      border: "border-purple-500/20 hover:border-purple-500/40",
      bg: "from-purple-500/5 via-pink-500/5 to-transparent",
      title: "bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent",
      iconBg: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30",
    },
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      bg: "from-cyan-500/5 to-transparent",
      title: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
    },
    rose: {
      border: "border-rose-500/20 hover:border-rose-500/40",
      bg: "from-rose-500/5 to-transparent",
      title: "text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
    },
  };

  const style = color ? colorStyles[color] : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-zinc-700",
        style && `${style.border} bg-gradient-to-br ${style.bg}`,
        className
      )}
    >
      {/* Background element */}
      {background && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {background}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6">
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-lg border",
            style ? style.iconBg : "border-zinc-700 bg-zinc-800/50"
          )}
        >
          {icon}
        </div>
        <h3
          className={cn(
            "mb-2 text-lg font-medium",
            style ? style.title : "text-white"
          )}
        >
          {name}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>
    </div>
  );
}
