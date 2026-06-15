"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/global/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search as SearchIcon } from "lucide-react"
import { useProducts, useDebounce } from "@/hooks"

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const { products, pagination, isLoading, error, fetchProducts } = useProducts()
  const [query, setQuery] = useState(initialQuery)
  const [searchInput, setSearchInput] = useState(initialQuery)
  const [sort, setSort] = useState<string>("newest")
  const debouncedSearch = useDebounce(searchInput, 1000)

  useEffect(() => {
    if (debouncedSearch.trim()) {
      setQuery(debouncedSearch)
      fetchProducts({ search: debouncedSearch, sort: sort as "newest" | "price-asc" | "price-desc" | "popular" })
    } else if (debouncedSearch === "") {
      setQuery("")
    }
  }, [debouncedSearch, sort, fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchInput)
    fetchProducts({ search: searchInput, sort: sort as "newest" | "price-asc" | "price-desc" | "popular" })
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    if (query) {
      fetchProducts({ search: query, sort: value as "newest" | "price-asc" | "price-desc" | "popular" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">Search</h1>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              className="pl-10 sm:pl-11 h-11"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>
      </div>

      {/* Results Toolbar */}
      {query && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
          <p className="text-muted-foreground">
            {isLoading ? "Searching..." : `${pagination.total} result${pagination.total !== 1 ? "s" : ""} for "${query}"`}
          </p>

          <div className="flex items-center gap-4">

            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="py-16">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : !query ? (
        <div className="w-full max-w-2xl mx-auto py-16 text-center">
          <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Enter a search term to find products</p>
        </div>
      ) : products.length === 0 ? (
        <div className="w-full max-w-2xl mx-auto py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">No products found for "{query}"</p>
          <p className="text-muted-foreground">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 gap-y-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => fetchProducts({ search: query, page: pagination.page - 1, sort: sort as "newest" | "price-asc" | "price-desc" | "popular" })}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchProducts({ search: query, page: pagination.page + 1, sort: sort as "newest" | "price-asc" | "price-desc" | "popular" })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-12 bg-muted animate-pulse rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  )
}