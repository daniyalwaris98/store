"use client"

import { ProductCard } from "@/components/global/product-card"

interface Product {
  _id: string
  name: string
  slug: string
  salePrice: number
  originalPrice?: number
  currency: string
  gallery: Array<{ url: string; type: string }>
  stickerId?: { imageUrl: string; placement: string }
}

interface FeaturedProductsProps {
  products: Product[]
  title?: string
  subtitle?: string
}

export function FeaturedProducts({
  products,
  title = "Best Sellers",
  subtitle,
}: FeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}