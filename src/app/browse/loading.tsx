/**
 * Browse Page - Loading Skeleton
 *
 * Displays skeleton loaders while cards are being fetched.
 * Maintains the same grid structure as the actual page to prevent layout shift.
 */

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-zinc-800 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-zinc-800/50 rounded animate-pulse" />
        </div>

        {/* Grid skeleton - 24 placeholder cards */}
        <div className="grid gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2.5/3.5] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
