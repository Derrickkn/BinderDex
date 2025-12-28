/**
 * Browse Page - Error Boundary
 *
 * Displays error UI when the browse page fails to load.
 * Provides retry functionality and helpful error messages.
 */

"use client"

import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BrowseError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (and Sentry in production)
    console.error("Browse page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Error icon */}
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error title */}
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">
          Failed to Load Cards
        </h2>

        {/* Error message */}
        <p className="text-sm text-zinc-400 mb-8">
          {error.message || "Something went wrong while loading the card browser."}
        </p>

        {/* Retry button */}
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
        >
          Try Again
        </button>

        {/* Help text */}
        <p className="text-xs text-zinc-600 mt-4">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  )
}
