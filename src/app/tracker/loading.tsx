import { SetCardSkeleton } from "@/components/tracker/SetCard";

export default function TrackerLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-px bg-zinc-700" />
            <div className="h-5 w-40 rounded bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-64 rounded bg-zinc-800 animate-pulse" />
          <div className="h-5 w-96 rounded bg-zinc-800 animate-pulse" />
        </div>

        {/* Set grid skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SetCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
