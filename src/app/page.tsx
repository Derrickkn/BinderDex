"use client";

import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Particles } from "@/components/magicui/particles";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Ripple } from "@/components/magicui/ripple";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Card Browser",
    description:
      "Browse thousands of Pokémon cards with powerful filters. Search by set, type, rarity, and more.",
    icon: "🔍",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Master Set Tracker",
    description:
      "Track your collection progress with a visual binder representation. See what you own vs what you need.",
    icon: "📊",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Binder Builder",
    description:
      "Create custom binders with drag-and-drop. Organize your collection exactly how you want.",
    icon: "📁",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "ChromaDex",
    description:
      "Smart binder page generator. Create beautiful, color-coordinated layouts with one click.",
    icon: "🎨",
    gradient: "from-pink-500 to-cyan-500",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <Particles
          className="absolute inset-0"
          quantity={150}
          ease={80}
          color="#00ffff"
          size={1.2}
        />
        <DotPattern
          className="absolute inset-0 opacity-40"
          cr={1}
          cx={1}
          cy={1}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-cyan-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🎴</span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              BinderDex
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-cyan-400 transition-all hover:text-cyan-300"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/10 to-transparent" />
          <Ripple mainCircleSize={300} numCircles={6} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <BlurFade delay={0.1}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              <span className="text-cyan-400">For Pokémon TCG Collectors</span>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="mb-8 text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">
              <span className="text-glow bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Organize your
              </span>
              <br />
              <AnimatedGradientText
                className="mt-2 text-6xl font-black sm:text-7xl lg:text-8xl"
                colorFrom="#ff00ff"
                colorTo="#00ffff"
                speed={2}
              >
                collection
              </AnimatedGradientText>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-400 sm:text-xl">
              Track what you own, discover what you need, and create{" "}
              <span className="text-cyan-400">stunning binder layouts</span>{" "}
              with smart color matching.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ShimmerButton
                className="w-full px-8 py-4 text-base sm:w-auto"
                shimmerColor="#00ffff"
                background="rgba(0, 255, 255, 0.1)"
                borderRadius="12px"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <span>Start for free</span>
                  <span className="text-lg">→</span>
                </Link>
              </ShimmerButton>
              <Link
                href="/demo"
                className="group w-full rounded-xl border border-purple-500/30 bg-purple-500/5 px-8 py-4 text-base font-medium text-purple-400 transition-all hover:border-purple-400/50 hover:bg-purple-500/10 sm:w-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  View demo
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                <span className="text-glow-magenta bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Everything you need
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-400">
                Powerful tools designed for serious collectors
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <BlurFade key={index} delay={0.2 + index * 0.1} inView>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1a]/50 p-8 backdrop-blur-sm transition-all hover:border-cyan-500/50">
                  <BorderBeam
                    size={150}
                    duration={12 + index * 2}
                    delay={index * 3}
                    colorFrom="#00ffff"
                    colorTo="#ff00ff"
                  />
                  <div
                    className={cn(
                      "mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-2xl",
                      feature.gradient
                    )}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ChromaDex Section */}
      <section className="relative border-y border-cyan-500/20 py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <BlurFade delay={0.1} inView>
              <div>
                <div className="mb-4 inline-block rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-1.5 text-sm font-medium text-cyan-400">
                  Introducing
                </div>
                <h2 className="mb-6 text-5xl font-black text-white">
                  <span className="text-glow bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ChromaDex
                  </span>
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-gray-400">
                  Create visually stunning binder pages automatically. ChromaDex
                  analyzes your cards&apos; colors and arranges them into
                  harmonious layouts—no manual sorting required.
                </p>
                <ul className="mb-10 space-y-4">
                  {[
                    "Color-coordinated layouts",
                    "Multiple arrangement styles",
                    "One-click generation",
                    "Unlimited with Pro",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-base"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                        ✓
                      </span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <ShimmerButton
                  className="px-8 py-4"
                  shimmerColor="#ff00ff"
                  background="rgba(255, 0, 255, 0.1)"
                  borderRadius="12px"
                >
                  <Link href="/signup">Try ChromaDex</Link>
                </ShimmerButton>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f1a]/50 p-8 backdrop-blur-sm">
                <BorderBeam
                  size={200}
                  duration={15}
                  colorFrom="#00ffff"
                  colorTo="#ff00ff"
                />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-[2.5/3.5] rounded-lg transition-all hover:scale-105",
                        i < 3 &&
                          "bg-gradient-to-br from-rose-500/40 to-pink-500/40 shadow-lg shadow-pink-500/20",
                        i >= 3 &&
                          i < 6 &&
                          "bg-gradient-to-br from-amber-500/40 to-orange-500/40 shadow-lg shadow-orange-500/20",
                        i >= 6 &&
                          "bg-gradient-to-br from-sky-500/40 to-cyan-500/40 shadow-lg shadow-cyan-500/20"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-6 text-center text-sm text-gray-500">
                  Cards grouped by color palette
                </p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Simple pricing
                </span>
              </h2>
              <p className="text-lg text-gray-400">
                Free to start. Upgrade when you need more.
              </p>
            </div>
          </BlurFade>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            <BlurFade delay={0.15} inView>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f1a]/50 p-10 backdrop-blur-sm">
                <h3 className="mb-2 text-2xl font-bold text-white">Free</h3>
                <div className="mb-6 text-5xl font-black text-cyan-400">$0</div>
                <p className="mb-8 text-sm text-gray-400">
                  For casual collectors
                </p>
                <ul className="mb-10 space-y-3">
                  {[
                    "Browse all cards",
                    "1 Master Set Tracker",
                    "1 Custom Binder",
                    "3 ChromaDex layouts/month",
                    "CSV Export",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-cyan-400">✓</span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/5 py-3 text-sm font-medium text-cyan-400 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/10">
                  Get started
                </button>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-10 backdrop-blur-sm">
                <BorderBeam
                  size={200}
                  duration={10}
                  colorFrom="#ff00ff"
                  colorTo="#00ffff"
                />
                <div className="mb-2 inline-block rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-3 py-1 text-xs font-semibold text-purple-300">
                  POPULAR
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">Pro</h3>
                <div className="mb-6">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-5xl font-black text-transparent">
                    $4.99
                  </span>
                  <span className="text-gray-400">/mo</span>
                </div>
                <p className="mb-8 text-sm text-gray-400">
                  For serious collectors
                </p>
                <ul className="mb-10 space-y-3">
                  {[
                    "Everything in Free",
                    "Unlimited trackers & binders",
                    "Unlimited ChromaDex",
                    "PDF export with images",
                    "No ads",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-purple-400">✓</span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <ShimmerButton
                  className="w-full py-3"
                  shimmerColor="#ff00ff"
                  background="linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))"
                  borderRadius="12px"
                >
                  Start free trial
                </ShimmerButton>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-cyan-500/20 py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-purple-500/5 to-transparent" />
        </div>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-6 text-4xl font-black text-white sm:text-5xl">
              <span className="text-glow bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to organize your collection?
              </span>
            </h2>
            <p className="mb-10 text-lg text-gray-400">
              Join collectors already using BinderDex.
            </p>
            <ShimmerButton
              className="px-10 py-4 text-base"
              shimmerColor="#00ffff"
              background="rgba(0, 255, 255, 0.1)"
              borderRadius="12px"
            >
              <Link href="/signup">Get started for free</Link>
            </ShimmerButton>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎴</span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-lg font-bold text-transparent">
              BinderDex
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 BinderDex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
