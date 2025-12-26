import { SetSelector } from "@/components/tracker/SetSelector";
import { BlurFade } from "@/components/magicui/blur-fade";
import Link from "next/link";
import { BinderLogoFull } from "@/components/ui/Logo";

export const metadata = {
  title: "Master Set Tracker - BinderDex",
  description: "Track your Pokémon TCG collection progress for each set",
};

export default function TrackerPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <BinderLogoFull iconClassName="h-5 w-auto" />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-400">Tracker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <BlurFade delay={0.1} inView>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Select a Set to Track
            </h2>
            <p className="text-zinc-400">
              Choose a Pokémon TCG set to view your collection progress and
              track which cards you own.
            </p>
          </div>
        </BlurFade>

        {/* Set grid */}
        <SetSelector />
      </main>
    </div>
  );
}
