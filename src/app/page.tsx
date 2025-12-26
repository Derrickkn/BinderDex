"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { Particles } from "@/components/magicui/particles";

// Color palettes for ChromaDex binder rotation
const colorPalettes = [
  {
    name: "Fire",
    colors: [
      "from-red-400/60 to-red-500/60",
      "from-orange-400/60 to-red-500/60",
      "from-red-500/60 to-orange-600/60",
      "from-amber-500/60 to-red-600/60",
      "from-red-400/50 to-rose-500/50",
      "from-orange-500/60 to-amber-600/60",
      "from-red-600/60 to-red-700/60",
      "from-rose-400/60 to-red-500/60",
      "from-amber-400/60 to-orange-500/60",
      "from-red-500/50 to-rose-600/50",
      "from-orange-400/50 to-red-400/50",
      "from-red-400/60 to-amber-500/60",
      "from-rose-500/60 to-red-600/60",
      "from-orange-500/50 to-red-500/50",
      "from-red-300/60 to-red-500/60",
      "from-amber-400/60 to-red-500/60",
    ],
  },
  {
    name: "Water",
    colors: [
      "from-blue-400/60 to-blue-500/60",
      "from-sky-400/60 to-blue-500/60",
      "from-blue-500/60 to-cyan-600/60",
      "from-cyan-400/60 to-blue-500/60",
      "from-blue-400/50 to-sky-500/50",
      "from-sky-500/60 to-blue-600/60",
      "from-blue-600/60 to-blue-700/60",
      "from-cyan-400/60 to-sky-500/60",
      "from-blue-400/60 to-indigo-500/60",
      "from-sky-400/50 to-blue-500/50",
      "from-blue-500/50 to-cyan-500/50",
      "from-cyan-500/60 to-blue-600/60",
      "from-blue-300/60 to-blue-500/60",
      "from-sky-500/50 to-cyan-500/50",
      "from-blue-400/60 to-sky-600/60",
      "from-indigo-400/60 to-blue-500/60",
    ],
  },
  {
    name: "Grass",
    colors: [
      "from-green-400/60 to-green-500/60",
      "from-emerald-400/60 to-green-500/60",
      "from-green-500/60 to-teal-600/60",
      "from-teal-400/60 to-green-500/60",
      "from-green-400/50 to-emerald-500/50",
      "from-lime-500/60 to-green-600/60",
      "from-green-600/60 to-green-700/60",
      "from-emerald-400/60 to-teal-500/60",
      "from-green-400/60 to-lime-500/60",
      "from-teal-400/50 to-green-500/50",
      "from-green-500/50 to-emerald-500/50",
      "from-lime-400/60 to-green-500/60",
      "from-green-300/60 to-green-500/60",
      "from-emerald-500/50 to-teal-500/50",
      "from-green-400/60 to-teal-600/60",
      "from-teal-500/60 to-green-600/60",
    ],
  },
  {
    name: "Electric",
    colors: [
      "from-yellow-400/60 to-yellow-500/60",
      "from-amber-400/60 to-yellow-500/60",
      "from-yellow-500/60 to-orange-500/60",
      "from-yellow-400/60 to-amber-500/60",
      "from-amber-300/50 to-yellow-500/50",
      "from-yellow-500/60 to-amber-600/60",
      "from-amber-500/60 to-yellow-600/60",
      "from-yellow-300/60 to-amber-400/60",
      "from-amber-400/60 to-orange-400/60",
      "from-yellow-400/50 to-amber-500/50",
      "from-amber-400/50 to-yellow-500/50",
      "from-yellow-500/60 to-yellow-600/60",
      "from-amber-300/60 to-amber-500/60",
      "from-yellow-400/50 to-orange-400/50",
      "from-amber-400/60 to-yellow-600/60",
      "from-yellow-300/60 to-yellow-500/60",
    ],
  },
  {
    name: "Psychic",
    colors: [
      "from-purple-400/60 to-purple-500/60",
      "from-violet-400/60 to-purple-500/60",
      "from-purple-500/60 to-pink-600/60",
      "from-fuchsia-400/60 to-purple-500/60",
      "from-purple-400/50 to-violet-500/50",
      "from-pink-500/60 to-purple-600/60",
      "from-purple-600/60 to-purple-700/60",
      "from-violet-400/60 to-fuchsia-500/60",
      "from-purple-400/60 to-indigo-500/60",
      "from-fuchsia-400/50 to-purple-500/50",
      "from-purple-500/50 to-pink-500/50",
      "from-violet-500/60 to-purple-600/60",
      "from-purple-300/60 to-purple-500/60",
      "from-pink-400/50 to-fuchsia-500/50",
      "from-purple-400/60 to-fuchsia-600/60",
      "from-indigo-400/60 to-purple-500/60",
    ],
  },
];

