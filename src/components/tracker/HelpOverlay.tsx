"use client";

import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpOverlayProps {
  className?: string;
  onRestartTutorial?: () => void;
}

export function HelpOverlay({ className, onRestartTutorial }: HelpOverlayProps) {
  const handleRestartTutorial = () => {
    if (onRestartTutorial) {
      onRestartTutorial();
    }
  };

  return (
    <>
      {/* Help Button - Restarts Tutorial */}
      <button
        onClick={handleRestartTutorial}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-12 w-12 rounded-full",
          "bg-zinc-800 hover:bg-zinc-700",
          "text-zinc-400 hover:text-zinc-300",
          "border border-zinc-700 hover:border-zinc-600",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200",
          "flex items-center justify-center",
          "group",
          className
        )}
        aria-label="Restart tutorial"
      >
        <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </button>
    </>
  );
}
