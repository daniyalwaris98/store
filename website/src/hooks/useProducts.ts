"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { ProductListResponse, ProductQueryParams } from "@/types"

interface UseProductsState {
  products: ProductListResponse["products"]
  pagination: ProductListResponse["pagination"]
  isLoading: boolean
  error: string | null
}

export function useProducts(initialParams: ProductQueryParams = {}) {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  })

  const fetchProducts = useCallback(async (params: ProductQueryParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<ProductListResponse>("/api/products", {
        params: {
          page: initialParams.page || 1,
          limit: initialParams.limit || 20,
          ...params,
        },
      })
      setState({
        products: data.products,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch products"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [initialParams.page, initialParams.limit])

  return { ...state, fetchProducts }
}