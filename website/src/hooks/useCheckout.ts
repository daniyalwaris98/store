"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { CreateOrderInput, Order } from "@/types"

interface UseCheckoutState {
  order: Order | null
  isLoading: boolean
  error: string | null
  validationDetails: { path: string; message: string }[] | null
}

export function useCheckout() {
  const [state, setState] = useState<UseCheckoutState>({
    order: null,
    isLoading: false,
    error: null,
    validationDetails: null,
  })

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<Order | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null, validationDetails: null }))

      try {
        const { data } = await axios.post<Order>("/api/orders", input)
        setState({ order: data, isLoading: false, error: null, validationDetails: null })
        return data
      } catch (err) {
        let message = "An unexpected error occurred"
        let validationDetails: { path: string; message: string }[] | null = null

        if (axios.isAxiosError(err)) {
          message = err.response?.data?.error || "Failed to create order"
          const details = err.response?.data?.details
          if (Array.isArray(details)) {
            validationDetails = details.map((d: { path: string[]; message: string }) => ({
              path: d.path.join("."),
              message: d.message,
            }))
          }
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          validationDetails,
        }))
        return null
      }
    },
    []
  )

  const clearCheckout = useCallback(() => {
    setState({ order: null, isLoading: false, error: null, validationDetails: null })
  }, [])

  return { ...state, createOrder, clearCheckout }
}