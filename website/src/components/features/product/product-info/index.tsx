"use client"

import { useState } from "react"
import { ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { VariantSelector } from "@/components/global/variant-selector"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { formatCurrency } from "@/lib/utils"
import { resolveProductPrice } from "@/lib/currency"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ProductVariant {
  sku: string
  name: string
  price: number
  inventory?: number
  options: Record<string, string>
}

interface Product {
  _id: string
  name: string
  slug: string
  description?: string
  salePrice: number
  originalPrice?: number
  currency: string
  prices?: Record<string, { salePrice: number; originalPrice?: number }>
  variants: ProductVariant[]
  stickerId?: { imageUrl: string; placement: string }
  gallery?: { url: string; alt?: string }[]
}

interface ProductInfoProps {
  product: Product
  onAddToCart?: () => void
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const { addItem, openCart } = useCart()
  const { currency: selectedCurrency } = useCurrency()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] || null
  )
  const [wishlist, setWishlist] = useState(false)

  const resolved = resolveProductPrice(
    { salePrice: product.salePrice, originalPrice: product.originalPrice, currency: product.currency || "USD", prices: product.prices },
    selectedCurrency
  )
  const hasDiscount = resolved.originalPrice && resolved.originalPrice > resolved.salePrice
  const discountPercent = hasDiscount
    ? Math.round((1 - resolved.salePrice / resolved.originalPrice!) * 100)
    : 0

  const handleAddToCart = () => {
    if (!selectedVariant) return

    addItem({
      productId: product._id,
      name: product.name,
      price: selectedVariant.price || resolved.salePrice,
      quantity: 1,
      variantId: selectedVariant.sku,
      image: product.gallery?.[0]?.url,
    })
    openCart()
    onAddToCart?.()
  }

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
  }

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">
          {formatCurrency(selectedVariant?.price || resolved.salePrice, resolved.currency)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(resolved.originalPrice!, resolved.currency)}
            </span>
            <span className="bg-danger text-white text-sm font-semibold px-2 py-1 rounded">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      <Separator />

      {/* Variants */}
      {product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          onVariantChange={handleVariantChange}
        />
      )}

      {/* Description */}
      {product.description && (
        <div className="prose prose-sm text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {product.description}
          </ReactMarkdown>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={product.variants.length > 0 && !selectedVariant}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setWishlist(!wishlist)}
        >
          <Heart
            className={`h-5 w-5 ${wishlist ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
      </div>
    </div>
  )
}