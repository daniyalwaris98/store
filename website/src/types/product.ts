export interface ProductVariant {
  sku: string
  name: string
  price: number
  compareAt?: number
  inventory?: number
  options: Record<string, string>
}

export interface GalleryItem {
  url: string
  type: "image" | "video"
  order: number
}

export interface CurrencyPrice {
  salePrice: number
  originalPrice?: number
}

export interface Product {
  _id: string
  name: string
  slug: string
  description?: string
  originalPrice?: number
  salePrice: number
  currency: string
  prices?: Record<string, CurrencyPrice>
  weight?: number
  sku: string
  inventory?: number
  trackInventory: boolean
  gallery: GalleryItem[]
  collections: string[]
  variants: ProductVariant[]
  stickerId?: string
  sizeChartId?: string
  status: "active" | "draft" | "archived"
  createdAt: string
  updatedAt: string
}

export interface ProductListItem {
  _id: string
  name: string
  slug: string
  salePrice: number
  originalPrice?: number
  currency: string
  status: "active" | "draft" | "archived"
  gallery: GalleryItem[]
  inventory?: number
  trackInventory: boolean
}

export interface ProductQueryParams {
  collection?: string
  search?: string
  page?: number
  limit?: number
  sort?: "newest" | "price-asc" | "price-desc" | "popular"
  minPrice?: number
  maxPrice?: number
  status?: "active" | "draft" | "archived"
}

export interface ProductListResponse {
  products: ProductListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}