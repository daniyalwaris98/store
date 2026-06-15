"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { Product } from "@/types"

interface UseProductState {
  product: Product | null
  isLoading: boolean
  error: string | null
}

export function useProduct(slug?: string) {
  const [state, setState] = useState<UseProductState>({
    product: null,
    isLoading: false,
    error: null,
  })

  const fetchProduct = useCallback(async (productSlug?: string) => {
    const targetSlug = productSlug || slug
    if (!targetSlug) return

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<Product>(`/api/products/${targetSlug}`)
      setState({ product: data, isLoading: false, error: null })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Product not found"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [slug])

  return { ...state, fetchProduct }
}