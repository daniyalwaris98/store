"use client"

import { ProductCard } from "@/components/global/product-card"
import { Pagination } from "@/components/global/pagination"

interface Product {
  _id: string
  name: string
  slug: string
  salePrice: number
  originalPrice?: number
  currency: string
  gallery: Array<{ url: string; type: string; order?: number }>
  stickerId?: { imageUrl: string; placement: string }
}

interface ProductGridProps {
  products: Product[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductGrid({
  products,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-lg">
          No products found in this collection.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}