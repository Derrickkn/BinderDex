"use client";

import Link from "next/link";
import { BlurFade } from "@/components/magicui/blur-fade";

const features = [
  {
    title: "Card Browser",
    description:
      "Browse thousands of Pokémon cards with powerful filters. Search by set, type, rarity, and more.",
  },
  {
    title: "Master Set Tracker",
    description:
      "Track your collection progress with a visual binder representation. See what you own vs what you need.",
  },
  {
    title: "Binder Builder",
    description:
      "Create custom binders with drag-and-drop. Organize your collection exactly how you want.",
  },
  {
    title: "ChromaDex",
    description:
      "Smart binder page generator. Create beautiful, color-coordinated layouts with one click.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="h-4 w-2 rounded-sm bg-white" />
              <div className="h-4 w-2 rounded-sm bg-white" />
              <div className="h-4 w-2 rounded-sm bg-white" />
            </div>
            <span className="text-sm font-medium text-zinc-400">binderdex</span>
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
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-14">
        <div className="mx-auto max-w-4xl text-center">
          <BlurFade delay={0.1}>
            <h1 className="mb-6 text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl">
              BinderDex is a{" "}
              <span className="text-gradient">purpose-built tool</span> for
              organizing and designing binders
            </h1>
          </BlurFade>

          <BlurFade delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
              The ultimate digital Pokémon card binder for collectors. Design
              custom layouts, organize your TCG collection with precision, and
              visualize your perfect binder. Both English and Japanese cards are
              supported.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-md border border-zinc-700 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Start organizing
              </Link>
              <Link
                href="/chromadex"
                className="group flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <span>New: Color Matching</span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  &gt;
                </span>
              </Link>
            </div>
          </BlurFade>
        </div>

        {/* Product Preview */}
        <BlurFade delay={0.4} className="mt-16 w-full max-w-5xl px-6">
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
                      Color Match
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

      {/* Features Section */}
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

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <BlurFade key={index} delay={0.1 + index * 0.05} inView>
                <div className="group">
                  <h3 className="mb-2 text-lg font-medium text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ChromaDex Section */}
      <section className="border-y border-zinc-800 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <BlurFade delay={0.1} inView>
              <div>
                <p className="mb-2 text-sm text-zinc-500">Introducing</p>
                <h2 className="mb-4 text-4xl font-medium text-white">
                  ChromaDex
                </h2>
                <p className="mb-6 text-zinc-400">
                  Create visually stunning binder pages automatically. ChromaDex
                  analyzes your cards&apos; colors and arranges them into
                  harmonious layouts—no manual sorting required.
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Color-coordinated layouts",
                    "Multiple arrangement styles",
                    "One-click generation",
                    "Unlimited with Pro",
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
                  className="inline-flex items-center gap-2 text-sm text-white transition-colors hover:text-zinc-300"
                >
                  Try ChromaDex
                  <span>&rarr;</span>
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                <div className="grid grid-cols-3 gap-2">
                  {/* Color grouped cards preview */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`pink-${i}`}
                      className="aspect-[2.5/3.5] rounded-md bg-gradient-to-br from-rose-500/50 to-pink-600/50"
                    />
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`amber-${i}`}
                      className="aspect-[2.5/3.5] rounded-md bg-gradient-to-br from-amber-400/50 to-orange-500/50"
                    />
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`sky-${i}`}
                      className="aspect-[2.5/3.5] rounded-md bg-gradient-to-br from-sky-400/50 to-cyan-500/50"
                    />
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-zinc-500">
                  Cards grouped by color palette
                </p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <h2 className="mb-4 text-center text-3xl font-medium text-white">
              Simple pricing
            </h2>
            <p className="mb-16 text-center text-zinc-400">
              Free to start. Upgrade when you need more.
            </p>
          </BlurFade>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <BlurFade delay={0.15} inView>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
                <h3 className="mb-1 text-xl font-medium text-white">Free</h3>
                <div className="mb-4 text-4xl font-medium text-white">$0</div>
                <p className="mb-6 text-sm text-zinc-500">
                  For casual collectors
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Browse all cards",
                    "1 Master Set Tracker",
                    "1 Custom Binder",
                    "3 ChromaDex layouts/month",
                    "CSV Export",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <span className="text-zinc-500">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-md border border-zinc-700 bg-transparent py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
                  Get started
                </button>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-8">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-xl font-medium text-white">Pro</h3>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    Popular
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-medium text-white">$4.99</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <p className="mb-6 text-sm text-zinc-500">
                  For serious collectors
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Everything in Free",
                    "Unlimited trackers & binders",
                    "Unlimited ChromaDex",
                    "PDF export with images",
                    "No ads",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <span className="text-zinc-500">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full rounded-md bg-white py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
                  Start free trial
                </button>
              </div>
            </BlurFade>
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
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="h-3 w-1.5 rounded-sm bg-zinc-600" />
              <div className="h-3 w-1.5 rounded-sm bg-zinc-600" />
              <div className="h-3 w-1.5 rounded-sm bg-zinc-600" />
            </div>
            <span className="text-sm text-zinc-600">binderdex</span>
          </div>
          <p className="text-sm text-zinc-600">
            © 2025 BinderDex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
