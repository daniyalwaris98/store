import Image from "next/image"
import Link from "next/link"
import { BRAND } from "@/lib/constants/brand"
import { DesktopNav } from "./DesktopNav"
import { HeaderActions } from "./HeaderActions"
import { MobileMenu } from "./MobileMenu"
import type { CollectionTree } from "@/lib/utils/collections"

interface HeaderProps {
  collectionTree: CollectionTree[]
}

const fallbackLinks = [
  { name: "Shop All", href: "/collections/all" },
  { name: "New Arrivals", href: "/collections/new" },
  { name: "Sale", href: "/collections/sale" },
]

export function Header({ collectionTree }: HeaderProps) {
  const displayTree = collectionTree.length > 0 ? collectionTree : null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={BRAND.logo}
            alt={BRAND.name}
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        {displayTree ? (
          <DesktopNav collectionTree={displayTree} />
        ) : (
          <nav className="hidden md:flex items-center space-x-1">
            {fallbackLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors rounded-lg hover:bg-accent-light"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center">
          <HeaderActions />
          <MobileMenu collectionTree={collectionTree} />
        </div>
      </div>
    </header>
  )
}
