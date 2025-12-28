'use client'

import { Toaster as Sonner } from 'sonner'

/**
 * Toast notification component using Sonner
 * Displays success, error, info, and warning toasts
 */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        className: 'font-sans',
      }}
    />
  )
}
