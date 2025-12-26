import { TrackerHeaderSkeleton, CardSlotSkeleton } from "@/components/tracker";

export default function TrackerSetLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <TrackerHeaderSkeleton />
      <main className="container mx-auto">
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <CardSlotSkeleton key={i} />
            ))}
          </div>
        </div>
        {/* Navigation skeleton */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse" />
          <div className="h-4 w-16 rounded bg-zinc-800 animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse" />
        </div>
      </main>
    </div>
  );
}
