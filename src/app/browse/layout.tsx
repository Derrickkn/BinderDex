import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Cards - BinderDex",
  description:
    "Browse and search through thousands of Pokemon TCG cards with advanced filters.",
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