// Animated ChromaDex Binder Component with smooth page-turn transition
function ChromaDexBinder() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPalette, setDisplayPalette] = useState(colorPalettes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setIsTransitioning(true);

      // After fade out, change palette and fade back in
      setTimeout(() => {
        setPaletteIndex((prev) => {
          const newIndex = (prev + 1) % colorPalettes.length;
          setDisplayPalette(colorPalettes[newIndex]);
          return newIndex;
        });
        // Small delay before fading back in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex">
      {/* Binder spine */}
      <div className="w-6 rounded-l-lg border border-r-0 border-zinc-700 bg-zinc-800/80 transition-colors duration-500" />
      {/* Binder page with cards */}
      <div className="relative flex-1 overflow-hidden rounded-r-xl border border-l-0 border-zinc-800 bg-zinc-900/30 p-6">
        {/* Page content with fade transition */}
        <div
          className={`transition-all duration-400 ease-in-out ${
            isTransitioning
              ? "opacity-0 scale-[0.98] blur-[2px]"
              : "opacity-100 scale-100 blur-0"
          }`}
        >
          <div className="grid grid-cols-4 gap-2">
            {displayPalette.colors.map((color, i) => (
              <div
                key={`${displayPalette.name}-${i}`}
                className={`aspect-[2.5/3.5] rounded-md bg-gradient-to-br ${color}`}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-zinc-500">
            {displayPalette.name} type — sorted by hue
          </p>
        </div>

        {/* Page turn indicator dots */}
        <div className="mt-4 flex justify-center gap-1.5">
          {colorPalettes.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === paletteIndex
                  ? "w-4 bg-zinc-500"
                  : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Minimalist binder logo component
const BinderLogo = ({ className = "h-5 w-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 20" fill="none">
    {/* Binder spine/rings */}
    <rect x="0" y="0" width="4" height="20" rx="1" fill="currentColor" opacity="0.6" />
    <circle cx="2" cy="4" r="1.5" fill="currentColor" />
    <circle cx="2" cy="10" r="1.5" fill="currentColor" />
    <circle cx="2" cy="16" r="1.5" fill="currentColor" />
    {/* Binder pages */}
    <rect x="5" y="1" width="18" height="18" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="6" y="2" width="16" height="16" rx="1" fill="currentColor" opacity="0.5" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <BinderLogo className="h-5 w-6" />
            <span className="text-sm font-medium text-zinc-400">BinderDex</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/features"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-zinc-700 bg-transparent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14">
        {/* Background Particles */}
        <Particles
          className="absolute inset-0"
          quantity={50}
          staticity={30}
          ease={50}
          color="#a855f7"
        />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <BlurFade delay={0.1}>
            <h1 className="mb-6 text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl">
              Track what you own.{" "}
              <span className="text-gradient">Discover what you need.</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
              Pokémon TCG collection management with smart theme and color matching.
              Build master set trackers, create custom binders, and generate
              visually cohesive layouts with ChromaDex.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-md border border-zinc-700 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Start collecting
              </Link>
              <Link
                href="/chromadex"
                className="group flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Try ChromaDex</span>
                <span className="text-purple-400 transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            </div>
          </BlurFade>
        </div>

        {/* Product Preview */}
        <BlurFade delay={0.4} className="relative z-10 mt-16 w-full max-w-5xl px-6">
          <div className="relative">
            {/* Binder Preview */}
            <div
              className="relative mx-auto overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
              style={{
                transform: "perspective(2000px) rotateX(10deg)",
                transformOrigin: "center bottom",
              }}
            >
              {/* Mock Binder Grid */}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      ChromaDex
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">Binder Settings</div>
                </div>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                  {/* Row 1 - Greens */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`green-${i}`}
                      className="aspect-[2.5/3.5] rounded-lg bg-gradient-to-br from-emerald-600/60 to-green-700/60"
                    />
                  ))}
                  {/* Row 2 - Blues */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`blue-${i}`}
                      className="aspect-[2.5/3.5] rounded-lg bg-gradient-to-br from-sky-500/60 to-blue-600/60"
                    />
                  ))}
                  {/* Row 3 - Yellows/Oranges */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`yellow-${i}`}
                      className="aspect-[2.5/3.5] rounded-lg bg-gradient-to-br from-amber-400/60 to-orange-500/60"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Features Bento Grid Section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-3xl font-medium text-white">
              Everything you need to organize
            </h2>
            <p className="mb-16 text-center text-zinc-400">
              Powerful tools designed for serious collectors
            </p>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <BentoGrid className="auto-rows-[14rem] md:grid-cols-3">
              {/* Card Browser - spans 1 column */}
              <BentoCard
                name="Card Browser"
                description="Search thousands of cards with powerful filters by set, type, rarity, era, and more."
                color="blue"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                }
                background={
                  <div className="absolute right-4 top-4 grid grid-cols-3 gap-1 opacity-20">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-8 w-6 rounded bg-blue-400/40" />
                    ))}
                  </div>
                }
              />

              {/* Master Set Tracker - spans 2 columns */}
              <BentoCard
                name="Master Set Tracker"
                description="Visual binder showing what you own vs what you need. Track variants like Reverse Holo and First Edition."
                color="green"
                className="md:col-span-2"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                }
                background={
                  <div className="absolute right-4 top-4 flex gap-1 opacity-20">
                    {/* Mini binder preview */}
                    <div className="grid grid-cols-4 gap-0.5">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 w-4 rounded-sm ${i < 5 ? "bg-green-400/60" : "bg-zinc-600/40"}`}
                        />
                      ))}
                    </div>
                  </div>
                }
              />

              {/* Binder Builder - spans 2 columns */}
              <BentoCard
                name="Binder Builder"
                description="Create custom binders with drag-and-drop. Design the perfect layout for your collection."
                color="amber"
                className="md:col-span-2"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                }
                background={
                  <div className="absolute right-4 top-4 opacity-20">
                    <div className="flex gap-2">
                      <div className="h-16 w-3 rounded bg-amber-400/60" />
                      <div className="grid grid-cols-3 gap-1">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="h-5 w-4 rounded-sm bg-amber-400/40" />
                        ))}
                      </div>
                    </div>
                  </div>
                }
              />

              {/* ChromaDex - spans 1 column */}
              <BentoCard
                name="ChromaDex"
                description="Find similar cards by theme or color. Generate stunning, cohesive binder pages."
                color="purple"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="url(#bento-chromadex-gradient)" strokeWidth={1.5}>
                    <defs>
                      <linearGradient id="bento-chromadex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                  </svg>
                }
                background={
                  <div className="absolute right-4 top-4 grid grid-cols-2 gap-1 opacity-30">
                    <div className="h-6 w-5 rounded bg-purple-400/60" />
                    <div className="h-6 w-5 rounded bg-pink-400/60" />
                    <div className="h-6 w-5 rounded bg-pink-400/60" />
                    <div className="h-6 w-5 rounded bg-orange-400/60" />
                  </div>
                }
              />

              {/* Export/Import - spans 1 column */}
              <BentoCard
                name="Export & Import"
                description="Import from TCGPlayer or Collectr. Export to CSV, JSON, or PDF with card images."
                color="cyan"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#22d3ee" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                  </svg>
                }
                background={
                  <div className="absolute right-4 top-4 opacity-20">
                    <svg className="h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                }
              />

              {/* Community Sharing - spans 2 columns */}
              <BentoCard
                name="Community & Sharing"
                description="Share your binders publicly. Discover curated collections from other collectors."
                color="rose"
                className="md:col-span-2"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#fb7185" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                }
                background={
                  <div className="absolute right-4 top-4 flex -space-x-2 opacity-30">
                    <div className="h-8 w-8 rounded-full bg-rose-400/60" />
                    <div className="h-8 w-8 rounded-full bg-rose-300/60" />
                    <div className="h-8 w-8 rounded-full bg-rose-500/60" />
                  </div>
                }
              />
            </BentoGrid>
          </BlurFade>
        </div>
      </section>

      {/* ChromaDex Section */}
      <section className="border-y border-zinc-800 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <BlurFade delay={0.1} inView>
              <div>
                <p className="mb-2 text-sm text-purple-400/80">Flagship Feature</p>
                <h2 className="mb-4 text-4xl font-medium bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  ChromaDex
                </h2>
                <p className="mb-6 text-zinc-400">
                  Discover cards that match by theme or color, then generate
                  visually cohesive binder pages from your owned collection.
                  Sort by color, theme, or both to create stunning layouts.
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Find similar cards by theme or color palette",
                    "Generate pages sorted by color, theme, or both",
                    "Auto-arrange owned cards into cohesive layouts",
                    "CIEDE2000 color matching for perfect harmony",
                    "3 free generations per month, unlimited with Pro",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <span className="text-zinc-500">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/chromadex"
                  className="group inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
                >
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Try ChromaDex</span>
                  <span className="text-purple-400 transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <ChromaDexBinder />
            </BlurFade>
          </div>
        </div>
      </section>

      {/* How It Works Section - Horizontal Timeline */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-3xl font-medium text-white">
              How it works
            </h2>
            <p className="mb-16 text-center text-zinc-400">
              From browsing to building in four simple steps
            </p>
          </BlurFade>

          {/* Timeline container */}
          <div className="relative mx-auto max-w-5xl">
            {/* Connecting line - hidden on mobile */}
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent md:block" />

            {/* Steps */}
            <div className="grid gap-12 md:grid-cols-4 md:gap-0">
              {[
                {
                  step: "1",
                  title: "Browse",
                  description: "Search thousands of cards with powerful filters",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  ),
                  color: "blue",
                },
                {
                  step: "2",
                  title: "Track",
                  description: "See what you own vs what you need at a glance",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  ),
                  color: "green",
                },
                {
                  step: "3",
                  title: "Build",
                  description: "Design custom binders with drag-and-drop",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  ),
                  color: "amber",
                },
                {
                  step: "4",
                  title: "Generate",
                  description: "Auto-arrange cards by color or theme",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="url(#timeline-chromadex-gradient)" strokeWidth={1.5}>
                      <defs>
                        <linearGradient id="timeline-chromadex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                    </svg>
                  ),
                  isChromaDex: true,
                },
              ].map((item, index) => {
                const colorStyles = {
                  blue: {
                    border: "border-blue-500/30 hover:border-blue-400/50",
                    bg: "bg-blue-500/5",
                    step: "text-blue-400/70",
                    title: "text-blue-400",
                  },
                  green: {
                    border: "border-green-500/30 hover:border-green-400/50",
                    bg: "bg-green-500/5",
                    step: "text-green-400/70",
                    title: "text-green-400",
                  },
                  amber: {
                    border: "border-amber-500/30 hover:border-amber-400/50",
                    bg: "bg-amber-500/5",
                    step: "text-amber-400/70",
                    title: "text-amber-400",
                  },
                };
                const style = item.color ? colorStyles[item.color as keyof typeof colorStyles] : null;

                return (
                  <BlurFade key={index} delay={0.1 + index * 0.1} inView>
                    <div className="relative flex flex-col items-center text-center md:px-4">
                      {/* Step node */}
                      <div
                        className={`relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                          item.isChromaDex
                            ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-400/70"
                            : style
                            ? `${style.border} ${style.bg}`
                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {item.icon}
                      </div>
                      {/* Step number badge */}
                      <span
                        className={`mb-2 text-xs font-medium ${
                          item.isChromaDex ? "text-purple-400/70" : style ? style.step : "text-zinc-600"
                        }`}
                      >
                        Step {item.step}
                      </span>
                      <h3
                        className={`mb-1 text-lg font-medium ${
                          item.isChromaDex
                            ? "bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
                            : style
                            ? style.title
                            : "text-white"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </BlurFade>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-800 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-3xl font-medium text-white">
              Ready to organize your collection?
            </h2>
            <p className="mb-8 text-zinc-400">
              Join collectors already using BinderDex.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-md border border-zinc-700 bg-transparent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Get started for free
            </Link>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-zinc-600">
            <BinderLogo className="h-4 w-5" />
            <span className="text-sm">BinderDex</span>
          </div>
          <p className="text-sm text-zinc-600">
            © 2025 BinderDex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
