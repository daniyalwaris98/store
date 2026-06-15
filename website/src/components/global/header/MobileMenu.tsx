"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileNav } from "./MobileNav"
import type { CollectionTree } from "@/lib/utils/collections"

interface MobileMenuProps {
  collectionTree: CollectionTree[]
}

export function MobileMenu({ collectionTree }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const displayTree = collectionTree.length > 0 ? collectionTree : null

  const fallbackLinks = [
    { name: "Shop All", href: "/collections/all" },
    { name: "New Arrivals", href: "/collections/new" },
    { name: "Sale", href: "/collections/sale" },
  ]

  const handleNavigate = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col h-full">
          {displayTree ? (
            <MobileNav collectionTree={displayTree} onNavigate={handleNavigate} />
          ) : (
            <nav className="flex flex-col space-y-1">
              {fallbackLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavigate}
                  className="py-2 text-base font-medium hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
