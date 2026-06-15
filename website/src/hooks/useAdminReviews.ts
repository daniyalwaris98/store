"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { Review, ReviewListResponse } from "@/types"

interface ReviewQueryParams {
  productId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

interface UseAdminReviewsState {
  reviews: Review[]
  pagination: ReviewListResponse["pagination"]
  isLoading: boolean
  error: string | null
}

export function useAdminReviews() {
  const [state, setState] = useState<UseAdminReviewsState>({
    reviews: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  })

  const fetchReviews = useCallback(async (params: ReviewQueryParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<ReviewListResponse>("/api/reviews", {
        params,
      })
      setState({
        reviews: data.reviews,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch reviews"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const approveReview = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.patch<Review>(`/api/reviews/${id}/approve`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        reviews: prev.reviews.map((r) => (r._id === id ? { ...r, status: "approved" } : r)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to approve review"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const rejectReview = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.patch<Review>(`/api/reviews/${id}/reject`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        reviews: prev.reviews.map((r) => (r._id === id ? { ...r, status: "rejected" } : r)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to reject review"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const createReview = useCallback(async (reviewData: {
    rating: number
    title: string
    body: string
    images?: string[]
    customer?: string
    verified?: boolean
    featured?: boolean
  }) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.post<Review>("/api/reviews", reviewData)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        reviews: [data, ...prev.reviews],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to create review"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  return { ...state, fetchReviews, approveReview, rejectReview, createReview }
}