export interface Collection {
  _id: string
  name: string
  slug: string
  description?: string
  parent?: string
  order: number
  image?: string
  filters: string[]
  status: "active" | "archived"
  showInMenu: boolean
  createdAt: string
}

export interface CollectionProduct {
  _id: string
  name: string
  slug: string
  salePrice: number
  originalPrice?: number
  currency: string
  gallery: Array<{
    url: string
    type: "image" | "video"
    order: number
  }>
}

export interface CollectionWithProducts extends Collection {
  products: CollectionProduct[]
}

export interface CollectionQueryParams {
  page?: number
  limit?: number
}

export interface CollectionListResponse {
  collections: Collection[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}