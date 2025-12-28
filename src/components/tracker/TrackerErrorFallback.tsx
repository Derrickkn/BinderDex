'use client'

import { AlertCircle } from 'lucide-react'

interface TrackerErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function TrackerErrorFallback({
  error,
  resetErrorBoundary
}: TrackerErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-[#0a0a0a]">
      <div className="text-red-500 mb-4">
        <AlertCircle className="h-16 w-16" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-white">Failed to load tracker</h2>
      <p className="text-zinc-400 mb-6 text-center max-w-md">
        {error.message}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.href = '/tracker'}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Back to sets
        </button>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
