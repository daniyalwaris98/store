"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/lib/constants/brand"
import { useCart } from "@/context/CartContext"
import Image from "next/image"

export function CheckoutHeader() {
  const { totalItems, openCart } = useCart()

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

        {/* Cart Icon */}
        <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs leading-1 text-white">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Cart</span>
        </Button>
      </div>
    </header>
  )
}