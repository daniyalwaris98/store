"use client"

import { useEffect, useCallback } from "react"
import { useCart } from "@/context/CartContext"
import axios from "axios"
import type { AddToCartInput, UpdateCartInput, RemoveFromCartInput } from "@/types"

export function useCartSync() {
  const cart = useCart()

  const addToCartSync = useCallback(async (input: AddToCartInput) => {
    try {
      await axios.post("/api/cart/add", input)
      // Optimistic update already handled by useCart
    } catch (err) {
      console.error("Failed to sync add to cart:", err)
      throw err
    }
  }, [])

  const updateCartSync = useCallback(async (input: UpdateCartInput) => {
    try {
      await axios.patch("/api/cart/update", input)
      // Optimistic update already handled by useCart
    } catch (err) {
      console.error("Failed to sync update cart:", err)
      throw err
    }
  }, [])

  const removeFromCartSync = useCallback(async (input: RemoveFromCartInput) => {
    try {
      await axios.delete("/api/cart/remove", { data: input })
      // Optimistic update already handled by useCart
    } catch (err) {
      console.error("Failed to sync remove from cart:", err)
      throw err
    }
  }, [])

  const syncCart = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/cart")
      return data
    } catch (err) {
      console.error("Failed to sync cart:", err)
      return null
    }
  }, [])

  return {
    cart,
    addToCartSync,
    updateCartSync,
    removeFromCartSync,
    syncCart,
  }
}