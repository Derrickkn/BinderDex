"use client";

import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Card Browser",
    description:
      "Browse thousands of Pokémon cards with powerful filters. Search by set, type, rarity, and more.",
    icon: "🔍",
  },
  {
    title: "Master Set Tracker",
    description:
      "Track your collection progress with a visual binder representation. See what you own vs what you need.",
    icon: "📊",
  },
  {
    title: "Binder Builder",
    description:
      "Create custom binders with drag-and-drop. Organize your collection exactly how you want.",
    icon: "📁",
  },
  {
    title: "ChromaDex",
    description:
      "Smart binder page generator. Create beautiful, color-coordinated layouts with one click.",
    icon: "🎨",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-foreground/5 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎴</span>
            <span className="text-lg font-semibold tracking-tight">BinderDex</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <BlurFade delay={0.1}>
            <p className="mb-4 text-sm font-medium text-foreground/50">
              For Pokémon TCG Collectors
            </p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Organize your collection
              <br />
              <span className="text-foreground/70">beautifully.</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="mx-auto mb-10 max-w-lg text-foreground/60">
              Track what you own, discover what you need, and create stunning
              binder layouts with smart color matching.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Start for free
              </Link>
              <Link
                href="/demo"
                className="rounded-full px-6 py-3 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                View demo →
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-2xl font-semibold">
              Everything you need
            </h2>
            <p className="mx-auto mb-16 max-w-md text-center text-foreground/60">
              Simple tools to manage your entire collection.
            </p>
          </BlurFade>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <BlurFade key={index} delay={0.1 + index * 0.1} inView>
                <div className="rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/10">
                  <div className="mb-3 text-2xl">{feature.icon}</div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-foreground/60">
                    {feature.description}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ChromaDex Section */}
      <section className="border-y border-foreground/5 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <BlurFade delay={0.1} inView>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground/50">
                  Introducing
                </p>
                <h2 className="mb-4 text-3xl font-semibold">ChromaDex</h2>
                <p className="mb-6 text-foreground/60">
                  Create visually stunning binder pages automatically. ChromaDex
                  analyzes your cards&apos; colors and arranges them into harmonious
                  layouts—no manual sorting required.
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Color-coordinated layouts",
                    "Multiple arrangement styles",
                    "One-click generation",
                    "Unlimited with Pro",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-foreground/40">✓</span>
                      <span className="text-foreground/70">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Try ChromaDex
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-6">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-[2.5/3.5] rounded-lg",
                        i < 3 && "bg-rose-100 dark:bg-rose-900/20",
                        i >= 3 && i < 6 && "bg-amber-100 dark:bg-amber-900/20",
                        i >= 6 && "bg-sky-100 dark:bg-sky-900/20"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-foreground/40">
                  Cards grouped by color palette
                </p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-2xl font-semibold">
              Simple pricing
            </h2>
            <p className="mx-auto mb-12 max-w-md text-center text-foreground/60">
              Free to start. Upgrade when you need more.
            </p>
          </BlurFade>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <BlurFade delay={0.15} inView>
              <div className="rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-8">
                <h3 className="mb-1 font-semibold">Free</h3>
                <div className="mb-4 text-3xl font-bold">$0</div>
                <p className="mb-6 text-sm text-foreground/50">
                  For casual collectors
                </p>
                <ul className="mb-8 space-y-2">
                  {[
                    "Browse all cards",
                    "1 Master Set Tracker",
                    "1 Custom Binder",
                    "3 ChromaDex layouts/month",
                    "CSV Export",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-foreground/70"
                    >
                      <span className="text-foreground/30">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-full border border-foreground/10 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5">
                  Get started
                </button>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8">
                <h3 className="mb-1 font-semibold">Pro</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$4.99</span>
                  <span className="text-foreground/50">/mo</span>
                </div>
                <p className="mb-6 text-sm text-foreground/50">
                  For serious collectors
                </p>
                <ul className="mb-8 space-y-2">
                  {[
                    "Everything in Free",
                    "Unlimited trackers & binders",
                    "Unlimited ChromaDex",
                    "PDF export with images",
                    "No ads",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-foreground/70"
                    >
                      <span className="text-foreground/30">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-full bg-foreground py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                  Start free trial
                </button>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-foreground/5 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-2xl font-semibold">
              Ready to organize your collection?
            </h2>
            <p className="mb-8 text-foreground/60">
              Join collectors already using BinderDex.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get started for free
            </Link>
          </BlurFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎴</span>
            <span className="text-sm font-medium">BinderDex</span>
          </div>
          <p className="text-xs text-foreground/40">
            © 2025 BinderDex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
