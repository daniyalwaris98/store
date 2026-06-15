"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CollectionTree } from "@/lib/utils/collections"

interface MobileNavProps {
  collectionTree: CollectionTree[]
  onNavigate?: () => void
}

export function MobileNav({ collectionTree, onNavigate }: MobileNavProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleLinkClick = () => {
    onNavigate?.()
  }

  return (
    <nav className="flex flex-col space-y-1 pt-14">
      {collectionTree.map((item) => {
        const hasChildren = item.children.length > 0
        const isOpen = openItems.has(item.collection._id)

        return (
          <div key={item.collection._id} className="border-b border-border last:border-0">
            <div className="flex items-center justify-between">
              {hasChildren ? (
                <button
                  onClick={() => toggleItem(item.collection._id)}
                  className="flex flex-1 items-center justify-between py-3 text-base font-medium hover:text-primary transition-colors text-left"
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  <span>{item.collection.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={`/collections/${item.collection.slug}`}
                  onClick={handleLinkClick}
                  className="flex-1 py-3 text-base font-medium hover:text-primary transition-colors"
                >
                  {item.collection.name}
                </Link>
              )}
            </div>

            {hasChildren && isOpen && (
              <div className="pl-4 pb-2 space-y-1">
                <Link
                  href={`/collections/${item.collection.slug}`}
                  onClick={handleLinkClick}
                  className="block py-2 text-sm font-medium text-primary-hover hover:text-primary transition-colors"
                >
                  All {item.collection.name}
                </Link>
                {item.children.map((child) => (
                  <Link
                    key={child._id}
                    href={`/collections/${child.slug}`}
                    onClick={handleLinkClick}
                    className="block py-2 text-sm text-primary-hover hover:text-primary transition-colors"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}