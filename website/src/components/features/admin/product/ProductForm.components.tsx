"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

// ============================================================================
// SECTION CARD
// ============================================================================

export function SectionCard({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  action,
}: {
  title: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  action?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg bg-card-bg overflow-hidden">
      <div
        className={`flex items-center justify-between px-4 py-3 ${collapsible ? "cursor-pointer hover:bg-background-subtle/50" : ""} ${!open ? "" : "border-b border-border"}`}
        onClick={collapsible ? () => setOpen(!open) : undefined}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          {collapsible && (
            open ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />
          )}
        </div>
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

// ============================================================================
// SIDEBAR CARD
// ============================================================================

export function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-card-bg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}