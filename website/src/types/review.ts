export type ReviewStatus = "pending" | "approved" | "rejected"

export interface Review {
  _id: string
  product?: string
  customer?: string
  rating: number
  title: string
  body: string
  images: string[]
  verified: boolean
  helpful: number
  featured: boolean
  status: ReviewStatus
  createdAt: string
}

export interface ReviewListResponse {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateReviewInput {
  product?: string
  rating: number
  title: string
  body: string
  images?: string[]
}