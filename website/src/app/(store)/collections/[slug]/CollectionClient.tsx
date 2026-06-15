"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductGrid } from "@/components/features/collection/product-grid"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { CollectionProduct } from "@/types"

interface CollectionClientProps {
  name: string
  description?: string
  slug: string
  products: CollectionProduct[]
}

const PRODUCTS_PER_PAGE = 12

export function CollectionClient({ name, description, slug, products }: CollectionClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = parseInt(searchParams.get("page") || "1", 10)
  const sort = searchParams.get("sort") || "newest"

  const sortedProducts = [...products].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.salePrice - b.salePrice
      case "price-desc":
        return b.salePrice - a.salePrice
      case "newest":
      default:
        return 0
    }
  })

  const totalProducts = sortedProducts.length
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  const startIndex = (page - 1) * PRODUCTS_PER_PAGE
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", newSort)
    params.set("page", "1")
    router.push(`/collections/${slug}?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Collection Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold capitalize">{name}</h1>
        {description && (
          <div className="mt-4 prose prose-sm text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 border-b border-border">
        <p className="text-xs sm:text-sm text-muted-foreground">{totalProducts} products</p>

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-44 min-h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid with Pagination */}
      <ProductGrid
        products={paginatedProducts}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("page", newPage.toString())
          router.push(`/collections/${slug}?${params.toString()}`)
        }}
      />
    </div>
  )
}