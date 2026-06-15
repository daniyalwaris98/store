"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { CollectionTree } from "@/lib/utils/collections"

interface DesktopNavProps {
  collectionTree: CollectionTree[]
}

export function DesktopNav({ collectionTree }: DesktopNavProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {collectionTree.map((item) => {
        const hasChildren = item.children.length > 0

        if (!hasChildren) {
          return (
            <Link
              key={item.collection._id}
              href={`/collections/${item.collection.slug}`}
              className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors rounded-lg hover:bg-accent-light"
            >
              {item.collection.name}
            </Link>
          )
        }

        return (
          <div key={item.collection._id} className="relative group">
            <Link
              href={`/collections/${item.collection.slug}`}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-primary transition-colors rounded-lg hover:bg-accent-light"
            >
              {item.collection.name}
              <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-transform" />
            </Link>

            <div className="absolute left-0 top-full pt-2 invisible group-hover:visible z-50">
              <div className="w-56 rounded-xl border border-border bg-background shadow-lg p-1.5">
                <Link
                  href={`/collections/${item.collection.slug}`}
                  className="flex items-center px-3 py-2.5 text-sm font-medium hover:text-primary hover:bg-accent-light transition-colors rounded-lg"
                >
                  All {item.collection.name}
                </Link>
                {item.children.map((child) => (
                  <Link
                    key={child._id}
                    href={`/collections/${child.slug}`}
                    className="flex items-center px-3 py-2.5 text-sm hover:text-primary hover:bg-accent-light transition-colors rounded-lg"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
