"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type {
  Product,
  ProductListItem,
  ProductListResponse,
  ProductQueryParams,
} from "@/types"
import type { CreateProductInput, UpdateProductInput } from "@/lib/validators/product"

interface UseAdminProductsState {
  products: ProductListItem[]
  pagination: ProductListResponse["pagination"]
  isLoading: boolean
  error: string | null
}

export function useAdminProducts(initialParams: ProductQueryParams = {}) {
  const [state, setState] = useState<UseAdminProductsState>({
    products: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  })

  const fetchProducts = useCallback(
    async (params: ProductQueryParams = {}) => {
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
    },
    [initialParams.page, initialParams.limit]
  )

  const createProduct = useCallback(async (input: CreateProductInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.post<Product>("/api/products", input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        products: [data, ...prev.products],
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.details
          ? `${err.response.data.error}: ${err.response.data.details.map((d: { message: string }) => d.message).join(", ")}`
          : err.response?.data?.error || "Failed to create product"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      throw new Error(message)
    }
  }, [])

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.put<Product>(`/api/products/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        products: prev.products.map((p) => (p._id === id ? data : p)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.details
          ? `${err.response.data.error}: ${err.response.data.details.map((d: { message: string }) => d.message).join(", ")}`
          : err.response?.data?.error || "Failed to update product"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      throw new Error(message)
    }
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      await axios.delete(`/api/products/${id}`)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        products: prev.products.filter((p) => p._id !== id),
      }))
      return true
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to delete product"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return false
    }
  }, [])

  const updateInventory = useCallback(async (id: string, inventory: number) => {
    try {
      await axios.patch(`/api/products/${id}/inventory`, { inventory })
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p._id === id ? { ...p, inventory } : p
        ),
      }))
      return true
    } catch (err) {
      console.error("Failed to update inventory:", err)
      return false
    }
  }, [])

  return { ...state, fetchProducts, createProduct, updateProduct, deleteProduct, updateInventory }
}