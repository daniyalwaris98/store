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

interface RelatedProductsProps {
  products: Product[]
  title?: string
}

export function RelatedProducts({
  products,
  title = "You May Also Like",
}: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}