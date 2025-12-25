"use client";

import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
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
      "AI-powered binder page generator. Create beautiful, color-coordinated layouts automatically.",
    icon: "✨",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Pattern */}
      <DotPattern
        className="absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
      />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎴</span>
            <span className="text-xl font-bold">BinderDex</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <ShimmerButton
              className="h-9 px-4 text-sm"
              shimmerColor="#ffffff"
              background="linear-gradient(135deg, #3b82f6, #8b5cf6)"
            >
              Get Started
            </ShimmerButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5">
            <span className="mr-2">✨</span>
            <AnimatedGradientText
              colorFrom="#3b82f6"
              colorTo="#8b5cf6"
              className="text-sm font-medium"
            >
              Powered by ChromaDex AI
            </AnimatedGradientText>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your Pokémon TCG
            <br />
            <AnimatedGradientText
              colorFrom="#3b82f6"
              colorTo="#8b5cf6"
              className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Collection Manager
            </AnimatedGradientText>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/70 sm:text-xl">
            Track, organize, and showcase your Pokémon card collection with
            AI-powered binder layouts. The ultimate tool for collectors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ShimmerButton
              className="h-12 px-8 text-base font-medium"
              shimmerColor="#ffffff"
              background="linear-gradient(135deg, #3b82f6, #8b5cf6)"
            >
              Start Collecting Free
            </ShimmerButton>
            <button className="flex h-12 items-center gap-2 rounded-full border border-foreground/20 bg-background px-8 text-base font-medium transition-colors hover:bg-foreground/5">
              <span>Watch Demo</span>
              <span>▶</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-foreground/10 pt-8">
            <div>
              <div className="text-3xl font-bold text-foreground">10,000+</div>
              <div className="text-sm text-foreground/60">Cards Indexed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">50+</div>
              <div className="text-sm text-foreground/60">Sets Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">Free</div>
              <div className="text-sm text-foreground/60">To Get Started</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to{" "}
              <AnimatedGradientText colorFrom="#3b82f6" colorTo="#8b5cf6">
                Manage Your Collection
              </AnimatedGradientText>
            </h2>
            <p className="mx-auto mb-16 max-w-2xl text-foreground/70">
              From browsing cards to creating stunning binder layouts, BinderDex
              has all the tools you need.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background p-6 transition-all hover:border-foreground/20 hover:shadow-lg"
              >
                <BorderBeam
                  size={150}
                  duration={12}
                  delay={index * 2}
                  colorFrom="#3b82f6"
                  colorTo="#8b5cf6"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-foreground/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ChromaDex Highlight Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-sm">
                <span className="mr-2">🤖</span>
                AI-Powered
              </div>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                Meet{" "}
                <AnimatedGradientText
                  colorFrom="#3b82f6"
                  colorTo="#8b5cf6"
                  className="text-3xl font-bold sm:text-4xl"
                >
                  ChromaDex
                </AnimatedGradientText>
              </h2>
              <p className="mb-6 text-lg text-foreground/70">
                Our AI analyzes your cards&apos; colors, themes, and artwork to
                create stunning binder pages. Choose from color harmony, thematic
                grouping, or let the AI decide the perfect layout.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Color-coordinated layouts",
                  "Theme-based organization",
                  "One-click generation",
                  "Unlimited with Pro",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                      ✓
                    </span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <ShimmerButton
                className="h-11 px-6"
                shimmerColor="#ffffff"
                background="linear-gradient(135deg, #3b82f6, #8b5cf6)"
              >
                Try ChromaDex Free
              </ShimmerButton>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/5 to-foreground/10 p-8">
                <BorderBeam
                  size={200}
                  duration={10}
                  colorFrom="#3b82f6"
                  colorTo="#8b5cf6"
                />
                {/* Placeholder for ChromaDex preview */}
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-[2.5/3.5] rounded-lg",
                        i % 3 === 0 && "bg-blue-500/30",
                        i % 3 === 1 && "bg-purple-500/30",
                        i % 3 === 2 && "bg-pink-500/30"
                      )}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <span className="text-lg font-medium">Preview Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-foreground/70">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Free Tier */}
            <div className="rounded-2xl border border-foreground/10 bg-background p-8">
              <h3 className="mb-2 text-xl font-semibold">Free</h3>
              <div className="mb-4 text-4xl font-bold">$0</div>
              <p className="mb-6 text-foreground/60">
                Perfect for getting started
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Browse all cards",
                  "1 Master Set Tracker",
                  "1 Custom Binder (10 pages)",
                  "3 ChromaDex generations/month",
                  "CSV Export",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <span className="text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-full border border-foreground/20 py-3 font-medium transition-colors hover:bg-foreground/5">
                Get Started Free
              </button>
            </div>

            {/* Pro Tier */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-background p-8">
              <BorderBeam
                size={200}
                duration={12}
                colorFrom="#3b82f6"
                colorTo="#8b5cf6"
              />
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              <h3 className="mb-2 text-xl font-semibold">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">$4.99</span>
                <span className="text-foreground/60">/month</span>
              </div>
              <p className="mb-6 text-foreground/60">For serious collectors</p>
              <ul className="mb-8 space-y-3">
                {[
                  "Everything in Free",
                  "Unlimited Master Set Trackers",
                  "Unlimited Custom Binders",
                  "Unlimited ChromaDex",
                  "PDF Export with images",
                  "No ads",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <span className="text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ShimmerButton
                className="w-full py-3"
                shimmerColor="#ffffff"
                background="linear-gradient(135deg, #3b82f6, #8b5cf6)"
              >
                Start Pro Trial
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-foreground/10 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
            Ready to Organize Your Collection?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/70">
            Join collectors who are already using BinderDex to manage and
            showcase their Pokémon card collections.
          </p>
          <ShimmerButton
            className="h-14 px-10 text-lg font-medium"
            shimmerColor="#ffffff"
            background="linear-gradient(135deg, #3b82f6, #8b5cf6)"
          >
            Get Started for Free
          </ShimmerButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎴</span>
              <span className="font-semibold">BinderDex</span>
            </div>
            <p className="text-sm text-foreground/60">
              © 2025 BinderDex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
