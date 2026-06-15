"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type {
  Order,
  OrderListResponse,
  OrderQueryParams,
  UpdateOrderStageInput,
} from "@/types"

interface UseAdminOrdersState {
  orders: Order[]
  pagination: OrderListResponse["pagination"]
  isLoading: boolean
  error: string | null
}

export function useAdminOrders(initialParams: OrderQueryParams = {}) {
  const [state, setState] = useState<UseAdminOrdersState>({
    orders: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  })

  const fetchOrders = useCallback(
    async (params: OrderQueryParams = {}) => {
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
    },
    [initialParams.page, initialParams.limit]
  )

  const updateStage = useCallback(async (id: string, input: UpdateOrderStageInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.patch<Order>(`/api/orders/${id}`, input)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        orders: prev.orders.map((o) => (o._id === id ? data : o)),
      }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to update order"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  const getOrder = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data } = await axios.get<Order>(`/api/orders/${id}`)
      setState((prev) => ({ ...prev, isLoading: false }))
      return data
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || "Failed to fetch order"
        : "An unexpected error occurred"
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
      return null
    }
  }, [])

  return { ...state, fetchOrders, updateStage, getOrder }
}