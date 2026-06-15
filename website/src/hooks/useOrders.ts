"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { OrderListResponse, OrderQueryParams } from "@/types"

interface UseOrdersState {
  orders: OrderListResponse["orders"]
  pagination: OrderListResponse["pagination"]
  isLoading: boolean
  error: string | null
}

export function useOrders(initialParams: OrderQueryParams = {}) {
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  })

  const fetchOrders = useCallback(async (params: OrderQueryParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<OrderListResponse>("/api/orders", {
        params: {
          page: initialParams.page || 1,
          limit: initialParams.limit || 20,
          ...params,
        },
      })
      setState({
        orders: data.orders,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch orders"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [initialParams.page, initialParams.limit])

  return { ...state, fetchOrders }
}