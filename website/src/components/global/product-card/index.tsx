"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency } from "@/lib/utils"
import { resolveProductPrice } from "@/lib/currency"
import { Badge } from "@/components/global/badge"

interface Product {
  _id: string
  name: string
  slug: string
  salePrice: number
  originalPrice?: number
  currency?: string
  prices?: Record<string, { salePrice: number; originalPrice?: number }>
  gallery?: Array<{ url: string; type: string; order?: number }>
  stickerId?: { imageUrl: string; placement: string }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const { currency: selectedCurrency } = useCurrency()
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  const resolved = resolveProductPrice(
    { salePrice: product.salePrice, originalPrice: product.originalPrice, currency: product.currency || "USD", prices: product.prices },
    selectedCurrency
  )
  const hasDiscount = resolved.originalPrice && resolved.originalPrice > resolved.salePrice
  const discountPercent = hasDiscount
    ? Math.round((1 - resolved.salePrice / resolved.originalPrice!) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product._id,
      name: product.name,
      price: resolved.salePrice,
      quantity: 1,
      image: product.gallery?.[0]?.url,
    })
    openCart()
  }

  const galleryImages = product.gallery?.filter((g) => g.type === "image") || []
  const allMedia = product.gallery || []

  const mainImage = galleryImages[0]?.url || "/placeholder.svg"

  const handleMouseEnter = () => {
    if (allMedia.length > 1) {
      setHoveredIndex(0)
    }
  }

  const handleMouseLeave = () => {
    setHoveredIndex(-1)
  }

  const getVisibleItem = () => {
    if (hoveredIndex >= 0 && allMedia.length > 1) {
      const item = allMedia[hoveredIndex + 1] || allMedia[0]
      return item
    }
    return allMedia[0] || { url: mainImage, type: "image" }
  }

  const visibleItem = getVisibleItem()
  const showHoverMedia = hoveredIndex >= 0 && allMedia.length > 1

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-20/24 bg-muted rounded-md overflow-hidden mb-3">
        {/* Product Image/Video */}
        {visibleItem.type === "video" ? (
          <video
            src={visibleItem.url}
            autoPlay
            muted
            loop
            playsInline
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Image
            src={showHoverMedia ? visibleItem.url : mainImage}
            alt={product.name}
            width={800}
            height={800}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-danger text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}

        {/* Sticker Overlay */}
        {product.stickerId && product.stickerId.imageUrl && (
          <Badge
            imageUrl={product.stickerId.imageUrl}
            placement={product.stickerId.placement as any}
            size={48}
          />
        )}

        {/* Video indicator */}
        {visibleItem.type === "video" && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Video
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="font-medium text-sm line-clamp-2 mb-1 text-center group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-3">
          <span className="font-semibold">
            {formatCurrency(resolved.salePrice, resolved.currency)}
          </span>
          {hasDiscount && (
            <span className="opacity-70 line-through">
              {formatCurrency(resolved.originalPrice!, resolved.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}