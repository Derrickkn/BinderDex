/**
 * Sort Dropdown Component
 *
 * Dropdown menu for sorting cards by different fields with direction toggle.
 * Supports: Name, Number, Rarity, Release Date (ascending/descending)
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, ArrowUp, ArrowDown, Check } from "lucide-react"
import { useFilterStore } from "@/stores/filterStore"
import type { SortField } from "@/lib/types/browse"
import { cn } from "@/lib/utils"

interface SortOption {
  value: SortField
  label: string
  description: string
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: "number",
    label: "Card Number",
    description: "Sort by card number in set",
  },
  {
    value: "name",
    label: "Name",
    description: "Sort alphabetically by card name",
  },
  {
    value: "rarity",
    label: "Rarity",
    description: "Sort by rarity (Common to Hyper Rare)",
  },
  {
    value: "releaseDate",
    label: "Release Date",
    description: "Sort by set release date",
  },
]

export function SortDropdown() {
  const { sortBy, sortDirection, setSortBy, setSortDirection } =
    useFilterStore()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  // Get current sort option label
  const currentOption = SORT_OPTIONS.find((opt) => opt.value === sortBy)

  // Set mounted state for client-side rendering (portal hydration)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update dropdown position when button position changes or dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap (mt-2)
        left: rect.left + window.scrollX,
        width: 256, // w-64 = 16rem = 256px
      })
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle sort option change
  const handleSortChange = (value: SortField) => {
    setSortBy(value)
    setIsOpen(false)
  }

  // Toggle sort direction
  const toggleDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Render dropdown menu via portal
  const dropdownMenu = mounted && isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      }}
      className={cn(
        "rounded-lg overflow-hidden",
        "bg-zinc-800 border border-zinc-700 shadow-xl"
      )}
    >
      {SORT_OPTIONS.map((option) => {
        const isActive = sortBy === option.value

        return (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-3 text-left",
              "hover:bg-zinc-700 transition-colors",
              isActive && "bg-indigo-600/20"
            )}
          >
            {/* Checkmark */}
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              {isActive && <Check className="w-5 h-5 text-indigo-500" />}
            </div>

            {/* Option details */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-indigo-300" : "text-white"
                )}
              >
                {option.label}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {option.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex items-center gap-2">
      {/* Sort dropdown */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          )}
          aria-label="Sort options"
          aria-expanded={isOpen}
        >
          <span>Sort: {currentOption?.label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Render dropdown menu via portal to document.body */}
        {mounted && createPortal(dropdownMenu, document.body)}
      </div>

      {/* Direction toggle button */}
      <button
        onClick={toggleDirection}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        )}
        aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
        title={sortDirection === "asc" ? "Ascending" : "Descending"}
      >
        {sortDirection === "asc" ? (
          <ArrowUp className="w-5 h-5" />
        ) : (
          <ArrowDown className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
