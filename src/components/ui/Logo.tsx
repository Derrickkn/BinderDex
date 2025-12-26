"use client";

interface BinderLogoProps {
  className?: string;
  showText?: boolean;
}

// BinderDex logo component - matches the brand identity
export function BinderLogo({ className = "h-8", showText = false }: BinderLogoProps) {
  return (
    <svg className={className} viewBox={showText ? "0 0 400 120" : "0 0 100 80"} fill="none">
      <defs>
        {/* ChromaDex gradient for the "Dex" portion */}
        <linearGradient id="chromaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Logo Mark: Abstract binder/grid icon */}
      <g transform={showText ? "translate(20, 20)" : "translate(5, 0)"}>
        {/* Binder spine */}
        <rect x="0" y="0" width="8" height="80" rx="2" fill="#374151" />

        {/* 3x3 card grid (representing binder slots) */}
        <g transform="translate(16, 0)">
          {/* Row 1 */}
          <rect x="0" y="0" width="22" height="24" rx="2" fill="#4B5563" />
          <rect x="26" y="0" width="22" height="24" rx="2" fill="#6B7280" />
          <rect x="52" y="0" width="22" height="24" rx="2" fill="#6366F1" />

          {/* Row 2 */}
          <rect x="0" y="28" width="22" height="24" rx="2" fill="#6B7280" />
          <rect x="26" y="28" width="22" height="24" rx="2" fill="#EC4899" />
          <rect x="52" y="28" width="22" height="24" rx="2" fill="#6B7280" />

          {/* Row 3 */}
          <rect x="0" y="56" width="22" height="24" rx="2" fill="#F59E0B" />
          <rect x="26" y="56" width="22" height="24" rx="2" fill="#6B7280" />
          <rect x="52" y="56" width="22" height="24" rx="2" fill="#4B5563" />
        </g>
      </g>

      {/* Wordmark - only shown when showText is true */}
      {showText && (
        <text
          x="120"
          y="70"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="42"
          fontWeight="700"
          letterSpacing="-1"
        >
          <tspan fill="#E5E7EB">Binder</tspan>
          <tspan fill="url(#chromaGradient)">Dex</tspan>
        </text>
      )}
    </svg>
  );
}

// Compact text-only logo for navigation
export function BinderLogoText({ className = "" }: { className?: string }) {
  return (
    <span className={`text-sm font-semibold tracking-tight ${className}`}>
      <span className="text-zinc-200">Binder</span>
      <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
        Dex
      </span>
    </span>
  );
}

// Combined logo with icon and text
export function BinderLogoFull({ iconClassName = "h-6 w-auto" }: { iconClassName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <BinderLogo className={iconClassName} />
      <BinderLogoText />
    </div>
  );
}
