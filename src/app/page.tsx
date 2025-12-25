"use client";

import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Particles } from "@/components/magicui/particles";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Card Browser",
    description:
      "Browse thousands of Pokémon cards with powerful filters. Search by set, type, rarity, and more.",
    icon: "🔍",
    color: "terracotta",
  },
  {
    title: "Master Set Tracker",
    description:
      "Track your collection progress with a visual binder representation. See what you own vs what you need.",
    icon: "📊",
    color: "sage",
  },
  {
    title: "Binder Builder",
    description:
      "Create custom binders with drag-and-drop. Organize your collection exactly how you want.",
    icon: "📁",
    color: "amber",
  },
  {
    title: "ChromaDex",
    description:
      "Smart binder page generator. Create beautiful, color-coordinated layouts with one click.",
    icon: "🎨",
    color: "accent",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Warm particles background */}
      <Particles
        className="absolute inset-0"
        quantity={80}
        ease={80}
        color="#d97757"
        size={1.2}
      />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎴</span>
            <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--warm-brown)' }}>
              BinderDex
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--warm-brown)' }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--terracotta)',
                color: 'var(--primary-foreground)'
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <BlurFade delay={0.1}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: 'var(--cream)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--warm-brown)' }}>
                For Pokémon TCG Collectors
              </span>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span style={{ color: 'var(--warm-brown)' }}>Your collection,</span>
              <br />
              <span className="bg-gradient-to-r from-[#d97757] to-[#e8b85f] bg-clip-text text-transparent">
                beautifully organized
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--warm-brown)', opacity: 0.8 }}>
              Track what you own, discover what you need, and create stunning
              binder layouts with smart color matching. A warm, friendly home
              for your cherished collection.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full px-8 py-4 text-base font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: 'var(--terracotta)',
                  color: 'var(--primary-foreground)'
                }}
              >
                Start collecting
              </Link>
              <Link
                href="/demo"
                className="rounded-full px-8 py-4 text-base font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--cream)',
                  color: 'var(--warm-brown)'
                }}
              >
                View demo →
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-3xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              Everything you need
            </h2>
            <p className="mx-auto mb-20 max-w-xl text-center text-lg" style={{ color: 'var(--warm-brown)', opacity: 0.7 }}>
              Simple, thoughtful tools to manage your entire collection.
            </p>
          </BlurFade>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <BlurFade key={index} delay={0.1 + index * 0.1} inView>
                <div
                  className="group relative overflow-hidden rounded-3xl p-8 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}
                >
                  <div className="relative z-10">
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <h3 className="mb-3 text-xl font-semibold" style={{ color: 'var(--warm-brown)' }}>
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'var(--warm-brown)', opacity: 0.7 }}>
                      {feature.description}
                    </p>
                  </div>
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5"
                    style={{ background: `radial-gradient(circle at 50% 50%, var(--${feature.color}), transparent)` }}
                  />
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ChromaDex Showcase Section */}
      <section className="relative border-y py-32" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--cream)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <BlurFade delay={0.1} inView>
              <div>
                <div className="mb-3 inline-block rounded-full px-4 py-1.5" style={{ backgroundColor: 'var(--background)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--terracotta)' }}>
                    Introducing ChromaDex
                  </span>
                </div>
                <h2 className="mb-6 text-4xl font-bold" style={{ color: 'var(--warm-brown)' }}>
                  Color-coordinated magic
                </h2>
                <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--warm-brown)', opacity: 0.8 }}>
                  Create visually stunning binder pages automatically. ChromaDex
                  analyzes your cards&apos; colors and arranges them into harmonious
                  layouts—no manual sorting required.
                </p>
                <ul className="mb-10 space-y-4">
                  {[
                    "Smart color extraction",
                    "Multiple arrangement styles",
                    "One-click generation",
                    "Unlimited with Pro",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--sage)', color: 'var(--background)' }}>
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-base" style={{ color: 'var(--warm-brown)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="inline-block rounded-full px-7 py-3.5 text-base font-medium shadow-md transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--terracotta)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  Try ChromaDex
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="rounded-3xl p-8 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-[2.5/3.5] rounded-xl shadow-sm transition-transform hover:scale-105",
                        i < 3 && "bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-900",
                        i >= 3 && i < 6 && "bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-900",
                        i >= 6 && "bg-gradient-to-br from-orange-200 to-red-300 dark:from-orange-800 dark:to-red-900"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-6 text-center text-sm" style={{ color: 'var(--warm-brown)', opacity: 0.6 }}>
                  Cards grouped by color palette
                </p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-3xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              Simple, honest pricing
            </h2>
            <p className="mx-auto mb-16 max-w-xl text-center text-lg" style={{ color: 'var(--warm-brown)', opacity: 0.7 }}>
              Free to start. Upgrade when you need more.
            </p>
          </BlurFade>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <BlurFade delay={0.15} inView>
              <div className="rounded-3xl p-10 shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--warm-brown)' }}>Free</h3>
                <div className="mb-1">
                  <span className="text-5xl font-bold" style={{ color: 'var(--warm-brown)' }}>$0</span>
                </div>
                <p className="mb-8 text-sm" style={{ color: 'var(--warm-brown)', opacity: 0.6 }}>
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
                    <li
                      key={index}
                      className="flex items-center gap-3 text-base"
                      style={{ color: 'var(--warm-brown)', opacity: 0.8 }}
                    >
                      <span style={{ color: 'var(--sage)' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-full py-3.5 text-base font-medium transition-all hover:scale-[1.02]" style={{ backgroundColor: 'var(--cream)', color: 'var(--warm-brown)', border: '1px solid var(--border)' }}>
                  Get started
                </button>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="relative overflow-hidden rounded-3xl p-10 shadow-xl transition-all hover:shadow-2xl" style={{ backgroundColor: 'var(--terracotta)' }}>
                <div className="absolute right-4 top-4 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <span className="text-xs font-semibold text-white">Popular</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Pro</h3>
                <div className="mb-1">
                  <span className="text-5xl font-bold text-white">$4.99</span>
                  <span className="ml-2 text-white opacity-70">/mo</span>
                </div>
                <p className="mb-8 text-sm text-white opacity-80">
                  For serious collectors
                </p>
                <ul className="mb-10 space-y-3">
                  {[
                    "Everything in Free",
                    "Unlimited trackers & binders",
                    "Unlimited ChromaDex",
                    "PDF export with images",
                    "Priority support",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-base text-white"
                    >
                      <span className="text-white">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-full py-3.5 text-base font-medium transition-all hover:scale-[1.02]" style={{ backgroundColor: 'white', color: 'var(--terracotta)' }}>
                  Start free trial
                </button>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t py-32" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-6 text-4xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              Ready to organize your collection?
            </h2>
            <p className="mb-10 text-lg" style={{ color: 'var(--warm-brown)', opacity: 0.7 }}>
              Join collectors already using BinderDex to preserve their memories.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-full px-10 py-4 text-base font-medium shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: 'var(--terracotta)',
                color: 'var(--primary-foreground)'
              }}
            >
              Get started for free
            </Link>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t py-12" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎴</span>
            <span className="font-medium" style={{ color: 'var(--warm-brown)' }}>BinderDex</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--warm-brown)', opacity: 0.5 }}>
            © 2025 BinderDex. Made with care for collectors.
          </p>
        </div>
      </footer>
    </div>
  );
}
